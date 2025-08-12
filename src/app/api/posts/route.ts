import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, mediaFiles } from '@/lib/db/schema';
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

        if (!body.content || !body.mediaType) {
            return NextResponse.json(
                { error: 'Content and media type are required' },
                { status: 400 }
            );
        }

        // Start a transaction to ensure data consistency
        const result = await db.transaction(async (tx) => {
            // Create post
            const newPost = await tx
                .insert(posts)
                .values({
                    userId: user.userId,
                    content: body.content,
                    mediaType: body.mediaType,
                    status: body.status || 'draft',
                    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
                })
                .returning();

            const postId = newPost[0].id;

            // Handle media files if they exist
            if (body.mediaUrls && Array.isArray(body.mediaUrls) && body.mediaUrls.length > 0) {
                const mediaFilePromises = body.mediaUrls.map(async (url: string, index: number) => {
                    // Extract basic info from URL for now
                    // In a real app, you might want to store more metadata during upload
                    const fileExtension = url.split('.').pop()?.toLowerCase() || '';
                    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
                    const isVideo = ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(fileExtension);

                    return tx.insert(mediaFiles).values({
                        postId: postId,
                        fileUrl: url,
                        fileType: isImage ? 'image/jpeg' : isVideo ? 'video/mp4' : 'application/octet-stream',
                        fileSize: 0, // Default to 0 for now - could be populated during upload
                        width: null,
                        height: null,
                        duration: null,
                        thumbnailUrl: null,
                        order: index,
                    });
                });

                await Promise.all(mediaFilePromises);
            }

            return newPost[0];
        });

        return NextResponse.json({
            success: true,
            post: result,
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
