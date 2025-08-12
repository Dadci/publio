"use client";

import { useState, useEffect } from "react";
import { usePosts, Post } from "@/hooks/use-posts";
import Link from "next/link";

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

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case "image":
        return "🖼️";
      case "video":
        return "🎥";
      case "carousel":
        return "🎠";
      default:
        return "📝";
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
        <Link
          href="/dashboard/posts/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Create Post
        </Link>
      </div>

      {/* Posts Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-xl border bg-card text-card-foreground shadow transition-all hover:scale-105 ${
            filter === "all" ? "ring-2 ring-blue-500/50" : ""
          }`}
        >
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Posts</h3>
            <div className="h-4 w-4 rounded bg-blue-500/20"></div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All your posts</p>
          </div>
        </button>

        <button
          onClick={() => setFilter("published")}
          className={`rounded-xl border bg-card text-card-foreground shadow transition-all hover:scale-105 ${
            filter === "published" ? "ring-2 ring-green-500/50" : ""
          }`}
        >
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Published</h3>
            <div className="h-4 w-4 rounded bg-green-500/20"></div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats.published}</div>
            <p className="text-xs text-muted-foreground">Live posts</p>
          </div>
        </button>

        <button
          onClick={() => setFilter("scheduled")}
          className={`rounded-xl border bg-card text-card-foreground shadow transition-all hover:scale-105 ${
            filter === "scheduled" ? "ring-2 ring-orange-500/50" : ""
          }`}
        >
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Scheduled</h3>
            <div className="h-4 w-4 rounded bg-orange-500/20"></div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Upcoming posts</p>
          </div>
        </button>

        <button
          onClick={() => setFilter("draft")}
          className={`rounded-xl border bg-card text-card-foreground shadow transition-all hover:scale-105 ${
            filter === "draft" ? "ring-2 ring-gray-500/50" : ""
          }`}
        >
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Drafts</h3>
            <div className="h-4 w-4 rounded bg-gray-500/20"></div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats.drafts}</div>
            <p className="text-xs text-muted-foreground">Work in progress</p>
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
                  className="flex items-center space-x-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <span className="text-lg">
                      {getMediaTypeIcon(post.mediaType)}
                    </span>
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
                        className="h-8 w-8 rounded bg-blue-500/20 hover:bg-blue-500/30 flex items-center justify-center transition-colors"
                        title="Edit post"
                      >
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="h-8 w-8 rounded bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                        title="Delete post"
                      >
                        <svg
                          className="w-4 h-4 text-red-600"
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
