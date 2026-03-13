"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import {
  ArrowLeft,
  Building2,
  Users,
  Globe,
  Shield,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/shadcn/breadcrumb";
import { cn } from "@/lib/utils";

// Import the tab content components
import { GeneralSettings } from "./components/general-settings";
import { MembersSettings } from "./components/members-settings";
import { DomainsSettings } from "./components/domains-settings";

type SettingsTab = "general" | "members" | "domains";

interface NavItem {
  id: SettingsTab | "permissions" | "policies";
  label: string;
  icon: typeof Building2;
  description: string;
  href?: string; // If provided, navigates to this URL instead of switching tabs
}

const settingsNavItems: NavItem[] = [
  {
    id: "general",
    label: "General",
    icon: Building2,
    description: "Organization profile and settings",
  },
  {
    id: "members",
    label: "Members",
    icon: Users,
    description: "Manage organization members",
  },
  {
    id: "domains",
    label: "Domains",
    icon: Globe,
    description: "Verified domains and SSO",
  },
  {
    id: "permissions",
    label: "Permissions",
    icon: Shield,
    description: "Document access permissions",
    href: "documents/permissions", // Relative to current settings path
  },
  {
    id: "policies",
    label: "Policies",
    icon: ShieldCheck,
    description: "Custom access control rules",
    href: "policies", // Relative to current settings path
  },
];

export default function OrganizationSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clerkOrgIdFromUrl = params.clerk_org_id as string;
  
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { setActive } = useOrganizationList();
  
  // Get active tab from URL query param, default to "general"
  const activeTab = (searchParams.get("tab") as SettingsTab) || "general";
  const [isValidating, setIsValidating] = useState(true);

  // Validate that the URL org matches the active org, or switch to it
  useEffect(() => {
    if (!orgLoaded || !clerkOrgIdFromUrl) return;

    // If there's no organization context yet, wait
    if (!organization) {
      setIsValidating(false);
      return;
    }

    // If URL org matches active org, we're good
    if (organization.id === clerkOrgIdFromUrl) {
      setIsValidating(false);
      return;
    }

    // URL org doesn't match active org - redirect to correct URL
    router.replace(`/org/${organization.id}/settings`);
  }, [orgLoaded, organization, clerkOrgIdFromUrl, router, setActive]);

  if (!orgLoaded || isValidating) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span>Loading organization...</span>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto size-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-medium">No organization selected</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Please select an organization to view settings
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Header with breadcrumbs */}
      <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 py-5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            {organization.imageUrl ? (
              <Image
                src={organization.imageUrl}
                alt={organization.name}
                width={48}
                height={48}
                className="rounded-xl"
              />
            ) : (
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Building2 className="size-6" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{organization.name}</h1>
              <p className="text-sm text-muted-foreground">
                Organization Settings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Left sidebar navigation */}
        <div className="w-72 shrink-0 border-r bg-muted/20 overflow-y-auto">
          <div className="p-6">
            {/* Navigation */}
            <nav className="space-y-1">
              <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Settings
              </p>
              {settingsNavItems.map((item) => {
                const isActive = item.href ? false : activeTab === item.id;
                const linkHref = item.href
                  ? `/org/${clerkOrgIdFromUrl}/settings/${item.href}`
                  : `/org/${clerkOrgIdFromUrl}/settings?tab=${item.id}`;

                return (
                  <Link
                    key={item.id}
                    href={linkHref}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                      isActive
                        ? "bg-accent text-accent-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:shadow-sm"
                    )}
                  >
                    <item.icon className="mt-0.5 size-4 shrink-0" />
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="font-medium leading-none">{item.label}</span>
                      <span className="text-xs text-muted-foreground leading-tight">
                        {item.description}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Right content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-6 py-8 md:px-8 md:py-10">
            {activeTab === "general" && <GeneralSettings />}
            {activeTab === "members" && <MembersSettings />}
            {activeTab === "domains" && <DomainsSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}
