import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase-server";
import {
  getCurrentUserData,
  getUserInvestmentOrgs,
} from "@/lib/auth-helpers";
import { isInvestmentOrgRole } from "@/lib/deal-access";
import type { Database } from "@/types/database.types";

const DEAL_EMBED = `
  deal:deal_id(
    id,
    deal_name,
    deal_stage_2,
    deal_disposition_1,
    loan_amount_total,
    funding_date,
    project_type,
    property_id,
    loan_number,
    property:property_id(id, address),
    deal_guarantors(
      guarantor_id,
      is_primary,
      guarantor:guarantor_id(id, name)
    )
  )
`;

async function userCanViewOrgDeals(
  supabase: SupabaseClient<Database>,
  options: {
    requestedClerkOrgId: string;
    sessionOrgId: string | null;
    sessionOrgRole: string | null;
    authClerkUsersId: number | null;
    isInternalAdmin: boolean;
  }
): Promise<boolean> {
  if (options.isInternalAdmin) return true;

  const { data: dbOrg } = await supabase
    .from("auth_clerk_orgs")
    .select("id")
    .eq("clerk_org_id", options.requestedClerkOrgId)
    .maybeSingle();

  if (!dbOrg) return false;

  if (options.authClerkUsersId != null) {
    const { data: membership } = await supabase
      .from("auth_clerk_orgs_members")
      .select("clerk_org_role")
      .eq("auth_clerk_users_id", options.authClerkUsersId)
      .eq("clerk_org_id", dbOrg.id)
      .maybeSingle();

    return isInvestmentOrgRole(membership?.clerk_org_role);
  }

  // No auth_clerk_users row: only the active Clerk org, matching RLS
  // (admin/member, not viewer).
  return (
    options.sessionOrgId === options.requestedClerkOrgId &&
    isInvestmentOrgRole(options.sessionOrgRole)
  );
}

export async function GET(request: Request) {
  try {
    const supabase = createServiceRoleClient();
    const { userId: clerkUserId, orgId, orgRole } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const impersonatedUserIdParam = url.searchParams.get("impersonate_user_id");
    let clerkOrgIdParam = url.searchParams.get("clerk_org_id");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    const { data: caller } = await supabase
      .from("auth_clerk_users")
      .select("id, personal_role")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();

    const isInternalAdmin = caller?.personal_role === "admin";

    let targetUserId: number | null = null;

    if (impersonatedUserIdParam) {
      if (!isInternalAdmin) {
        return NextResponse.json(
          { error: "Forbidden - admin only" },
          { status: 403 }
        );
      }

      const parsed = parseInt(impersonatedUserIdParam, 10);
      if (Number.isNaN(parsed)) {
        return NextResponse.json([]);
      }

      const { data: impersonatedUser } = await supabase
        .from("auth_clerk_users")
        .select("id")
        .eq("id", parsed)
        .maybeSingle();

      if (!impersonatedUser) {
        return NextResponse.json(
          { error: "Impersonated user not found" },
          { status: 404 }
        );
      }

      targetUserId = impersonatedUser.id;
    } else {
      const currentUser = await getCurrentUserData();
      targetUserId = currentUser?.id ?? caller?.id ?? null;
    }

    // Org admins can open Deals before an auth_clerk_users row exists.
    // Use the active Clerk org so they still receive org-linked deals.
    if (
      !impersonatedUserIdParam &&
      targetUserId === null &&
      !clerkOrgIdParam &&
      orgId
    ) {
      clerkOrgIdParam = orgId;
    }

    if (clerkOrgIdParam) {
      const allowed = await userCanViewOrgDeals(supabase, {
        requestedClerkOrgId: clerkOrgIdParam,
        sessionOrgId: orgId,
        sessionOrgRole: orgRole,
        authClerkUsersId: targetUserId,
        // Impersonation must follow the target user's membership, not the
        // platform admin's global access.
        isInternalAdmin: impersonatedUserIdParam ? false : isInternalAdmin,
      });

      if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const { data: dbOrg } = await supabase
        .from("auth_clerk_orgs")
        .select("id")
        .eq("clerk_org_id", clerkOrgIdParam)
        .maybeSingle();

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
          ${DEAL_EMBED}
        `
        )
        .eq("clerk_org_id", dbOrg.id);

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

    const orgIds = await getUserInvestmentOrgs(targetUserId);

    let userQuery = supabase
      .from("bsi_deals_clerk_users")
      .select(
        `
        id,
        deal_id,
        clerk_user_id,
        ${DEAL_EMBED}
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
          ${DEAL_EMBED}
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
