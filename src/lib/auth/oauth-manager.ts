// src/lib/auth/oauth-manager.ts

import { db } from '@/lib/db';
import { socialAccounts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export abstract class OAuthProvider {
    abstract getAuthorizationUrl(state: string): string;
    abstract exchangeCodeForToken(code: string): Promise<TokenResponse>;
    abstract refreshAccessToken(refreshToken: string): Promise<TokenResponse>;
    abstract getUserInfo(accessToken: string): Promise<AccountInfo>;
}

interface TokenResponse {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    scope?: string;
}

interface AccountInfo {
    id: string;
    name: string;
    username?: string;
    profilePicture?: string;
}

// Facebook OAuth implementation
export class FacebookOAuth extends OAuthProvider {
    private clientId = process.env.FACEBOOK_APP_ID!;
    private clientSecret = process.env.FACEBOOK_APP_SECRET!;
    private redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/facebook`;

    getAuthorizationUrl(state: string): string {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            state: state,
            scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_engagement',
            response_type: 'code',
        });

        return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
    }

    async exchangeCodeForToken(code: string): Promise<TokenResponse> {
        const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.redirectUri,
                code: code,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to exchange code for token');
        }

        const data = await response.json();

        // Facebook uses long-lived tokens, so we need to exchange for one
        const longLivedResponse = await this.getLongLivedToken(data.access_token);

        return {
            accessToken: longLivedResponse.access_token,
            expiresIn: longLivedResponse.expires_in,
        };
    }

    private async getLongLivedToken(shortLivedToken: string): Promise<any> {
        const params = new URLSearchParams({
            grant_type: 'fb_exchange_token',
            client_id: this.clientId,
            client_secret: this.clientSecret,
            fb_exchange_token: shortLivedToken,
        });

        const response = await fetch(
            `https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`
        );

        return response.json();
    }

    async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
        // Facebook doesn't use refresh tokens in the traditional sense
        // Their long-lived tokens last 60 days and need to be refreshed before expiry
        throw new Error('Facebook uses long-lived tokens, not refresh tokens');
    }

    async getUserInfo(accessToken: string): Promise<AccountInfo> {
        const response = await fetch(
            `https://graph.facebook.com/v18.0/me?fields=id,name,picture&access_token=${accessToken}`
        );

        const data = await response.json();

        return {
            id: data.id,
            name: data.name,
            profilePicture: data.picture?.data?.url,
        };
    }
}