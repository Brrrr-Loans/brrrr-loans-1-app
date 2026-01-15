"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FileText, BookOpen, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

import { NavSearch } from "./nav-search";
import { TeamSwitcherV2 } from "./team-switcher-v2";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Dynamic imports with ssr: false to prevent hydration mismatches
const WorkspaceSwitcher = dynamic(
  () => import("./workspace-switcher").then((mod) => mod.WorkspaceSwitcher),
  { ssr: false }
);
const NavUser = dynamic(() => import("./nav-user").then((mod) => mod.NavUser), {
  ssr: false,
});

import { useUser } from "@clerk/nextjs";

interface Article {
  _id: string;
  _title: string;
  _slug: string;
  sidebarOverrides?: {
    title?: string;
    markAsNew?: boolean;
  };
  children?: {
    items: Article[];
  };
}

interface Page {
  _id: string;
  _title: string;
  _slug: string;
  articles?: {
    items: Article[];
  };
}

interface DocsData {
  pages?: {
    items: Page[];
  };
}

export function DocsSidebar(
  props: React.ComponentPropsWithoutRef<typeof Sidebar>
) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [docsData, setDocsData] = useState<DocsData | null>(null);

  // Fetch docs structure from BaseHub via API
  useEffect(() => {
    async function fetchDocsData() {
      try {
        const res = await fetch("/api/docs/structure");
        if (res.ok) {
          const data = await res.json();
          setDocsData(data);
        }
      } catch (error) {
        console.error("Failed to fetch docs structure:", error);
      }
    }
    fetchDocsData();
  }, []);

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

  const pages = docsData?.pages?.items || [];

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

        {/* Overview */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/docs"}>
                <Link href="/docs">
                  <BookOpen className="size-4" />
                  <span>Overview</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Dynamic BaseHub Pages */}
        {pages.map((page) => {
          const isPageActive = pathname.startsWith(`/docs/${page._slug}`);
          const hasArticles =
            page.articles?.items && page.articles.items.length > 0;

          return (
            <SidebarGroup key={page._id}>
              <SidebarGroupLabel>{page._title}</SidebarGroupLabel>
              <SidebarMenu>
                {hasArticles ? (
                  page.articles?.items.map((article) => {
                    const articlePath = `/docs/${page._slug}/${article._slug}`;
                    const isArticleActive = pathname === articlePath;
                    const hasChildren =
                      article.children?.items &&
                      article.children.items.length > 0;

                    if (hasChildren) {
                      return (
                        <Collapsible
                          key={article._id}
                          defaultOpen={pathname.startsWith(articlePath)}
                          className="group/collapsible"
                        >
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton
                                isActive={isArticleActive}
                                className="w-full justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="size-4" />
                                  <span>
                                    {article.sidebarOverrides?.title ||
                                      article._title}
                                  </span>
                                  {article.sidebarOverrides?.markAsNew && (
                                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                      New
                                    </span>
                                  )}
                                </div>
                                <ChevronRight className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {article.children?.items.map((child) => {
                                  const childPath = `/docs/${page._slug}/${article._slug}/${child._slug}`;
                                  return (
                                    <SidebarMenuSubItem key={child._id}>
                                      <SidebarMenuSubButton
                                        asChild
                                        isActive={pathname === childPath}
                                      >
                                        <Link href={childPath}>
                                          {child.sidebarOverrides?.title ||
                                            child._title}
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
                      <SidebarMenuItem key={article._id}>
                        <SidebarMenuButton asChild isActive={isArticleActive}>
                          <Link href={articlePath}>
                            <FileText className="size-4" />
                            <span>
                              {article.sidebarOverrides?.title ||
                                article._title}
                            </span>
                            {article.sidebarOverrides?.markAsNew && (
                              <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                New
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        isPageActive && pathname === `/docs/${page._slug}`
                      }
                    >
                      <Link href={`/docs/${page._slug}`}>
                        <FileText className="size-4" />
                        <span>{page._title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroup>
          );
        })}

        {/* Loading State */}
        {!docsData && (
          <SidebarGroup>
            <SidebarGroupLabel>Loading...</SidebarGroupLabel>
            <SidebarMenu>
              {[1, 2, 3].map((i) => (
                <SidebarMenuItem key={i}>
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <div className="size-4 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="mt-auto border-t border-sidebar-border pt-2">
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
