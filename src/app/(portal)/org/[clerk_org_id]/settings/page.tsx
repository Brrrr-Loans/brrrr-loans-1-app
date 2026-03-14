"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import {
  Building2,
  Users,
  Globe,
  Shield,
  ShieldCheck,
  Mail,
  Lock,
  BarChart3,
  LayoutDashboard,
  Workflow,
  Sparkles,
  Key,
  Plug,
  Palette,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import the tab content components
import { GeneralSettings } from "./components/general-settings";
import { MembersSettings } from "./components/members-settings";
import { DomainsSettings } from "./components/domains-settings";

type SettingsTab = "general" | "members" | "domains";

interface NavItem {
  id: SettingsTab | "permissions" | "policies" | "invitations" | "auth" | "usage" | "dashboard" | "automations" | "ai-agents" | "api-keys" | "integrations" | "themes";
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
    id: "invitations",
    label: "Invitations",
    icon: Mail,
    description: "Manage pending invitations",
    href: "?tab=invitations",
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
    href: "documents/permissions",
  },
  {
    id: "policies",
    label: "Policies",
    icon: ShieldCheck,
    description: "Global access policies",
    href: "policies",
  },
  {
    id: "auth",
    label: "Auth Architecture",
    icon: Lock,
    description: "View authentication flow diagram",
    href: "?tab=auth",
  },
  {
    id: "usage",
    label: "Usage",
    icon: BarChart3,
    description: "Monitor deal, document, and API usage",
    href: "?tab=usage",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Configure dashboard widgets and data",
    href: "?tab=dashboard",
  },
  {
    id: "automations",
    label: "Automations",
    icon: Workflow,
    description: "Manage workflow automations",
    href: "?tab=automations",
  },
  {
    id: "ai-agents",
    label: "AI Agents",
    icon: Sparkles,
    description: "Configure AI agent workflows",
    href: "?tab=ai-agents",
  },
  {
    id: "api-keys",
    label: "API Keys",
    icon: Key,
    description: "Manage API keys for integrations",
    href: "?tab=api-keys",
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Plug,
    description: "Manage integrations",
    href: "?tab=integrations",
  },
  {
    id: "themes",
    label: "Themes",
    icon: Palette,
    description: "Customize appearance",
    href: "?tab=themes",
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
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Main content container */}
      <div className="flex flex-1 min-h-0">
        {/* Left sidebar navigation */}
        <div className="w-80 shrink-0 border-r overflow-y-auto">
          {/* Organization info card */}
          <div className="border-b p-6">
            <div className="flex items-center gap-3">
              {organization.imageUrl ? (
                <Image
                  src={organization.imageUrl}
                  alt={organization.name}
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-base">{organization.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {organization.slug || "organization"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-0.5">
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
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-foreground/70 hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="leading-none">{item.label}</span>
                    <span className="text-xs text-muted-foreground mt-0.5 leading-tight">
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right content area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="shrink-0 border-b px-8 py-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your organization profile, members, and preferences
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-8">
              {activeTab === "general" && <GeneralSettings />}
              {activeTab === "members" && <MembersSettings />}
              {activeTab === "domains" && <DomainsSettings />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
