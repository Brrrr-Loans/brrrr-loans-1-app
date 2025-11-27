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

    // Check for impersonation (admin-only feature)
    const url = new URL(request.url);
    const impersonatedUserIdParam = url.searchParams.get("impersonate_user_id");
    
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

    console.log(`📊 Fetching cumulative cash flow for user ${targetUserId}...`);

    // Get all transactions for this investor, ordered by date
    const { data: transactions, error } = await supabase
      .from("bsi_transactions")
      .select(
        `
        transaction_date,
        transaction_amount,
        ledger_entry_type,
        bsi_transactions_investors!inner(clerk_user_id)
      `
      )
      .eq("bsi_transactions_investors.clerk_user_id", targetUserId)
      .order("transaction_date", { ascending: true });

    if (error) {
      console.error("❌ Error fetching transactions:", error);
      throw error;
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({
        data: [],
        current_position: 0,
        total_invested: 0,
        total_returned: 0,
      });
    }

    // Calculate cumulative cash flow by month
    const monthlyData: Map<string, number> = new Map();
    let runningTotal = 0;

    transactions.forEach((tx) => {
      const amount = parseFloat(tx.transaction_amount || "0");
      runningTotal += amount;

      const date = new Date(tx.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
      
      // Keep the last cumulative value for each month
      monthlyData.set(monthKey, runningTotal);
    });

    // Convert to array format for chart
    const chartData = Array.from(monthlyData.entries())
      .map(([dateStr, cumulative]) => {
        const date = new Date(dateStr);
        return {
          date: dateStr,
          cumulative: cumulative,
          month: date.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate summary stats
    const totalInvested = transactions
      .filter((tx) => parseFloat(tx.transaction_amount || "0") < 0)
      .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.transaction_amount || "0")), 0);

    const totalReturned = transactions
      .filter((tx) => parseFloat(tx.transaction_amount || "0") > 0)
      .reduce((sum, tx) => sum + parseFloat(tx.transaction_amount || "0"), 0);

    console.log(
      `✅ Generated ${chartData.length} data points, current position: $${runningTotal.toFixed(2)}`
    );

    return NextResponse.json({
      data: chartData,
      current_position: runningTotal,
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

