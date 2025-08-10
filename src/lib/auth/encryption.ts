import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const algorithm = 'aes-256-gcm';
const secretKey = process.env.ENCRYPTION_KEY!;

if (!secretKey) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
}

// Ensure the key is 32 bytes for AES-256
const key = crypto.scryptSync(secretKey, 'salt', 32);

export function encrypt(text: string): string {
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher(algorithm, key);
        cipher.setAutoPadding(true);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        // Combine iv, authTag, and encrypted data
        return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    } catch (error) {
        throw new Error('Failed to encrypt data');
    }
}

export function decrypt(encryptedData: string): string {
    try {
        const parts = encryptedData.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];

        const decipher = crypto.createDecipher(algorithm, key);
        decipher.setAuthTag(authTag);
        decipher.setAutoPadding(true);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        throw new Error('Failed to decrypt data');
    }
}

export async function hashPassword(password: string): Promise<string> {
    try {
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        throw new Error('Failed to hash password');
    }
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        throw new Error('Failed to verify password');
    }
}
