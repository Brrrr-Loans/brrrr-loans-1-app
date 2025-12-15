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

    let deals: Array<{ status: string }> = [];

    if (clerkOrgIdParam) {
      // User has an org selected - only show deals for that org
      const { data: dbOrg } = await supabase
        .from("auth_clerk_orgs")
        .select("id")
        .eq("clerk_org_id", clerkOrgIdParam)
        .single();

      if (dbOrg) {
        const { data, error } = await supabase
          .from("bsi_deals_clerk_orgs")
          .select(
            `
            id,
            deal_id,
            deal:deal_id(
              id,
              deal_name,
              deal_disposition_1
            )
          `
          )
          .eq("clerk_org_id", dbOrg.id);

        if (error) {
          console.error("Error fetching org deals:", error);
        } else {
          deals = (data || [])
            .filter((row) => row.deal)
            .map((row) => ({
              status: row.deal?.deal_disposition_1 || "unknown",
            }));
        }
      }
    } else {
      // No org selected - show ALL user's deals:
      // 1. Direct user deals (via bsi_deals)
      // 2. Org deals where user is a member (via auth_clerk_orgs_members)

      // Get user's org memberships where they have INVESTMENT interest
      const { data: orgMemberships } = await supabase
        .from("auth_clerk_orgs_members")
        .select("clerk_org_id, clerk_org_role")
        .eq("auth_clerk_users_id", targetUserId)
        .neq("clerk_org_role", "viewer");

      const userOrgIds = (orgMemberships || [])
        .map((m) => m.clerk_org_id)
        .filter((id): id is number => id !== null);

      // Get user's direct deals
      const { data: userDeals, error: userError } = await supabase
        .from("bsi_deals_clerk_users")
        .select(
          `
          id,
          deal_id,
          deal:deal_id(
            id,
            deal_name,
            deal_disposition_1
          )
        `
        )
        .eq("clerk_user_id", targetUserId);

      if (userError) {
        console.error("Error fetching user deals:", userError);
      }

      // Get org deals
      let orgDeals: typeof userDeals = [];
      if (userOrgIds.length > 0) {
        const { data: orgData, error: orgError } = await supabase
          .from("bsi_deals_clerk_orgs")
          .select(
            `
            id,
            deal_id,
            deal:deal_id(
              id,
              deal_name,
              deal_disposition_1
            )
          `
          )
          .in("clerk_org_id", userOrgIds);

        if (orgError) {
          console.error("Error fetching org deals:", orgError);
        } else {
          orgDeals = orgData || [];
        }
      }

      // Combine and deduplicate
      const allDeals = [...(userDeals || []), ...orgDeals];
      const uniqueDeals = Array.from(
        new Map(allDeals.map((d) => [d.deal_id, d])).values()
      );

      deals = uniqueDeals
        .filter((row) => row.deal)
        .map((row) => ({
          status: row.deal?.deal_disposition_1 || "unknown",
        }));
    }

    return NextResponse.json(deals);
  } catch (error) {
    console.error("Error fetching deals:", error);
    return NextResponse.json([]);
  }
}
