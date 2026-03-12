"use client";

import * as React from "react";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SlashIcon, Settings, ChevronDown } from "lucide-react";
import { Separator } from "@/components/ui";
import { SidebarTrigger } from "@/components/ui";
import { TeamSwitcherV2 } from "@/components/layout/team-switcher-v2";
import { useUser } from "@clerk/nextjs";
import {
  getBreadcrumbSegments,
  ROUTES,
  DOCUMENT_TAB_ITEMS,
  INTEGRATION_ITEMS,
  ROUTE_SEGMENTS,
} from "@/config/navigation";

// Dynamic imports with ssr: false to prevent hydration mismatches
// These components use Radix UI primitives that generate IDs differently on server vs client
const SearchForm = dynamic(
  () => import("@/components/layout/search-form").then((mod) => mod.SearchForm),
  { ssr: false },
);
const ThemeDropdown = dynamic(
  () =>
    import("@/components/theme/theme-dropdown").then(
      (mod) => mod.ThemeDropdown,
    ),
  { ssr: false },
);
const PlatformSettingsPopover = dynamic(
  () =>
    import("@/components/layout/platform-settings-popover").then(
      (mod) => mod.PlatformSettingsPopover,
    ),
  { ssr: false },
);
const ImpersonationSwitcher = dynamic(
  () =>
    import("@/app/(portal)/platform-settings/components/impersonation-switcher").then(
      (mod) => mod.ImpersonationSwitcher,
    ),
  { ssr: false },
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
} from "@/components/ui/shadcn/breadcrumb";
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
} from "@/components/ui/shadcn/dropdown-menu";

interface SiteHeaderProps {
  breadcrumb?: React.ReactNode;
  dealName?: string;
}

/**
 * Generates breadcrumb navigation using the centralized navigation config.
 * All route labels and paths are defined in @/config/navigation.ts
 */
function generateBreadcrumbs(
  pathname: string,
  searchParams?: URLSearchParams,
  dealName?: string,
): React.ReactNode {
  const path = pathname.replace(/\/$/, "");
  const segments = getBreadcrumbSegments(pathname, searchParams);

  // Handle deal details pages - add the dynamic deal name
  if (
    path.startsWith(ROUTES.investorPortfolio.deals + "/") &&
    path !== ROUTES.investorPortfolio.deals
  ) {
    const dealId = path.split("/").pop();
    const displayName = dealName || `Deal #${dealId}`;

    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={ROUTES.investorPortfolio.deals}>
                {ROUTE_SEGMENTS.deals.label}
              </Link>
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

  // Handle Documents with dropdown menu
  if (path === ROUTES.documents.base) {
    const tab = searchParams?.get("tab") || "statements";
    const tabLabel =
      tab === "payments"
        ? ROUTE_SEGMENTS.payments.label
        : tab === "agreements"
          ? ROUTE_SEGMENTS.agreements.label
          : ROUTE_SEGMENTS.statements.label;

    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-muted-foreground">
              {ROUTE_SEGMENTS.balanceSheet.label}
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-foreground transition-colors">
                {ROUTE_SEGMENTS.documents.label}
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {DOCUMENT_TAB_ITEMS.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="cursor-pointer">
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
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

  // Handle Platform Settings / Integrations with dropdown menu
  if (path.startsWith(ROUTES.integrations.base + "/")) {
    const integrationSlug = path.split("/").pop();
    const integrationLabel =
      integrationSlug === ROUTE_SEGMENTS.brex.path
        ? ROUTE_SEGMENTS.brex.label
        : integrationSlug === ROUTE_SEGMENTS.ofb.path
          ? ROUTE_SEGMENTS.ofb.label
          : integrationSlug === ROUTE_SEGMENTS.templateEditor.path
            ? ROUTE_SEGMENTS.templateEditor.label
            : integrationSlug;

    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-muted-foreground">
              {ROUTE_SEGMENTS.platformSettings.label}
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-foreground transition-colors">
                {ROUTE_SEGMENTS.integrations.label}
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {INTEGRATION_ITEMS.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="cursor-pointer">
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{integrationLabel}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Handle simple single-segment breadcrumbs (like Dashboard)
  if (segments.length === 1) {
    const title = segments[0].label;
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

  // Handle multi-segment breadcrumbs from centralized config
  // Use flatMap to avoid conditional rendering within fragments which can cause
  // React reconciliation issues (e.g., "Cannot read properties of null (reading 'removeChild')")
  const breadcrumbElements = segments.flatMap((segment, index) => {
    const isLast = index === segments.length - 1;
    const itemKey = `item-${index}`;
    const separatorKey = `sep-${index}`;

    const item = (
      <BreadcrumbItem key={itemKey}>
        {isLast || !segment.href ? (
          <BreadcrumbPage
            className={!isLast ? "text-muted-foreground" : undefined}
          >
            {segment.label}
          </BreadcrumbPage>
        ) : (
          <BreadcrumbLink asChild>
            <Link href={segment.href}>{segment.label}</Link>
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
    );

    if (isLast) {
      return [item];
    }

    return [
      item,
      <BreadcrumbSeparator key={separatorKey}>
        <SlashIcon />
      </BreadcrumbSeparator>,
    ];
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>{breadcrumbElements}</BreadcrumbList>
    </Breadcrumb>
  );
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
        {mounted ? (
          breadcrumb || generateBreadcrumbs(pathname, searchParams, dealName)
        ) : (
          <div className="h-4 w-32 bg-muted/50 animate-pulse rounded" />
        )}
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
