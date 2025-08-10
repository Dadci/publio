import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
    try {
        const { authenticated, user } = await authenticate(request);

        if (!authenticated || !user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.userId,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Session verification error:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
