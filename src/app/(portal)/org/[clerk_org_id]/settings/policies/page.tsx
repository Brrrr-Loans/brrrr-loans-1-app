import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/shadcn/alert";
import { getOrgPolicies, getOrgDisplayName } from "./actions";
import OrgPolicyBuilder from "@/components/policies/org-policy-builder";

export default async function PoliciesPage() {
  let policiesData;
  let error: string | null = null;
  let orgDisplayName = "This Organization";

  try {
    policiesData = await getOrgPolicies();
    orgDisplayName = await getOrgDisplayName().catch(() => "This Organization");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load policies";
    console.error("Error loading org policies:", e);
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Unable to Load Policies</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {policiesData && !error && (
        <OrgPolicyBuilder
          initialPolicies={policiesData.policies}
          orgDisplayName={orgDisplayName}
        />
      )}
    </div>
  );
}
