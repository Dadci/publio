// src/hooks/use-posts.ts
'use client';

import { useState } from 'react';

export interface CreatePostData {
    content: string;
    mediaType: 'image' | 'video' | 'carousel' | 'text_only';
    status?: 'draft' | 'scheduled' | 'published';
    scheduledAt?: string | null;
    mediaUrls?: string[];
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
    mediaFiles?: MediaFile[];
    destinations?: Array<{
        id: number;
        platform: string;
        socialAccountId: number;
    }>;
}

export interface MediaFile {
    id: number;
    postId: number;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    width: number | null;
    height: number | null;
    duration: number | null;
    thumbnailUrl: string | null;
    order: number;
    createdAt: string;
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
                    mediaUrls: postData.mediaUrls,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();

                // Handle authentication errors
                if (response.status === 401) {
                    window.location.href = '/login';
                    return null;
                }

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

                // Handle authentication errors
                if (response.status === 401) {
                    window.location.href = '/login';
                    return null;
                }

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

    const updatePost = async (postId: number, postData: CreatePostData): Promise<CreatePostResponse | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    content: postData.content,
                    mediaType: postData.mediaType,
                    status: postData.status || 'draft',
                    scheduledAt: postData.scheduledAt,
                    mediaUrls: postData.mediaUrls,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();

                if (response.status === 401) {
                    window.location.href = '/login';
                    return null;
                }

                throw new Error(errorData.error || 'Failed to update post');
            }

            const result: CreatePostResponse = await response.json();
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Update post error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deletePost = async (postId: number): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();

                if (response.status === 401) {
                    window.location.href = '/login';
                    return false;
                }

                throw new Error(errorData.error || 'Failed to delete post');
            }

            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Delete post error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const getPost = async (postId: number): Promise<{ success: boolean; post?: Post } | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();

                if (response.status === 401) {
                    window.location.href = '/login';
                    return null;
                }

                throw new Error(errorData.error || 'Failed to fetch post');
            }

            const result = await response.json();
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Get post error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        // State
        loading,
        error,

        // Methods
        createPost,
        getPosts,
        getPost,
        updatePost,
        deletePost,
        saveDraft,
        schedulePost,
        publishNow,
    };
};
