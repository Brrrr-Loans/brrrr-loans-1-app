"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RouteProtection } from "@/components/auth/route-protection";
import { useCurrentOrganization } from "@/contexts/organization-context";
import { useImpersonation } from "@/contexts/impersonation-context";
import {
  fetchPortalDeals,
  propertyAddressFromDeal,
  type PortalDeal,
} from "@/lib/deals-api";
import { dealRecordPath } from "@/config/deal-routes";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

const PIPELINE_STAGES: Array<{ key: string; label: string }> = [
  { key: "loan_setup", label: "Loan Setup" },
  { key: "processing_1", label: "Processing I" },
  { key: "appraisal_review", label: "Appraisal Review" },
  { key: "processing_2", label: "Processing II" },
  { key: "qc_1", label: "QC I" },
  { key: "underwriting", label: "Underwriting" },
  { key: "conditionally_approved", label: "Conditionally Approved" },
  { key: "qc_2", label: "QC II" },
  { key: "clear_to_close", label: "Clear to Close" },
  { key: "closed_and_funded", label: "Closed & Funded" },
];

function DealPipelineBoard() {
  const router = useRouter();
  const { clerkOrgId, isLoaded: orgLoaded } = useCurrentOrganization();
  const { impersonatedUserId } = useImpersonation();
  const [deals, setDeals] = useState<PortalDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgLoaded) return;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const rows = await fetchPortalDeals({
          clerkOrgId,
          impersonatedUserId,
        });
        setDeals(rows);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load pipeline");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [orgLoaded, clerkOrgId, impersonatedUserId]);

  const grouped = useMemo(() => {
    const buckets = new Map<string, PortalDeal[]>();
    for (const stage of PIPELINE_STAGES) {
      buckets.set(stage.key, []);
    }
    buckets.set("unassigned", []);

    for (const deal of deals) {
      const key = deal.deal_stage_2 || "unassigned";
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(deal);
    }

    return buckets;
  }, [deals]);

  if (loading) {
    return (
      <div className="h-64 bg-muted animate-pulse rounded-md" />
    );
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  const stages = [
    ...PIPELINE_STAGES,
    { key: "unassigned", label: "Unassigned" },
  ].filter((stage) => (grouped.get(stage.key) || []).length > 0 || stage.key !== "unassigned");

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const stageDeals = grouped.get(stage.key) || [];
        return (
          <Card key={stage.key} className="min-w-[260px] w-[260px] shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{stage.label}</span>
                <Badge variant="secondary">{stageDeals.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stageDeals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No deals</p>
              ) : (
                stageDeals.map((deal) => (
                  <Button
                    key={deal.id}
                    variant="outline"
                    className="h-auto w-full flex-col items-start gap-1 whitespace-normal p-3 text-left"
                    onClick={() => router.push(dealRecordPath(deal.id))}
                  >
                    <span className="font-medium">
                      {deal.deal_name || deal.loan_number || `Deal ${deal.id}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {propertyAddressFromDeal(deal)}
                    </span>
                  </Button>
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function DealPipelinePage() {
  return (
    <RouteProtection
      requiredContactTypes={[
        "Balance Sheet Investor",
        "Lender",
        "Borrower",
        "Broker",
        "Point of Contact",
      ]}
      requiredPermissions={["canAccessDeals"]}
    >
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Deal Pipeline</h1>
              <p className="text-muted-foreground">
                Track loans through origination stages.
              </p>
            </div>
            <DealPipelineBoard />
          </div>
        </div>
      </div>
    </RouteProtection>
  );
}
