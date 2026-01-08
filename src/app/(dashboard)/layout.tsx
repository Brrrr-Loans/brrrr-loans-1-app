"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { ImpersonationProvider } from "@/contexts/impersonation-context";
import { OrganizationProvider } from "@/contexts/organization-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrganizationProvider>
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
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-auto p-4 pb-3 md:px-6 md:pt-6 md:pb-4">
                {children}
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ImpersonationProvider>
    </OrganizationProvider>
  );
}
