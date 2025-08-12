import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, mediaFiles } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';

async function getPostHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = (request as any).user;
        const { id } = await params;
        const postId = parseInt(id);

        if (isNaN(postId)) {
            return NextResponse.json(
                { error: 'Invalid post ID' },
                { status: 400 }
            );
        }

        // Get specific post for the user
        const post = await db
            .select()
            .from(posts)
            .where(and(eq(posts.id, postId), eq(posts.userId, user.userId)))
            .limit(1);

        if (post.length === 0) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        // Get media files for this post
        const media = await db
            .select()
            .from(mediaFiles)
            .where(eq(mediaFiles.postId, postId))
            .orderBy(asc(mediaFiles.order));

        return NextResponse.json({
            success: true,
            post: {
                ...post[0],
                mediaFiles: media,
            },
        });
    } catch (error) {
        console.error('Get post error:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function updatePostHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = (request as any).user;
        const { id } = await params;
        const postId = parseInt(id);
        const body = await request.json();

        if (isNaN(postId)) {
            return NextResponse.json(
                { error: 'Invalid post ID' },
                { status: 400 }
            );
        }

        // Start a transaction to handle both post and media files
        const result = await db.transaction(async (tx) => {
            // Update post
            const updatedPost = await tx
                .update(posts)
                .set({
                    content: body.content,
                    mediaType: body.mediaType,
                    status: body.status,
                    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
                    updatedAt: new Date(),
                })
                .where(and(eq(posts.id, postId), eq(posts.userId, user.userId)))
                .returning();

            if (updatedPost.length === 0) {
                throw new Error('Post not found');
            }

            // Handle media files if they exist
            if (body.mediaUrls && Array.isArray(body.mediaUrls)) {
                // Delete existing media files for this post
                await tx
                    .delete(mediaFiles)
                    .where(eq(mediaFiles.postId, postId));

                // Insert new media files if any
                if (body.mediaUrls.length > 0) {
                    const mediaFilePromises = body.mediaUrls.map(async (url: string, index: number) => {
                        const fileExtension = url.split('.').pop()?.toLowerCase() || '';
                        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
                        const isVideo = ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(fileExtension);

                        return tx.insert(mediaFiles).values({
                            postId: postId,
                            fileUrl: url,
                            fileType: isImage ? 'image/jpeg' : isVideo ? 'video/mp4' : 'application/octet-stream',
                            fileSize: 0,
                            width: null,
                            height: null,
                            duration: null,
                            thumbnailUrl: null,
                            order: index,
                        });
                    });

                    await Promise.all(mediaFilePromises);
                }
            }

            return updatedPost[0];
        });

        return NextResponse.json({
            success: true,
            post: result,
        });
    } catch (error) {
        console.error('Update post error:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function deletePostHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = (request as any).user;
        const { id } = await params;
        const postId = parseInt(id);

        if (isNaN(postId)) {
            return NextResponse.json(
                { error: 'Invalid post ID' },
                { status: 400 }
            );
        }

        // Delete post
        const deletedPost = await db
            .delete(posts)
            .where(and(eq(posts.id, postId), eq(posts.userId, user.userId)))
            .returning();

        if (deletedPost.length === 0) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Post deleted successfully',
        });
    } catch (error) {
        console.error('Delete post error:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Wrap with authentication
export const GET = requireAuth(getPostHandler);
export const PUT = requireAuth(updatePostHandler);
export const DELETE = requireAuth(deletePostHandler);
