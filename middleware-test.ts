import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    console.log(`[SIMPLE MIDDLEWARE] Request to: ${request.nextUrl.pathname}`);

    if (request.nextUrl.pathname === '/api/auth/login') {
        console.log('[SIMPLE MIDDLEWARE] LOGIN REQUEST DETECTED!');
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
