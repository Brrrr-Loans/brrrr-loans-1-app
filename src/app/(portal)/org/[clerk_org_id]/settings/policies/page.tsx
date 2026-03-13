import Link from "next/link";
import { ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/shadcn/alert";
import { getOrgPolicies, getOrgDisplayName } from "./actions";

export default async function PoliciesPage({
  params,
}: {
  params: Promise<{ clerk_org_id: string }>;
}) {
  const { clerk_org_id } = await params;

  let policiesData;
  let error: string | null = null;
  let orgDisplayName = "This Organization";

  try {
    policiesData = await getOrgPolicies();
    orgDisplayName = await getOrgDisplayName().catch(
      () => "This Organization"
    );
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load policies";
    console.error("Error loading org policies:", e);
  }

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
            Create conditional rules to customize user access and org-scoped
            permissions.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Unable to Load Policies</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {policiesData && !error && (
          <Card>
            <CardHeader>
              <CardTitle>Organization Policies</CardTitle>
              <CardDescription>
                {orgDisplayName} has {policiesData.policies.length} active{" "}
                {policiesData.policies.length === 1 ? "policy" : "policies"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {policiesData.policies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShieldCheck className="size-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No policies defined yet. Click "New Policy" to create your
                    first access rule.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {policiesData.policies.map((policy) => (
                    <div
                      key={policy.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div>
                        <p className="font-medium">
                          {policy.resource_type}/{policy.resource_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Action: {policy.action} | Scope: {policy.scope} |
                          Effect: {policy.effect}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        v{policy.version}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
