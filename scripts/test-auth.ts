#!/usr/bin/env tsx

// Load environment variables
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local from the project root
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function testLogin() {
    try {
        console.log('🧪 Testing authentication system...');

        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@publio.app',
                password: 'admin123!',
            }),
        });

        const data = await response.json();
        console.log('📊 Login Response Status:', response.status);
        console.log('📊 Login Response Data:', data);

        if (response.ok) {
            console.log('✅ Login successful!');

            // Test the protected route
            const protectedResponse = await fetch('http://localhost:3000/api/auth/me', {
                method: 'GET',
                headers: {
                    'Cookie': response.headers.get('set-cookie') || '',
                },
            });

            const protectedData = await protectedResponse.json();
            console.log('📊 Protected Route Response:', protectedData);

            if (protectedResponse.ok) {
                console.log('✅ Protected route access successful!');
            } else {
                console.log('❌ Protected route access failed');
            }
        } else {
            console.log('❌ Login failed');
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testLogin();
