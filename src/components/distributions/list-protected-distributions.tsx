"use client";

import { withInvestorPermission } from "@/components/auth/with-investor-permission";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { DistributionsDataTable } from "./distributions-data-table";

interface DistributionsListProps {
  dealId?: string; // Optional - if provided, shows distributions for specific deal
}

function UnprotectedDistributionsList({ dealId }: DistributionsListProps) {
  // The DistributionsDataTable already includes its own Card wrapper
  return <DistributionsDataTable />;
}

// Create a permission-protected version of DistributionsList
export const ProtectedDistributionsList =
  withInvestorPermission<DistributionsListProps>(UnprotectedDistributionsList);

// Usage example:
export function DistributionsListWrapper({ dealId }: DistributionsListProps) {
  return (
    <ProtectedDistributionsList
      resourceType={dealId ? "deal" : "distribution"}
      resourceId={dealId || "all"} // Use 'all' as a special case for viewing all distributions
      fallback={
        <Card>
          <CardHeader>
            <CardTitle>Distributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
              You don&apos;t have permission to view these distributions.
            </div>
          </CardContent>
        </Card>
      }
      dealId={dealId}
    />
  );
}
