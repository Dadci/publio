import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './src/lib/auth/jwt';
import {
    loginRateLimiter,
    apiRateLimiter,
    uploadRateLimiter,
    getRateLimitIdentifier,
    createRateLimitResponse
} from './src/lib/auth/rate-limiter';

// Routes that don't require authentication
const publicRoutes = [
    '/api/auth/login',
    '/api/auth/logout',
    '/api/setup', // Allow setup routes for initial configuration
];

// Routes that require admin role
const adminRoutes = [
    '/api/admin',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for static files
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        (pathname.includes('.') && !pathname.startsWith('/api/'))
    ) {
        return NextResponse.next();
    }

    // Apply rate limiting to API routes
    if (pathname.startsWith('/api/')) {
        const identifier = getRateLimitIdentifier(request);

        if (pathname === '/api/auth/login' || pathname === '/api/auth/register') {
            const rateLimitResult = loginRateLimiter.isAllowed(identifier);
            if (!rateLimitResult.allowed) {
                return createRateLimitResponse(rateLimitResult.resetTime, identifier);
            }
        } else if (pathname.startsWith('/api/upload/')) {
            const rateLimitResult = uploadRateLimiter.isAllowed(identifier);
            if (!rateLimitResult.allowed) {
                return createRateLimitResponse(rateLimitResult.resetTime, identifier);
            }
        } else if (pathname.startsWith('/api/')) {
            const rateLimitResult = apiRateLimiter.isAllowed(identifier);
            if (!rateLimitResult.allowed) {
                return createRateLimitResponse(rateLimitResult.resetTime, identifier);
            }
        }
    }

    // Skip auth for public routes
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // Only apply auth to API routes
    if (!pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    try {
        // Get token from Authorization header or cookies
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '') ||
            request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const user = await verifyJWT(token);

        // Check admin routes
        if (pathname.startsWith('/api/admin') && user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        // Add user to request headers for use in API routes
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', user.userId.toString());
        requestHeaders.set('x-user-email', user.email);
        requestHeaders.set('x-user-role', user.role);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid authentication token' },
            { status: 401 }
        );
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth/login (login endpoint)
         * - api/auth/logout (logout endpoint)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api/auth/login|api/auth/logout|_next/static|_next/image|favicon.ico).*)',
    ],
};
