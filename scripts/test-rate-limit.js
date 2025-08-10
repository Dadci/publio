#!/usr/bin/env node

// Improved rate limiting test
const http = require('http');

async function makeRequest(payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'User-Agent': 'RateLimitTest/1.0'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: body
                });
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function testRateLimit() {
    console.log('🔄 Testing Rate Limiting with rapid requests...');

    // Use valid format payload to avoid Zod validation errors
    const payload = {
        email: 'test@example.com',
        password: 'password123'
    };

    const results = [];

    // Make 7 rapid requests (exceeds limit of 5)
    for (let i = 0; i < 7; i++) {
        try {
            const start = Date.now();
            const result = await makeRequest(payload);
            const duration = Date.now() - start;

            results.push(result);
            console.log(`Request ${i + 1}: Status ${result.status} (${duration}ms)`);

            // Check for rate limit response
            if (result.status === 429) {
                console.log('✅ Rate limiting triggered!');
                console.log('📋 Rate limit headers:');
                console.log(`   Retry-After: ${result.headers['retry-after']}`);
                console.log(`   X-RateLimit-Reset: ${result.headers['x-ratelimit-reset']}`);
                break;
            }

            // Very small delay to ensure requests hit the same rate limit window
            await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
            console.error(`Request ${i + 1} failed:`, error.message);
        }
    }

    const rateLimitedRequests = results.filter(r => r.status === 429);

    if (rateLimitedRequests.length > 0) {
        console.log(`✅ Rate limiting is working! ${rateLimitedRequests.length} requests were blocked.`);
    } else {
        console.log('❌ No rate limiting detected.');
        console.log('📊 Response status breakdown:');
        const statusCounts = {};
        results.forEach(r => {
            statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
        });
        console.log(statusCounts);
    }
}

// Add debug logging for rate limiter
async function testRateLimitDebug() {
    console.log('\n🔧 Debug: Testing rate limiter logic...');

    // Test with manual rate limiter
    const InMemoryRateLimiter = require('../src/lib/auth/rate-limiter');

    // Create a test rate limiter with low limits for testing
    const testLimiter = new InMemoryRateLimiter.InMemoryRateLimiter(60000, 3); // 3 requests per minute

    for (let i = 0; i < 5; i++) {
        const result = testLimiter.isAllowed('test-ip');
        console.log(`Test ${i + 1}: Allowed=${result.allowed}, Remaining=${result.remaining}`);

        if (!result.allowed) {
            console.log('✅ Rate limiter logic is working correctly!');
            break;
        }
    }
}

async function runTests() {
    console.log('🧪 Enhanced Rate Limiting Test');
    console.log('==============================\n');

    await testRateLimit();

    console.log('\n' + '='.repeat(50) + '\n');

    console.log('💡 Note: Rate limiting applies to login attempts per IP address.');
    console.log('📝 In development, all requests come from localhost (127.0.0.1)');
    console.log('🔍 If no rate limiting is detected, check middleware logs and rate limiter implementation.');
}

runTests().catch(console.error);
