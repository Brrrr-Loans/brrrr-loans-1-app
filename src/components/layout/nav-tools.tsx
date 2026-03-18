"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui";

export function NavTools({
  items,
}: {
  items: {
    name: string;
    url?: string;
    icon: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70">
        Tools
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = item.url
              ? pathname.startsWith(item.url)
              : false;

            return (
              <SidebarMenuItem key={item.name}>
                {item.url ? (
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className="text-sidebar-foreground/70 font-normal hover:text-sidebar-foreground hover:bg-sidebar-accent data-[active=true]:text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-normal"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    className={`font-normal ${
                      item.disabled
                        ? "text-sidebar-foreground/50 cursor-not-allowed"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                    disabled={item.disabled}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
