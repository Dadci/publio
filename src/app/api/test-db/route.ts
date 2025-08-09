// src/app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, socialAccounts, posts, postDestinations, mediaFiles } from '@/lib/db/schema';

export async function GET() {
    try {
        // Test each table
        const userCount = await db.select().from(users).then(rows => rows.length);
        const socialAccountCount = await db.select().from(socialAccounts).then(rows => rows.length);
        const postCount = await db.select().from(posts).then(rows => rows.length);
        const destinationCount = await db.select().from(postDestinations).then(rows => rows.length);
        const mediaCount = await db.select().from(mediaFiles).then(rows => rows.length);

        return NextResponse.json({
            status: 'success',
            message: 'Database connection successful',
            tables: {
                users: userCount,
                socialAccounts: socialAccountCount,
                posts: postCount,
                postDestinations: destinationCount,
                mediaFiles: mediaCount,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Database test error:', error);
        return NextResponse.json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
