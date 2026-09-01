"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { StatCard } from "@/components/once-ui";
import { useSupabase } from "@/hooks/use-supabase";
import { useCurrentOrganization } from "@/contexts/organization-context";
import { useImpersonation } from "@/contexts/impersonation-context";
import { fetchPortalDeals, type PortalDeal } from "@/lib/deals-api";

interface DashboardMetrics {
  totalDeals: number;
  activeDeals: number;
  totalVolume: number;
  previousMonthDeals?: number;
  previousMonthActiveDeals?: number;
}

function metricsFromDeals(
  deals: Array<{
    deal_stage_2?: string | null;
    deal_disposition_1?: string | null;
    loan_amount_total?: number | null;
  }>
): DashboardMetrics {
  const totalDeals = deals.length;
  const activeDeals = deals.filter(
    (deal) =>
      deal.deal_stage_2 === "closed_and_funded" ||
      deal.deal_stage_2 === "clear_to_close"
  ).length;
  const totalVolume = deals.reduce(
    (sum, deal) => sum + (Number(deal.loan_amount_total) || 0),
    0
  );

  return { totalDeals, activeDeals, totalVolume };
}

export function SectionCards() {
  const supabase = useSupabase();
  const { isLoaded: authLoaded } = useAuth();
  const { clerkOrgId, isLoaded: orgLoaded } = useCurrentOrganization();
  const { impersonatedUserId } = useImpersonation();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalDeals: 0,
    activeDeals: 0,
    totalVolume: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!authLoaded || !orgLoaded) return;

      const loadFromApi = async () => {
        const apiDeals: PortalDeal[] = await fetchPortalDeals({
          clerkOrgId,
          impersonatedUserId,
        });
        setMetrics(metricsFromDeals(apiDeals));
      };

      try {
        if (!supabase || impersonatedUserId) {
          await loadFromApi();
          return;
        }

        const { data: deals, error } = await supabase
          .from("deal")
          .select("id, deal_stage_2, deal_disposition_1, loan_amount_total");

        if (error || (deals?.length ?? 0) === 0) {
          try {
            await loadFromApi();
            return;
          } catch {
            console.error("Error fetching deals metrics:", {
              message: error?.message,
              details: error?.details,
              hint: error?.hint,
              code: error?.code,
            });
            setMetrics(metricsFromDeals([]));
            return;
          }
        }

        setMetrics(metricsFromDeals(deals || []));
      } catch (error) {
        try {
          await loadFromApi();
        } catch (apiError) {
          console.error("Error calculating metrics:", error, apiError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [authLoaded, orgLoaded, supabase, clerkOrgId, impersonatedUserId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="relative flex flex-col rounded-2xl border border-[rgb(var(--chart-grid)_/_0.15)] bg-transparent p-5 pb-20 min-w-48 animate-pulse"
          >
            <div className="flex flex-col gap-3">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-8 w-20 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Deals"
        value={metrics.totalDeals.toString()}
        trendDirection="up"
      />
      <StatCard
        label="Active Deals"
        value={metrics.activeDeals.toString()}
        trendDirection="up"
      />
      <StatCard
        label="Total Volume"
        value={formatCurrency(metrics.totalVolume)}
        trendDirection="up"
      />
      <StatCard
        label="Avg Deal Size"
        value={
          metrics.totalDeals > 0
            ? formatCurrency(metrics.totalVolume / metrics.totalDeals)
            : "$0"
        }
        trendDirection="up"
      />
    </div>
  );
}
