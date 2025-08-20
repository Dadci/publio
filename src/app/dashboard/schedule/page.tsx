"use client";

import { useState, useEffect } from "react";
import { usePosts, Post } from "@/hooks/use-posts";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Edit,
  TrendingUp,
  Users,
  BarChart3,
  Eye,
  Heart,
  MessageCircle,
  Calendar,
} from "lucide-react";

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  posts: Post[];
  engagement?: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
  };
}

interface PopoverState {
  isOpen: boolean;
  date: Date | null;
  posts: Post[];
  position: { x: number; y: number };
}

interface MonthlyStats {
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  totalEngagement: number;
  avgEngagementPerPost: number;
}

export default function SchedulePage() {
  const { getPosts, loading, error } = usePosts();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    totalPosts: 0,
    scheduledPosts: 0,
    publishedPosts: 0,
    totalEngagement: 0,
    avgEngagementPerPost: 0,
  });
  const [popover, setPopover] = useState<PopoverState>({
    isOpen: false,
    date: null,
    posts: [],
    position: { x: 0, y: 0 },
  });

  // Get the first day of the current month
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  // Get the last day of the current month
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  // Calculate monthly statistics
  const calculateMonthlyStats = () => {
    const monthPosts = posts.filter((post) => {
      if (!post.scheduledAt) return false;
      const postDate = new Date(post.scheduledAt);
      return (
        postDate.getMonth() === currentDate.getMonth() &&
        postDate.getFullYear() === currentDate.getFullYear()
      );
    });

    const published = monthPosts.filter((post) => post.status === "published");
    const scheduled = monthPosts.filter((post) => post.status === "scheduled");

    // Mock engagement data (in real app, this would come from API)
    const totalEngagement = published.reduce((total, post) => {
      const mockViews = Math.floor(Math.random() * 1000) + 100;
      const mockLikes = Math.floor(Math.random() * 50) + 5;
      const mockComments = Math.floor(Math.random() * 20) + 1;
      return total + mockViews + mockLikes + mockComments;
    }, 0);

    setMonthlyStats({
      totalPosts: monthPosts.length,
      scheduledPosts: scheduled.length,
      publishedPosts: published.length,
      totalEngagement,
      avgEngagementPerPost:
        published.length > 0
          ? Math.round(totalEngagement / published.length)
          : 0,
    });
  };

  // Generate mock engagement data for calendar days
  const generateEngagementData = (postsForDay: Post[]) => {
    const publishedPosts = postsForDay.filter(
      (post) => post.status === "published"
    );
    if (publishedPosts.length === 0) return undefined;

    return {
      totalViews: publishedPosts.reduce(
        (total) => total + Math.floor(Math.random() * 200) + 50,
        0
      ),
      totalLikes: publishedPosts.reduce(
        (total) => total + Math.floor(Math.random() * 25) + 2,
        0
      ),
      totalComments: publishedPosts.reduce(
        (total) => total + Math.floor(Math.random() * 10) + 1,
        0
      ),
    };
  };

  // Handle clicking on a calendar day
  const handleDayClick = (day: CalendarDay, event: React.MouseEvent) => {
    if (day.posts.length === 0) return;

    // Ensure we get the calendar cell, not a child element
    const calendarCell = event.currentTarget as HTMLElement;
    const rect = calendarCell.getBoundingClientRect();

    setPopover({
      isOpen: true,
      date: day.date,
      posts: day.posts,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8,
      },
    });
  };

  // Close popover
  const closePopover = () => {
    setPopover({
      isOpen: false,
      date: null,
      posts: [],
      position: { x: 0, y: 0 },
    });
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popover.isOpen) {
        const target = event.target as HTMLElement;
        if (
          !target.closest(".popover-content") &&
          !target.closest(".calendar-day")
        ) {
          closePopover();
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [popover.isOpen]);

  // Calculate calendar grid
  const generateCalendarDays = () => {
    const days: CalendarDay[] = [];
    const today = new Date();

    // Get first Monday of the calendar view
    const startDate = new Date(firstDayOfMonth);
    const dayOfWeek = firstDayOfMonth.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
    startDate.setDate(firstDayOfMonth.getDate() - daysToSubtract);

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
      const isToday = date.toDateString() === today.toDateString();

      // Filter posts for this specific date
      const dayPosts = posts.filter((post) => {
        if (!post.scheduledAt) return false;
        const postDate = new Date(post.scheduledAt);
        return postDate.toDateString() === date.toDateString();
      });

      days.push({
        date,
        isCurrentMonth,
        isToday,
        posts: dayPosts,
        engagement: generateEngagementData(dayPosts),
      });
    }

    setCalendarDays(days);
  };

  // Load posts when component mounts or month changes
  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    generateCalendarDays();
    calculateMonthlyStats();
  }, [posts, currentDate]);

  const loadPosts = async () => {
    const result = await getPosts(1, 100); // Load more posts to cover the month
    if (result?.success) {
      // Include both scheduled and published posts that have scheduledAt
      const filteredPosts = result.posts.filter(
        (post) =>
          post.scheduledAt &&
          (post.status === "scheduled" || post.status === "published")
      );
      setPosts(filteredPosts);
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="flex-1 m-2 rounded-3xl bg-white space-y-4 p-4 md:p-4 md:pt-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Schedule</h2>
        <Button
          asChild
          className="w-auto justify-center font-bold bg-black"
          size="default"
        >
          <Link href="/dashboard/posts/new">
            <Plus className="h-4 w-4 font-bold" />
            Schedule Post
          </Link>
        </Button>
      </div>

      {/* Monthly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">
                {monthlyStats.totalPosts}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs text-gray-500">
            <TrendingUp className="h-3 w-3 mr-1" />
            This month
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-orange-600">
                {monthlyStats.scheduledPosts}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs text-gray-500">
            <span>Upcoming posts</span>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600">
                {monthlyStats.publishedPosts}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs text-gray-500">
            <span>Live posts</span>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Avg. Engagement
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {monthlyStats.avgEngagementPerPost}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs text-gray-500">
            <span>Per published post</span>
          </div>
        </div>
      </div>

      {/* Calendar View - Full Width */}
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {/* Previous Month Button */}
              <button
                onClick={() => navigateMonth("prev")}
                className="h-8 w-8 rounded bg-gray-100/50 border border-gray-200/50 flex items-center justify-center cursor-pointer hover:bg-gray-200/50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>

              {/* Month/Year Display */}
              <h3 className="text-lg font-medium">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>

              {/* Next Month Button */}
              <button
                onClick={() => navigateMonth("next")}
                className="h-8 w-8 rounded bg-gray-100/50 border border-gray-200/50 flex items-center justify-center cursor-pointer hover:bg-gray-200/50 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {/* Today Button */}
              <button
                onClick={goToToday}
                className="h-8 px-4 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center cursor-pointer hover:bg-blue-500/20 transition-colors"
              >
                <span className="text-blue-600 text-sm font-medium">Today</span>
              </button>

              {/* View Toggle Buttons - for future implementation */}
              <div className="h-8 w-8 rounded bg-gray-100/50 border border-gray-200/50 flex items-center justify-center cursor-pointer hover:bg-gray-200/50 transition-colors">
                <span className="text-gray-500 text-xs">W</span>
              </div>
              <div className="h-8 w-8 rounded bg-blue-500/20 border border-blue-500/30 flex items-center justify-center cursor-pointer">
                <span className="text-blue-600 text-xs font-medium">M</span>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-gray-600"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                onClick={(e) => handleDayClick(day, e)}
                className={`
                  calendar-day relative cursor-pointer transition-all hover:bg-gray-50 border min-h-[80px] p-2 flex flex-col
                  ${
                    day.isToday
                      ? "bg-blue-50 border-blue-200"
                      : day.isCurrentMonth
                      ? "bg-white border-gray-200 hover:border-gray-300"
                      : "bg-gray-50 border-gray-100 text-gray-400"
                  }
                  ${day.posts.length > 0 ? "hover:shadow-sm" : ""}
                `}
              >
                <span
                  className={`text-sm font-medium ${
                    day.isToday
                      ? "font-semibold text-blue-600"
                      : day.isCurrentMonth
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  {day.date.getDate()}
                </span>

                {/* Post blocks - Simple design */}
                {day.posts.length > 0 && (
                  <div className="flex-1 mt-2 space-y-1 overflow-hidden pointer-events-none">
                    {day.posts.slice(0, 3).map((post, postIndex) => (
                      <div
                        key={post.id}
                        className={`text-xs px-2 py-1 bg-gray-100 border-l-2 text-gray-700 ${
                          post.status === "scheduled"
                            ? "border-l-orange-400"
                            : "border-l-green-400"
                        }`}
                        title={`${
                          post.content?.substring(0, 100) || "No content"
                        } - ${post.status}`}
                      >
                        <div className="truncate font-medium">
                          {post.content?.substring(0, 20) || "Untitled"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(post.scheduledAt!).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    ))}
                    {day.posts.length > 3 && (
                      <div className="text-xs text-gray-500 text-center py-1">
                        +{day.posts.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Loading/Error States */}
          {loading && (
            <div className="text-center py-4">
              <span className="text-sm text-gray-500">Loading posts...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-4">
              <span className="text-sm text-red-500">{error}</span>
            </div>
          )}

          {/* Legend - Simple */}
          <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-2 bg-gray-100 border-l-2 border-l-orange-400"></div>
              <span>Scheduled</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-2 bg-gray-100 border-l-2 border-l-green-400"></div>
              <span>Published</span>
            </div>
          </div>
        </div>
      </div>

      {/* Popover for scheduled posts - Simple Design */}
      {popover.isOpen && (
        <div
          className="popover-content fixed z-50 bg-white border border-gray-200 shadow-lg p-0 w-80"
          style={{
            left: `${Math.max(
              10,
              Math.min(popover.position.x - 160, window.innerWidth - 340)
            )}px`,
            top: `${Math.max(
              10,
              Math.min(popover.position.y, window.innerHeight - 400)
            )}px`,
          }}
        >
          {/* Popover Header - Simple */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">
                  {popover.date?.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {popover.posts.length}{" "}
                  {popover.posts.length === 1 ? "post" : "posts"}
                </p>
              </div>
              <button
                onClick={closePopover}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Posts List - Simple */}
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {popover.posts.map((post) => (
              <div
                key={post.id}
                className="border border-gray-200 p-3 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          post.status === "scheduled"
                            ? "bg-orange-400"
                            : "bg-green-400"
                        }`}
                      ></div>
                      <h5 className="text-sm font-medium text-gray-900">
                        {post.content?.substring(0, 40) || "Untitled Post"}
                      </h5>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(post.scheduledAt!).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs">
                        {post.status}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/posts/edit/${post.id}`}
                    className="ml-2 p-1 hover:bg-gray-200 rounded"
                    title="Edit post"
                  >
                    <Edit className="w-4 h-4 text-gray-500" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200">
            <Button asChild size="sm" className="w-full">
              <Link href="/dashboard/posts/new">
                <Plus className="w-4 h-4 mr-2" />
                Add New Post
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
