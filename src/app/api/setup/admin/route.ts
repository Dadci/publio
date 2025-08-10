import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/encryption';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        // Check if any admin user already exists
        const existingAdmin = await db
            .select()
            .from(users)
            .where(eq(users.role, 'admin'))
            .limit(1);

        if (existingAdmin.length > 0) {
            return NextResponse.json(
                { error: 'Admin user already exists' },
                { status: 409 }
            );
        }

        console.log('Creating admin user...');

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

        return NextResponse.json({
            success: true,
            message: 'Admin user created successfully',
            user: newAdmin[0],
            credentials: {
                email: adminEmail,
                password: adminPassword,
                warning: 'Change this password immediately after first login!',
            },
        });

    } catch (error) {
        console.error('Error creating admin user:', error);

        return NextResponse.json(
            { error: 'Failed to create admin user' },
            { status: 500 }
        );
    }
}
