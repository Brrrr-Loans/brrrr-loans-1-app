"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-clerk-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { Eye, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface ActiveDeal {
  id: number;
  deal_name: string;
  loan_number: string;
  property_address: string;
  loan_amount: number;
  interest_rate: number;
  loan_term_months: number;
  closing_date: string;
  status: string;
  investor_contributions?: Array<{
    contribution_amount: number;
    contribution_status: string;
  }>;
}

interface ActiveDealsListProps {
  className?: string;
}

export function ActiveDealsList({ className }: ActiveDealsListProps) {
  const supabase = useSupabase();
  const { userId } = useAuth();
  const [deals, setDeals] = useState<ActiveDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveDeals = async () => {
      if (!supabase || !userId) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await (supabase as any)
          .from("bs_debt_instruments_deal")
          .select(
            `
            id,
            deal_name,
            loan_number,
            property_address,
            loan_amount,
            interest_rate,
            loan_term_months,
            closing_date,
            status,
            investor_contributions:bsi_investor_contributions(
              contribution_amount,
              contribution_status
            )
          `
          )
          .eq("status", "active")
          .order("closing_date", { ascending: false });

        if (error) throw error;

        setDeals((data as any) || []);
      } catch (err) {
        console.error("Error fetching active deals:", err);
        setError(err instanceof Error ? err.message : "Failed to load deals");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveDeals();
  }, [supabase, userId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalInvestment = (deal: ActiveDeal) => {
    return (
      deal.investor_contributions?.reduce(
        (sum, contribution) =>
          sum + Number(contribution.contribution_amount || 0),
        0
      ) || 0
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">
              Loading active deals...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-32 text-destructive">
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (deals.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Active Deals</CardTitle>
          <CardDescription>
            Your current investment opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active deals found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Active Deals</CardTitle>
        <CardDescription>
          {deals.length} active investment{" "}
          {deals.length === 1 ? "opportunity" : "opportunities"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal Name</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Loan Amount</TableHead>
                <TableHead>Your Investment</TableHead>
                <TableHead>Rate/Term</TableHead>
                <TableHead>Closing Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => {
                const totalInvestment = getTotalInvestment(deal);
                return (
                  <TableRow key={deal.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{deal.deal_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {deal.loan_number}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {deal.property_address}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(deal.loan_amount)}
                    </TableCell>
                    <TableCell>
                      {totalInvestment > 0 ? (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          {formatCurrency(totalInvestment)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{deal.interest_rate}%</div>
                        <div className="text-muted-foreground">
                          {Math.floor(deal.loan_term_months / 12)}y{" "}
                          {deal.loan_term_months % 12}m
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(deal.closing_date), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{deal.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActiveDealsListWrapper() {
  return <ActiveDealsList />;
}
