// src/lib/posting/publishers/base.ts

export interface PublishRequest {
    content: string;
    mediaUrls: string[];
    postType: string;
    accessToken: string;
    accountId: string;
}

export interface PublishResult {
    postId: string;
    metadata?: Record<string, any>;
}

export abstract class PlatformPublisher {
    abstract publish(request: PublishRequest): Promise<PublishResult>;
}
