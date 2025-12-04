"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { Banknote } from "lucide-react";
import { format } from "date-fns";
import { useImpersonation } from "@/contexts/impersonation-context";

interface Distribution {
  id: number;
  transaction_date: string;
  from: string;
  to: string;
  transaction_method: string;
  transaction_status: string;
  ledger_entry_type: string;
  transaction_amount: number;
}

interface DistributionsDataTableProps {
  className?: string;
}

// Status badge variant helper (matching transactions table)
const getStatusBadgeVariant = (status: string | null) => {
  switch (status) {
    case "completed":
    case "processed":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "danger";
    case "processing":
      return "info";
    default:
      return "secondary";
  }
};

export function DistributionsDataTable({
  className,
}: DistributionsDataTableProps) {
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { impersonatedUserId } = useImpersonation();

  useEffect(() => {
    const fetchDistributions = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (impersonatedUserId) {
          params.set("impersonate_user_id", impersonatedUserId);
        }

        const queryString = params.toString();
        const url = `/api/investor-summary/distributions${queryString ? `?${queryString}` : ""}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch distributions");
        }

        const data = await response.json();
        setDistributions(data || []);
      } catch (err) {
        console.error("Error fetching distributions:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load distributions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDistributions();
  }, [impersonatedUserId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">
              Loading distributions...
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

  if (distributions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Distributions</CardTitle>
          <CardDescription>Your recent distribution payments</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-muted-foreground">
            <Banknote className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No distributions found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Distributions</CardTitle>
        <CardDescription>
          {distributions.length} distribution{" "}
          {distributions.length === 1 ? "payment" : "payments"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Transaction Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ledger Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distributions.map((dist) => (
                <TableRow key={dist.id}>
                  {/* Date */}
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {dist.transaction_date
                        ? format(new Date(dist.transaction_date), "MMM d, yyyy")
                        : "-"}
                    </span>
                  </TableCell>

                  {/* From */}
                  <TableCell>
                    <span className="text-sm font-medium truncate max-w-[150px] block">
                      {dist.from}
                    </span>
                  </TableCell>

                  {/* To */}
                  <TableCell>
                    <span className="text-sm font-medium truncate max-w-[150px] block">
                      {dist.to}
                    </span>
                  </TableCell>

                  {/* Transaction Type */}
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {dist.transaction_method?.toUpperCase() || "N/A"}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(dist.transaction_status)}>
                      {dist.transaction_status}
                    </Badge>
                  </TableCell>

                  {/* Ledger Type */}
                  <TableCell>
                    <Badge variant="outline" className="text-sm">
                      {dist.ledger_entry_type === "distribution"
                        ? "Distribution"
                        : dist.ledger_entry_type}
                    </Badge>
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(dist.transaction_amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
