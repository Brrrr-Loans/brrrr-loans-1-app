"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui";
import { useImpersonation } from "@/contexts/impersonation-context";
import { useCurrentOrganization } from "@/contexts/organization-context";
import { InvestorDashboardSkeleton } from "@/components/skeletons/investor-dashboard-skeleton";
import { PermissionErrorBoundary } from "@/components/error-boundary/permission-error-boundary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { DistributionsListWrapper } from "@/components/distributions/list-protected-distributions";
import { ActiveDealsListWrapper } from "@/app/(dashboard)/deals/components/list-active-deals";
import { ChartAreaInvestorROI, type InvestorROIDataPoint } from "./components";
import { StatCard } from "@/components/once-ui";

interface InvestorContribution {
  contribution_amount: string | number;
  contribution_status: string;
  active: boolean;
}

interface InvestorDistribution {
  transaction_amount: number;
  transaction_date: string;
  transaction_status: string;
}

interface InvestorDeal {
  status: string;
}

export default function InvestorDashboard() {
  const { impersonatedUserId } = useImpersonation();
  const { clerkOrgId } = useCurrentOrganization();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contributions, setContributions] = useState<InvestorContribution[]>(
    []
  );
  const [distributions, setDistributions] = useState<InvestorDistribution[]>(
    []
  );
  const [deals, setDeals] = useState<InvestorDeal[]>([]);
  const [roiData, setRoiData] = useState<InvestorROIDataPoint[]>([]);
  const [currentROI, setCurrentROI] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query params for impersonation and org filtering
        // When impersonating, don't apply org filter - show all impersonated user's data
        const params = new URLSearchParams();
        if (impersonatedUserId) {
          params.set("impersonate_user_id", impersonatedUserId);
        } else if (clerkOrgId) {
          // Only apply org filter when NOT impersonating
          params.set("clerk_org_id", clerkOrgId);
        }
        const queryString = params.toString();
        const queryParam = queryString ? `?${queryString}` : "";

        // Fetch all data in parallel
        const [contributionsRes, distributionsRes, dealsRes, cashFlowRes] =
          await Promise.all([
            fetch(`/api/investor-summary/contributions${queryParam}`),
            fetch(`/api/investor-summary/distributions${queryParam}`),
            fetch(`/api/investor-summary/deals${queryParam}`),
            fetch(`/api/investor-dashboard/cumulative-cash-flow${queryParam}`),
          ]);

        if (
          !contributionsRes.ok ||
          !distributionsRes.ok ||
          !dealsRes.ok ||
          !cashFlowRes.ok
        ) {
          throw new Error("Failed to fetch investor data");
        }

        const [contributionsData, distributionsData, dealsData, cashFlowData] =
          await Promise.all([
            contributionsRes.json(),
            distributionsRes.json(),
            dealsRes.json(),
            cashFlowRes.json(),
          ]);

        setContributions(contributionsData);
        setDistributions(distributionsData);
        setDeals(dealsData);
        setRoiData(cashFlowData.data || []);
        setCurrentROI(cashFlowData.current_roi || 0);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [impersonatedUserId, clerkOrgId]);

  // Calculate summary data
  const totalInvested = contributions.reduce(
    (sum: number, item: InvestorContribution) => {
      const amount =
        typeof item.contribution_amount === "string"
          ? Number(item.contribution_amount)
          : item.contribution_amount;
      return sum + (isNaN(amount) ? 0 : amount);
    },
    0
  );

  const totalDistributions = distributions.reduce(
    (sum: number, item: InvestorDistribution) => {
      const amount = item.transaction_amount || 0;
      return sum + (isNaN(amount) ? 0 : amount);
    },
    0
  );

  const activeDeals = deals.filter(
    (deal: InvestorDeal) => deal.status.toLowerCase() === "active"
  ).length;

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32 text-destructive">
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <InvestorDashboardSkeleton />;
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <PermissionErrorBoundary>
      <div className="container mx-auto py-6 space-y-6 animate-in fade-in-50">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Invested"
            value={formatCurrency(totalInvested)}
            trendDirection="up"
          />
          <StatCard
            label="Total Distributions"
            value={formatCurrency(totalDistributions)}
            trendDirection="up"
          />
          <StatCard
            label="Active Deals"
            value={activeDeals.toString()}
            trendDirection="up"
          />
          <StatCard
            label="ROI"
            value={
              totalInvested > 0
                ? `${((totalDistributions / totalInvested) * 100).toFixed(2)}%`
                : "0%"
            }
            trendPercent={
              totalInvested > 0 ? (totalDistributions / totalInvested) * 100 : 0
            }
            trendDirection={totalDistributions > 0 ? "up" : "neutral"}
          />
        </div>

        {/* Contributions vs Distributions Chart - Once UI Style */}
        <ChartAreaInvestorROI
          key="roi-chart"
          data={roiData}
          currentROI={currentROI}
          formatCurrency={formatCurrency}
        />

        <Tabs defaultValue="distributions" className="w-full">
          <TabsList>
            <TabsTrigger value="distributions">
              Recent Distributions
            </TabsTrigger>
            <TabsTrigger value="active-deals">Active Deals</TabsTrigger>
          </TabsList>

          <TabsContent value="distributions">
            <DistributionsListWrapper />
          </TabsContent>

          <TabsContent value="active-deals">
            <ActiveDealsListWrapper />
          </TabsContent>
        </Tabs>
      </div>
    </PermissionErrorBoundary>
  );
}
