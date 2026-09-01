import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase-server";
import {
  getCurrentUserData,
  getUserInvestmentOrgs,
} from "@/lib/auth-helpers";
import { isInvestmentOrgRole } from "@/lib/deal-access";
import {
  isPlatformAdminIdentity,
  shouldFallbackToAllDeals,
} from "@/lib/internal-admin";
import { wrapDealsForApi, type PortalDeal } from "@/lib/deals-api";
import type { Database } from "@/types/database.types";

const DEAL_FIELDS = `
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
`;

const DEAL_EMBED = `deal:deal_id(${DEAL_FIELDS})`;

type DealDisposition = "on_hold" | "active" | "dead";

async function fetchAllDeals(
  supabase: SupabaseClient<Database>,
  filters: { status: string | null; search: string | null }
) {
  let query = supabase.from("deal").select(DEAL_FIELDS);

  if (filters.status) {
    query = query.eq("deal_disposition_1", filters.status as DealDisposition);
  }
  if (filters.search) {
    query = query.or(
      `deal_name.ilike.%${filters.search}%,loan_number.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching all deals:", error);
    return { error: error.message, rows: [] as ReturnType<typeof wrapDealsForApi> };
  }

  return {
    error: null,
    rows: wrapDealsForApi((data || []) as unknown as PortalDeal[]),
  };
}

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
    const filters = { status, search };

    const clerk = await currentUser();
    const { data: caller } = await supabase
      .from("auth_clerk_users")
      .select("id, personal_role, is_internal_yn, email")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();

    const isInternalAdmin = isPlatformAdminIdentity({
      clerkUserId,
      email:
        caller?.email || clerk?.emailAddresses?.[0]?.emailAddress || null,
      personalRole: caller?.personal_role,
      isInternalYn: caller?.is_internal_yn,
    });

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
      const current = await getCurrentUserData();
      targetUserId = current?.id ?? caller?.id ?? null;
    }

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
        sessionOrgId: orgId ?? null,
        sessionOrgRole: orgRole ?? null,
        authClerkUsersId: targetUserId,
        isInternalAdmin: impersonatedUserIdParam ? false : isInternalAdmin,
      });

      if (!allowed) {
        if (impersonatedUserIdParam) {
          return NextResponse.json([]);
        }
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const { data: dbOrg } = await supabase
        .from("auth_clerk_orgs")
        .select("id")
        .eq("clerk_org_id", clerkOrgIdParam)
        .maybeSingle();

      if (!dbOrg) {
        if (!impersonatedUserIdParam && isInternalAdmin) {
          const allDeals = await fetchAllDeals(supabase, filters);
          if (allDeals.error) {
            return NextResponse.json({ error: allDeals.error }, { status: 500 });
          }
          return NextResponse.json(allDeals.rows);
        }
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
        query = query.eq("deal.deal_disposition_1", status as DealDisposition);
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

      if (
        !impersonatedUserIdParam &&
        shouldFallbackToAllDeals({
          isInternalAdmin,
          orgLinkedCount: data?.length ?? 0,
        })
      ) {
        const allDeals = await fetchAllDeals(supabase, filters);
        if (allDeals.error) {
          return NextResponse.json({ error: allDeals.error }, { status: 500 });
        }
        return NextResponse.json(allDeals.rows);
      }

      return NextResponse.json(data || []);
    }

    if (!impersonatedUserIdParam && isInternalAdmin) {
      const allDeals = await fetchAllDeals(supabase, filters);
      if (allDeals.error) {
        return NextResponse.json({ error: allDeals.error }, { status: 500 });
      }
      return NextResponse.json(allDeals.rows);
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
        status as DealDisposition
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
          status as DealDisposition
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
