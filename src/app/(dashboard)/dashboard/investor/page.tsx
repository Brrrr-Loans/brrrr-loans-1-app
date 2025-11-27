"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { useImpersonation } from "@/contexts/impersonation-context";
import { InvestorDashboardSkeleton } from "@/components/skeletons/investor-dashboard-skeleton";
import { PermissionErrorBoundary } from "@/components/error-boundary/permission-error-boundary";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { DistributionsListWrapper } from "@/components/distributions/list-protected-distributions";
import { ActiveDealsListWrapper } from "@/components/deals/list-active-deals";

interface MonthlyDistribution {
  month: string;
  amount: number;
}

interface InvestorContribution {
  contribution_amount: string | number;
  contribution_status: string;
  active: boolean;
}

interface InvestorDistribution {
  total_payment_amount: string | number;
  payment_date: string;
  status: string;
}

interface InvestorDeal {
  status: string;
}

interface ROIData {
  date: string;
  roi: number;
  month: string;
  contributions: number;
  distributions: number;
}

export default function InvestorDashboard() {
  const { impersonatedUserId } = useImpersonation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contributions, setContributions] = useState<InvestorContribution[]>(
    []
  );
  const [distributions, setDistributions] = useState<InvestorDistribution[]>(
    []
  );
  const [deals, setDeals] = useState<InvestorDeal[]>([]);
  const [roiData, setRoiData] = useState<ROIData[]>([]);
  const [currentROI, setCurrentROI] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query param for impersonation
        const impersonateParam = impersonatedUserId ? `?impersonate_user_id=${impersonatedUserId}` : '';
        
        // Fetch all data in parallel
        const [contributionsRes, distributionsRes, dealsRes, cashFlowRes] =
          await Promise.all([
            fetch(`/api/investor-summary/contributions${impersonateParam}`),
            fetch(`/api/investor-summary/distributions${impersonateParam}`),
            fetch(`/api/investor-summary/deals${impersonateParam}`),
            fetch(`/api/investor-dashboard/cumulative-cash-flow${impersonateParam}`),
          ]);

        if (!contributionsRes.ok || !distributionsRes.ok || !dealsRes.ok || !cashFlowRes.ok) {
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
  }, [impersonatedUserId]);

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
      const amount =
        typeof item.total_payment_amount === "string"
          ? Number(item.total_payment_amount)
          : item.total_payment_amount;
      return sum + (isNaN(amount) ? 0 : amount);
    },
    0
  );

  const activeDeals = deals.filter(
    (deal: InvestorDeal) => deal.status.toLowerCase() === "active"
  ).length;

  // Process monthly distribution data
  const monthlyData = distributions.reduce(
    (acc: MonthlyDistribution[], dist: InvestorDistribution) => {
      const amount =
        typeof dist.total_payment_amount === "string"
          ? Number(dist.total_payment_amount)
          : dist.total_payment_amount;

      if (isNaN(amount)) return acc;

      const month = new Date(dist.payment_date).toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });

      const existingMonth = acc.find((m) => m.month === month);
      if (existingMonth) {
        existingMonth.amount += amount;
      } else {
        acc.push({ month, amount });
      }
      return acc;
    },
    []
  );

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
          <Card>
            <CardHeader>
              <CardTitle>Total Invested</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(totalInvested)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Distributions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(totalDistributions)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{activeDeals}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {totalInvested > 0
                  ? `${((totalDistributions / totalInvested) * 100).toFixed(
                      2
                    )}%`
                  : "0%"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Return on Investment Over Time</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Monthly ROI percentage trend
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Current ROI</p>
                <p className="text-2xl font-bold">
                  {currentROI.toFixed(2)}%
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                roi: {
                  label: "ROI %",
                  color: "#ff9500",
                },
              }}
              className="h-[350px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={roiData}>
                    <defs>
                      <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff9500" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#f72121" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${value.toFixed(1)}%`}
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      labelFormatter={(label) => `Month: ${label}`}
                      formatter={(value: number) => [`${value.toFixed(2)}%`, "ROI"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="roi"
                      stroke="#ff9500"
                      strokeWidth={2}
                      fill="url(#orangeGradient)"
                      fillOpacity={1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
          </CardContent>
        </Card>

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
