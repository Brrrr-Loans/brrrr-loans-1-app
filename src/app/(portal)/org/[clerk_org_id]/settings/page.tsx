"use client";

import { useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import { Separator } from "@/components/ui/shadcn/separator";

// Import the tab content components
import { GeneralSettings } from "./components/general-settings";
import { MembersSettings } from "./components/members-settings";
import { DomainsSettings } from "./components/domains-settings";

type SettingsTab = "general" | "members" | "domains";

interface TabConfig {
  value: SettingsTab;
  label: string;
  icon: typeof Building2;
  description: string;
  component: React.ReactNode;
}

interface ExternalLink {
  label: string;
  icon: typeof Shield;
  description: string;
  href: string;
}

export default function OrganizationSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clerkOrgIdFromUrl = params.clerk_org_id as string;
  
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { setActive } = useOrganizationList();
  
  // Get active tab from URL query param, default to "general"
  const activeTab = (searchParams.get("tab") as SettingsTab) || "general";

  // Validate that the URL org matches the active org
  useEffect(() => {
    if (!orgLoaded || !clerkOrgIdFromUrl || !organization) return;

    // If URL org doesn't match active org - redirect to correct URL
    if (organization.id !== clerkOrgIdFromUrl) {
      router.replace(`/org/${organization.id}/settings`);
    }
  }, [orgLoaded, organization, clerkOrgIdFromUrl, router]);

  // Handle tab changes via URL
  const handleTabChange = (value: string) => {
    router.push(`/org/${clerkOrgIdFromUrl}/settings?tab=${value}`);
  };

  // Tab configurations
  const tabs: TabConfig[] = [
    {
      value: "general",
      label: "General",
      icon: Building2,
      description: "Organization profile and settings",
      component: <GeneralSettings />,
    },
    {
      value: "members",
      label: "Members",
      icon: Users,
      description: "Manage organization members",
      component: <MembersSettings />,
    },
    {
      value: "domains",
      label: "Domains",
      icon: Globe,
      description: "Verified domains and SSO",
      component: <DomainsSettings />,
    },
  ];

  const externalLinks: ExternalLink[] = [
    {
      label: "Permissions",
      icon: Shield,
      description: "Document access control",
      href: `/org/${clerkOrgIdFromUrl}/settings/documents/permissions`,
    },
    {
      label: "Policies",
      icon: ShieldCheck,
      description: "Custom access rules",
      href: `/org/${clerkOrgIdFromUrl}/settings/policies`,
    },
  ];

  if (!orgLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto size-12 text-muted-foreground/30" />
          <h2 className="mt-4 text-lg font-semibold">No organization selected</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
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
    <div className="flex flex-col h-full">
      {/* Compact header */}
      <div className="shrink-0 border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <Separator orientation="vertical" className="h-5" />
            {organization.imageUrl ? (
              <Image
                src={organization.imageUrl}
                alt={organization.name}
                width={32}
                height={32}
                className="rounded-lg"
              />
            ) : (
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="size-4" />
              </div>
            )}
            <div>
              <h1 className="text-base font-semibold leading-none">{organization.name}</h1>
              <p className="text-xs text-muted-foreground mt-1">Settings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content with vertical tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          orientation="vertical"
          className="flex h-full"
        >
          {/* Vertical tabs sidebar */}
          <div className="w-64 shrink-0 border-r bg-muted/30 overflow-y-auto">
            <TabsList className="flex flex-col items-stretch w-full h-auto bg-transparent p-3 gap-1">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="justify-start data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-2.5 rounded-md"
                >
                  <tab.icon className="size-4 mr-3 shrink-0" />
                  <div className="flex flex-col items-start gap-0.5 text-left">
                    <span className="text-sm font-medium">{tab.label}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {tab.description}
                    </span>
                  </div>
                </TabsTrigger>
              ))}
              
              {/* Separator before external links */}
              <div className="my-2">
                <Separator />
              </div>
              
              <div className="px-2 mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Advanced
                </p>
              </div>
              
              {/* External navigation links */}
              {externalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-start gap-3 px-3 py-2.5 text-sm rounded-md text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                >
                  <link.icon className="size-4 mt-0.5 shrink-0" />
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="font-medium">{link.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {link.description}
                    </span>
                  </div>
                </Link>
              ))}
            </TabsList>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto bg-background">
            {tabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="m-0 h-full data-[state=inactive]:hidden"
              >
                <div className="mx-auto max-w-4xl px-6 py-6 md:px-8 md:py-8">
                  {tab.component}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
