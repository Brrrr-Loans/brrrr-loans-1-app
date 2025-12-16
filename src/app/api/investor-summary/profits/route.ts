import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

/**
 * Returns total profits paid to an investor from bsi_distributions.
 * Profits = interest_amount + servicing_fee + wire_fee (excludes principal_amount)
 * 
 * Includes:
 * - Distributions linked directly to the user (via clerk_user_id)
 * - Distributions linked to any org the user is a member of (via clerk_org_id)
 */
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
        return NextResponse.json({ total_profits: 0 });
      }

      targetUserId = currentUser.id;
    }

    let totalProfits = 0;

    if (clerkOrgIdParam) {
      // User has an org selected - only show profits for that org
      const { data: dbOrg } = await supabase
        .from("auth_clerk_orgs")
        .select("id")
        .eq("clerk_org_id", clerkOrgIdParam)
        .single();

      if (dbOrg) {
        const { data, error } = await supabase
          .from("bsi_distributions")
          .select("interest_amount, servicing_fee, wire_fee")
          .eq("clerk_org_id", dbOrg.id);

        if (error) throw error;

        totalProfits = (data || []).reduce((sum, dist) => {
          const interest = parseFloat(dist.interest_amount || "0");
          const servicing = parseFloat(dist.servicing_fee || "0");
          const wireFee = parseFloat(dist.wire_fee || "0");
          return sum + interest + servicing + wireFee;
        }, 0);
      }
    } else {
      // No org selected - show ALL user's profits:
      // 1. Direct user distributions (via clerk_user_id)
      // 2. Org distributions where user is a member

      // Get user's org memberships where they have INVESTMENT interest
      const { data: orgMemberships } = await supabase
        .from("auth_clerk_orgs_members")
        .select("clerk_org_id")
        .eq("auth_clerk_users_id", targetUserId)
        .neq("clerk_org_role", "viewer");

      const userOrgIds = (orgMemberships || [])
        .map((m) => m.clerk_org_id)
        .filter((id): id is number => id !== null);

      // Get direct user distributions
      const { data: userDist, error: userError } = await supabase
        .from("bsi_distributions")
        .select("id, interest_amount, servicing_fee, wire_fee")
        .eq("clerk_user_id", targetUserId);

      if (userError) throw userError;

      // Get org distributions
      let orgDist: typeof userDist = [];
      if (userOrgIds.length > 0) {
        const { data: orgData, error: orgError } = await supabase
          .from("bsi_distributions")
          .select("id, interest_amount, servicing_fee, wire_fee")
          .in("clerk_org_id", userOrgIds);

        if (orgError) throw orgError;
        orgDist = orgData || [];
      }

      // Combine and deduplicate by id
      const allDistributions = [...(userDist || []), ...(orgDist || [])];
      const uniqueDistributions = Array.from(
        new Map(allDistributions.map((d) => [d.id, d])).values()
      );

      totalProfits = uniqueDistributions.reduce((sum, dist) => {
        const interest = parseFloat(dist.interest_amount || "0");
        const servicing = parseFloat(dist.servicing_fee || "0");
        const wireFee = parseFloat(dist.wire_fee || "0");
        return sum + interest + servicing + wireFee;
      }, 0);
    }

    return NextResponse.json({ total_profits: totalProfits });
  } catch (error) {
    console.error("Error fetching profits:", error);
    return NextResponse.json({ total_profits: 0 });
  }
}

