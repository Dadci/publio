export default function PostsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Posts</h2>
      </div>

      {/* Posts Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Posts</h3>
            <div className="h-4 w-4 rounded bg-blue-500/20"></div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Published</h3>
            <div className="h-4 w-4 rounded bg-green-500/20"></div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">189</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Scheduled</h3>
            <div className="h-4 w-4 rounded bg-orange-500/20"></div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">+3 this week</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Drafts</h3>
            <div className="h-4 w-4 rounded bg-gray-500/20"></div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">35</div>
            <p className="text-xs text-muted-foreground">-2 from yesterday</p>
          </div>
        </div>
      </div>

      {/* Posts List Placeholder */}
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Recent Posts</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center space-x-4 p-4 rounded-lg bg-muted/30"
              >
                <div className="h-12 w-12 rounded-lg bg-blue-500/20"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-3/4 rounded bg-gray-300/50"></div>
                  <div className="h-3 w-1/2 rounded bg-gray-200/50"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-6 w-16 rounded bg-green-500/20"></div>
                  <div className="h-6 w-20 rounded bg-blue-500/20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
