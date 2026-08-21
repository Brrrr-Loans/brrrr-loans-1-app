import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import {
  getCurrentUserData,
  getUserInvestmentOrgs,
} from "@/lib/auth-helpers";

export async function GET(request: Request) {
  try {
    const supabase = createServiceRoleClient();
    const { userId: clerkUserId, orgId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const impersonatedUserIdParam = url.searchParams.get("impersonate_user_id");
    let clerkOrgIdParam = url.searchParams.get("clerk_org_id");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    // Get target user ID (for impersonation or current user)
    let targetUserId: number | null = null;

    if (impersonatedUserIdParam) {
      const parsed = parseInt(impersonatedUserIdParam, 10);
      targetUserId = Number.isNaN(parsed) ? null : parsed;
    } else {
      const currentUser = await getCurrentUserData();
      targetUserId = currentUser?.id ?? null;
    }

    // Org admins can open Deals before an auth_clerk_users row exists.
    // Use the active Clerk org so they still receive org-linked deals.
    if (!impersonatedUserIdParam && targetUserId === null && !clerkOrgIdParam && orgId) {
      clerkOrgIdParam = orgId;
    }

    if (clerkOrgIdParam) {
      // User has an org selected - only show deals for that org
      const { data: dbOrg } = await supabase
        .from("auth_clerk_orgs")
        .select("id")
        .eq("clerk_org_id", clerkOrgIdParam)
        .single();

      if (!dbOrg) {
        return NextResponse.json([]);
      }

      let query = supabase
        .from("bsi_deals_clerk_orgs")
        .select(
          `
          id,
          deal_id,
          clerk_org_id,
          deal:deal_id(*)
        `
        )
        .eq("clerk_org_id", dbOrg.id);

      // Apply filters
      if (status) {
        query = query.eq(
          "deal.deal_disposition_1",
          status as "on_hold" | "active" | "dead"
        );
      }
      if (search) {
        query = query.or(
          `deal.deal_name.ilike.%${search}%,deal.loan_number.ilike.%${search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching org deals:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }

    if (targetUserId === null) {
      return NextResponse.json([]);
    }

    // No org selected - show ALL user's deals (direct + org memberships)
    const orgIds = await getUserInvestmentOrgs(targetUserId);

    let userQuery = supabase
      .from("bsi_deals_clerk_users")
      .select(
        `
        id,
        deal_id,
        clerk_user_id,
        deal:deal_id(*)
      `
      )
      .eq("clerk_user_id", targetUserId);

    if (status) {
      userQuery = userQuery.eq(
        "deal.deal_disposition_1",
        status as "on_hold" | "active" | "dead"
      );
    }
    if (search) {
      userQuery = userQuery.or(
        `deal.deal_name.ilike.%${search}%,deal.loan_number.ilike.%${search}%`
      );
    }

    const { data: userDeals, error: userError } = await userQuery;

    if (userError) {
      console.error("Error fetching user deals:", userError);
      return NextResponse.json(
        { error: userError.message },
        { status: 500 }
      );
    }

    let orgDeals: Array<{
      id: number;
      deal_id: number;
      deal: unknown;
    }> = [];
    if (orgIds.length > 0) {
      let orgQuery = supabase
        .from("bsi_deals_clerk_orgs")
        .select(
          `
          id,
          deal_id,
          clerk_org_id,
          deal:deal_id(*)
        `
        )
        .in("clerk_org_id", orgIds);

      if (status) {
        orgQuery = orgQuery.eq(
          "deal.deal_disposition_1",
          status as "on_hold" | "active" | "dead"
        );
      }
      if (search) {
        orgQuery = orgQuery.or(
          `deal.deal_name.ilike.%${search}%,deal.loan_number.ilike.%${search}%`
        );
      }

      const { data: orgData, error: orgError } = await orgQuery;

      if (orgError) {
        console.error("Error fetching org deals:", orgError);
      } else {
        orgDeals = orgData || [];
      }
    }

    const allDeals = [...(userDeals || []), ...orgDeals];
    const uniqueDeals = Array.from(
      new Map(allDeals.map((d) => [d.deal_id, d])).values()
    );

    return NextResponse.json(uniqueDeals);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
