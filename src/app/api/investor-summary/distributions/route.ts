import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const supabase = createServiceRoleClient();
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for impersonation
    const url = new URL(request.url);
    const impersonatedUserIdParam = url.searchParams.get("impersonate_user_id");
    
    let targetUserId: number;

    if (impersonatedUserIdParam) {
      targetUserId = parseInt(impersonatedUserIdParam);
    } else {
      const { data: currentUser } = await supabase
        .from("auth_clerk_users")
        .select("id")
        .eq("clerk_user_id", clerkUserId)
        .single();

      if (!currentUser) {
        return NextResponse.json([]);
      }

      targetUserId = currentUser.id;
    }

    // Get the investor's name for display
    const { data: investorData } = await supabase
      .from("auth_clerk_users")
      .select("full_name")
      .eq("id", targetUserId)
      .single();

    const investorName = investorData?.full_name || "Unknown";

    // Get the user's organization memberships
    const { data: orgMemberships } = await supabase
      .from("auth_clerk_orgs_members")
      .select("clerk_org_id")
      .eq("auth_clerk_users_id", targetUserId);

    const userOrgIds = (orgMemberships || [])
      .map((m) => m.clerk_org_id)
      .filter((id): id is number => id !== null);

    // Get distributions for this user - either directly linked OR via org membership
    // We need two queries since Supabase doesn't support OR on junction table filters easily
    
    // Query 1: Distributions linked directly to user
    const { data: userDistributions, error: userError } = await supabase
      .from("bsi_transactions")
      .select(
        `
        id,
        transaction_amount,
        transaction_status,
        transaction_date,
        transaction_method,
        ledger_entry_type,
        bsi_transactions_investors!inner(clerk_user_id, clerk_org_id)
      `
      )
      .eq("bsi_transactions_investors.clerk_user_id", targetUserId)
      .eq("ledger_entry_type", "distribution")
      .order("transaction_date", { ascending: false });

    if (userError) throw userError;

    // Query 2: Distributions linked via org membership (if user belongs to any orgs)
    let orgDistributions: typeof userDistributions = [];
    if (userOrgIds.length > 0) {
      const { data: orgData, error: orgError } = await supabase
        .from("bsi_transactions")
        .select(
          `
          id,
          transaction_amount,
          transaction_status,
          transaction_date,
          transaction_method,
          ledger_entry_type,
          bsi_transactions_investors!inner(clerk_user_id, clerk_org_id)
        `
        )
        .in("bsi_transactions_investors.clerk_org_id", userOrgIds)
        .eq("ledger_entry_type", "distribution")
        .order("transaction_date", { ascending: false });

      if (orgError) throw orgError;
      orgDistributions = orgData || [];
    }

    // Combine and deduplicate results
    const allDistributions = [...(userDistributions || []), ...orgDistributions];
    const uniqueDistributions = Array.from(
      new Map(allDistributions.map((d) => [d.id, d])).values()
    );

    // Sort by date descending
    uniqueDistributions.sort((a, b) => {
      const dateA = a.transaction_date ? new Date(a.transaction_date).getTime() : 0;
      const dateB = b.transaction_date ? new Date(b.transaction_date).getTime() : 0;
      return dateB - dateA;
    });

    // Map to expected format with all columns matching the Transactions page
    const distributions = uniqueDistributions.map((tx) => ({
      id: tx.id,
      transaction_date: tx.transaction_date,
      from: "Brrrr Loans 1 LLC", // Distributions always come FROM Brrrr
      to: investorName, // Distributions always go TO the investor
      transaction_method: tx.transaction_method || "wire",
      transaction_status: tx.transaction_status || "pending",
      ledger_entry_type: tx.ledger_entry_type || "distribution",
      transaction_amount: Math.abs(parseFloat(tx.transaction_amount || "0")),
    }));

    return NextResponse.json(distributions);
  } catch (error) {
    console.error("Error fetching distributions:", error);
    return NextResponse.json([]);
  }
}

