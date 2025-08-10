import { NextRequest } from 'next/server';
import { logAuditEvent, getClientInfo, AuditActions, AuditResources } from './audit-logger';

// Utility wrapper for API routes to add automatic audit logging
export function withAuditLogging<T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<Response>,
    action: string,
    resource: string
) {
    return async (request: NextRequest, ...args: T): Promise<Response> => {
        const clientInfo = getClientInfo(request);
        const userId = request.headers.get('x-user-id');
        const userEmail = request.headers.get('x-user-email');

        const startTime = Date.now();
        let response: Response | undefined;
        let success = true;
        let errorMessage: string | undefined;

        try {
            response = await handler(request, ...args);
            success = response.ok;

            if (!response.ok) {
                const responseText = await response.clone().text();
                try {
                    const responseJson = JSON.parse(responseText);
                    errorMessage = responseJson.error || responseJson.message;
                } catch {
                    errorMessage = responseText || `HTTP ${response.status}`;
                }
            }
        } catch (error) {
            success = false;
            errorMessage = error instanceof Error ? error.message : 'Unknown error';

            // Log the failed request
            logAuditEvent({
                userId: userId ? parseInt(userId) : undefined,
                action,
                resource,
                details: {
                    method: request.method,
                    url: request.url,
                    userEmail,
                    duration: Date.now() - startTime,
                },
                success: false,
                errorMessage,
                ...clientInfo,
            });

            throw error; // Re-throw to maintain normal error handling
        }

        // Log successful request
        if (response) {
            logAuditEvent({
                userId: userId ? parseInt(userId) : undefined,
                action,
                resource,
                details: {
                    method: request.method,
                    url: request.url,
                    userEmail,
                    duration: Date.now() - startTime,
                    statusCode: response.status,
                },
                success,
                errorMessage,
                ...clientInfo,
            });
        }

        return response;
    };
}

// Helper to log specific events with user context from request
export function logUserAction(
    request: NextRequest,
    action: string,
    resource: string,
    details?: Record<string, any>,
    resourceId?: string,
    success: boolean = true,
    errorMessage?: string
) {
    const clientInfo = getClientInfo(request);
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');

    logAuditEvent({
        userId: userId ? parseInt(userId) : undefined,
        action,
        resource,
        resourceId,
        details: {
            ...details,
            userEmail,
        },
        success,
        errorMessage,
        ...clientInfo,
    });
}

// Predefined logging functions for common actions
export const auditHelpers = {
    logPostCreated: (request: NextRequest, postId: string, details?: Record<string, any>) =>
        logUserAction(request, AuditActions.POST_CREATED, AuditResources.POST, details, postId),

    logPostUpdated: (request: NextRequest, postId: string, details?: Record<string, any>) =>
        logUserAction(request, AuditActions.POST_UPDATED, AuditResources.POST, details, postId),

    logPostDeleted: (request: NextRequest, postId: string, details?: Record<string, any>) =>
        logUserAction(request, AuditActions.POST_DELETED, AuditResources.POST, details, postId),

    logSocialAccountConnected: (request: NextRequest, accountId: string, platform: string) =>
        logUserAction(request, AuditActions.SOCIAL_ACCOUNT_CONNECTED, AuditResources.SOCIAL_ACCOUNT,
            { platform }, accountId),

    logSocialAccountDisconnected: (request: NextRequest, accountId: string, platform: string) =>
        logUserAction(request, AuditActions.SOCIAL_ACCOUNT_DISCONNECTED, AuditResources.SOCIAL_ACCOUNT,
            { platform }, accountId),

    logFileUploaded: (request: NextRequest, fileName: string, fileSize: number) =>
        logUserAction(request, AuditActions.FILE_UPLOADED, AuditResources.FILE,
            { fileName, fileSize }),

    logUnauthorizedAccess: (request: NextRequest, attemptedResource: string, reason: string) =>
        logUserAction(request, AuditActions.UNAUTHORIZED_ACCESS, AuditResources.SYSTEM,
            { attemptedResource, reason }, undefined, false, reason),

    logSuspiciousActivity: (request: NextRequest, activityType: string, details?: Record<string, any>) =>
        logUserAction(request, AuditActions.SUSPICIOUS_ACTIVITY, AuditResources.SYSTEM,
            { activityType, ...details }, undefined, false, 'Suspicious activity detected'),
};
