"use client";

import React from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { LayoutDashboard } from "lucide-react";
import { NavSearch } from "./nav-search";
import { NavMain } from "./nav-main";
import { TeamSwitcherV2 } from "./team-switcher-v2";
import {
  MAIN_NAV_ITEMS,
  BALANCE_SHEET_NAV_ITEMS,
  STANDALONE_NAV_ITEMS,
} from "@/config/navigation";

// Dynamic imports with ssr: false to prevent hydration mismatches
// These components use Radix UI primitives that generate IDs differently on server vs client
const WorkspaceSwitcher = dynamic(
  () => import("./workspace-switcher").then((mod) => mod.WorkspaceSwitcher),
  { ssr: false }
);
const NavBalanceSheet = dynamic(
  () => import("./nav-balancesheet").then((mod) => mod.NavBalanceSheet),
  { ssr: false }
);
const NavUser = dynamic(() => import("./nav-user").then((mod) => mod.NavUser), {
  ssr: false,
});

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui";

export function AppSidebar(
  props: React.ComponentPropsWithoutRef<typeof Sidebar>
) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  // Use centralized navigation config with runtime isActive state
  const mainNavItems = MAIN_NAV_ITEMS.map((item) => ({
    ...item,
    icon: LayoutDashboard,
    isActive: pathname === item.url,
  }));

  const standaloneNavItems = STANDALONE_NAV_ITEMS.map((item) => ({
    ...item,
    isActive:
      pathname === item.url || pathname.startsWith(`${item.url}/`),
  }));

  // Prepare user data for NavUser component
  const userData =
    user && isLoaded
      ? {
          name: user.fullName || user.firstName || "User",
          email: user.primaryEmailAddress?.emailAddress || "user@example.com",
          avatar: user.imageUrl || "",
        }
      : {
          name: isLoaded ? "Guest" : "Loading...",
          email: isLoaded ? "guest@example.com" : "",
          avatar: "",
        };

  // Debug: Log Clerk user data
  console.log("🔍 AppSidebar Clerk data:", {
    isLoaded,
    hasUser: !!user,
    imageUrl: user?.imageUrl,
    finalAvatar: userData.avatar,
  });

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <TeamSwitcherV2 />
      </SidebarHeader>
      <SidebarContent>
        <div className="px-2 pt-1 pb-2">
          <WorkspaceSwitcher />
        </div>
        <NavSearch />
        <NavMain items={mainNavItems} leadingItems={standaloneNavItems} />
        <NavBalanceSheet items={BALANCE_SHEET_NAV_ITEMS} />
      </SidebarContent>
      <SidebarFooter className="mt-auto border-t border-sidebar-border pt-2">
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
