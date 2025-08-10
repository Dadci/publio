import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Create separate connection for audit logs to avoid transaction conflicts
const auditPool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 2, // Smaller pool for audit logs
});
const auditDb = drizzle(auditPool);

export interface AuditLogEntry {
    userId?: number;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
    success: boolean;
    errorMessage?: string;
}

// In-memory buffer for high-frequency logging
const auditBuffer: AuditLogEntry[] = [];
const BUFFER_SIZE = 100;
const FLUSH_INTERVAL = 5000; // 5 seconds

// Create audit_logs table schema
export const auditLogsTable = {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'integer', references: 'users.id' },
    action: { type: 'varchar(100)', notNull: true },
    resource: { type: 'varchar(100)', notNull: true },
    resource_id: { type: 'varchar(100)' },
    details: { type: 'jsonb' },
    ip_address: { type: 'varchar(45)' },
    user_agent: { type: 'text' },
    timestamp: { type: 'timestamp', notNull: true, default: 'now()' },
    success: { type: 'boolean', notNull: true },
    error_message: { type: 'text' },
};

async function flushAuditBuffer() {
    if (auditBuffer.length === 0) return;

    const entries = auditBuffer.splice(0, auditBuffer.length);

    try {
        // Use parameterized query for safety
        const placeholders = entries.map((_, i) => {
            const base = i * 10;
            return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10})`;
        }).join(', ');

        const query = `
      INSERT INTO audit_logs (user_id, action, resource, resource_id, details, ip_address, user_agent, timestamp, success, error_message)
      VALUES ${placeholders}
    `;

        const values = entries.flatMap(entry => [
            entry.userId || null,
            entry.action,
            entry.resource,
            entry.resourceId || null,
            JSON.stringify(entry.details || {}),
            entry.ipAddress || null,
            entry.userAgent || null,
            entry.timestamp,
            entry.success,
            entry.errorMessage || null,
        ]);

        const client = await auditPool.connect();
        try {
            await client.query(query, values);
            console.log(`Flushed ${entries.length} audit log entries`);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Failed to flush audit logs:', error);
        // Re-add entries to buffer for retry
        auditBuffer.unshift(...entries);
    }
}

// Start periodic flushing
setInterval(flushAuditBuffer, FLUSH_INTERVAL);

// Also flush on process exit
process.on('beforeExit', flushAuditBuffer);
process.on('SIGTERM', flushAuditBuffer);
process.on('SIGINT', flushAuditBuffer);

export function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>) {
    const auditEntry: AuditLogEntry = {
        ...entry,
        timestamp: new Date(),
    };

    auditBuffer.push(auditEntry);

    // Flush immediately if buffer is full
    if (auditBuffer.length >= BUFFER_SIZE) {
        flushAuditBuffer();
    }
}

// Helper function to extract client info from request
export function getClientInfo(request: Request) {
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] :
        request.headers.get('x-real-ip') ||
        'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';

    return { ipAddress, userAgent };
}

// Pre-defined audit actions
export const AuditActions = {
    // Authentication
    LOGIN_SUCCESS: 'login_success',
    LOGIN_FAILED: 'login_failed',
    LOGOUT: 'logout',
    TOKEN_REFRESH: 'token_refresh',

    // User management
    USER_CREATED: 'user_created',
    USER_UPDATED: 'user_updated',
    USER_DELETED: 'user_deleted',
    PASSWORD_CHANGED: 'password_changed',

    // Social accounts
    SOCIAL_ACCOUNT_CONNECTED: 'social_account_connected',
    SOCIAL_ACCOUNT_DISCONNECTED: 'social_account_disconnected',
    SOCIAL_ACCOUNT_TOKEN_REFRESHED: 'social_account_token_refreshed',

    // Posts
    POST_CREATED: 'post_created',
    POST_UPDATED: 'post_updated',
    POST_DELETED: 'post_deleted',
    POST_SCHEDULED: 'post_scheduled',
    POST_PUBLISHED: 'post_published',

    // File uploads
    FILE_UPLOADED: 'file_uploaded',
    FILE_DELETED: 'file_deleted',

    // Admin actions
    ADMIN_USER_CREATED: 'admin_user_created',
    ADMIN_USER_ROLE_CHANGED: 'admin_user_role_changed',
    ADMIN_SYSTEM_CONFIG_CHANGED: 'admin_system_config_changed',

    // Security events
    RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
    INVALID_TOKEN: 'invalid_token',
    UNAUTHORIZED_ACCESS: 'unauthorized_access',
    SUSPICIOUS_ACTIVITY: 'suspicious_activity',
} as const;

export const AuditResources = {
    USER: 'user',
    SOCIAL_ACCOUNT: 'social_account',
    POST: 'post',
    FILE: 'file',
    SYSTEM: 'system',
    AUTH: 'auth',
} as const;
