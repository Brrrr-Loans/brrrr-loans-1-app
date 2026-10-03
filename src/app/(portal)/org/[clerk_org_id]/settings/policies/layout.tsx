"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useOrganization } from "@clerk/nextjs";
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
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/shadcn/breadcrumb";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  subtitle?: string;
  icon: typeof Building2;
  href: string;
  isActive?: boolean;
}

export default function PoliciesSettingsLayout({
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
      subtitle: "Organization profile and settings",
      icon: Building2,
      href: `/org/${clerkOrgId}/settings?tab=general`,
    },
    {
      id: "members",
      label: "Members",
      subtitle: "Manage team members and roles",
      icon: Users,
      href: `/org/${clerkOrgId}/settings?tab=members`,
    },
    {
      id: "domains",
      label: "Domains",
      subtitle: "Verified domains and email settings",
      icon: Globe,
      href: `/org/${clerkOrgId}/settings?tab=domains`,
    },
    {
      id: "permissions",
      label: "Permissions",
      subtitle: "Document access control",
      icon: Shield,
      href: `/org/${clerkOrgId}/settings/documents/permissions`,
    },
    {
      id: "policies",
      label: "Policies",
      subtitle: "Custom access rules",
      icon: ShieldCheck,
      href: `/org/${clerkOrgId}/settings/policies`,
      isActive: true,
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

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b px-6 py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/org/${clerkOrgId}/settings?tab=general`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {organization?.slug || clerkOrgId}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/org/${clerkOrgId}/settings?tab=general`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Settings
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Policies</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="mt-4 text-2xl font-semibold">Access Policies</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create conditional rules to customize user access. DENY always wins
          over ALLOW when both match.
        </p>
      </div>

      <div className="flex flex-1">
        <div className="w-64 border-r bg-[var(--background)] p-6">
          {organization && (
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
          )}

          <nav className="space-y-1">
            <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Organization
            </p>
            {settingsNavItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex w-full items-start gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  item.isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <item.icon className="mt-0.5 size-4 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{item.label}</span>
                  {item.subtitle && (
                    <span className="text-xs text-muted-foreground">
                      {item.subtitle}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
