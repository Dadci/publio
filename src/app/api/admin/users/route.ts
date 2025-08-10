import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createUserSchema } from '@/lib/auth/validation';
import { hashPassword } from '@/lib/auth/encryption';
import { requireRole } from '@/lib/auth/middleware';
import crypto from 'crypto';

async function createUserHandler(request: NextRequest) {
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

        // Generate a secure random password
        const password = crypto.randomBytes(12).toString('base64').replace(/[+/=]/g, '').substring(0, 12);
        const passwordHash = await hashPassword(password);

        // Create user
        const newUser = await db
            .insert(users)
            .values({
                name: validatedData.name,
                email: validatedData.email,
                passwordHash,
                role: validatedData.role,
            })
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
                createdAt: users.createdAt,
            });

        return NextResponse.json({
            success: true,
            user: newUser[0],
            temporaryPassword: password, // Return this securely to admin
        });
    } catch (error) {
        console.error('Create user error:', error);

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

// Wrap with admin role requirement
export const POST = requireRole('admin')(createUserHandler);
