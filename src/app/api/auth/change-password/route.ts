import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { changePasswordSchema } from '@/lib/auth/validation';
import { hashPassword, verifyPassword } from '@/lib/auth/encryption';
import { requireAuth } from '@/lib/auth/middleware';

async function changePasswordHandler(request: NextRequest) {
    try {
        const body = await request.json();
        const user = (request as any).user;

        // Validate request body
        const validatedData = changePasswordSchema.parse(body);

        // Get current user data
        const userData = await db
            .select()
            .from(users)
            .where(eq(users.id, user.userId))
            .limit(1);

        if (userData.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Verify current password
        const isValidPassword = await verifyPassword(
            validatedData.currentPassword,
            userData[0].passwordHash
        );

        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 400 }
            );
        }

        // Hash new password
        const newPasswordHash = await hashPassword(validatedData.newPassword);

        // Update password in database
        await db
            .update(users)
            .set({
                passwordHash: newPasswordHash,
                updatedAt: new Date(),
            })
            .where(eq(users.id, user.userId));

        return NextResponse.json({
            success: true,
            message: 'Password updated successfully',
        });
    } catch (error) {
        console.error('Change password error:', error);

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

// Wrap with authentication requirement
export const POST = requireAuth(changePasswordHandler);
