// src/hooks/use-post-form.ts
'use client';

import { useState, useCallback } from 'react';
import { UploadedFile } from '@/components/posts/MediaUpload';

export interface PostFormData {
    content: string;
    mediaType: 'image' | 'video' | 'carousel' | 'text_only';
    selectedPlatforms: string[];
    scheduledAt: string | null;
    mediaFiles: UploadedFile[];
}

export interface FormErrors {
    content?: string;
    platforms?: string;
    media?: string;
    schedule?: string;
}

export const usePostForm = () => {
    const [formData, setFormData] = useState<PostFormData>({
        content: '',
        mediaType: 'text_only',
        selectedPlatforms: [],
        scheduledAt: null,
        mediaFiles: [],
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const updateContent = useCallback((content: string) => {
        setFormData(prev => ({ ...prev, content }));
        if (content.trim() && errors.content) {
            setErrors(prev => ({ ...prev, content: undefined }));
        }
    }, [errors.content]);

    const updateMediaType = useCallback((mediaType: PostFormData['mediaType']) => {
        setFormData(prev => ({ ...prev, mediaType }));
    }, []);

    const updateMediaFiles = useCallback((mediaFiles: UploadedFile[]) => {
        setFormData(prev => {
            const newData = { ...prev, mediaFiles };

            // Auto-update media type based on files
            if (mediaFiles.length > 1) {
                newData.mediaType = 'carousel';
            } else if (mediaFiles.length === 1) {
                const file = mediaFiles[0];
                if (file.type.startsWith('image/')) {
                    newData.mediaType = 'image';
                } else if (file.type.startsWith('video/')) {
                    newData.mediaType = 'video';
                }
            }

            return newData;
        });
    }, []);

    const togglePlatform = useCallback((platform: string) => {
        setFormData(prev => ({
            ...prev,
            selectedPlatforms: prev.selectedPlatforms.includes(platform)
                ? prev.selectedPlatforms.filter(p => p !== platform)
                : [...prev.selectedPlatforms, platform]
        }));
        if (errors.platforms) {
            setErrors(prev => ({ ...prev, platforms: undefined }));
        }
    }, [errors.platforms]);

    const updateScheduledAt = useCallback((scheduledAt: string | null) => {
        setFormData(prev => ({ ...prev, scheduledAt }));
        if (scheduledAt && errors.schedule) {
            setErrors(prev => ({ ...prev, schedule: undefined }));
        }
    }, [errors.schedule]);

    const resetForm = useCallback(() => {
        setFormData({
            content: '',
            mediaType: 'text_only',
            selectedPlatforms: [],
            scheduledAt: null,
            mediaFiles: [],
        });
        setErrors({});
    }, []);

    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        // Content validation
        if (!formData.content.trim()) {
            newErrors.content = 'Content is required';
        } else if (formData.content.length > 500) {
            newErrors.content = 'Content must be less than 500 characters';
        }

        // Platform validation
        if (formData.selectedPlatforms.length === 0) {
            newErrors.platforms = 'Select at least one platform';
        }

        // Media validation
        if (['image', 'video', 'carousel'].includes(formData.mediaType) && formData.mediaFiles.length === 0) {
            newErrors.media = 'Please upload media files for this post type';
        }

        // Schedule validation
        if (formData.scheduledAt) {
            const scheduledDate = new Date(formData.scheduledAt);
            if (scheduledDate <= new Date()) {
                newErrors.schedule = 'Scheduled time must be in the future';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const isValid = useCallback(() => {
        return formData.content.trim().length > 0 && formData.selectedPlatforms.length > 0;
    }, [formData.content, formData.selectedPlatforms]);

    return {
        formData,
        errors,
        updateContent,
        updateMediaType,
        updateMediaFiles,
        togglePlatform,
        updateScheduledAt,
        resetForm,
        validateForm,
        isValid,
        setFormData,
    };
};