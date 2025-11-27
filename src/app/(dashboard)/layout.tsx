"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { ImpersonationProvider } from "@/contexts/impersonation-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ImpersonationProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16rem",
            "--header-height": "4rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-auto flex flex-col gap-4 p-4 pb-3 md:gap-6 md:px-6 md:pt-6 md:pb-4">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ImpersonationProvider>
  );
}
