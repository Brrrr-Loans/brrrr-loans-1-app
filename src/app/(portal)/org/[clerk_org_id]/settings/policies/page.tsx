import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default async function PoliciesPage({
  params,
}: {
  params: Promise<{ clerk_org_id: string }>;
}) {
  const { clerk_org_id } = await params;

  return (
    <div className="w-full min-h-full px-4 pt-3 pb-3 mx-7 md:px-8 md:pt-8 md:pb-8">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        <div>
          <Link
            href={`/org/${clerk_org_id}/settings`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to Settings
          </Link>
          <h1 className="text-3xl font-bold">Access Policies</h1>
          <p className="mt-1 text-muted-foreground">
            Create conditional rules to customize user access and org-scoped permissions.
          </p>
        </div>

        {/* Placeholder content */}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShieldCheck className="size-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold">Policy Engine Coming Soon</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            The custom policy builder is being integrated. This page will allow you to
            create conditional access rules for tables, features, and storage buckets.
          </p>
        </div>
      </div>
    </div>
  );
}
