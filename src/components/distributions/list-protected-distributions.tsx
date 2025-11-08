"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { withInvestorPermission } from "@/components/auth/with-investor-permission";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { Badge } from "@/components/ui";
import type { Database } from "@/types/supabase";

interface Distribution {
  id: string;
  total_payment_amount: string;
  distribution_date: string;
  status: string;
  distribution_type: string;
  deal: {
    name: string;
  } | null;
}

interface DistributionsListProps {
  dealId?: string; // Optional - if provided, shows distributions for specific deal
}

function UnprotectedDistributionsList({ dealId }: DistributionsListProps) {
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    async function fetchDistributions() {
      let query = supabase
        .from("bsi_distributions")
        .select(
          `
          *,
          deal:deal_id (
            name
          )
        `
        )
        .order("distribution_date", { ascending: false });

      if (dealId) {
        query = query.eq("deal_id", Number(dealId));
      }

      const { data, error } = await query;

      if (!error && data) {
        // Map Supabase data to Distribution interface
        const mapped = (data as any[]).map((dist: any) => ({
          id: dist.id,
          total_payment_amount: String(dist.total_payment_amount ?? 0),
          distribution_date: dist.distribution_date ?? "",
          status: dist.status ?? "",
          distribution_type: dist.distribution_type ?? "",
          deal:
            dist.deal && typeof dist.deal === "object"
              ? { name: dist.deal.name ?? "" }
              : null,
        }));
        setDistributions(mapped);
      }
      setLoading(false);
    }

    fetchDistributions();
  }, [dealId, supabase]);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  if (loading) {
    return <div>Loading distributions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distributions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deal</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {distributions.map((dist) => (
              <TableRow key={dist.id}>
                <TableCell>{dist.deal?.name || "Unknown Deal"}</TableCell>
                <TableCell>{dist.distribution_type}</TableCell>
                <TableCell>
                  {formatCurrency(dist.total_payment_amount)}
                </TableCell>
                <TableCell>
                  {new Date(dist.distribution_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      dist.status === "Processing"
                        ? "secondary"
                        : dist.status === "Scheduled"
                          ? "outline"
                          : "default"
                    }
                  >
                    {dist.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {distributions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No distributions available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
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
