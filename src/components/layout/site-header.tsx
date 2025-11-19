"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SlashIcon, ChevronDown, Settings } from "lucide-react";
import { Separator } from "@/components/ui";
import { SidebarTrigger } from "@/components/ui";
import { SearchForm } from "@/components/layout/search-form";
import { ThemeDropdown } from "@/components/theme/theme-dropdown";
import { PlatformSettingsPopover } from "@/components/layout/platform-settings-popover";
import { TeamSwitcherV2 } from "@/components/layout/team-switcher-v2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Button } from "@/components/ui";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/overlays/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";

interface SiteHeaderProps {
  breadcrumb?: React.ReactNode;
  dealName?: string;
}

function generateBreadcrumbs(
  pathname: string,
  searchParams?: URLSearchParams,
  dealName?: string
): React.ReactNode {
  const path = pathname.replace(/\/$/, "");

  // Handle deal details pages
  if (path.startsWith("/deals/") && path !== "/deals") {
    const dealId = path.split("/").pop();
    const displayName = dealName || `Deal #${dealId}`;

    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/deals">Deals</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="truncate max-w-xs">
              {displayName}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Handle Balance Sheet / Transactions routes
  const renderTransactionsBreadcrumb = (currentPage: string) => {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/balance-sheet/transactions">Balance Sheet</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5">
                Transactions
                <ChevronDown />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/balance-sheet/transactions?tab=all">
                    All Transactions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/balance-sheet/transactions?tab=investments">
                    Investments
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/balance-sheet/transactions?tab=distributions">
                    Distributions
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{currentPage}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  // Handle Balance Sheet / Transactions routes with tab parameter
  if (path === "/balance-sheet/transactions") {
    const tab = searchParams?.get("tab") || "all";
    const tabLabel =
      tab === "investments"
        ? "Investments"
        : tab === "distributions"
          ? "Distributions"
          : "All Transactions";

    return renderTransactionsBreadcrumb(tabLabel);
  }

  // Handle Balance Sheet / Documents routes with tab parameter
  if (path === "/balance-sheet/documents") {
    const tab = searchParams?.get("tab") || "statements";
    const tabLabel = tab === "payments" ? "Payments" : "Statements";

    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/balance-sheet/documents">Balance Sheet</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/balance-sheet/documents">Documents</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{tabLabel}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Handle other pages with simple title
  const title = getPageTitle(pathname);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <h1 className="text-base font-medium truncate flex-shrink min-w-0 max-w-md cursor-default">
            {title}
          </h1>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start">
          <p className="max-w-xs">{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function getPageTitle(pathname: string): string {
  // Remove trailing slash and split path
  const path = pathname.replace(/\/$/, "");

  if (path === "/dashboard") return "Dashboard";
  if (path === "/deals") return "Deals";
  if (path.startsWith("/deals/")) return "Deal Details";
  if (path === "/balance-sheet/transactions") {
    // This will be handled by breadcrumbs with searchParams
    return "Transactions";
  }
  if (path === "/balance-sheet/documents") {
    // This will be handled by breadcrumbs with searchParams
    return "Documents";
  }
  if (path === "/dashboard/investor") return "Investor Portal";
  if (path === "/dashboard/settings/integrations") return "Integrations";
  if (path === "/builder") return "Builder";

  // Default fallback - capitalize the last segment
  const segments = path.split("/");
  const lastSegment = segments[segments.length - 1];
  return lastSegment
    ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
    : "Dashboard";
}

function SiteHeaderContent({ breadcrumb, dealName }: SiteHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showTeamSwitcher, setShowTeamSwitcher] = React.useState(false);

  const handleOpenTeamSwitcher = () => {
    setShowTeamSwitcher(true);
  };

  return (
    <>
      <header className="bg-background z-50 flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 rounded-tl-xl rounded-tr-xl">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="bg-border shrink-0 w-[1px] mr-2 h-4"
        />
        {breadcrumb || generateBreadcrumbs(pathname, searchParams, dealName)}
        <div className="flex items-center gap-4 ml-auto flex-shrink-0">
          <SearchForm
            className="w-full max-w-56 xl:max-w-64"
            onOpenTeamSwitcher={handleOpenTeamSwitcher}
          />
          <PlatformSettingsPopover
            trigger={
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Platform Settings</span>
              </Button>
            }
          />
          <ThemeDropdown />
        </div>
      </header>

      {/* Team Switcher Dialog */}
      <Dialog open={showTeamSwitcher} onOpenChange={setShowTeamSwitcher}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Switch Organization</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <TeamSwitcherV2 />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function SiteHeader({ breadcrumb, dealName }: SiteHeaderProps) {
  return (
    <Suspense
      fallback={
        <header className="bg-background z-50 flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 rounded-tl-xl rounded-tr-xl">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="bg-border shrink-0 w-[1px] mr-2 h-4"
          />
          <div className="flex items-center gap-4 ml-auto flex-shrink-0">
            <PlatformSettingsPopover
              trigger={
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Platform Settings</span>
                </Button>
              }
            />
            <ThemeDropdown />
          </div>
        </header>
      }
    >
      <SiteHeaderContent breadcrumb={breadcrumb} dealName={dealName} />
    </Suspense>
  );
}
