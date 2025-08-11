"use client";

import React from "react";
import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react";

import { useFileUpload } from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";

interface MediaUploadProps {
  onFilesChange?: (
    files: Array<{ id: string; file: File; preview: string }>
  ) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export default function MediaUpload({
  onFilesChange,
  maxFiles = 6,
  maxSizeMB = 5,
}: MediaUploadProps) {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept:
      "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif,video/mp4,video/webm,video/ogg",
    maxSize,
    multiple: true,
    maxFiles,
  });

  // Notify parent component when files change
  React.useEffect(() => {
    if (onFilesChange) {
      const fileData = files.map((f) => ({
        id: f.id,
        file: f.file,
        preview: f.preview,
      }));
      onFilesChange(fileData);
    }
  }, [files, onFilesChange]);

  return (
    <div className="flex flex-col gap-2">
      {/* Drop area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        data-files={files.length > 0 || undefined}
        className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]"
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload media files"
        />
        {files.length > 0 ? (
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-medium">
                Uploaded Files ({files.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={openFileDialog}
                disabled={files.length >= maxFiles}
              >
                <UploadIcon
                  className="-ms-0.5 size-3.5 opacity-60"
                  aria-hidden="true"
                />
                Add more
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-accent relative aspect-square rounded-md overflow-hidden"
                >
                  {file.type.startsWith("image/") ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="size-full rounded-[inherit] object-cover"
                    />
                  ) : file.type.startsWith("video/") ? (
                    <video
                      src={file.preview}
                      className="size-full rounded-[inherit] object-cover"
                      muted
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center bg-gray-100">
                      <span className="text-xs text-gray-500">{file.name}</span>
                    </div>
                  )}
                  <Button
                    onClick={() => removeFile(file.id)}
                    size="icon"
                    className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
                    aria-label="Remove file"
                  >
                    <XIcon className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
            <div
              className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              <ImageIcon className="size-4 opacity-60" />
            </div>
            <p className="mb-1.5 text-sm font-medium">Drop your media here</p>
            <p className="text-muted-foreground text-xs">
              Images, Videos (max. {maxSizeMB}MB each)
            </p>
            <Button variant="outline" className="mt-4" onClick={openFileDialog}>
              <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
              Select files
            </Button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  );
}
