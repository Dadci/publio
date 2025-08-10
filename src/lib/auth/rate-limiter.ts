// Rate limiting implementation using in-memory store
// For production, consider using Redis or a database

interface RateLimitEntry {
    count: number;
    windowStart: number;
}

class InMemoryRateLimiter {
    private store = new Map<string, RateLimitEntry>();
    private windowMs: number;
    private maxRequests: number;

    constructor(windowMs: number, maxRequests: number) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
    }

    // Clean up expired entries periodically
    private cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (now - entry.windowStart > this.windowMs) {
                this.store.delete(key);
            }
        }
    }

    isAllowed(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
        this.cleanup();

        const now = Date.now();
        const entry = this.store.get(identifier);

        if (!entry || now - entry.windowStart > this.windowMs) {
            // New window or first request
            this.store.set(identifier, {
                count: 1,
                windowStart: now,
            });
            return {
                allowed: true,
                remaining: this.maxRequests - 1,
                resetTime: now + this.windowMs,
            };
        }

        if (entry.count >= this.maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: entry.windowStart + this.windowMs,
            };
        }

        entry.count++;
        return {
            allowed: true,
            remaining: this.maxRequests - entry.count,
            resetTime: entry.windowStart + this.windowMs,
        };
    }
}

// Different rate limiters for different endpoints
export const loginRateLimiter = new InMemoryRateLimiter(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
export const apiRateLimiter = new InMemoryRateLimiter(60 * 1000, 100); // 100 requests per minute
export const uploadRateLimiter = new InMemoryRateLimiter(60 * 1000, 10); // 10 uploads per minute

export function getRateLimitIdentifier(request: Request): string {
    // Use IP address as identifier
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] :
        request.headers.get('x-real-ip') ||
        'unknown';
    return ip;
}

export function createRateLimitResponse(resetTime: number, identifier: string) {
    // Log rate limit exceeded event
    const { logAuditEvent, AuditActions, AuditResources } = require('./audit-logger');

    logAuditEvent({
        action: AuditActions.RATE_LIMIT_EXCEEDED,
        resource: AuditResources.SYSTEM,
        details: { identifier, resetTime },
        success: false,
        errorMessage: 'Rate limit exceeded',
        ipAddress: identifier,
    });

    const resetDate = new Date(resetTime);
    return new Response(
        JSON.stringify({
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
            resetTime: resetDate.toISOString(),
        }),
        {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
                'X-RateLimit-Reset': resetDate.toISOString(),
            },
        }
    );
}
