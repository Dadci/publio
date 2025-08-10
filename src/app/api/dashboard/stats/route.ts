import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, socialAccounts, postDestinations } from '@/lib/db/schema';
import { eq, count, and, gte } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';

async function getDashboardStatsHandler(request: NextRequest) {
    try {
        const user = (request as any).user;

        // Get total posts count
        const totalPostsResult = await db
            .select({ count: count() })
            .from(posts)
            .where(eq(posts.userId, user.userId));

        const totalPosts = totalPostsResult[0]?.count || 0;

        // Get published posts count
        const publishedPostsResult = await db
            .select({ count: count() })
            .from(posts)
            .where(and(eq(posts.userId, user.userId), eq(posts.status, 'published')));

        const publishedPosts = publishedPostsResult[0]?.count || 0;

        // Get scheduled posts count
        const scheduledPostsResult = await db
            .select({ count: count() })
            .from(posts)
            .where(and(eq(posts.userId, user.userId), eq(posts.status, 'scheduled')));

        const scheduledPosts = scheduledPostsResult[0]?.count || 0;

        // Get draft posts count
        const draftPostsResult = await db
            .select({ count: count() })
            .from(posts)
            .where(and(eq(posts.userId, user.userId), eq(posts.status, 'draft')));

        const draftPosts = draftPostsResult[0]?.count || 0;

        // Get connected social accounts count
        const connectedAccountsResult = await db
            .select({ count: count() })
            .from(socialAccounts)
            .where(and(eq(socialAccounts.userId, user.userId), eq(socialAccounts.isActive, true)));

        const connectedAccounts = connectedAccountsResult[0]?.count || 0;

        // Get social accounts by platform
        const accountsByPlatform = await db
            .select({
                platform: socialAccounts.platform,
                count: count(),
            })
            .from(socialAccounts)
            .where(and(eq(socialAccounts.userId, user.userId), eq(socialAccounts.isActive, true)))
            .groupBy(socialAccounts.platform);

        // Get recent posts (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentPostsResult = await db
            .select({ count: count() })
            .from(posts)
            .where(and(
                eq(posts.userId, user.userId),
                gte(posts.createdAt, sevenDaysAgo)
            ));

        const recentPosts = recentPostsResult[0]?.count || 0;

        return NextResponse.json({
            success: true,
            stats: {
                totalPosts,
                publishedPosts,
                scheduledPosts,
                draftPosts,
                connectedAccounts,
                recentPosts,
                accountsByPlatform: accountsByPlatform.reduce((acc, item) => {
                    acc[item.platform] = item.count;
                    return acc;
                }, {} as Record<string, number>),
            },
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Wrap with authentication
export const GET = requireAuth(getDashboardStatsHandler);
