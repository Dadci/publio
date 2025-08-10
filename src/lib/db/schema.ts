// src/lib/db/schema.ts

import { pgTable, serial, text, timestamp, varchar, boolean, jsonb, integer, pgEnum, index } from 'drizzle-orm/pg-core';

// First, define your enums for platform types and post statuses
export const platformEnum = pgEnum('platform', ['facebook', 'instagram', 'tiktok']);
export const postStatusEnum = pgEnum('post_status', ['draft', 'scheduled', 'publishing', 'published', 'failed']);
export const mediaTypeEnum = pgEnum('media_type', ['image', 'video', 'carousel', 'text_only']);
export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);

// Users table remains similar but needs password for auth
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(), // Add this
    role: userRoleEnum('role').default('user').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// This is the crucial table you're missing - social account connections
export const socialAccounts = pgTable('social_accounts', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    platform: platformEnum('platform').notNull(),
    accountName: varchar('account_name', { length: 255 }).notNull(), // Display name
    platformAccountId: varchar('platform_account_id', { length: 255 }).notNull(), // Facebook page ID, Instagram account ID, etc.
    accessToken: text('access_token').notNull(), // Encrypted in production
    refreshToken: text('refresh_token'), // Some platforms use refresh tokens
    tokenExpiresAt: timestamp('token_expires_at'),
    isActive: boolean('is_active').default(true).notNull(),
    metadata: jsonb('metadata'), // Store platform-specific data
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        userPlatformIdx: index('idx_social_accounts_user_platform').on(table.userId, table.platform),
    };
});

// Transform your posts table to handle multi-platform scheduling
export const posts = pgTable('posts', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    content: text('content').notNull(),
    mediaType: mediaTypeEnum('media_type').notNull(),
    status: postStatusEnum('status').default('draft').notNull(),
    scheduledAt: timestamp('scheduled_at'), // When to publish
    publishedAt: timestamp('published_at'), // When actually published
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        userScheduledIdx: index('idx_posts_user_scheduled').on(table.userId, table.scheduledAt),
    };
});

// Junction table for many-to-many relationship (one post can go to multiple accounts)
export const postDestinations = pgTable('post_destinations', {
    id: serial('id').primaryKey(),
    postId: integer('post_id').references(() => posts.id).notNull(),
    socialAccountId: integer('social_account_id').references(() => socialAccounts.id).notNull(),
    platform: platformEnum('platform').notNull(), // Denormalized for easier querying
    platformPostId: varchar('platform_post_id', { length: 255 }), // ID returned by platform after posting
    postType: varchar('post_type', { length: 50 }), // 'feed', 'story', 'reel', etc.
    status: postStatusEnum('status').default('scheduled').notNull(),
    publishedAt: timestamp('published_at'),
    error: text('error'), // Store error message if posting fails
    metadata: jsonb('metadata'), // Platform-specific response data
});

// Table for storing media files
export const mediaFiles = pgTable('media_files', {
    id: serial('id').primaryKey(),
    postId: integer('post_id').references(() => posts.id).notNull(),
    fileUrl: text('file_url').notNull(), // URL to your stored file
    fileType: varchar('file_type', { length: 50 }).notNull(), // 'image/jpeg', 'video/mp4', etc.
    fileSize: integer('file_size').notNull(), // in bytes
    width: integer('width'),
    height: integer('height'),
    duration: integer('duration'), // for videos, in seconds
    thumbnailUrl: text('thumbnail_url'), // for video thumbnails
    order: integer('order').default(0), // for carousel posts
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Table for audit logging
export const auditLogs = pgTable('audit_logs', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    action: varchar('action', { length: 100 }).notNull(),
    resource: varchar('resource', { length: 100 }).notNull(),
    resourceId: varchar('resource_id', { length: 100 }),
    details: jsonb('details'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    success: boolean('success').notNull(),
    errorMessage: text('error_message'),
});

// Type exports for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type SocialAccount = typeof socialAccounts.$inferSelect;
export type NewSocialAccount = typeof socialAccounts.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type PostDestination = typeof postDestinations.$inferSelect;
export type NewPostDestination = typeof postDestinations.$inferInsert;

export type MediaFile = typeof mediaFiles.$inferSelect;
export type NewMediaFile = typeof mediaFiles.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;