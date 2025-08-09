// src/lib/db/queries.ts

import { db } from './index';
import {
    users,
    socialAccounts,
    posts,
    postDestinations,
    mediaFiles,
    type NewUser,
    type NewSocialAccount,
    type NewPost,
    type NewPostDestination,
    type NewMediaFile
} from './schema';
import { eq, and, or, desc, asc, lte, gte, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// ============= User Management Queries =============

export async function createUser(userData: Omit<NewUser, 'passwordHash'> & { password: string }) {
    // Hash the password before storing - never store plain text passwords
    const passwordHash = await bcrypt.hash(userData.password, 10);

    const [user] = await db
        .insert(users)
        .values({
            email: userData.email,
            name: userData.name,
            passwordHash,
        })
        .returning({
            id: users.id,
            email: users.email,
            name: users.name,
            createdAt: users.createdAt,
        });

    return user;
}

export async function authenticateUser(email: string, password: string) {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

    if (!user) {
        return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
        return null;
    }

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

export async function getUserWithAccounts(userId: number) {
    // This query demonstrates Drizzle's powerful relationship handling
    const userWithAccounts = await db
        .select({
            user: {
                id: users.id,
                email: users.email,
                name: users.name,
            },
            accounts: {
                id: socialAccounts.id,
                platform: socialAccounts.platform,
                accountName: socialAccounts.accountName,
                isActive: socialAccounts.isActive,
            },
        })
        .from(users)
        .leftJoin(socialAccounts, eq(users.id, socialAccounts.userId))
        .where(eq(users.id, userId));

    // Transform the flat result into nested structure
    if (userWithAccounts.length === 0) {
        return null;
    }

    const user = userWithAccounts[0].user;
    const accounts = userWithAccounts
        .filter(row => row.accounts !== null)
        .map(row => row.accounts);

    return {
        ...user,
        socialAccounts: accounts,
    };
}

// ============= Social Account Management =============

export async function addSocialAccount(accountData: NewSocialAccount) {
    // Check if account already exists for this user
    const existing = await db
        .select()
        .from(socialAccounts)
        .where(
            and(
                eq(socialAccounts.userId, accountData.userId),
                eq(socialAccounts.platform, accountData.platform),
                eq(socialAccounts.platformAccountId, accountData.platformAccountId)
            )
        );

    if (existing.length > 0) {
        // Update existing account instead of creating duplicate
        const [updated] = await db
            .update(socialAccounts)
            .set({
                accessToken: accountData.accessToken,
                refreshToken: accountData.refreshToken,
                tokenExpiresAt: accountData.tokenExpiresAt,
                isActive: true,
                updatedAt: new Date(),
            })
            .where(eq(socialAccounts.id, existing[0].id))
            .returning();

        return updated;
    }

    const [account] = await db
        .insert(socialAccounts)
        .values(accountData)
        .returning();

    return account;
}

export async function updateSocialAccountToken(
    accountId: number,
    accessToken: string,
    refreshToken?: string,
    expiresAt?: Date
) {
    const [updated] = await db
        .update(socialAccounts)
        .set({
            accessToken,
            refreshToken: refreshToken || undefined,
            tokenExpiresAt: expiresAt || undefined,
            updatedAt: new Date(),
        })
        .where(eq(socialAccounts.id, accountId))
        .returning();

    return updated;
}

export async function getActiveAccountsForUser(userId: number) {
    return await db
        .select()
        .from(socialAccounts)
        .where(
            and(
                eq(socialAccounts.userId, userId),
                eq(socialAccounts.isActive, true)
            )
        );
}

export async function getExpiringTokens(hoursBeforeExpiry: number = 24) {
    const expiryThreshold = new Date(Date.now() + hoursBeforeExpiry * 60 * 60 * 1000);

    return await db
        .select()
        .from(socialAccounts)
        .where(
            and(
                eq(socialAccounts.isActive, true),
                lte(socialAccounts.tokenExpiresAt, expiryThreshold)
            )
        );
}

// ============= Post Management Queries =============

export async function createPostWithDestinations(
    postData: Omit<NewPost, 'id' | 'createdAt' | 'updatedAt'>,
    destinations: Array<{
        socialAccountId: number;
        platform: 'facebook' | 'instagram' | 'tiktok';
        postType: string;
    }>,
    media?: Array<Omit<NewMediaFile, 'id' | 'postId' | 'createdAt'>>
) {
    // Use a transaction to ensure all-or-nothing creation
    return await db.transaction(async (tx) => {
        // Create the main post
        const [post] = await tx
            .insert(posts)
            .values(postData)
            .returning();

        // Create destinations for each selected platform
        const destinationPromises = destinations.map(dest =>
            tx.insert(postDestinations).values({
                postId: post.id,
                socialAccountId: dest.socialAccountId,
                platform: dest.platform,
                postType: dest.postType,
                status: postData.scheduledAt ? 'scheduled' : 'draft',
            }).returning()
        );

        const createdDestinations = await Promise.all(destinationPromises);

        // Create media files if provided
        let createdMedia: any[] = [];
        if (media && media.length > 0) {
            createdMedia = await tx
                .insert(mediaFiles)
                .values(
                    media.map((m: any) => ({
                        ...m,
                        postId: post.id,
                    }))
                )
                .returning();
        }

        return {
            post,
            destinations: createdDestinations.flat(),
            media: createdMedia,
        };
    });
}

export async function getPostsForCalendar(
    userId: number,
    startDate: Date,
    endDate: Date
) {
    // Complex query that gets posts with their destinations and account info
    const postsWithDetails = await db
        .select({
            post: posts,
            destination: postDestinations,
            account: {
                id: socialAccounts.id,
                platform: socialAccounts.platform,
                accountName: socialAccounts.accountName,
            },
        })
        .from(posts)
        .innerJoin(postDestinations, eq(posts.id, postDestinations.postId))
        .innerJoin(socialAccounts, eq(postDestinations.socialAccountId, socialAccounts.id))
        .where(
            and(
                eq(posts.userId, userId),
                gte(posts.scheduledAt, startDate),
                lte(posts.scheduledAt, endDate)
            )
        )
        .orderBy(asc(posts.scheduledAt));

    // Group results by post
    const postsMap = new Map();

    for (const row of postsWithDetails) {
        if (!postsMap.has(row.post.id)) {
            postsMap.set(row.post.id, {
                ...row.post,
                destinations: [],
            });
        }

        postsMap.get(row.post.id).destinations.push({
            ...row.destination,
            account: row.account,
        });
    }

    return Array.from(postsMap.values());
}

export async function getScheduledPostsReadyToPublish() {
    const now = new Date();

    return await db
        .select({
            post: posts,
            destinations: sql<any>`
                json_agg(
                    json_build_object(
                        'id', ${postDestinations.id},
                        'socialAccountId', ${postDestinations.socialAccountId},
                        'platform', ${postDestinations.platform},
                        'postType', ${postDestinations.postType}
                    )
                )
            `.as('destinations'),
        })
        .from(posts)
        .innerJoin(postDestinations, eq(posts.id, postDestinations.postId))
        .where(
            and(
                eq(posts.status, 'scheduled'),
                lte(posts.scheduledAt, now),
                eq(postDestinations.status, 'scheduled')
            )
        )
        .groupBy(posts.id);
}

export async function updatePostStatus(
    postId: number,
    status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed'
) {
    const [updated] = await db
        .update(posts)
        .set({
            status,
            publishedAt: status === 'published' ? new Date() : undefined,
            updatedAt: new Date(),
        })
        .where(eq(posts.id, postId))
        .returning();

    return updated;
}

export async function updateDestinationStatus(
    destinationId: number,
    status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed',
    platformPostId?: string,
    error?: string,
    metadata?: any
) {
    const [updated] = await db
        .update(postDestinations)
        .set({
            status,
            platformPostId,
            error,
            metadata,
            publishedAt: status === 'published' ? new Date() : undefined,
        })
        .where(eq(postDestinations.id, destinationId))
        .returning();

    return updated;
}

// ============= Media Management Queries =============

export async function addMediaToPost(postId: number, media: Omit<NewMediaFile, 'id' | 'postId' | 'createdAt'>[]) {
    const mediaWithPostId = media.map(m => ({
        ...m,
        postId,
    }));

    return await db
        .insert(mediaFiles)
        .values(mediaWithPostId)
        .returning();
}

export async function getMediaForPost(postId: number) {
    return await db
        .select()
        .from(mediaFiles)
        .where(eq(mediaFiles.postId, postId))
        .orderBy(asc(mediaFiles.order));
}

// ============= Analytics Queries =============

export async function getPostingStats(userId: number, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await db
        .select({
            platform: postDestinations.platform,
            status: postDestinations.status,
            count: sql<number>`count(*)`.as('count'),
        })
        .from(posts)
        .innerJoin(postDestinations, eq(posts.id, postDestinations.postId))
        .where(
            and(
                eq(posts.userId, userId),
                gte(posts.createdAt, startDate)
            )
        )
        .groupBy(postDestinations.platform, postDestinations.status);

    return stats;
}

export async function getUpcomingPostsCount(userId: number) {
    const now = new Date();

    const [result] = await db
        .select({
            count: sql<number>`count(distinct ${posts.id})`.as('count'),
        })
        .from(posts)
        .where(
            and(
                eq(posts.userId, userId),
                eq(posts.status, 'scheduled'),
                gte(posts.scheduledAt, now)
            )
        );

    return result.count;
}
