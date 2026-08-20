"use client";

import Link from "next/link";
import React from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui";

function NavLinkItem({
  url,
  icon: Icon,
  label,
  isActive,
}: {
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
}) {
  return (
    <SidebarMenuItem className="flex items-center gap-2">
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={label}
        className="text-sidebar-foreground/70 font-normal hover:text-sidebar-foreground hover:bg-sidebar-accent data-[active=true]:text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-normal"
      >
        <Link href={url}>
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function NavMain({
  items,
  leadingItems = [],
}: {
  items: {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive?: boolean;
  }[];
  leadingItems?: {
    name: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive?: boolean;
  }[];
}) {
  return (
    <>
      {leadingItems.length > 0 && (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {leadingItems.map((item) => (
                <NavLinkItem
                  key={item.url}
                  url={item.url}
                  icon={item.icon}
                  label={item.name}
                  isActive={item.isActive}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70">
          Resources
        </SidebarGroupLabel>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            {items.map((item) => (
              <NavLinkItem
                key={item.url}
                url={item.url}
                icon={item.icon}
                label={item.title}
                isActive={item.isActive}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
