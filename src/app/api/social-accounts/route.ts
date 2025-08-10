import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { socialAccounts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { encrypt } from '@/lib/auth/encryption';

async function getSocialAccountsHandler(request: NextRequest) {
    try {
        const user = (request as any).user;

        // Get user's social accounts
        const accounts = await db
            .select({
                id: socialAccounts.id,
                platform: socialAccounts.platform,
                accountName: socialAccounts.accountName,
                platformAccountId: socialAccounts.platformAccountId,
                isActive: socialAccounts.isActive,
                createdAt: socialAccounts.createdAt,
                updatedAt: socialAccounts.updatedAt,
            })
            .from(socialAccounts)
            .where(eq(socialAccounts.userId, user.userId));

        return NextResponse.json({
            success: true,
            accounts,
        });
    } catch (error) {
        console.error('Get social accounts error:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function createSocialAccountHandler(request: NextRequest) {
    try {
        const user = (request as any).user;
        const body = await request.json();

        // Basic validation
        if (!body.platform || !body.accountName || !body.platformAccountId) {
            return NextResponse.json(
                { error: 'Platform, account name, and platform account ID are required' },
                { status: 400 }
            );
        }

        // Check if account already exists for this user and platform
        const existingAccount = await db
            .select()
            .from(socialAccounts)
            .where(
                and(
                    eq(socialAccounts.userId, user.userId),
                    eq(socialAccounts.platform, body.platform),
                    eq(socialAccounts.platformAccountId, body.platformAccountId)
                )
            )
            .limit(1);

        if (existingAccount.length > 0) {
            return NextResponse.json(
                { error: 'This social account is already connected' },
                { status: 409 }
            );
        }

        // Create social account
        const newAccount = await db
            .insert(socialAccounts)
            .values({
                userId: user.userId,
                platform: body.platform,
                accountName: body.accountName,
                platformAccountId: body.platformAccountId,
                accessToken: encrypt(body.accessToken), // Encrypt access token
                refreshToken: body.refreshToken ? encrypt(body.refreshToken) : null, // Encrypt refresh token
                tokenExpiresAt: body.tokenExpiresAt ? new Date(body.tokenExpiresAt) : null,
                metadata: body.metadata,
            })
            .returning({
                id: socialAccounts.id,
                platform: socialAccounts.platform,
                accountName: socialAccounts.accountName,
                platformAccountId: socialAccounts.platformAccountId,
                isActive: socialAccounts.isActive,
                createdAt: socialAccounts.createdAt,
            });

        return NextResponse.json({
            success: true,
            account: newAccount[0],
        });
    } catch (error) {
        console.error('Create social account error:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Wrap with authentication
export const GET = requireAuth(getSocialAccountsHandler);
export const POST = requireAuth(createSocialAccountHandler);
