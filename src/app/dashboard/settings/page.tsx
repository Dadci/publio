export default function SettingsPage() {
  return (
    <div className="flex-1 bg-white mt-2  space-y-4 p-4 md:p-4 md:pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Profile Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-blue-500/20"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-200/50"></div>
                    <div className="h-3 w-1/2 rounded bg-gray-100/50"></div>
                  </div>
                  <div className="h-8 w-20 rounded bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xs text-blue-600">Change</span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <div className="h-10 rounded bg-gray-100/50 border border-gray-200/50"></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="h-10 rounded bg-gray-100/50 border border-gray-200/50"></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <div className="h-10 rounded bg-gray-100/50 border border-gray-200/50"></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Timezone</label>
                    <div className="h-10 rounded bg-gray-100/50 border border-gray-200/50"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Notifications</h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Email notifications",
                    description: "Receive email updates for important events",
                  },
                  {
                    label: "Push notifications",
                    description: "Get notified about post performance",
                  },
                  {
                    label: "Weekly reports",
                    description: "Weekly analytics summary via email",
                  },
                  {
                    label: "Security alerts",
                    description: "Important security and login notifications",
                  },
                ].map((setting, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50"
                  >
                    <div>
                      <div className="font-medium text-sm">{setting.label}</div>
                      <div className="text-xs text-gray-500">
                        {setting.description}
                      </div>
                    </div>
                    <div
                      className={`h-6 w-11 rounded-full ${
                        i % 2 === 0 ? "bg-blue-500/20" : "bg-gray-300/50"
                      }`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Security</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50">
                  <div>
                    <div className="font-medium text-sm">
                      Two-factor authentication
                    </div>
                    <div className="text-xs text-gray-500">
                      Add an extra layer of security
                    </div>
                  </div>
                  <div className="h-8 w-20 rounded bg-green-500/20 flex items-center justify-center">
                    <span className="text-xs text-green-600">Enabled</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50">
                  <div>
                    <div className="font-medium text-sm">Change password</div>
                    <div className="text-xs text-gray-500">
                      Update your account password
                    </div>
                  </div>
                  <div className="h-8 w-20 rounded bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xs text-blue-600">Change</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50">
                  <div>
                    <div className="font-medium text-sm">Active sessions</div>
                    <div className="text-xs text-gray-500">
                      Manage your active login sessions
                    </div>
                  </div>
                  <div className="h-8 w-20 rounded bg-gray-200/50 flex items-center justify-center">
                    <span className="text-xs text-gray-600">View</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Plan & Billing */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Plan & Billing</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="font-medium text-blue-700">Pro Plan</div>
                  <div className="text-xs text-blue-600">$29/month</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Posts this month</span>
                    <span>247 / 1000</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200/50">
                    <div className="h-2 rounded-full bg-blue-500/30 w-1/4"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Connected accounts</span>
                    <span>3 / 10</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200/50">
                    <div className="h-2 rounded-full bg-green-500/30 w-1/3"></div>
                  </div>
                </div>

                <div className="h-8 rounded bg-purple-500/20 flex items-center justify-center">
                  <span className="text-xs text-purple-600">Upgrade Plan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Settings */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Team</h3>
              <div className="space-y-3">
                {[
                  { name: "John Doe", role: "Owner", color: "blue" },
                  { name: "Jane Smith", role: "Editor", color: "green" },
                  { name: "Mike Wilson", role: "Viewer", color: "gray" },
                ].map((member, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div
                      className={`h-8 w-8 rounded-full bg-${member.color}-500/20`}
                    ></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.role}</div>
                    </div>
                  </div>
                ))}

                <div className="h-8 rounded border-2 border-dashed border-gray-300/50 flex items-center justify-center">
                  <span className="text-xs text-gray-500">+ Invite member</span>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-red-200 bg-red-50/50">
            <div className="p-6">
              <h3 className="text-lg font-medium text-red-700 mb-4">
                Danger Zone
              </h3>
              <div className="space-y-3">
                <div className="h-8 rounded border border-red-300/50 bg-red-100/50 flex items-center justify-center">
                  <span className="text-xs text-red-600">Export Data</span>
                </div>
                <div className="h-8 rounded border border-red-300/50 bg-red-100/50 flex items-center justify-center">
                  <span className="text-xs text-red-600">Delete Account</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
