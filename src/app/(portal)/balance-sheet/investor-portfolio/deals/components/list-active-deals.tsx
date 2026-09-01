"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentOrganization } from "@/contexts/organization-context";
import { useImpersonation } from "@/contexts/impersonation-context";
import {
  fetchPortalDeals,
  propertyAddressFromDeal,
  type PortalDeal,
} from "@/lib/deals-api";
import { dealRecordPath } from "@/config/deal-routes";
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
import { Eye, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";

const getStatusBadgeVariant = (
  status: string | null
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status?.toLowerCase()) {
    case "active":
      return "default";
    case "on_hold":
    case "pending":
      return "secondary";
    case "dead":
    case "closed":
      return "destructive";
    default:
      return "secondary";
  }
};

interface ActiveDealsListProps {
  className?: string;
}

export function ActiveDealsList({ className }: ActiveDealsListProps) {
  const router = useRouter();
  const { impersonatedUserId } = useImpersonation();
  const { clerkOrgId, isLoaded: orgLoaded } = useCurrentOrganization();
  const [deals, setDeals] = useState<PortalDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgLoaded) return;

    const fetchActiveDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        const rows = await fetchPortalDeals({
          clerkOrgId,
          impersonatedUserId,
        });
        setDeals(
          rows.filter(
            (deal) =>
              !deal.deal_disposition_1 || deal.deal_disposition_1 === "active"
          )
        );
      } catch (err) {
        console.error("Error fetching active deals:", err);
        setError(err instanceof Error ? err.message : "Failed to load deals");
      } finally {
        setLoading(false);
      }
    };

    void fetchActiveDeals();
  }, [orgLoaded, impersonatedUserId, clerkOrgId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading deals...</p>
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
          <CardTitle>Deals</CardTitle>
          <CardDescription>Your investment opportunities</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No deals found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Deals</CardTitle>
        <CardDescription>
          {deals.length} investment {deals.length === 1 ? "deal" : "deals"}
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
                <TableHead>Closing Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{deal.deal_name || "-"}</div>
                      <div className="text-sm text-muted-foreground">
                        {deal.loan_number || "-"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {propertyAddressFromDeal(deal)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {deal.loan_amount_total
                      ? formatCurrency(deal.loan_amount_total)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {deal.funding_date ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(deal.funding_date), "MMM d, yyyy")}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(deal.deal_disposition_1)}
                    >
                      {deal.deal_disposition_1 || deal.deal_stage_2 || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => router.push(dealRecordPath(deal.id))}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View deal</span>
                    </Button>
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

export function ActiveDealsListWrapper() {
  return <ActiveDealsList />;
}
