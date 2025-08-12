"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePosts } from "@/hooks/use-posts";
import { usePostForm } from "@/hooks/use-post-form";
import MediaUpload from "@/components/posts/MediaUpload";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const router = useRouter();
  const { getPost, updatePost, loading, error } = usePosts();
  const {
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
  } = usePostForm();

  const [success, setSuccess] = useState<string | null>(null);
  const [postId, setPostId] = useState<number | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return; // Prevent multiple initializations

    async function loadPost() {
      try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);

        if (isNaN(id)) {
          router.push("/dashboard/posts");
          return;
        }

        setPostId(id);

        const result = await getPost(id);

        if (result?.success && result.post) {
          const post = result.post;

          // Convert database media files to UploadedFile format
          const convertedMediaFiles = post.mediaFiles
            ? post.mediaFiles.map((mediaFile) => ({
                id: mediaFile.id.toString(),
                url: mediaFile.fileUrl,
                type: mediaFile.fileType,
                size: mediaFile.fileSize,
                name: mediaFile.fileUrl.split("/").pop() || "Unknown file",
                preview: mediaFile.fileUrl, // Use the file URL as preview
              }))
            : [];

          // Populate form with existing post data
          setFormData({
            content: post.content || "",
            mediaType: post.mediaType || "text_only",
            selectedPlatforms: [], // You might want to fetch this from destinations
            scheduledAt: post.scheduledAt
              ? new Date(post.scheduledAt).toISOString().slice(0, 16)
              : null,
            mediaFiles: convertedMediaFiles,
          });
          setIsInitialized(true);
        } else {
          router.push("/dashboard/posts");
        }
      } catch (error) {
        console.error("Failed to load post:", error);
        router.push("/dashboard/posts");
      } finally {
        setLoadingPost(false);
      }
    }

    loadPost();
  }, [params, router, isInitialized]); // Added isInitialized to prevent re-runs

  const handleUpdatePost = useCallback(async () => {
    if (!validateForm() || !postId) return;

    const result = await updatePost(postId, {
      content: formData.content,
      mediaType: formData.mediaType,
      status: "draft",
      scheduledAt: formData.scheduledAt,
      mediaUrls: formData.mediaFiles.map((file) => file.url),
    });

    if (result?.success) {
      setSuccess("Post updated successfully!");
      setTimeout(() => {
        router.push("/dashboard/posts");
      }, 1500);
    }
  }, [validateForm, postId, formData, updatePost, router]);

  const handleSchedulePost = useCallback(async () => {
    if (!validateForm() || !formData.scheduledAt || !postId) return;

    const result = await updatePost(postId, {
      content: formData.content,
      mediaType: formData.mediaType,
      status: "scheduled",
      scheduledAt: formData.scheduledAt,
      mediaUrls: formData.mediaFiles.map((file) => file.url),
    });

    if (result?.success) {
      setSuccess("Post scheduled successfully!");
      setTimeout(() => {
        router.push("/dashboard/posts");
      }, 1500);
    }
  }, [validateForm, formData, postId, updatePost, router]);

  const handlePublishNow = useCallback(async () => {
    if (!validateForm() || !postId) return;

    const result = await updatePost(postId, {
      content: formData.content,
      mediaType: formData.mediaType,
      status: "published",
      scheduledAt: null,
      mediaUrls: formData.mediaFiles.map((file) => file.url),
    });

    if (result?.success) {
      setSuccess("Post published successfully!");
      setTimeout(() => {
        router.push("/dashboard/posts");
      }, 1500);
    }
  }, [validateForm, formData, postId, updatePost, router]);

  if (loadingPost) {
    return (
      <div className="flex-1 m-2 rounded-3xl bg-white space-y-4 p-4 md:p-4 pt-6">
        <div className="flex items-center justify-center h-64">
          <span className="text-gray-500">Loading post...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 m-2 rounded-3xl bg-white space-y-4 p-4 md:p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Edit Post</h2>
        <button
          onClick={() => router.push("/dashboard/posts")}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back to Posts
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <span className="text-green-600 text-sm font-medium">{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <span className="text-red-600 text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Platform Selection */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-4">
              <h3 className="text-base font-medium mb-4">Select Platforms</h3>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  {[
                    {
                      id: "facebook",
                      name: "Facebook",
                      icon: (
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      ),
                      bgColor: "bg-blue-600",
                      selectedBg: "bg-blue-50",
                      selectedBorder: "border-blue-200",
                      selectedText: "text-blue-700",
                    },
                    {
                      id: "instagram",
                      name: "Instagram",
                      icon: (
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      ),
                      bgColor: "bg-pink-600",
                      selectedBg: "bg-pink-50",
                      selectedBorder: "border-pink-200",
                      selectedText: "text-pink-700",
                    },
                    {
                      id: "tiktok",
                      name: "TikTok",
                      icon: (
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                        </svg>
                      ),
                      bgColor: "bg-black",
                      selectedBg: "bg-gray-50",
                      selectedBorder: "border-gray-300",
                      selectedText: "text-gray-900",
                    },
                  ].map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`group relative flex items-center gap-3 px-2 py-1.5 rounded-lg border transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
                        formData.selectedPlatforms.includes(platform.id)
                          ? `${platform.selectedBg} ${platform.selectedBorder} ${platform.selectedText} shadow-sm`
                          : "bg-white border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded-full text-white ${platform.bgColor}`}
                      >
                        {platform.icon}
                      </div>
                      <span className="text-sm font-medium">
                        {platform.name}
                      </span>
                      {formData.selectedPlatforms.includes(platform.id) && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white">
                          <svg
                            className="w-2 h-2 text-white absolute top-0 left-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Media Type & Upload */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-4">
              <h3 className="text-base font-medium mb-4">
                Media Type & Upload
              </h3>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {[
                    {
                      value: "text_only",
                      label: "Text Only",
                      icon: (
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                          <polyline points="14,2 14,8 20,8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10,9 9,9 8,9" />
                        </svg>
                      ),
                      bgColor: "bg-gray-600",
                      selectedBg: "bg-gray-50",
                      selectedBorder: "border-gray-200",
                      selectedText: "text-gray-700",
                    },
                    {
                      value: "image",
                      label: "Image",
                      icon: (
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21,15 16,10 5,21" />
                        </svg>
                      ),
                      bgColor: "bg-green-600",
                      selectedBg: "bg-green-50",
                      selectedBorder: "border-green-200",
                      selectedText: "text-green-700",
                    },
                    {
                      value: "video",
                      label: "Video",
                      icon: (
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <polygon points="23 7 16 12 23 17 23 7" />
                          <rect
                            x="1"
                            y="5"
                            width="15"
                            height="14"
                            rx="2"
                            ry="2"
                          />
                        </svg>
                      ),
                      bgColor: "bg-red-600",
                      selectedBg: "bg-red-50",
                      selectedBorder: "border-red-200",
                      selectedText: "text-red-700",
                    },
                    {
                      value: "carousel",
                      label: "Carousel",
                      icon: (
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <rect
                            x="2"
                            y="3"
                            width="20"
                            height="14"
                            rx="2"
                            ry="2"
                          />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                          <circle cx="7" cy="10" r="1" />
                          <circle cx="12" cy="10" r="1" />
                          <circle cx="17" cy="10" r="1" />
                        </svg>
                      ),
                      bgColor: "bg-purple-600",
                      selectedBg: "bg-purple-50",
                      selectedBorder: "border-purple-200",
                      selectedText: "text-purple-700",
                    },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => updateMediaType(type.value as any)}
                      className={`group relative flex items-center gap-3 px-2 py-1.5 rounded-lg border transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
                        formData.mediaType === type.value
                          ? `${type.selectedBg} ${type.selectedBorder} ${type.selectedText} shadow-sm`
                          : "bg-white border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded-full text-white ${type.bgColor}`}
                      >
                        {type.icon}
                      </div>
                      <span className="text-sm font-medium">{type.label}</span>
                      {formData.mediaType === type.value && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white">
                          <svg
                            className="w-2 h-2 text-white absolute top-0 left-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {formData.mediaType !== "text_only" && (
                  <div className="space-y-2">
                    <MediaUpload
                      onFilesChange={updateMediaFiles}
                      maxFiles={formData.mediaType === "carousel" ? 6 : 1}
                      maxSizeMB={5}
                      initialFiles={formData.mediaFiles}
                    />
                    {errors.media && (
                      <p className="text-red-500 text-xs">{errors.media}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="text-base font-medium mb-4">Post Content</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <textarea
                    value={formData.content}
                    onChange={(e) => updateContent(e.target.value)}
                    placeholder="What would you like to share?"
                    className={`w-full h-32 p-3 rounded-lg border resize-none transition-colors focus:outline-none focus:ring-2 ${
                      errors.content
                        ? "border-red-300/50 bg-red-50/50 focus:ring-red-500/20"
                        : "bg-gray-100/50 border-gray-300/50 focus:ring-blue-500/20 focus:border-blue-500/20"
                    }`}
                  />
                  {errors.content && (
                    <p className="text-red-500 text-xs">{errors.content}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <div className="h-8 w-16 rounded bg-blue-500/20 flex items-center justify-center cursor-pointer hover:bg-blue-500/30 transition-colors">
                        <span className="text-blue-600 text-xs">Bold</span>
                      </div>
                      <div className="h-8 w-16 rounded bg-green-500/20 flex items-center justify-center cursor-pointer hover:bg-green-500/30 transition-colors">
                        <span className="text-green-600 text-xs">Italic</span>
                      </div>
                      <div className="h-8 w-16 rounded bg-purple-500/20 flex items-center justify-center cursor-pointer hover:bg-purple-500/30 transition-colors">
                        <span className="text-purple-600 text-xs">Link</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formData.content.length}/500
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Publishing Options */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-4">
              <h3 className="text-base font-medium mb-4">Publishing</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt || ""}
                    onChange={(e) => updateScheduledAt(e.target.value || null)}
                    min={new Date().toISOString().slice(0, 16)}
                    className={`w-full h-10 px-3 rounded border transition-colors focus:outline-none focus:ring-2 ${
                      errors.schedule
                        ? "border-red-300/50 bg-red-50/50 focus:ring-red-500/20"
                        : "bg-gray-100/50 border-gray-300/50 focus:ring-blue-500/20 focus:border-blue-500/20"
                    }`}
                  />
                  {errors.schedule && (
                    <p className="text-red-500 text-xs">{errors.schedule}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUpdatePost}
              disabled={!isValid() || loading}
              className="w-full h-10 rounded bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm font-medium">
                {loading ? "Updating..." : "Update Draft"}
              </span>
            </button>
            <button
              onClick={handleSchedulePost}
              disabled={!isValid() || !formData.scheduledAt || loading}
              className="w-full h-10 rounded bg-blue-500/20 flex items-center justify-center hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm font-medium text-blue-700">
                {loading ? "Scheduling..." : "Schedule Post"}
              </span>
            </button>
            <button
              onClick={handlePublishNow}
              disabled={!isValid() || loading}
              className="w-full h-10 rounded bg-green-500/20 flex items-center justify-center hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm font-medium text-green-700">
                {loading ? "Publishing..." : "Publish Now"}
              </span>
            </button>
          </div>

          {/* Form Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="text-red-600 text-xs font-medium mb-1">
                Please fix the following issues:
              </div>
              <ul className="text-red-600 text-xs space-y-1">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>• {message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
