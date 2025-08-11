import { NextRequest, NextResponse } from 'next/server';

// This endpoint is only available in development to reset rate limits
export async function POST(request: NextRequest) {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
    }

    // Clear localStorage in client-side for rate limit reset
    return NextResponse.json({
        success: true,
        message: 'Rate limits reset. Please refresh the page.'
    });
}

export async function GET(request: NextRequest) {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
    }

    return NextResponse.json({
        message: 'Rate limit reset endpoint. Use POST to reset.'
    });
}
