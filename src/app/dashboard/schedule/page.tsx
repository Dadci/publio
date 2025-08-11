export default function SchedulePage() {
  return (
    <div className="flex-1 m-2 rounded-3xl bg-white space-y-4 p-4 md:p-4 md:pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Schedule</h2>
      </div>

      <div className="grid gap-4 ">
        {/* Calendar View */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  {/* Previous Month Button */}
                  <div className="h-8 w-8 rounded bg-gray-100/50 border border-gray-200/50 flex items-center justify-center cursor-pointer hover:bg-gray-200/50 transition-colors">
                    <span className="text-gray-500 text-sm">‹</span>
                  </div>

                  {/* Month/Year Display */}
                  <h3 className="text-lg font-medium">January 2025</h3>

                  {/* Next Month Button */}
                  <div className="h-8 w-8 rounded bg-gray-100/50 border border-gray-200/50 flex items-center justify-center cursor-pointer hover:bg-gray-200/50 transition-colors">
                    <span className="text-gray-500 text-sm">›</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Today Button */}
                  <div className="h-8 px-4 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center cursor-pointer hover:bg-blue-500/20 transition-colors">
                    <span className="text-blue-600 text-sm font-medium">
                      Today
                    </span>
                  </div>

                  {/* View Toggle Buttons */}
                  <div className="h-8 w-8 rounded bg-gray-100/50 border border-gray-200/50 flex items-center justify-center cursor-pointer hover:bg-gray-200/50 transition-colors">
                    <span className="text-gray-500 text-xs">W</span>
                  </div>
                  <div className="h-8 w-8 rounded bg-gray-100/50 border border-gray-200/50 flex items-center justify-center cursor-pointer hover:bg-gray-200/50 transition-colors">
                    <span className="text-gray-500 text-xs">M</span>
                  </div>
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
      </div>
    </div>
  );
}
