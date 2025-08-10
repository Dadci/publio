import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createUserSchema } from '@/lib/auth/validation';
import { hashPassword } from '@/lib/auth/encryption';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate request body
        const validatedData = createUserSchema.parse(body);

        // Check if user already exists
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, validatedData.email))
            .limit(1);

        if (existingUser.length > 0) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // For now, registration is disabled - users must be created by admin
        return NextResponse.json(
            {
                error: 'Registration is currently disabled. Please contact an administrator to create your account.'
            },
            { status: 403 }
        );

    } catch (error) {
        console.error('Registration error:', error);

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input data' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
