import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

/**
 * Get cumulative cash flow data for investor dashboard
 * GET /api/investor-dashboard/cumulative-cash-flow
 */
export async function GET(request: Request) {
  try {
    const supabase = createServiceRoleClient();
    
    // Get current user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const impersonatedUserIdParam = url.searchParams.get("impersonate_user_id");
    const clerkOrgIdParam = url.searchParams.get("clerk_org_id");
    
    let targetUserId: number;

    if (impersonatedUserIdParam) {
      // Admin is impersonating - verify they're admin first
      const { data: adminUser } = await supabase
        .from("auth_clerk_users")
        .select("id, role")
        .eq("clerk_user_id", clerkUserId)
        .single();

      if (!adminUser || adminUser.role !== "admin") {
        return NextResponse.json({ error: "Forbidden - admin only" }, { status: 403 });
      }

      targetUserId = parseInt(impersonatedUserIdParam);
    } else {
      // Normal flow - use current user
      const { data: currentUser } = await supabase
        .from("auth_clerk_users")
        .select("id")
        .eq("clerk_user_id", clerkUserId)
        .single();

      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      targetUserId = currentUser.id;
    }

    console.log(`📊 Fetching cumulative cash flow for user ${targetUserId}, org: ${clerkOrgIdParam || 'none'}, impersonating: ${!!impersonatedUserIdParam}...`);

    let transactions: Array<{
      id: number;
      transaction_date: string;
      transaction_amount: string;
      ledger_entry_type: string;
    }> = [];

    if (clerkOrgIdParam) {
      // User has an org selected - only show data for that org
      const { data: dbOrg } = await supabase
        .from("auth_clerk_orgs")
        .select("id")
        .eq("clerk_org_id", clerkOrgIdParam)
        .single();

      if (dbOrg) {
        const { data, error } = await supabase
          .from("bsi_transactions")
          .select(
            `
            id,
            transaction_date,
            transaction_amount,
            ledger_entry_type,
            bsi_transactions_investors!inner(clerk_user_id, clerk_org_id)
          `
          )
          .eq("bsi_transactions_investors.clerk_org_id", dbOrg.id)
          .order("transaction_date", { ascending: true });

        if (error) {
          console.error("❌ Error fetching org transactions:", error);
          throw error;
        }
        transactions = data || [];
      }
    } else if (impersonatedUserIdParam) {
      // Impersonating without org filter - show ALL data for impersonated user
      // Get user's org memberships where they have INVESTMENT interest (not just viewer/employee)
      const { data: orgMemberships } = await supabase
        .from("auth_clerk_orgs_members")
        .select("clerk_org_id, clerk_org_role")
        .eq("auth_clerk_users_id", targetUserId)
        .neq("clerk_org_role", "viewer"); // Exclude viewer role (employees with no investment interest)

      const userOrgIds = (orgMemberships || [])
        .map((m) => m.clerk_org_id)
        .filter((id): id is number => id !== null);

      // Get direct user transactions
      const { data: userTransactions, error: userError } = await supabase
      .from("bsi_transactions")
      .select(
        `
          id,
        transaction_date,
        transaction_amount,
        ledger_entry_type,
          bsi_transactions_investors!inner(clerk_user_id, clerk_org_id)
      `
      )
      .eq("bsi_transactions_investors.clerk_user_id", targetUserId)
      .order("transaction_date", { ascending: true });

      if (userError) {
        console.error("❌ Error fetching user transactions:", userError);
        throw userError;
      }

      // Get org transactions
      let orgTransactions: typeof userTransactions = [];
      if (userOrgIds.length > 0) {
        const { data: orgData, error: orgError } = await supabase
          .from("bsi_transactions")
          .select(
            `
            id,
            transaction_date,
            transaction_amount,
            ledger_entry_type,
            bsi_transactions_investors!inner(clerk_user_id, clerk_org_id)
          `
          )
          .in("bsi_transactions_investors.clerk_org_id", userOrgIds)
          .order("transaction_date", { ascending: true });

        if (orgError) {
          console.error("❌ Error fetching org transactions:", orgError);
          throw orgError;
        }
        orgTransactions = orgData || [];
      }

      // Combine and deduplicate
      const allTransactions = [...(userTransactions || []), ...orgTransactions];
      transactions = Array.from(
        new Map(allTransactions.map((t) => [t.id, t])).values()
      ).sort((a, b) => {
        const dateA = a.transaction_date ? new Date(a.transaction_date).getTime() : 0;
        const dateB = b.transaction_date ? new Date(b.transaction_date).getTime() : 0;
        return dateA - dateB;
      });
    } else {
      // No org selected, no impersonation - only show user's direct transactions
      const { data, error } = await supabase
        .from("bsi_transactions")
        .select(
          `
          id,
          transaction_date,
          transaction_amount,
          ledger_entry_type,
          bsi_transactions_investors!inner(clerk_user_id, clerk_org_id)
        `
        )
        .eq("bsi_transactions_investors.clerk_user_id", targetUserId)
        .is("bsi_transactions_investors.clerk_org_id", null)
        .order("transaction_date", { ascending: true });

    if (error) {
        console.error("❌ Error fetching user transactions:", error);
      throw error;
      }
      transactions = data || [];
    }

    if (transactions.length === 0) {
      return NextResponse.json({
        data: [],
        current_position: 0,
        total_invested: 0,
        total_returned: 0,
      });
    }

    // Calculate ROI month over month
    const monthlyData: Map<
      string,
      { contributions: number; distributions: number }
    > = new Map();

    // Group transactions by month
    transactions.forEach((tx) => {
      const amount = parseFloat(tx.transaction_amount || "0");
      const date = new Date(tx.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;

      const existing = monthlyData.get(monthKey) || {
        contributions: 0,
        distributions: 0,
      };

      if (amount < 0) {
        // Contribution (investment)
        existing.contributions += Math.abs(amount);
      } else {
        // Distribution (return)
        existing.distributions += amount;
      }

      monthlyData.set(monthKey, existing);
    });

    // Calculate cumulative contributions and ROI for each month
    let cumulativeContributions = 0;
    const chartData = Array.from(monthlyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dateStr, { contributions, distributions }]) => {
        cumulativeContributions += contributions;

        // ROI = (Total Distributions to Date / Total Contributions to Date) * 100
        const roi =
          cumulativeContributions > 0
            ? (distributions / cumulativeContributions) * 100
            : 0;

        const date = new Date(dateStr);
        return {
          date: dateStr,
          roi: roi,
          contributions: cumulativeContributions,
          distributions: distributions,
          month: date.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
        };
      });

    // Calculate overall ROI
    const totalInvested = transactions
      .filter((tx) => parseFloat(tx.transaction_amount || "0") < 0)
      .reduce(
        (sum, tx) => sum + Math.abs(parseFloat(tx.transaction_amount || "0")),
        0
      );

    const totalReturned = transactions
      .filter((tx) => parseFloat(tx.transaction_amount || "0") > 0)
      .reduce((sum, tx) => sum + parseFloat(tx.transaction_amount || "0"), 0);

    const currentROI =
      totalInvested > 0 ? (totalReturned / totalInvested) * 100 : 0;

    console.log(
      `✅ Generated ${chartData.length} data points, current ROI: ${currentROI.toFixed(2)}%`
    );

    return NextResponse.json({
      data: chartData,
      current_roi: currentROI,
      total_invested: totalInvested,
      total_returned: totalReturned,
    });
  } catch (error) {
    console.error("❌ Error generating cumulative cash flow:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

