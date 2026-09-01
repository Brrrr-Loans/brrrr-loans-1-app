import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase-server";
import {
  isPlatformAdminIdentity,
  shouldFallbackToAllDeals,
} from "@/lib/internal-admin";
import type { Database } from "@/types/database.types";

type DealStatusRow = { status: string };

function statusesFromJunction(
  rows: Array<{ deal?: { deal_disposition_1?: string | null } | null }> | null
): DealStatusRow[] {
  return (rows || [])
    .filter((row) => row.deal)
    .map((row) => ({
      status: row.deal?.deal_disposition_1 || "unknown",
    }));
}

async function fetchAllDealStatuses(
  supabase: SupabaseClient<Database>
): Promise<DealStatusRow[]> {
  const { data, error } = await supabase
    .from("deal")
    .select("deal_disposition_1");

  if (error) {
    console.error("Error fetching all deal statuses:", error);
    return [];
  }

  return (data || []).map((row) => ({
    status: row.deal_disposition_1 || "unknown",
  }));
}

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

    const { data: caller } = await supabase
      .from("auth_clerk_users")
      .select("id, email, personal_role, is_internal_yn")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();

    const isCallerAdmin = isPlatformAdminIdentity({
      clerkUserId,
      email: caller?.email,
      personalRole: caller?.personal_role,
      isInternalYn: caller?.is_internal_yn,
    });

    let targetUserId: number | null = caller?.id ?? null;

    if (impersonatedUserIdParam) {
      if (!isCallerAdmin) {
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
        return NextResponse.json([]);
      }

      targetUserId = impersonatedUser.id;
    }

    const canUseAllDealsFallback = isCallerAdmin && !impersonatedUserIdParam;
    let deals: DealStatusRow[] = [];

    if (clerkOrgIdParam) {
      if (shouldFallbackToAllDeals({ isInternalAdmin: canUseAllDealsFallback })) {
        return NextResponse.json(await fetchAllDealStatuses(supabase));
      }

      const { data: dbOrg } = await supabase
        .from("auth_clerk_orgs")
        .select("id")
        .eq("clerk_org_id", clerkOrgIdParam)
        .maybeSingle();

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
          deals = statusesFromJunction(data);
        }
      }

      return NextResponse.json(deals);
    }

    if (canUseAllDealsFallback) {
      return NextResponse.json(await fetchAllDealStatuses(supabase));
    }

    if (targetUserId === null) {
      return NextResponse.json([]);
    }

    const { data: orgMemberships } = await supabase
      .from("auth_clerk_orgs_members")
      .select("clerk_org_id, clerk_org_role")
      .eq("auth_clerk_users_id", targetUserId)
      .neq("clerk_org_role", "viewer");

    const userOrgIds = (orgMemberships || [])
      .map((m) => m.clerk_org_id)
      .filter((id): id is number => id !== null);

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

    const allDeals = [...(userDeals || []), ...(orgDeals || [])];
    const uniqueDeals = Array.from(
      new Map(allDeals.map((d) => [d.deal_id, d])).values()
    );

    deals = statusesFromJunction(uniqueDeals);
    return NextResponse.json(deals);
  } catch (error) {
    console.error("Error fetching deals:", error);
    return NextResponse.json([]);
  }
}
