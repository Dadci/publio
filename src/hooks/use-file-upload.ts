// src/hooks/use-file-upload.ts
'use client';

import { useState, useCallback, useRef } from 'react';

export interface FileWithPreview {
    id: string;
    file: File;
    preview: string;
    name: string;
    size: number;
    type: string;
    url?: string;
    uploaded?: boolean;
    error?: string;
}

export interface UseFileUploadOptions {
    accept?: string;
    maxSize?: number;
    multiple?: boolean;
    maxFiles?: number;
    initialFiles?: Array<{
        name: string;
        size: number;
        type: string;
        url: string;
        id: string;
    }>;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
    const {
        accept = 'image/*',
        maxSize = 5 * 1024 * 1024, // 5MB
        multiple = true,
        maxFiles = 6,
        initialFiles = []
    } = options;

    const [files, setFiles] = useState<FileWithPreview[]>(() =>
        initialFiles.map(file => ({
            id: file.id,
            file: new File([], file.name, { type: file.type }),
            preview: file.url,
            name: file.name,
            size: file.size,
            type: file.type,
            url: file.url,
            uploaded: true, // Mark initial files as already uploaded
        }))
    );
    const [isDragging, setIsDragging] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFiles = useCallback((fileList: FileList | File[]): { validFiles: File[], errors: string[] } => {
        const validFiles: File[] = [];
        const newErrors: string[] = [];

        Array.from(fileList).forEach(file => {
            // Check file type
            if (accept && !accept.split(',').some(type => {
                const trimmedType = type.trim();
                if (trimmedType.startsWith('.')) {
                    return file.name.toLowerCase().endsWith(trimmedType);
                }
                return file.type.match(trimmedType.replace('*', '.*'));
            })) {
                newErrors.push(`${file.name}: File type not supported`);
                return;
            }

            // Check file size
            if (file.size > maxSize) {
                newErrors.push(`${file.name}: File too large`);
                return;
            }

            // Check max files
            if (files.length + validFiles.length >= maxFiles) {
                newErrors.push(`Maximum ${maxFiles} files allowed`);
                return;
            }

            validFiles.push(file);
        });

        return { validFiles, errors: newErrors };
    }, [accept, maxSize, maxFiles, files.length]);

    const addFiles = useCallback((newFiles: File[]) => {
        const { validFiles, errors: validationErrors } = validateFiles(newFiles);

        setErrors(validationErrors);

        if (validFiles.length > 0) {
            const filesWithPreview: FileWithPreview[] = validFiles.map(file => ({
                id: `${file.name}-${Date.now()}-${Math.random()}`,
                file,
                preview: URL.createObjectURL(file),
                name: file.name,
                size: file.size,
                type: file.type
            }));

            setFiles(prev => [...prev, ...filesWithPreview]);
        }
    }, [validateFiles]);

    const removeFile = useCallback((fileId: string) => {
        setFiles(prev => {
            const fileToRemove = prev.find(f => f.id === fileId);
            if (fileToRemove && fileToRemove.preview && !fileToRemove.url) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return prev.filter(f => f.id !== fileId);
        });
        setErrors([]);
    }, []);

    const openFileDialog = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    }, [addFiles]);

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles) {
            addFiles(Array.from(selectedFiles));
        }
        // Reset input value to allow re-selecting the same file
        e.target.value = '';
    }, [addFiles]);

    const getInputProps = useCallback(() => ({
        ref: fileInputRef,
        type: 'file' as const,
        accept,
        multiple,
        onChange: handleFileInputChange,
    }), [accept, multiple, handleFileInputChange]);

    return [
        { files, isDragging, errors },
        {
            handleDragEnter,
            handleDragLeave,
            handleDragOver,
            handleDrop,
            openFileDialog,
            removeFile,
            getInputProps,
            addFiles,
        }
    ] as const;
}
