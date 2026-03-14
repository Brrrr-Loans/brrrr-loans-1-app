"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useOrganization } from "@clerk/nextjs";
import {
  Building2,
  Users,
  Globe,
  Shield,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  description: string;
  icon: typeof Building2;
  href: string;
  isActive?: boolean;
}

export default function DocumentPermissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const clerkOrgId = params.clerk_org_id as string;
  const { organization, isLoaded: orgLoaded } = useOrganization();

  const settingsNavItems: NavItem[] = [
    {
      id: "general",
      label: "General",
      description: "Organization profile and settings",
      icon: Building2,
      href: `/org/${clerkOrgId}/settings?tab=general`,
    },
    {
      id: "members",
      label: "Members",
      description: "Manage organization members",
      icon: Users,
      href: `/org/${clerkOrgId}/settings?tab=members`,
    },
    {
      id: "domains",
      label: "Domains",
      description: "Verified domains and SSO",
      icon: Globe,
      href: `/org/${clerkOrgId}/settings?tab=domains`,
    },
    {
      id: "permissions",
      label: "Permissions",
      description: "Document access permissions",
      icon: Shield,
      href: `/org/${clerkOrgId}/settings/documents/permissions`,
      isActive: true,
    },
    {
      id: "policies",
      label: "Policies",
      description: "Global access policies",
      icon: ShieldCheck,
      href: `/org/${clerkOrgId}/settings/policies`,
    },
  ];

  if (!orgLoaded) {
    return (
      <div className="w-full flex justify-center px-4 py-8 md:px-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span>Loading organization...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 pt-3 pb-3 mx-7 md:px-8 md:pt-9 md:pb-9">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your organization profile, members, and preferences.
          </p>
        </div>

        {/* Main content with sidebar */}
        <div className="flex gap-8">
          {/* Left sidebar navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-4">
              {/* Organization info */}
              {organization && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border bg-card p-4">
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
              )}

              {/* Navigation */}
              <nav className="space-y-1">
                {settingsNavItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                      item.isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    <item.icon className="size-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Right content area */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
