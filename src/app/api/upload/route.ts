import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { requireAuth } from '@/lib/auth/middleware';

async function uploadHandler(request: NextRequest) {
    try {
        const user = (request as any).user;
        const formData = await request.formData();

        const file = formData.get('file') as File | null;
        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'File type not supported. Allowed: JPEG, PNG, GIF, MP4, MOV' },
                { status: 400 }
            );
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size must be less than 10MB' },
                { status: 400 }
            );
        }

        // Create upload directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'uploads', user.userId.toString());
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `${timestamp}.${fileExtension}`;
        const filePath = join(uploadDir, fileName);

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Return file URL
        const fileUrl = `/uploads/${user.userId}/${fileName}`;

        return NextResponse.json({
            success: true,
            file: {
                name: fileName,
                url: fileUrl,
                size: file.size,
                type: file.type,
            },
        });
    } catch (error) {
        console.error('Upload error:', error);

        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}

// Only allow POST requests with authentication
export const POST = requireAuth(uploadHandler);
