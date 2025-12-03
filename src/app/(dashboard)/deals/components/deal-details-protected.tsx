"use client";

import { withInvestorPermission } from "@/components/auth/with-investor-permission";
import { DealDetails } from "./deal-details";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui";
import { AlertCircle } from "lucide-react";

interface ProtectedDealDetailsProps {
  dealId: string;
  deal: unknown;
}

function UnprotectedDealDetails({ deal }: ProtectedDealDetailsProps) {
  return <DealDetails deal={deal as any} />;
}

// Create a permission-protected version of DealDetails
export const ProtectedDealDetails =
  withInvestorPermission<ProtectedDealDetailsProps>(UnprotectedDealDetails);

// Usage example:
export function DealDetailsWrapper({
  dealId,
  deal,
}: ProtectedDealDetailsProps) {
  return (
    <ProtectedDealDetails
      resourceType="deal"
      resourceId={dealId}
      fallback={
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don&apos;t have permission to view this deal.
          </AlertDescription>
        </Alert>
      }
      dealId={dealId}
      deal={deal}
    />
  );
}
