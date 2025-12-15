"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-clerk-auth";
import { useImpersonation } from "@/contexts/impersonation-context";
import { useCurrentOrganization } from "@/contexts/organization-context";
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

// Status badge variant helper (matching distributions table)
const getStatusBadgeVariant = (status: string | null) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "success";
    case "on_hold":
    case "pending":
      return "warning";
    case "dead":
    case "closed":
      return "danger";
    default:
      return "secondary";
  }
};

interface ActiveDeal {
  id: number;
  deal_name: string;
  loan_number: string;
  loan_amount_total: number;
  note_rate: number;
  loan_term: string;
  note_date: string;
  deal_disposition_1: string;
  property?: {
    address_street: string;
    address_city: string;
    address_state: string;
  };
}

interface ActiveDealsListProps {
  className?: string;
}

export function ActiveDealsList({ className }: ActiveDealsListProps) {
  const supabase = useSupabase();
  const { userId } = useAuth();
  const { impersonatedUserId, isImpersonating } = useImpersonation();
  const { clerkOrgId } = useCurrentOrganization();
  const [deals, setDeals] = useState<ActiveDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveDeals = async () => {
      if (!supabase || !userId) return;

      try {
        setLoading(true);
        setError(null);

        // Determine target user ID (impersonated user or current user)
        const targetUserId = isImpersonating && impersonatedUserId 
          ? parseInt(impersonatedUserId) 
          : null;

        // Fetch all active deals first
        const { data: allDeals, error: dealsError } = await (supabase as any)
          .from("deal")
          .select(
            `
            id,
            deal_name,
            loan_number,
            loan_amount_total,
            note_rate,
            loan_term,
            note_date,
            deal_disposition_1,
            property:property_id(
              address_street,
              address_city,
              address_state
            )
          `
          )
          .eq("deal_disposition_1", "active")
          .order("note_date", { ascending: false });

        if (dealsError) throw dealsError;

        if (targetUserId) {
          // Impersonating - show ALL deals for impersonated user (direct + org)
          // Get user's org memberships where they have INVESTMENT interest (not just viewer/employee)
          const { data: orgMemberships } = await supabase
            .from("auth_clerk_orgs_members")
            .select("clerk_org_id, clerk_org_role")
            .eq("auth_clerk_users_id", targetUserId)
            .neq("clerk_org_role", "viewer"); // Exclude viewer role (employees with no investment interest)

          const userOrgIds = (orgMemberships || [])
            .map((m) => m.clerk_org_id)
            .filter((id): id is number => id !== null);

          // Get user's direct deals
          const { data: userDeals } = await supabase
            .from("bsi_deals_clerk_users")
            .select("deal_id")
            .eq("clerk_user_id", targetUserId);

          const userDealIds = new Set((userDeals || []).map((d) => d.deal_id));

          // Get org deals
          let orgDealIds = new Set<number>();
          if (userOrgIds.length > 0) {
            const { data: orgDeals } = await supabase
              .from("bsi_deals_clerk_orgs")
              .select("deal_id")
              .in("clerk_org_id", userOrgIds);

            orgDealIds = new Set((orgDeals || []).map((d) => d.deal_id));
          }

          // Filter to all deals the user has access to
          const filteredDeals = (allDeals || []).filter(
            (deal: ActiveDeal) => userDealIds.has(deal.id) || orgDealIds.has(deal.id)
          );
          setDeals(filteredDeals);
        } else if (clerkOrgId) {
          // Not impersonating, has org selected - only show deals for that org
          const { data: dbOrg } = await supabase
            .from("auth_clerk_orgs")
            .select("id")
            .eq("clerk_org_id", clerkOrgId)
            .single();

          if (dbOrg) {
            const { data: orgDeals } = await supabase
              .from("bsi_deals_clerk_orgs")
              .select("deal_id")
              .eq("clerk_org_id", dbOrg.id);

            const orgDealIds = new Set((orgDeals || []).map((d) => d.deal_id));
            const filteredDeals = (allDeals || []).filter(
              (deal: ActiveDeal) => orgDealIds.has(deal.id)
            );
            setDeals(filteredDeals);
          } else {
            setDeals([]);
          }
        } else {
          // No org, not impersonating - admin view, show all
          setDeals((allDeals as any) || []);
        }
      } catch (err) {
        console.error("Error fetching active deals:", err);
        setError(err instanceof Error ? err.message : "Failed to load deals");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveDeals();
  }, [supabase, userId, isImpersonating, impersonatedUserId, clerkOrgId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper to format property address
  const formatPropertyAddress = (deal: ActiveDeal) => {
    if (!deal.property) return "-";
    const { address_street, address_city, address_state } = deal.property;
    const parts = [address_street, address_city, address_state].filter(Boolean);
    return parts.join(", ") || "-";
  };

  // Helper to format loan term
  const formatLoanTerm = (term: string) => {
    const months = parseInt(term, 10);
    if (isNaN(months)) return term;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths}m`;
    if (remainingMonths === 0) return `${years}y`;
    return `${years}y ${remainingMonths}m`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">
              Loading deals...
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
          <CardTitle>Deals</CardTitle>
          <CardDescription>
            Your investment opportunities
          </CardDescription>
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
                <TableHead>Rate/Term</TableHead>
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
                    {formatPropertyAddress(deal)}
                    </TableCell>
                    <TableCell className="font-medium">
                    {deal.loan_amount_total
                      ? formatCurrency(deal.loan_amount_total)
                      : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                      <div>{deal.note_rate ? `${deal.note_rate}%` : "-"}</div>
                        <div className="text-muted-foreground">
                        {deal.loan_term ? formatLoanTerm(deal.loan_term) : "-"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                    {deal.note_date ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(deal.note_date), "MMM d, yyyy")}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                    </TableCell>
                    <TableCell>
                    <Badge variant={getStatusBadgeVariant(deal.deal_disposition_1)}>
                      {deal.deal_disposition_1 || "Unknown"}
                    </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
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
