export default function IntegrationsPage() {
  return (
    <div className="flex-1 bg-white mt-2 rounded-3xl  space-y-4 p-4 md:p-4 md:pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Integrations</h2>
      </div>

      {/* Connected Accounts */}
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Connected Accounts</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Facebook Page",
                status: "connected",
                color: "blue",
                accounts: 2,
              },
              {
                name: "Instagram Business",
                status: "connected",
                color: "pink",
                accounts: 1,
              },
              {
                name: "TikTok Business",
                status: "disconnected",
                color: "black",
                accounts: 0,
              },
            ].map((platform) => (
              <div
                key={platform.name}
                className="p-6 rounded-lg border bg-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`h-12 w-12 rounded-lg bg-${platform.color}-500/20 flex items-center justify-center`}
                  >
                    <div
                      className={`h-6 w-6 rounded bg-${platform.color}-500/40`}
                    ></div>
                  </div>
                  <div
                    className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${
                      platform.status === "connected"
                        ? "bg-green-500/10 text-green-600 border border-green-500/20"
                        : "bg-gray-500/10 text-gray-600 border border-gray-500/20"
                    }
                  `}
                  >
                    {platform.status}
                  </div>
                </div>
                <h4 className="font-medium mb-2">{platform.name}</h4>
                <p className="text-sm text-gray-500 mb-4">
                  {platform.accounts > 0
                    ? `${platform.accounts} account${
                        platform.accounts > 1 ? "s" : ""
                      } connected`
                    : "No accounts connected"}
                </p>
                <div
                  className={`
                  h-9 rounded flex items-center justify-center text-sm font-medium
                  ${
                    platform.status === "connected"
                      ? "bg-gray-100/50 text-gray-600"
                      : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                  }
                `}
                >
                  {platform.status === "connected" ? "Manage" : "Connect"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Available Integrations */}
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Available Integrations</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "LinkedIn", color: "blue", status: "coming-soon" },
              { name: "Twitter/X", color: "black", status: "coming-soon" },
              { name: "YouTube", color: "red", status: "coming-soon" },
              { name: "Pinterest", color: "red", status: "coming-soon" },
            ].map((platform) => (
              <div
                key={platform.name}
                className="p-4 rounded-lg border bg-gray-50/50 border-gray-200/50"
              >
                <div
                  className={`h-10 w-10 rounded-lg bg-${platform.color}-500/20 mb-3 flex items-center justify-center`}
                >
                  <div
                    className={`h-5 w-5 rounded bg-${platform.color}-500/40`}
                  ></div>
                </div>
                <h4 className="font-medium mb-2">{platform.name}</h4>
                <div className="px-2 py-1 rounded text-xs bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 text-center">
                  Coming Soon
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integration Settings */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* API Settings */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">API Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Webhook URL</label>
                <div className="h-10 rounded bg-gray-100/50 border border-gray-200/50"></div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">API Key</label>
                <div className="h-10 rounded bg-gray-100/50 border border-gray-200/50"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-9 w-20 rounded bg-blue-500/20 flex items-center justify-center">
                  <span className="text-xs text-blue-600">Test</span>
                </div>
                <div className="h-9 w-20 rounded bg-green-500/20 flex items-center justify-center">
                  <span className="text-xs text-green-600">Save</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Settings */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Sync Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50">
                <span className="text-sm">Auto-sync content</span>
                <div className="h-6 w-11 rounded-full bg-blue-500/20"></div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50">
                <span className="text-sm">Real-time notifications</span>
                <div className="h-6 w-11 rounded-full bg-green-500/20"></div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50">
                <span className="text-sm">Analytics sync</span>
                <div className="h-6 w-11 rounded-full bg-gray-300/50"></div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sync Frequency</label>
                <div className="h-10 rounded bg-gray-100/50 border border-gray-200/50"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
