// src/app/api/auth/[provider]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { FacebookOAuth } from '@/lib/auth/oauth-manager';

const providers = {
    facebook: new FacebookOAuth(),
    // Add other providers here
};

export async function GET(
    request: NextRequest,
    { params }: { params: { provider: string } }
) {
    const provider = providers[params.provider];

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