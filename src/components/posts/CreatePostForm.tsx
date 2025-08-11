// src/components/posts/CreatePostForm.tsx
"use client";

import { useState } from "react";
import { usePosts } from "@/hooks/use-posts";
import { usePostForm } from "@/hooks/use-post-form";

export default function CreatePostForm() {
  const { createPost, saveDraft, schedulePost, publishNow, loading, error } =
    usePosts();
  const {
    formData,
    updateContent,
    updateMediaType,
    togglePlatform,
    updateScheduledAt,
    resetForm,
    isValid,
  } = usePostForm();
  const [success, setSuccess] = useState<string | null>(null);

  const handleSaveDraft = async () => {
    if (!isValid()) return;

    const result = await saveDraft({
      content: formData.content,
      mediaType: formData.mediaType,
    });

    if (result?.success) {
      setSuccess("Draft saved successfully!");
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleSchedulePost = async () => {
    if (!isValid() || !formData.scheduledAt) return;

    const result = await schedulePost({
      content: formData.content,
      mediaType: formData.mediaType,
      scheduledAt: formData.scheduledAt,
    });

    if (result?.success) {
      setSuccess("Post scheduled successfully!");
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handlePublishNow = async () => {
    if (!isValid()) return;

    const result = await publishNow({
      content: formData.content,
      mediaType: formData.mediaType,
    });

    if (result?.success) {
      setSuccess("Post published successfully!");
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Success Message */}
      {success && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <span className="text-green-600 text-sm font-medium">{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <span className="text-red-600 text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Content Editor */}
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Post Content</h3>
          <textarea
            value={formData.content}
            onChange={(e) => updateContent(e.target.value)}
            placeholder="What would you like to share?"
            className="w-full h-32 p-3 rounded-lg border border-gray-200/50 bg-gray-50/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/20"
          />
          <div className="flex space-x-2 mt-4">
            <div className="h-8 w-16 rounded bg-blue-500/20 flex items-center justify-center cursor-pointer">
              <span className="text-blue-600 text-xs">Bold</span>
            </div>
            <div className="h-8 w-16 rounded bg-green-500/20 flex items-center justify-center cursor-pointer">
              <span className="text-green-600 text-xs">Italic</span>
            </div>
            <div className="h-8 w-16 rounded bg-purple-500/20 flex items-center justify-center cursor-pointer">
              <span className="text-purple-600 text-xs">Link</span>
            </div>
          </div>
        </div>
      </div>

      {/* Media Type Selection */}
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Media Type</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { value: "text_only", label: "Text", icon: "📝" },
              { value: "image", label: "Image", icon: "🖼️" },
              { value: "video", label: "Video", icon: "🎥" },
              { value: "carousel", label: "Carousel", icon: "🎠" },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => updateMediaType(type.value as any)}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  formData.mediaType === type.value
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-700"
                    : "bg-gray-50/50 border-gray-200/50 hover:bg-gray-100/50"
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="text-xs font-medium">{type.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Selection */}
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Platforms</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: "facebook", name: "Facebook", color: "blue" },
              { id: "instagram", name: "Instagram", color: "pink" },
              { id: "tiktok", name: "TikTok", color: "black" },
            ].map((platform) => (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`p-4 rounded-lg border transition-colors ${
                  formData.selectedPlatforms.includes(platform.id)
                    ? `bg-${platform.color}-500/10 border-${platform.color}-500/20`
                    : "bg-gray-50/50 border-gray-200/50 hover:bg-gray-100/50"
                }`}
              >
                <div
                  className={`h-8 w-8 rounded bg-${platform.color}-500/20 mb-2`}
                ></div>
                <span className="text-sm font-medium">{platform.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Options */}
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Schedule</h3>
          <input
            type="datetime-local"
            value={formData.scheduledAt || ""}
            onChange={(e) => updateScheduledAt(e.target.value || null)}
            className="w-full p-3 rounded-lg border border-gray-200/50 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/20"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleSaveDraft}
          disabled={!isValid() || loading}
          className="w-full h-10 rounded bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-sm font-medium">
            {loading ? "Saving..." : "Save Draft"}
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

      {/* Validation Info */}
      {!isValid() && (
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <span className="text-yellow-600 text-xs">
            Please add content and select at least one platform to continue.
          </span>
        </div>
      )}
    </div>
  );
}
