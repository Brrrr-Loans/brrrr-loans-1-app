"use client";

import * as React from "react";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SlashIcon, Settings } from "lucide-react";
import { Separator } from "@/components/ui";
import { SidebarTrigger } from "@/components/ui";
import { TeamSwitcherV2 } from "@/components/layout/team-switcher-v2";
import { useUser } from "@clerk/nextjs";

// Dynamic imports with ssr: false to prevent hydration mismatches
// These components use Radix UI primitives that generate IDs differently on server vs client
const SearchForm = dynamic(
  () => import("@/components/layout/search-form").then((mod) => mod.SearchForm),
  { ssr: false }
);
const ThemeDropdown = dynamic(
  () =>
    import("@/components/theme/theme-dropdown").then(
      (mod) => mod.ThemeDropdown
    ),
  { ssr: false }
);
const PlatformSettingsPopover = dynamic(
  () =>
    import("@/components/layout/platform-settings-popover").then(
      (mod) => mod.PlatformSettingsPopover
    ),
  { ssr: false }
);
const ImpersonationSwitcher = dynamic(
  () =>
    import(
      "@/app/(dashboard)/platform-settings/components/impersonation-switcher"
    ).then((mod) => mod.ImpersonationSwitcher),
  { ssr: false }
);
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/overlays/dropdown-menu";
import { ChevronDown } from "lucide-react";

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
  if (path.startsWith("/balance-sheet/investor-portfolio/deals/") && path !== "/balance-sheet/investor-portfolio/deals") {
    const dealId = path.split("/").pop();
    const displayName = dealName || `Deal #${dealId}`;

    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/balance-sheet/investor-portfolio/deals">Deals</Link>
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
            <BreadcrumbLink asChild>
              <Link href="/balance-sheet/transactions?tab=all">
                Transactions
                  </Link>
            </BreadcrumbLink>
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

  // Handle Balance Sheet / Investor Portfolio routes
  const renderInvestorPortfolioBreadcrumb = (currentPage: string) => {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/balance-sheet/investor-portfolio/analytics">Balance Sheet</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/balance-sheet/investor-portfolio/analytics">Investor Portfolio</Link>
            </BreadcrumbLink>
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

  // Handle Balance Sheet / Transactions / New route
  if (path === "/balance-sheet/transactions/new") {
    return renderTransactionsBreadcrumb("New Transaction");
  }

  // Handle Balance Sheet / Transactions / [id] route (transaction details)
  if (path.startsWith("/balance-sheet/transactions/") && path !== "/balance-sheet/transactions/new") {
    const transactionId = path.split("/").pop();
    return renderTransactionsBreadcrumb(`Transaction #${transactionId}`);
  }

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

  // Handle Balance Sheet / Investor Portfolio / Insights route
  if (path === "/balance-sheet/investor-portfolio/analytics") {
    return renderInvestorPortfolioBreadcrumb("Insights");
  }

  // Handle Balance Sheet / Documents routes with tab parameter
  if (path === "/balance-sheet/documents") {
    const tab = searchParams?.get("tab") || "statements";
    const tabLabel = 
      tab === "payments" ? "Payments" : 
      tab === "agreements" ? "Agreements" : 
      "Statements";

    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-muted-foreground">Balance Sheet</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-foreground transition-colors">
                Documents
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/balance-sheet/documents?tab=statements" className="cursor-pointer">
                    Statements
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/balance-sheet/documents?tab=payments" className="cursor-pointer">
                    Payments
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/balance-sheet/documents?tab=agreements" className="cursor-pointer">
                    Agreements
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

  // Handle Platform Settings / Integrations routes
  if (path.startsWith("/platform-settings/integrations/")) {
    const integrationSlug = path.split("/").pop();
    const integrationName = integrationSlug === "ofb" ? "Ocean First" : integrationSlug === "brex" ? "Brex" : integrationSlug === "grapesjs" ? "GrapesJS Pages" : integrationSlug;

    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-muted-foreground">Platform Settings</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-foreground transition-colors">
                Integrations
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/platform-settings/integrations/brex" className="cursor-pointer">
                    Brex
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/platform-settings/integrations/ofb" className="cursor-pointer">
                    Ocean First
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/platform-settings/integrations/grapesjs" className="cursor-pointer">
                    GrapesJS Pages
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{integrationName}</BreadcrumbPage>
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
  if (path === "/balance-sheet/investor-portfolio/deals") return "Deals";
  if (path.startsWith("/balance-sheet/investor-portfolio/deals/")) return "Deal Details";
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
  const [mounted, setMounted] = React.useState(false);
  const { user } = useUser();

  // Ensure breadcrumbs only render on client to prevent hydration mismatch
  // useSearchParams() can return different values during SSR vs client hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  // Check if user is admin
  const isAdmin =
    user?.publicMetadata?.role === "admin" ||
    user?.organizationMemberships?.[0]?.role === "org:admin";

  const handleOpenTeamSwitcher = () => {
    setShowTeamSwitcher(true);
  };

  return (
    <>
      <header className="bg-background flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 rounded-tl-xl rounded-tr-xl">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="bg-border shrink-0 w-[1px] mr-2 h-4"
        />
        {mounted 
          ? (breadcrumb || generateBreadcrumbs(pathname, searchParams, dealName))
          : <div className="h-4 w-32 bg-muted/50 animate-pulse rounded" />
        }
        <div className="flex items-center gap-4 ml-auto flex-shrink-0">
          <SearchForm
            className="w-full max-w-56 xl:max-w-64"
            onOpenTeamSwitcher={handleOpenTeamSwitcher}
          />
          {isAdmin && <ImpersonationSwitcher />}
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
        <header className="bg-background flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 rounded-tl-xl rounded-tr-xl">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="bg-border shrink-0 w-[1px] mr-2 h-4"
          />
          {/* Placeholder for dynamically loaded components */}
          <div className="flex items-center gap-4 ml-auto flex-shrink-0">
            <div className="h-8 w-8" />
            <div className="h-8 w-8" />
          </div>
        </header>
      }
    >
      <SiteHeaderContent breadcrumb={breadcrumb} dealName={dealName} />
    </Suspense>
  );
}
