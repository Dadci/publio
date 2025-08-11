// src/hooks/use-post-form.ts
'use client';

import { useState } from 'react';

export interface PostFormData {
    content: string;
    mediaType: 'image' | 'video' | 'carousel' | 'text_only';
    selectedPlatforms: string[];
    scheduledAt: string | null;
    mediaFiles: Array<{ id: string; file: File; preview: string }>;
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

    const updateContent = (content: string) => {
        setFormData(prev => ({ ...prev, content }));
        if (content.trim() && errors.content) {
            setErrors(prev => ({ ...prev, content: undefined }));
        }
    };

    const updateMediaType = (mediaType: PostFormData['mediaType']) => {
        setFormData(prev => ({ ...prev, mediaType }));
    };

    const updateMediaFiles = (mediaFiles: Array<{ id: string; file: File; preview: string }>) => {
        setFormData(prev => ({ ...prev, mediaFiles }));

        // Auto-update media type based on files
        if (mediaFiles.length > 1) {
            setFormData(prev => ({ ...prev, mediaType: 'carousel' }));
        } else if (mediaFiles.length === 1) {
            const file = mediaFiles[0];
            if (file.file.type.startsWith('image/')) {
                setFormData(prev => ({ ...prev, mediaType: 'image' }));
            } else if (file.file.type.startsWith('video/')) {
                setFormData(prev => ({ ...prev, mediaType: 'video' }));
            }
        }
    };

    const togglePlatform = (platform: string) => {
        setFormData(prev => ({
            ...prev,
            selectedPlatforms: prev.selectedPlatforms.includes(platform)
                ? prev.selectedPlatforms.filter(p => p !== platform)
                : [...prev.selectedPlatforms, platform]
        }));
        if (errors.platforms) {
            setErrors(prev => ({ ...prev, platforms: undefined }));
        }
    };

    const updateScheduledAt = (scheduledAt: string | null) => {
        setFormData(prev => ({ ...prev, scheduledAt }));
        if (scheduledAt && errors.schedule) {
            setErrors(prev => ({ ...prev, schedule: undefined }));
        }
    };

    const resetForm = () => {
        setFormData({
            content: '',
            mediaType: 'text_only',
            selectedPlatforms: [],
            scheduledAt: null,
            mediaFiles: [],
        });
        setErrors({});
    };

    const validateForm = (): boolean => {
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
    };

    const isValid = () => {
        return formData.content.trim().length > 0 && formData.selectedPlatforms.length > 0;
    };

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
    };
};