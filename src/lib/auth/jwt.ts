// src/lib/auth/jwt.ts
import { SignJWT, jwtVerify } from 'jose';
import { SessionPayload } from './validation';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function signJWT(payload: Omit<SessionPayload, 'iat' | 'exp'>): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(process.env.JWT_EXPIRES_IN || '7d')
        .sign(secret);
}

export async function verifyJWT(token: string): Promise<SessionPayload> {
    try {
        const { payload } = await jwtVerify(token, secret);

        // Validate payload structure
        if (!payload.userId || !payload.email || !payload.name) {
            throw new Error('Invalid token payload');
        }

        return payload as unknown as SessionPayload;
    } catch (error) {
        throw new Error('Invalid token');
    }
}

export async function getJWTPayload(token: string): Promise<SessionPayload | null> {
    try {
        return await verifyJWT(token);
    } catch {
        return null;
    }
}
