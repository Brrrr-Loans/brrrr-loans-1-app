"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Building,
  Home,
  FileBarChart2,
  ArrowLeftRight,
  FileSpreadsheet,
  CreditCard,
  FileSignature,
  ArrowDownLeft,
  ArrowUpRight,
  ListTree,
  PieChart,
  BarChart3,
} from "lucide-react";
import { NavSearch } from "./nav-search";
import { NavMain } from "./nav-main";
import { NavBalanceSheet } from "./nav-balancesheet";
import { NavUser } from "./nav-user";
import { TeamSwitcherV2 } from "./team-switcher-v2";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui";

export function AppSidebar(
  props: React.ComponentPropsWithoutRef<typeof Sidebar>
) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  const mainNavItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Deals",
      url: "/deals",
      icon: Building,
      isActive: pathname.startsWith("/deals"),
    },
  ];

  const balanceSheetItems = [
    {
      name: "Investor Portfolio",
      icon: PieChart,
      items: [
        {
          name: "Insights",
          url: "/balance-sheet/investor",
          icon: BarChart3,
        },
      ],
    },
    {
      name: "Documents",
      icon: FileBarChart2,
      items: [
        {
          name: "Statements",
          url: "/balance-sheet/documents?tab=statements",
          icon: FileSpreadsheet,
        },
        {
          name: "Payments",
          url: "/balance-sheet/documents?tab=payments",
          icon: CreditCard,
        },
        {
          name: "Agreements",
          url: "/balance-sheet/documents?tab=agreements",
          icon: FileSignature,
        },
      ],
    },
    {
      name: "Transactions",
      icon: ArrowLeftRight,
      items: [
        {
          name: "All Transactions",
          url: "/balance-sheet/transactions?tab=all",
          icon: ListTree,
        },
        {
          name: "Investments",
          url: "/balance-sheet/transactions?tab=investments",
          icon: ArrowDownLeft,
        },
        {
          name: "Distributions",
          url: "/balance-sheet/transactions?tab=distributions",
          icon: ArrowUpRight,
        },
      ],
    },
  ];

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
        <NavSearch />
        <NavMain items={mainNavItems} />
        <Suspense fallback={null}>
          <NavBalanceSheet items={balanceSheetItems} />
        </Suspense>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="mt-auto border-t border-sidebar-border pt-2">
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
