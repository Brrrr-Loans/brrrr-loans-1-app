"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/once-ui";
import { useSupabase } from "@/hooks/use-supabase";

interface DashboardMetrics {
  totalDeals: number;
  activeDeals: number;
  totalVolume: number;
  previousMonthDeals?: number;
  previousMonthActiveDeals?: number;
}

export function SectionCards() {
  const supabase = useSupabase();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalDeals: 0,
    activeDeals: 0,
    totalVolume: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!supabase) return;

      try {
        // Fetch all deals
        const { data: deals, error } = await supabase
          .from("deal")
          .select("id, deal_stage_2, loan_amount_total");

        if (error) {
          console.error("Error fetching deals metrics:", error);
          return;
        }

        const totalDeals = deals?.length || 0;
        const activeDeals =
          deals?.filter(
            (deal) =>
              deal.deal_stage_2 === "active" ||
              deal.deal_stage_2 === "closed_and_funded" ||
              deal.deal_stage_2 === "clear_to_close"
          ).length || 0;

        const totalVolume = deals?.reduce(
          (sum, deal) => sum + (deal.loan_amount_total || 0),
          0
        ) || 0;

        setMetrics({
          totalDeals,
          activeDeals,
          totalVolume,
        });
      } catch (error) {
        console.error("Error calculating metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [supabase]);

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
