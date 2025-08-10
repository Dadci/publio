export default function NewPostPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create New Post</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Content */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Post Content</h3>
              <div className="space-y-4">
                <div className="h-32 rounded-lg bg-gray-100/50 border-2 border-dashed border-gray-300/50 flex items-center justify-center">
                  <span className="text-gray-500">
                    Content Editor Placeholder
                  </span>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-16 rounded bg-blue-500/20"></div>
                  <div className="h-8 w-16 rounded bg-green-500/20"></div>
                  <div className="h-8 w-16 rounded bg-purple-500/20"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Media</h3>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-gray-100/50 border-2 border-dashed border-gray-300/50 flex items-center justify-center"
                  >
                    <span className="text-sm text-gray-500">+</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Selection */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Platforms</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border bg-blue-500/10 border-blue-500/20">
                  <div className="h-8 w-8 rounded bg-blue-500/20 mb-2"></div>
                  <span className="text-sm font-medium">Facebook</span>
                </div>
                <div className="p-4 rounded-lg border bg-pink-500/10 border-pink-500/20">
                  <div className="h-8 w-8 rounded bg-pink-500/20 mb-2"></div>
                  <span className="text-sm font-medium">Instagram</span>
                </div>
                <div className="p-4 rounded-lg border bg-black/10 border-black/20">
                  <div className="h-8 w-8 rounded bg-black/20 mb-2"></div>
                  <span className="text-sm font-medium">TikTok</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing Options */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Publishing</h3>
              <div className="space-y-3">
                <div className="h-10 rounded bg-gray-100/50"></div>
                <div className="h-10 rounded bg-gray-100/50"></div>
                <div className="h-32 rounded bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <span className="text-sm text-orange-600">
                    Schedule Options
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Preview */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Analytics Preview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Reach</span>
                  <div className="h-4 w-16 rounded bg-green-500/20"></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Engagement</span>
                  <div className="h-4 w-16 rounded bg-blue-500/20"></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Best Time</span>
                  <div className="h-4 w-16 rounded bg-purple-500/20"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="h-10 rounded bg-black/10 flex items-center justify-center">
              <span className="text-sm font-medium">Save Draft</span>
            </div>
            <div className="h-10 rounded bg-blue-500/20 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-700">
                Schedule Post
              </span>
            </div>
            <div className="h-10 rounded bg-green-500/20 flex items-center justify-center">
              <span className="text-sm font-medium text-green-700">
                Publish Now
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
