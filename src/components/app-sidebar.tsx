"use client";

import * as React from "react";
import Link from "next/link";
import {
  BarChart3,
  Command,
  FileText,
  Calendar,
  Plug,
  Settings2,
  Plus,
  PenTool,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "John Doe",
    email: "john@publio.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: BarChart3,
      isActive: true,
    },
    {
      title: "Posts",
      url: "/dashboard/posts",
      icon: FileText,
    },
    {
      title: "Schedule",
      url: "/dashboard/schedule",
      icon: Calendar,
    },
  ],
  navConfiguration: [
    {
      title: "Integrations",
      url: "/dashboard/integrations",
      icon: Plug,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <PenTool className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Publio</span>
                  <span className="truncate text-xs">Content Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <Button
        asChild
        className="w-auto justify-center mt-4 mx-4 font-bold"
        size="default"
      >
        <Link href="/dashboard/posts/new">
          <Plus className=" h-4 w-4 font-bold" />
          Create Post
        </Link>
      </Button>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navConfiguration} label="Configuration" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
