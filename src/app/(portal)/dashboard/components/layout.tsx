"use client";

import type React from "react";
import { useAuth } from "@/hooks/use-clerk-auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoaded } = useAuth();

  // Show loading state while authentication is being checked
  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // The middleware will handle redirecting unauthenticated users
  // We don't need to manually redirect here

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col gap-4 pb-4 md:gap-6 md:pb-6 px-4 lg:px-6 flex-1">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
