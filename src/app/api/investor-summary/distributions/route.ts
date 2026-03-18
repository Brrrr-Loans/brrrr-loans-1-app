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

    // Get the investor's name for display
    const { data: investorData } = await supabase
      .from("auth_clerk_users")
      .select("full_name")
      .eq("id", targetUserId)
      .single();

    const investorName = investorData?.full_name || "Unknown";

    interface DistributionResult {
      id: number;
      transaction_date: string | null;
      from: string;
      to: string;
      transaction_method: string;
      transaction_status: string;
      ledger_entry_type: string;
      transaction_amount: number;
    }

    let distributions: DistributionResult[] = [];

    if (clerkOrgIdParam) {
      // User has an org selected - only show data for that org
      const { data: dbOrg } = await supabase
        .from("auth_clerk_orgs")
        .select("id, clerk_org_name")
        .eq("clerk_org_id", clerkOrgIdParam)
        .single();

      if (dbOrg) {
        const orgName = dbOrg.clerk_org_name || "Unknown Organization";

        const { data, error } = await supabase
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
          .eq("bsi_transactions_investors.clerk_org_id", dbOrg.id)
          .eq("ledger_entry_type", "distribution")
          .order("transaction_date", { ascending: false });

        if (error) throw error;

        distributions = (data || []).map((tx) => ({
          id: tx.id,
          transaction_date: tx.transaction_date,
          from: "Brrrr Loans 1 LLC",
          to: orgName,
          transaction_method: tx.transaction_method || "wire",
          transaction_status: tx.transaction_status || "pending",
          ledger_entry_type: tx.ledger_entry_type || "distribution",
          transaction_amount: Math.abs(Number(tx.transaction_amount ?? 0)),
        }));
      }
    } else {
      // No org selected - show ALL user's distributions:
      // 1. Direct user distributions (via junction table clerk_user_id)
      // 2. Org distributions where user is a member (via auth_clerk_orgs_members)

      // Get user's org memberships where they have INVESTMENT interest
      const { data: orgMemberships } = await supabase
        .from("auth_clerk_orgs_members")
        .select("clerk_org_id, clerk_org_role, auth_clerk_orgs:clerk_org_id(id, clerk_org_name)")
        .eq("auth_clerk_users_id", targetUserId)
        .neq("clerk_org_role", "viewer");

      const userOrgIds = (orgMemberships || [])
        .map((m) => m.clerk_org_id)
        .filter((id): id is number => id !== null);

      // Build org name map
      const orgNameMap = new Map<number, string>();
      (orgMemberships || []).forEach((m) => {
        if (m.clerk_org_id && m.auth_clerk_orgs) {
          const org = m.auth_clerk_orgs as { id: number; clerk_org_name: string };
          orgNameMap.set(m.clerk_org_id, org.clerk_org_name || "Unknown Organization");
        }
      });

      // Get direct user distributions
      const { data: userDist, error: userError } = await supabase
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

      // Get org distributions
      let orgDist: typeof userDist = [];
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
        orgDist = orgData || [];
      }

      // Combine and deduplicate
      const allDistributions = [...(userDist || []), ...(orgDist || [])];
      const uniqueDistributions = Array.from(
        new Map(allDistributions.map((d) => [d.id, d])).values()
      );

      // Sort by date descending
      uniqueDistributions.sort((a, b) => {
        const dateA = a.transaction_date ? new Date(a.transaction_date).getTime() : 0;
        const dateB = b.transaction_date ? new Date(b.transaction_date).getTime() : 0;
        return dateB - dateA;
      });

      // Helper to get recipient name
      const getRecipientName = (tx: typeof uniqueDistributions[0]): string => {
        const investors = tx.bsi_transactions_investors as Array<{
          clerk_user_id: number | null;
          clerk_org_id: number | null;
        }>;
        if (!investors || investors.length === 0) return investorName;
        const investor = investors[0];
        if (investor.clerk_org_id && orgNameMap.has(investor.clerk_org_id)) {
          return orgNameMap.get(investor.clerk_org_id)!;
        }
        return investorName;
      };

      distributions = uniqueDistributions.map((tx) => ({
        id: tx.id,
        transaction_date: tx.transaction_date,
        from: "Brrrr Loans 1 LLC",
        to: getRecipientName(tx),
        transaction_method: tx.transaction_method || "wire",
        transaction_status: tx.transaction_status || "pending",
        ledger_entry_type: tx.ledger_entry_type || "distribution",
        transaction_amount: Math.abs(Number(tx.transaction_amount ?? 0)),
      }));
    }

    return NextResponse.json(distributions);
  } catch (error) {
    console.error("Error fetching distributions:", error);
    return NextResponse.json([]);
  }
}
