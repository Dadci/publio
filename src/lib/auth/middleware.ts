import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from './jwt';

export async function authenticate(request: NextRequest) {
    try {
        // Get token from Authorization header or cookies
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '') ||
            request.cookies.get('auth-token')?.value;

        if (!token) {
            return { authenticated: false, user: null };
        }

        const user = await verifyJWT(token);
        return { authenticated: true, user };
    } catch (error) {
        return { authenticated: false, user: null };
    }
}

export function requireAuth(handler: Function) {
    return async (request: NextRequest, context?: any) => {
        const { authenticated, user } = await authenticate(request);

        if (!authenticated) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Add user to request context
        (request as any).user = user;
        return handler(request, context);
    };
}

export function requireRole(role: string) {
    return (handler: Function) => {
        return requireAuth(async (request: NextRequest, context?: any) => {
            const user = (request as any).user;

            if (user.role !== role) {
                return NextResponse.json(
                    { error: 'Forbidden' },
                    { status: 403 }
                );
            }

            return handler(request, context);
        });
    };
}
