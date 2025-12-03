"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { DollarSign, Building, TrendingUp, FileText } from "lucide-react";
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
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
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
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalDeals}</div>
          <p className="text-xs text-muted-foreground">
            All deals in the system
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeDeals}</div>
          <p className="text-xs text-muted-foreground">
            Currently active or funded
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics.totalVolume)}
          </div>
          <p className="text-xs text-muted-foreground">
            Combined loan amount
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.totalDeals > 0
              ? formatCurrency(metrics.totalVolume / metrics.totalDeals)
              : "$0"}
          </div>
          <p className="text-xs text-muted-foreground">
            Per deal average
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
