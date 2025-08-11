// src/hooks/use-posts.ts
'use client';

import { useState } from 'react';

export interface CreatePostData {
    content: string;
    mediaType: 'image' | 'video' | 'carousel' | 'text_only';
    status?: 'draft' | 'scheduled' | 'published';
    scheduledAt?: string | null;
}

export interface Post {
    id: number;
    userId: number;
    content: string;
    mediaType: 'image' | 'video' | 'carousel' | 'text_only';
    status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
    scheduledAt: string | null;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface PostsResponse {
    success: boolean;
    posts: Post[];
    pagination: {
        page: number;
        limit: number;
        hasMore: boolean;
    };
}

export interface CreatePostResponse {
    success: boolean;
    post: Post;
}

export const usePosts = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createPost = async (postData: CreatePostData): Promise<CreatePostResponse | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for authentication
                body: JSON.stringify({
                    content: postData.content,
                    mediaType: postData.mediaType,
                    status: postData.status || 'draft',
                    scheduledAt: postData.scheduledAt,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create post');
            }

            const result: CreatePostResponse = await response.json();
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Create post error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const getPosts = async (page: number = 1, limit: number = 10): Promise<PostsResponse | null> => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            const response = await fetch(`/api/posts?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch posts');
            }

            const result: PostsResponse = await response.json();
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Get posts error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const saveDraft = async (postData: Omit<CreatePostData, 'status'>): Promise<CreatePostResponse | null> => {
        return createPost({
            ...postData,
            status: 'draft',
        });
    };

    const schedulePost = async (
        postData: Omit<CreatePostData, 'status' | 'scheduledAt'> & { scheduledAt: string }
    ): Promise<CreatePostResponse | null> => {
        return createPost({
            ...postData,
            status: 'scheduled',
            scheduledAt: postData.scheduledAt,
        });
    };

    const publishNow = async (postData: Omit<CreatePostData, 'status' | 'scheduledAt'>): Promise<CreatePostResponse | null> => {
        return createPost({
            ...postData,
            status: 'published',
            scheduledAt: null,
        });
    };

    return {
        // State
        loading,
        error,

        // Methods
        createPost,
        getPosts,
        saveDraft,
        schedulePost,
        publishNow,
    };
};
