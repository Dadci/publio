// src/lib/posting/posting-engine.ts

import { db } from '@/lib/db';
import { posts, postDestinations, socialAccounts } from '@/lib/db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { PlatformPublisher, FacebookPublisher, InstagramPublisher, TikTokPublisher } from './publishers';

export class PostingEngine {
    private publishers: Map<string, PlatformPublisher>;

    constructor() {
        this.publishers = new Map([
            ['facebook', new FacebookPublisher()],
            ['instagram', new InstagramPublisher()],
            ['tiktok', new TikTokPublisher()],
        ]);
    }

    // This method will be called by your cron job
    async processScheduledPosts() {
        const now = new Date();

        // Find all posts that should be published
        const scheduledPosts = await db
            .select()
            .from(posts)
            .where(
                and(
                    eq(posts.status, 'scheduled'),
                    lte(posts.scheduledAt, now)
                )
            );

        for (const post of scheduledPosts) {
            await this.publishPost(post.id);
        }
    }

    async publishPost(postId: number) {
        // Get the post data first
        const [post] = await db
            .select()
            .from(posts)
            .where(eq(posts.id, postId));

        if (!post) {
            throw new Error(`Post with ID ${postId} not found`);
        }

        // Get all destinations for this post
        const destinations = await db
            .select({
                destination: postDestinations,
                account: socialAccounts,
            })
            .from(postDestinations)
            .innerJoin(
                socialAccounts,
                eq(postDestinations.socialAccountId, socialAccounts.id)
            )
            .where(eq(postDestinations.postId, postId));

        // Publish to each platform
        const publishPromises = destinations.map(async ({ destination, account }) => {
            const publisher = this.publishers.get(account.platform);

            if (!publisher) {
                console.error(`No publisher found for platform: ${account.platform}`);
                return;
            }

            try {
                const result = await publisher.publish({
                    content: post.content,
                    mediaUrls: [], // You'll need to fetch these from mediaFiles table
                    postType: destination.postType || 'feed',
                    accessToken: account.accessToken,
                    accountId: account.platformAccountId,
                });

                // Update the destination with success
                await db
                    .update(postDestinations)
                    .set({
                        status: 'published',
                        publishedAt: new Date(),
                        platformPostId: result.postId,
                        metadata: result.metadata,
                    })
                    .where(eq(postDestinations.id, destination.id));

            } catch (error) {
                // Update the destination with failure
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                await db
                    .update(postDestinations)
                    .set({
                        status: 'failed',
                        error: errorMessage,
                    })
                    .where(eq(postDestinations.id, destination.id));
            }
        });

        await Promise.allSettled(publishPromises);

        // Check if all destinations have been processed
        const allDestinations = await db
            .select()
            .from(postDestinations)
            .where(eq(postDestinations.postId, postId));

        const allPublished = allDestinations.every(
            d => d.status === 'published' || d.status === 'failed'
        );

        if (allPublished) {
            const hasFailures = allDestinations.some(d => d.status === 'failed');

            await db
                .update(posts)
                .set({
                    status: hasFailures ? 'failed' : 'published',
                    publishedAt: new Date(),
                })
                .where(eq(posts.id, postId));
        }
    }
}