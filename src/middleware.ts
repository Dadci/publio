import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/auth/jwt';

// In-memory rate limiter for Edge Runtime
class EdgeRateLimiter {
    private store = new Map<string, { count: number; resetTime: number }>();

    constructor(private maxRequests: number, private windowMs: number) { }

    isAllowed(key: string): { allowed: boolean; remaining: number; resetTime: number } {
        const now = Date.now();
        const record = this.store.get(key);

        if (!record || now > record.resetTime) {
            // First request or window expired
            const resetTime = now + this.windowMs;
            this.store.set(key, { count: 1, resetTime });
            return { allowed: true, remaining: this.maxRequests - 1, resetTime };
        }

        if (record.count >= this.maxRequests) {
            return { allowed: false, remaining: 0, resetTime: record.resetTime };
        }

        record.count++;
        this.store.set(key, record);
        return { allowed: true, remaining: this.maxRequests - record.count, resetTime: record.resetTime };
    }

    // Cleanup old entries periodically
    cleanup() {
        const now = Date.now();
        for (const [key, record] of this.store.entries()) {
            if (now > record.resetTime) {
                this.store.delete(key);
            }
        }
    }

    // Clear all entries (useful for development)
    clear() {
        this.store.clear();
    }
}

// Create rate limiters - More permissive for development
const isDevelopment = process.env.NODE_ENV === 'development';

const loginRateLimiter = new EdgeRateLimiter(
    isDevelopment ? 50 : 5,
    isDevelopment ? 60 * 1000 : 15 * 60 * 1000
); // Dev: 50 requests per minute, Prod: 5 requests per 15 minutes

const apiRateLimiter = new EdgeRateLimiter(
    isDevelopment ? 500 : 100,
    60 * 1000
); // Dev: 500 requests per minute, Prod: 100 requests per minute

const uploadRateLimiter = new EdgeRateLimiter(
    isDevelopment ? 50 : 10,
    60 * 1000
); // Dev: 50 requests per minute, Prod: 10 requests per minute

function getRateLimitIdentifier(request: NextRequest): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        '127.0.0.1';
}

function createRateLimitResponse(resetTime: number, identifier: string): NextResponse {
    console.log(`[RATE LIMIT] Blocking request from ${identifier}, reset at ${new Date(resetTime)}`);
    return NextResponse.json(
        {
            error: 'Too many requests. Please try again later.',
            resetTime: Math.ceil((resetTime - Date.now()) / 1000)
        },
        {
            status: 429,
            headers: {
                'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
                'X-RateLimit-Limit': '5',
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString()
            }
        }
    );
}

// Routes that don't require authentication
const publicRoutes = [
    '/api/auth/login',
    '/api/auth/logout',
    '/api/setup', // Allow setup routes for initial configuration
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    console.log(`[MIDDLEWARE] Processing: ${pathname}`);

    // Apply rate limiting to API routes first
    if (pathname.startsWith('/api/')) {
        const identifier = getRateLimitIdentifier(request);
        console.log(`[RATE LIMIT] Path: ${pathname}, IP: ${identifier}`);

        if (pathname === '/api/auth/login' || pathname === '/api/auth/register') {
            const rateLimitResult = loginRateLimiter.isAllowed(identifier);
            console.log(`[RATE LIMIT] Login - allowed: ${rateLimitResult.allowed}, remaining: ${rateLimitResult.remaining}`);
            if (!rateLimitResult.allowed) {
                console.log(`[RATE LIMIT] BLOCKING - rate limit exceeded for ${identifier}`);
                return createRateLimitResponse(rateLimitResult.resetTime, identifier);
            }
        } else if (pathname.startsWith('/api/upload/')) {
            const rateLimitResult = uploadRateLimiter.isAllowed(identifier);
            if (!rateLimitResult.allowed) {
                return createRateLimitResponse(rateLimitResult.resetTime, identifier);
            }
        } else {
            const rateLimitResult = apiRateLimiter.isAllowed(identifier);
            if (!rateLimitResult.allowed) {
                return createRateLimitResponse(rateLimitResult.resetTime, identifier);
            }
        }
    }

    // Skip auth for public routes
    if (publicRoutes.includes(pathname)) {
        console.log(`[MIDDLEWARE] Public route: ${pathname}`);
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
    matcher: '/api/:path*',
};
