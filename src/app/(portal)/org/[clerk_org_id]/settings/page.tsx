"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import {
  ArrowLeft,
  Building2,
  Users,
  Globe,
  Shield,
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
  id: SettingsTab | "permissions";
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
];

export default function OrganizationSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const clerkOrgIdFromUrl = params.clerk_org_id as string;
  
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { setActive } = useOrganizationList();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
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
    <div className="flex flex-1 flex-col">
      {/* Header with breadcrumbs */}
      <div className="border-b px-6 py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                  Back to Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="mt-4 text-2xl font-semibold">Settings</h1>
      </div>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Left sidebar navigation */}
        <div className="w-64 border-r bg-muted/30 p-6">
          {/* Organization info */}
          <div className="mb-6 flex items-center gap-3">
            {organization.imageUrl ? (
              <Image
                src={organization.imageUrl}
                alt={organization.name}
                width={40}
                height={40}
                className="rounded-lg"
              />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="size-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{organization.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {organization.slug || "organization"}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Organization
            </p>
            {settingsNavItems.map((item) => {
              // If item has href, render as Link
              if (item.href) {
                return (
                  <Link
                    key={item.id}
                    href={`/org/${clerkOrgIdFromUrl}/settings/${item.href}`}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                );
              }
              
              // Otherwise render as button for tab switching
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as SettingsTab)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    activeTab === item.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right content area */}
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-3xl p-8">
            {activeTab === "general" && <GeneralSettings />}
            {activeTab === "members" && <MembersSettings />}
            {activeTab === "domains" && <DomainsSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}
