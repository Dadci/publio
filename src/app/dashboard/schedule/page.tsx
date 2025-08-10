export default function SchedulePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Schedule</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar View */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium">January 2025</h3>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 rounded bg-gray-100/50"></div>
                  <div className="h-8 w-8 rounded bg-gray-100/50"></div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <div
                      key={day}
                      className="p-2 text-center text-sm font-medium text-gray-500"
                    >
                      {day}
                    </div>
                  )
                )}

                {/* Calendar Days */}
                {Array.from({ length: 35 }, (_, i) => {
                  const hasContent = [3, 7, 12, 18, 24, 28].includes(i);
                  const isToday = i === 10;

                  return (
                    <div
                      key={i}
                      className={`
                      aspect-square p-2 rounded-lg border relative
                      ${
                        isToday
                          ? "bg-blue-500/10 border-blue-500/20"
                          : "bg-gray-50/50 border-gray-200/50"
                      }
                    `}
                    >
                      <span className="text-sm">{i + 1}</span>
                      {hasContent && (
                        <div className="absolute bottom-1 left-1 right-1 space-y-1">
                          <div className="h-1 rounded bg-blue-500/30"></div>
                          <div className="h-1 rounded bg-green-500/30"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">This Month</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Scheduled</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded bg-blue-500/30"></div>
                    <span className="text-sm font-medium">23</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Published</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded bg-green-500/30"></div>
                    <span className="text-sm font-medium">89</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Failed</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded bg-red-500/30"></div>
                    <span className="text-sm font-medium">2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Posts */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Upcoming</h3>
              <div className="space-y-3">
                {[
                  { time: "9:00 AM", platform: "facebook", color: "blue" },
                  { time: "2:30 PM", platform: "instagram", color: "pink" },
                  { time: "6:00 PM", platform: "tiktok", color: "black" },
                ].map((post, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50/50"
                  >
                    <div
                      className={`h-3 w-3 rounded bg-${post.color}-500/30`}
                    ></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{post.time}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {post.platform}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Best Times */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Best Times</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-sm font-medium text-green-700">
                    9:00 AM
                  </div>
                  <div className="text-xs text-green-600">High engagement</div>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <div className="text-sm font-medium text-orange-700">
                    2:00 PM
                  </div>
                  <div className="text-xs text-orange-600">
                    Medium engagement
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="text-sm font-medium text-purple-700">
                    7:00 PM
                  </div>
                  <div className="text-xs text-purple-600">Peak time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
