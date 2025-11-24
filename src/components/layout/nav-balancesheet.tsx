"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui";

export function NavBalanceSheet({
  items,
}: {
  items: {
    name: string;
    url?: string;
    icon: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
    items?: {
      name: string;
      url: string;
      icon: React.ComponentType<{ className?: string }>;
    }[];
  }[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const currentDocumentsTab = useMemo(() => {
    return searchParams?.get("tab") ?? "statements";
  }, [searchParams]);

  const currentTransactionsTab = useMemo(() => {
    return searchParams?.get("tab") ?? "all";
  }, [searchParams]);

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70">
        Balance Sheet
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const hasSubItems = item.items && item.items.length > 0;
            const isDocumentsRoute = pathname.startsWith(
              "/balance-sheet/documents"
            );
            const isTransactionsRoute = pathname.startsWith(
              "/balance-sheet/transactions"
            );

            const isActive = item.url
              ? pathname.startsWith(item.url)
              : item.items?.some((subItem) => {
                  const [basePath, search] = subItem.url.split("?");
                  if (!pathname.startsWith(basePath)) {
                    return false;
                  }

                  if (!search) {
                    return true;
                  }

                  const tabParam = new URLSearchParams(search).get("tab");
                  if (!tabParam) {
                    return true;
                  }

                  if (isDocumentsRoute) {
                    return tabParam === currentDocumentsTab;
                  }
                  if (isTransactionsRoute) {
                    return tabParam === currentTransactionsTab;
                  }
                  return true;
                }) ||
                (isTransactionsRoute &&
                  pathname.startsWith("/balance-sheet/transactions"));

            if (hasSubItems) {
              const isOpen = openItems[item.name] ?? isActive;

              return (
                <Collapsible
                  key={item.name}
                  open={isOpen}
                  onOpenChange={(open) =>
                    setOpenItems((prev) => ({ ...prev, [item.name]: open }))
                  }
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="font-normal text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent data-[active=true]:text-sidebar-foreground data-[active=true]:font-normal sidebar-collapsible-button">
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const [basePath, search] = subItem.url.split("?");
                          const isPathMatch = pathname.startsWith(basePath);

                          const tabParam = search
                            ? new URLSearchParams(search).get("tab")
                            : undefined;
                          const isTabMatch = tabParam
                            ? isDocumentsRoute
                              ? currentDocumentsTab === tabParam
                              : isTransactionsRoute
                                ? currentTransactionsTab === tabParam
                                : true
                            : true;

                          // For Documents and Transactions routes, check tab match
                          const isSubItemActive = isPathMatch && isTabMatch;
                          return (
                            <SidebarMenuSubItem key={subItem.name}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubItemActive}
                                className="text-sidebar-foreground font-normal hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:font-normal"
                              >
                                <Link href={subItem.url}>
                                  <subItem.icon className="h-4 w-4" />
                                  <span>{subItem.name}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

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
                    <item.icon
                      className={`h-4 w-4 ${
                        item.disabled ? "text-sidebar-foreground/50" : ""
                      }`}
                    />
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
