import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { loginSchema } from '@/lib/auth/validation';
import { verifyPassword } from '@/lib/auth/encryption';
import { signJWT } from '@/lib/auth/jwt';
import { logAuditEvent, getClientInfo, AuditActions, AuditResources } from '@/lib/auth/audit-logger';

export async function POST(request: NextRequest) {
    const clientInfo = getClientInfo(request);
    let userId: number | undefined;
    let email: string | undefined;

    try {
        const body = await request.json();

        // Validate request body
        const validatedData = loginSchema.parse(body);
        email = validatedData.email;

        // Find user by email
        const user = await db
            .select()
            .from(users)
            .where(eq(users.email, validatedData.email))
            .limit(1);

        if (user.length === 0) {
            // Log failed login attempt
            logAuditEvent({
                action: AuditActions.LOGIN_FAILED,
                resource: AuditResources.AUTH,
                details: { email, reason: 'user_not_found' },
                success: false,
                errorMessage: 'User not found',
                ...clientInfo,
            });

            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const userData = user[0];
        userId = userData.id;

        // Verify password
        const isValidPassword = await verifyPassword(
            validatedData.password,
            userData.passwordHash
        );

        if (!isValidPassword) {
            // Log failed login attempt
            logAuditEvent({
                userId,
                action: AuditActions.LOGIN_FAILED,
                resource: AuditResources.AUTH,
                details: { email, reason: 'invalid_password' },
                success: false,
                errorMessage: 'Invalid password',
                ...clientInfo,
            });

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

        // Log successful login
        logAuditEvent({
            userId,
            action: AuditActions.LOGIN_SUCCESS,
            resource: AuditResources.AUTH,
            details: { email, userAgent: clientInfo.userAgent },
            success: true,
            ...clientInfo,
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

        // Log system error
        logAuditEvent({
            userId,
            action: AuditActions.LOGIN_FAILED,
            resource: AuditResources.AUTH,
            details: { email, reason: 'system_error' },
            success: false,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            ...clientInfo,
        });

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
