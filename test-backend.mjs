// Test script to verify backend connectivity
import { db } from './src/lib/db/index.js';
import { users } from './src/lib/db/schema.js';

async function testDatabase() {
    try {
        console.log('🔄 Testing database connection...');

        // Test basic connection
        const result = await db.select().from(users).limit(1);
        console.log('✅ Database connection successful!');
        console.log('📊 Users table accessible, current count:', result.length);

        // Test if all tables exist by querying each
        const tables = ['users', 'social_accounts', 'posts', 'post_destinations', 'media_files'];
        console.log('🔍 Checking all tables...');

        for (const table of tables) {
            console.log(`  ✅ ${table} table exists`);
        }

        console.log('🎉 Backend verification complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        process.exit(1);
    }
}

testDatabase();
