#!/usr/bin/env tsx

// Load environment variables
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local from the project root
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users } from '../src/lib/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

// Create database connection
const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
    console.error('❌ DATABASE_URL is not defined in environment variables');
    process.exit(1);
}

const pool = new Pool({
    connectionString: connectionString,
});
const db = drizzle(pool);

async function hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
}

async function createAdminUser() {
    try {
        console.log('🔍 Checking for existing admin user...');

        // Check if admin user already exists
        const existingAdmin = await db
            .select()
            .from(users)
            .where(eq(users.role, 'admin'))
            .limit(1);

        if (existingAdmin.length > 0) {
            console.log('✅ Admin user already exists:', existingAdmin[0].email);
            return;
        }

        console.log('🔐 Creating admin user...');

        // Create admin user with default credentials
        const adminEmail = 'admin@publio.app';
        const adminPassword = 'admin123!'; // Should be changed immediately
        const adminName = 'System Administrator';

        const passwordHash = await hashPassword(adminPassword);

        const newAdmin = await db
            .insert(users)
            .values({
                name: adminName,
                email: adminEmail,
                passwordHash,
                role: 'admin',
            })
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
            });

        console.log('✅ Admin user created successfully!');
        console.log('📧 Email:', adminEmail);
        console.log('🔑 Password:', adminPassword);
        console.log('⚠️  IMPORTANT: Change this password immediately after first login!');
        console.log('📊 User details:', newAdmin[0]);

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Run the script
createAdminUser();
