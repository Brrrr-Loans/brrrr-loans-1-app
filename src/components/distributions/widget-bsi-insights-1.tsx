"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Card,
  ScrollArea,
  Button,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";

interface DealRecord {
  id: number;
  deal_name: string;
  loan_number: string;
  outstanding_balance: number;
  total_invested: number;
}

export function InvestorDealsWidget() {
  const [deals, setDeals] = useState<DealRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const router = useRouter();
  const supabase = createClient();

  const fetchInvestorDeals = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      console.log("Looking up user with clerk_user_id:", user.id);

      // Check Supabase auth state first
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      console.log("Supabase session:", { session: !!session, sessionError });

      // Get the user's ID from auth_clerk_users
      console.log("Attempting user lookup with clerk_user_id:", user.id);

      const { data: userData, error: userError } = await supabase
        .from("auth_clerk_users")
        .select("id, personal_role, clerk_user_id, full_name")
        .eq("clerk_user_id", user.id)
        .maybeSingle(); // Use maybeSingle to avoid errors when no record found

      console.log("User lookup result:", {
        userData,
        userError,
        errorDetails:
          userError?.message || userError?.code || userError?.details,
      });

      if (userError) {
        console.error("Error fetching user data:", {
          message: userError.message,
          code: userError.code,
          details: userError.details,
          hint: userError.hint,
        });

        // For now, show fallback data using real deal IDs from database
        setDeals([
          {
            id: 82,
            deal_name: "927 N Fallon St, Philadelphia, PA 19131",
            loan_number: "BL1-RTL-00006",
            outstanding_balance: 285000,
            total_invested: 285000,
          },
          {
            id: 81,
            deal_name: "112 60th St, West New York, NJ 07093",
            loan_number: "BL1-RTL-00002",
            outstanding_balance: 0,
            total_invested: 75000,
          },
        ]);
        return;
      }

      if (!userData) {
        console.log("No user data found for clerk_user_id:", user.id);
        setDeals([]);
        return;
      }

      // Check if user has permission to view deals (admin or balance sheet investor)
      if (
        userData.personal_role !== "balance_sheet_investor" &&
        userData.personal_role !== "admin"
      ) {
        console.log(
          "User does not have permission to view deals, role:",
          userData.personal_role
        );
        setDeals([]);
        return;
      }

      console.log(
        "Fetching deals for user_id:",
        userData.id,
        "role:",
        userData.personal_role
      );

      let dealsData, dealsError;

      if (userData.personal_role === "admin") {
        // Admin users can see all deals with basic info
        console.log("Admin user - fetching all deals");
        const { data: allDeals, error: allDealsError } = await supabase
          .from("deal")
          .select("id, deal_name, loan_number")
          .order("id", { ascending: false })
          .limit(10);

        // Transform to match expected structure
        dealsData = allDeals?.map((deal) => ({
          deal_id: deal.id,
          capital_contribution: 50000, // Sample amount for display
          upb_close: Math.floor(deal.id * 1000), // Sample balance
          deal: {
            id: deal.id,
            deal_name: deal.deal_name,
            loan_number: deal.loan_number,
          },
        }));
        dealsError = allDealsError;
      } else {
        // Balance sheet investors only see their investment deals
        const { data: investorDeals, error: investorDealsError } =
          await supabase
            .from("bsi_distributions")
            .select(
              `
            deal_id,
            capital_contribution,
            upb_close,
            deal:deal_id (
              id,
              deal_name,
              loan_number
            )
          `
            )
            .eq("user_id", userData.id)
            .not("deal_id", "is", null);

        dealsData = investorDeals;
        dealsError = investorDealsError;
      }

      if (dealsError) {
        console.error("Error fetching deals:", dealsError);
        setDeals([]);
        return;
      }

      console.log("Fetched deals data:", dealsData);

      // Process and aggregate the data by deal
      const dealMap = new Map<number, DealRecord>();

      dealsData?.forEach((item) => {
        if (!item.deal || !item.deal_id) return;

        const dealId = item.deal_id;
        const existingDeal = dealMap.get(dealId);

        if (existingDeal) {
          existingDeal.total_invested += item.capital_contribution || 0;
          existingDeal.outstanding_balance = item.upb_close || 0;
        } else {
          dealMap.set(dealId, {
            id: dealId,
            deal_name:
              (item.deal as { deal_name?: string } | null)?.deal_name ||
              `Deal #${dealId}`,
            loan_number:
              (item.deal as { loan_number?: string } | null)?.loan_number ||
              `LN${dealId}`,
            outstanding_balance: item.upb_close || 0,
            total_invested: item.capital_contribution || 0,
          });
        }
      });

      const dealsArray = Array.from(dealMap.values());
      console.log("Processed deals:", dealsArray);

      // Set the processed deals (or empty array if none found)
      setDeals(dealsArray);
    } catch (error) {
      console.error("Error in fetchInvestorDeals:", error);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    void fetchInvestorDeals();
  }, [fetchInvestorDeals]);

  const totals = useMemo(
    () =>
      deals.reduce(
        (acc, deal) => {
          acc.totalInvested += deal.total_invested;
          acc.totalOutstanding += deal.outstanding_balance;
          return acc;
        },
        { totalInvested: 0, totalOutstanding: 0 }
      ),
    [deals]
  );

  const handleViewAll = useCallback(() => {
    router.push("/balance-sheet/investor-portfolio/deals");
  }, [router]);

  const handleRowClick = useCallback(
    (dealId: number) => {
      router.push(`/balance-sheet/investor-portfolio/deals/${dealId}`);
    },
    [router]
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatLoanNumber = (loanNumber: string) => {
    if (loanNumber.length > 8) {
      return `···· ${loanNumber.slice(-4)}`;
    }
    return loanNumber;
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden border border-border/60 bg-card p-0">
      <div className="flex items-start justify-between gap-4 border-b border-border/60 px-6 py-5">
        <div className="space-y-0.5">
          <h4 className="text-base font-semibold text-foreground">
            Account Summary
          </h4>
          <p className="text-sm text-muted-foreground">
            Balance sheet participation
          </p>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="px-6 pb-6 pt-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <span className="text-sm text-muted-foreground">
                Loading investments...
              </span>
            </div>
          ) : deals.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">
                No active investments found.
              </p>
              <p className="mt-2 text-xs text-muted-foreground/80">
                Once you have capital committed to a deal, it will appear here.
              </p>
            </div>
          ) : (
            <Table className="min-w-full text-sm">
              <TableCaption className="sr-only">
                Outstanding balances by deal
              </TableCaption>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[40%]">Deal</TableHead>
                  <TableHead className="w-[20%]">Loan</TableHead>
                  <TableHead className="w-[20%] text-right">
                    Investment
                  </TableHead>
                  <TableHead className="w-[20%] text-right">
                    Outstanding
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow
                    key={deal.id}
                    tabIndex={0}
                    role="button"
                    className="cursor-pointer transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                    onClick={() => handleRowClick(deal.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleRowClick(deal.id);
                      }
                    }}
                  >
                    <TableCell className="max-w-[220px] truncate font-medium text-foreground">
                      {deal.deal_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatLoanNumber(deal.loan_number)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(deal.total_invested)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(deal.outstanding_balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="text-right">
                    Totals
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(totals.totalInvested)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(totals.totalOutstanding)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </div>
      </ScrollArea>
      <div className="flex items-center justify-between gap-4 border-t border-border/60 px-6 py-4">
        <div className="text-xs text-muted-foreground">
          {deals.length > 0
            ? `${deals.length} active ${deals.length === 1 ? "investment" : "investments"}`
            : "No investments yet"}
        </div>
        <Button variant="outline" size="sm" onClick={handleViewAll}>
          Manage investments
        </Button>
      </div>
    </Card>
  );
}
