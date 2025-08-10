// src/app/api/auth/[provider]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { FacebookOAuth } from '@/lib/auth/oauth-manager';

const providers: Record<string, any> = {
    facebook: new FacebookOAuth(),
    // Add other providers here
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    const { provider: providerName } = await params;
    const provider = providers[providerName];

    if (!provider) {
        return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    // Generate state for CSRF protection
    const state = crypto.randomUUID();

    // Store state in session or temporary storage
    // You'll need to implement session management

    const authUrl = provider.getAuthorizationUrl(state);

    return NextResponse.redirect(authUrl);
}