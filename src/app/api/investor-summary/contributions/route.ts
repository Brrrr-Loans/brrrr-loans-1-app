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

    // Get the user's organization memberships
    const { data: orgMemberships } = await supabase
      .from("auth_clerk_orgs_members")
      .select("clerk_org_id")
      .eq("auth_clerk_users_id", targetUserId);

    const userOrgIds = (orgMemberships || [])
      .map((m) => m.clerk_org_id)
      .filter((id): id is number => id !== null);

    // Get contributions for this user - either directly linked OR via org membership
    // Query 1: Contributions linked directly to user
    const { data: userContributions, error: userError } = await supabase
      .from("bsi_transactions")
      .select(
        `
        id,
        transaction_amount,
        transaction_status,
        transaction_date,
        bsi_transactions_investors!inner(clerk_user_id, clerk_org_id)
      `
      )
      .eq("bsi_transactions_investors.clerk_user_id", targetUserId)
      .eq("ledger_entry_type", "contribution")
      .order("transaction_date", { ascending: false });

    if (userError) throw userError;

    // Query 2: Contributions linked via org membership
    let orgContributions: typeof userContributions = [];
    if (userOrgIds.length > 0) {
      const { data: orgData, error: orgError } = await supabase
        .from("bsi_transactions")
        .select(
          `
          id,
          transaction_amount,
          transaction_status,
          transaction_date,
          bsi_transactions_investors!inner(clerk_user_id, clerk_org_id)
        `
        )
        .in("bsi_transactions_investors.clerk_org_id", userOrgIds)
        .eq("ledger_entry_type", "contribution")
        .order("transaction_date", { ascending: false });

      if (orgError) throw orgError;
      orgContributions = orgData || [];
    }

    // Combine and deduplicate results
    const allContributions = [...(userContributions || []), ...orgContributions];
    const uniqueContributions = Array.from(
      new Map(allContributions.map((d) => [d.id, d])).values()
    );

    // Map to expected format
    const contributions = uniqueContributions.map((tx) => ({
      contribution_amount: Math.abs(parseFloat(tx.transaction_amount || "0")),
      contribution_status: tx.transaction_status || "pending",
      active: true,
    }));

    return NextResponse.json(contributions);
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return NextResponse.json([]);
  }
}

