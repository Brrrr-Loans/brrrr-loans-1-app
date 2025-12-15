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

    const url = new URL(request.url);
    const impersonatedUserIdParam = url.searchParams.get("impersonate_user_id");
    const clerkOrgIdParam = url.searchParams.get("clerk_org_id");
    
    // Get target user ID (for impersonation or current user)
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

    let contributions: Array<{
      contribution_amount: number;
      contribution_status: string;
      active: boolean;
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
            transaction_amount,
            transaction_status,
            transaction_date,
            bsi_transactions_investors!inner(clerk_user_id, clerk_org_id)
          `
          )
          .eq("bsi_transactions_investors.clerk_org_id", dbOrg.id)
          .eq("ledger_entry_type", "contribution")
          .order("transaction_date", { ascending: false });

        if (error) throw error;

        contributions = (data || []).map((tx) => ({
          contribution_amount: Math.abs(parseFloat(tx.transaction_amount || "0")),
          contribution_status: tx.transaction_status || "pending",
          active: true,
        }));
      }
    } else {
      // No org selected - show ALL user's contributions:
      // 1. Direct user contributions (via junction table clerk_user_id)
      // 2. Org contributions where user is a member (via auth_clerk_orgs_members)

      // Get user's org memberships where they have INVESTMENT interest (not just viewer/employee)
      const { data: orgMemberships } = await supabase
        .from("auth_clerk_orgs_members")
        .select("clerk_org_id, clerk_org_role")
        .eq("auth_clerk_users_id", targetUserId)
        .neq("clerk_org_role", "viewer"); // Exclude viewer role

      const userOrgIds = (orgMemberships || [])
        .map((m) => m.clerk_org_id)
        .filter((id): id is number => id !== null);

      // Get direct user contributions
      const { data: userContribs, error: userError } = await supabase
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

      // Get org contributions
      let orgContribs: typeof userContribs = [];
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
        orgContribs = orgData || [];
      }

      // Combine and deduplicate by ID
      const allContributions = [...(userContribs || []), ...(orgContribs || [])];
      const uniqueContributions = Array.from(
        new Map(allContributions.map((d) => [d.id, d])).values()
      );

      contributions = uniqueContributions.map((tx) => ({
        contribution_amount: Math.abs(parseFloat(tx.transaction_amount || "0")),
        contribution_status: tx.transaction_status || "pending",
        active: true,
      }));
    }

    return NextResponse.json(contributions);
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return NextResponse.json([]);
  }
}
