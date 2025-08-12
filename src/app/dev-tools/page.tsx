"use client";

import { useState } from "react";

export default function DevToolsPage() {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const resetRateLimit = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/dev/reset-rate-limit", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setMessage("Rate limit reset successfully!");
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.message || "Failed to reset rate limit"}`);
      }
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const clearStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      setMessage("Browser storage cleared successfully!");
    } catch (error) {
      setMessage(
        `Error clearing storage: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const testAPI = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/posts", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`API Test Success: Found ${data.posts?.length || 0} posts`);
      } else {
        const error = await response.json();
        setMessage(`API Test Failed: ${error.error || response.statusText}`);
      }
    } catch (error) {
      setMessage(
        `API Test Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 m-2 rounded-3xl bg-white space-y-4 p-4 md:p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Development Tools</h2>
        <div className="text-sm text-gray-500">Debug and reset utilities</div>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.includes("Error") || message.includes("Failed")
              ? "bg-red-500/10 border-red-500/20 text-red-600"
              : "bg-green-500/10 border-green-500/20 text-green-600"
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Rate Limit Tools */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Rate Limit Management</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Reset API rate limits if you hit the limit during development
              </p>
              <button
                onClick={resetRateLimit}
                disabled={loading}
                className="w-full h-10 px-4 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Rate Limit"}
              </button>
            </div>
          </div>
        </div>

        {/* Storage Tools */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Browser Storage</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Clear browser localStorage and sessionStorage
              </p>
              <button
                onClick={clearStorage}
                className="w-full h-10 px-4 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-700 font-medium transition-colors"
              >
                Clear Storage
              </button>
            </div>
          </div>
        </div>

        {/* API Testing */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">API Testing</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Test API connectivity and authentication
              </p>
              <button
                onClick={testAPI}
                disabled={loading}
                className="w-full h-10 px-4 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Testing..." : "Test API"}
              </button>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">System Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Environment:</span>
                <span className="font-mono">development</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Timestamp:</span>
                <span className="font-mono">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">User Agent:</span>
                <span
                  className="font-mono text-xs truncate max-w-32"
                  title={navigator.userAgent}
                >
                  {navigator.userAgent.split(" ")[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-gray-500/20 hover:bg-gray-500/30 text-gray-700 font-medium transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-700 font-medium transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => (window.location.href = "/dashboard/posts")}
              className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-700 font-medium transition-colors"
            >
              Go to Posts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
