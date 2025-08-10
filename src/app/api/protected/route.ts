import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // User data is now available in headers thanks to middleware
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');
    const userRole = request.headers.get('x-user-role');

    return NextResponse.json({
        success: true,
        message: 'Protected route accessed successfully',
        user: {
            id: userId,
            email: userEmail,
            role: userRole,
        },
    });
}
