"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  FileText,
  BookOpen,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { useSidebar } from "@/components/ui";
import type { LucideIcon } from "lucide-react";

interface Workspace {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  href: string;
  prefixes: string[];
}

const workspaces: Workspace[] = [
  {
    id: "platform",
    label: "Platform",
    shortLabel: "Platform",
    description: "Lender Platform",
    icon: Building2,
    href: "/dashboard",
    prefixes: ["/dashboard", "/balance-sheet", "/platform-settings", "/tools"],
  },
  {
    id: "docs",
    label: "Documentation",
    shortLabel: "Docs",
    description: "API & developer docs",
    icon: FileText,
    href: "/docs",
    prefixes: ["/docs"],
  },
  {
    id: "resources",
    label: "Resources",
    shortLabel: "Resources",
    description: "Guides, templates & tools",
    icon: BookOpen,
    href: "/resources",
    prefixes: ["/resources"],
  },
];

export function WorkspaceSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile } = useSidebar();

  const currentWorkspace =
    workspaces.find((ws) => ws.prefixes.some((p) => pathname.startsWith(p))) ||
    workspaces[0];

  const handleWorkspaceChange = (workspace: Workspace) => {
    router.push(workspace.href);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-md border border-sidebar-border bg-sidebar-accent/10 px-2.5 py-1 text-xs font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-sidebar-ring">
          <currentWorkspace.icon className="size-3.5" />
          <span>{currentWorkspace.shortLabel}</span>
          <ChevronDown className="size-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="start"
        sideOffset={4}
      >
        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onClick={() => handleWorkspaceChange(ws)}
            className="gap-3 p-2.5"
          >
            <div className="flex size-8 items-center justify-center rounded-md border bg-background">
              <ws.icon className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="font-medium">{ws.label}</span>
              <span className="text-xs text-muted-foreground">
                {ws.description}
              </span>
            </div>
            {currentWorkspace.id === ws.id && (
              <Check className="size-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
