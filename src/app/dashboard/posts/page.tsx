"use client";

import { useState, useEffect } from "react";
import { usePosts, Post } from "@/hooks/use-posts";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PostStats {
  total: number;
  published: number;
  scheduled: number;
  drafts: number;
}

export default function PostsPage() {
  const { getPosts, deletePost, loading, error } = usePosts();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [stats, setStats] = useState<PostStats>({
    total: 0,
    published: 0,
    scheduled: 0,
    drafts: 0,
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const result = await getPosts(1, 50); // Load more posts for better stats
    if (result?.success) {
      setPosts(result.posts);
      calculateStats(result.posts);
    }
  };

  const calculateStats = (postsList: Post[]) => {
    const total = postsList.length;
    const published = postsList.filter((p) => p.status === "published").length;
    const scheduled = postsList.filter((p) => p.status === "scheduled").length;
    const drafts = postsList.filter((p) => p.status === "draft").length;

    setStats({ total, published, scheduled, drafts });
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === "all") return true;
    return post.status === filter;
  });

  const getPlatformIcons = (post: Post) => {
    const destinations = post.destinations;

    if (!destinations || destinations.length === 0) {
      // Fallback to media type icon when no destinations are available
      const mediaTypeIcon = getMediaTypeIcon(post.mediaType);
      return (
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-600 text-white">
          {mediaTypeIcon}
        </div>
      );
    }

    const platformIcons = destinations.map((destination) => {
      const platform = destination.platform.toLowerCase();

      switch (platform) {
        case "facebook":
          return (
            <div
              key={destination.id}
              className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
          );
        case "instagram":
          return (
            <div
              key={destination.id}
              className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
          );
        case "tiktok":
          return (
            <div
              key={destination.id}
              className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
              </svg>
            </div>
          );
        default:
          return (
            <div
              key={destination.id}
              className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-600 text-white"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
            </div>
          );
      }
    });

    return <div className="flex space-x-1">{platformIcons}</div>;
  };

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case "image":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21,15 16,10 5,21" />
          </svg>
        );
      case "video":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        );
      case "carousel":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10,9 9,9 8,9" />
          </svg>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500/20 text-green-700 border-green-500/20";
      case "scheduled":
        return "bg-orange-500/20 text-orange-700 border-orange-500/20";
      case "draft":
        return "bg-gray-500/20 text-gray-700 border-gray-500/20";
      case "failed":
        return "bg-red-500/20 text-red-700 border-red-500/20";
      default:
        return "bg-blue-500/20 text-blue-700 border-blue-500/20";
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const success = await deletePost(postId);
    if (success) {
      loadPosts(); // Refresh the list
    }
  };

  return (
    <div className="flex-1 m-2 rounded-3xl bg-white space-y-4 p-4 md:p-4 md:pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Posts</h2>
        <Button
          asChild
          className="w-48 justify-center  font-bold bg-black"
          size="default"
        >
          <Link href="/dashboard/posts/new">
            <Plus className=" h-4 w-4 font-bold" />
            Create Post
          </Link>
        </Button>
      </div>

      {/* Posts Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-lg border bg-card text-card-foreground shadow transition-all hover:scale-105 ${
            filter === "all" ? "ring-2 ring-blue-500/50" : ""
          }`}
        >
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total Posts</p>
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setFilter("published")}
          className={`rounded-lg border bg-card text-card-foreground shadow transition-all hover:scale-105 ${
            filter === "published" ? "ring-2 ring-green-500/50" : ""
          }`}
        >
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold">{stats.published}</div>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setFilter("scheduled")}
          className={`rounded-lg border bg-card text-card-foreground shadow transition-all hover:scale-105 ${
            filter === "scheduled" ? "ring-2 ring-orange-500/50" : ""
          }`}
        >
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold">{stats.scheduled}</div>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setFilter("draft")}
          className={`rounded-lg border bg-card text-card-foreground shadow transition-all hover:scale-105 ${
            filter === "draft" ? "ring-2 ring-gray-500/50" : ""
          }`}
        >
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gray-500/20 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold">{stats.drafts}</div>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Posts List */}
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              {filter === "all"
                ? "All Posts"
                : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Posts`}
            </h3>
            {loading && (
              <span className="text-sm text-gray-500">Loading...</span>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-3">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {filter === "all"
                  ? "No posts yet. Create your first post!"
                  : `No ${filter} posts found.`}
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    {getPlatformIcons(post)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="font-medium text-sm truncate">
                      {post.content || "No content"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {post.scheduledAt
                        ? `Scheduled: ${new Date(
                            post.scheduledAt
                          ).toLocaleDateString()}`
                        : `Created: ${new Date(
                            post.createdAt
                          ).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-xs border ${getStatusColor(
                        post.status
                      )}`}
                    >
                      {post.status}
                    </span>
                    <div className="flex space-x-1">
                      <Link
                        href={`/dashboard/posts/edit/${post.id}`}
                        className="h-7 w-7 rounded bg-blue-500/20 hover:bg-blue-500/30 flex items-center justify-center transition-colors"
                        title="Edit post"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="h-7 w-7 rounded bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                        title="Delete post"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
