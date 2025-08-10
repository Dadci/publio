import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';

async function getPostsHandler(request: NextRequest) {
    try {
        const user = (request as any).user;
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        // Get user's posts
        const userPosts = await db
            .select()
            .from(posts)
            .where(eq(posts.userId, user.userId))
            .orderBy(desc(posts.createdAt))
            .limit(limit)
            .offset(offset);

        return NextResponse.json({
            success: true,
            posts: userPosts,
            pagination: {
                page,
                limit,
                hasMore: userPosts.length === limit,
            },
        });
    } catch (error) {
        console.error('Get posts error:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function createPostHandler(request: NextRequest) {
    try {
        const user = (request as any).user;
        const body = await request.json();

        // Basic validation
        if (!body.content || !body.mediaType) {
            return NextResponse.json(
                { error: 'Content and media type are required' },
                { status: 400 }
            );
        }

        // Create post
        const newPost = await db
            .insert(posts)
            .values({
                userId: user.userId,
                content: body.content,
                mediaType: body.mediaType,
                status: body.status || 'draft',
                scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
            })
            .returning();

        return NextResponse.json({
            success: true,
            post: newPost[0],
        });
    } catch (error) {
        console.error('Create post error:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Wrap with authentication
export const GET = requireAuth(getPostsHandler);
export const POST = requireAuth(createPostHandler);
