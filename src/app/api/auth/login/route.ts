import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { loginSchema } from '@/lib/auth/validation';
import { verifyPassword } from '@/lib/auth/encryption';
import { signJWT } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate request body
        const validatedData = loginSchema.parse(body);

        // Find user by email
        const user = await db
            .select()
            .from(users)
            .where(eq(users.email, validatedData.email))
            .limit(1);

        if (user.length === 0) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const userData = user[0];

        // Verify password
        const isValidPassword = await verifyPassword(
            validatedData.password,
            userData.passwordHash
        );

        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = await signJWT({
            userId: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
        });

        // Set secure cookie
        const response = NextResponse.json({
            success: true,
            user: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                role: userData.role,
            },
        });

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);

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
