import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import type { Tables } from "@/types/supabase";
import {
  getCurrentUserData,
  getUserInvestmentOrgs,
} from "@/lib/auth-helpers";

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
    const search = url.searchParams.get("search") ?? "";
    const period = url.searchParams.get("period") ?? "all";

    // Get target user ID (for impersonation or current user)
    let targetUserId: number;

    if (impersonatedUserIdParam) {
      targetUserId = parseInt(impersonatedUserIdParam);
    } else {
      const currentUser = await getCurrentUserData();
      if (!currentUser) {
        return NextResponse.json([]);
      }
      targetUserId = currentUser.id;
    }

    // Calculate date filter
    let startDate: string | null = null;
    if (period !== "all") {
      const now = new Date();
      const start = new Date();
      if (period === "3m") start.setMonth(now.getMonth() - 3);
      else if (period === "6m") start.setMonth(now.getMonth() - 6);
      else if (period === "1y") start.setFullYear(now.getFullYear() - 1);
      startDate = start.toISOString();
    }

    if (clerkOrgIdParam) {
      // User has an org selected - only show distributions for that org
      const { data: dbOrg } = await supabase
        .from("auth_clerk_orgs")
        .select("id")
        .eq("clerk_org_id", clerkOrgIdParam)
        .single();

      if (!dbOrg) {
        return NextResponse.json([]);
      }

      let query = supabase
        .from("bsi_distributions")
        .select(
          `
          *,
          deal:deal_id(deal_name)
        `
        )
        .eq("clerk_org_id", dbOrg.id);

      if (startDate) {
        query = query.gte("created_at", startDate);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Error fetching org distributions:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Apply search filter
      let filteredData = data || [];
      if (search) {
        const searchLower = search.toLowerCase();
        const searchAsNumber = parseInt(search, 10);
        filteredData = filteredData.filter(
          (row) =>
            row.deal?.deal_name?.toLowerCase().includes(searchLower) ||
            (!isNaN(searchAsNumber) && row.id === searchAsNumber)
        );
      }

      return NextResponse.json(filteredData);
    } else {
      // No org selected - show ALL user's distributions (direct + org memberships)

      // Get user's org memberships where they have INVESTMENT interest
      const orgIds = await getUserInvestmentOrgs(targetUserId);

      // Get user's direct distributions
      let userQuery = supabase
        .from("bsi_distributions")
        .select(
          `
          *,
          deal:deal_id(deal_name)
        `
        )
        .eq("clerk_user_id", targetUserId);

      if (startDate) {
        userQuery = userQuery.gte("created_at", startDate);
      }

      const { data: userDistributions, error: userError } = await userQuery.order(
        "created_at",
        { ascending: false }
      );

      if (userError) {
        console.error("Error fetching user distributions:", userError);
        return NextResponse.json(
          { error: userError.message },
          { status: 500 }
        );
      }

      // Get org distributions
      let orgDistributions: typeof userDistributions = [];
      if (orgIds.length > 0) {
        let orgQuery = supabase
          .from("bsi_distributions")
          .select(
            `
            *,
            deal:deal_id(deal_name)
          `
          )
          .in("clerk_org_id", orgIds);

        if (startDate) {
          orgQuery = orgQuery.gte("created_at", startDate);
        }

        const { data: orgData, error: orgError } = await orgQuery.order(
          "created_at",
          { ascending: false }
        );

        if (orgError) {
          console.error("Error fetching org distributions:", orgError);
        } else {
          orgDistributions = orgData || [];
        }
      }

      // Combine and deduplicate by id
      const allDistributions = [
        ...(userDistributions || []),
        ...orgDistributions,
      ];
      const uniqueDistributions = Array.from(
        new Map(allDistributions.map((d) => [d.id, d])).values()
      );

      // Sort by created_at descending
      uniqueDistributions.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });

      // Apply search filter
      let filteredData = uniqueDistributions;
      if (search) {
        const searchLower = search.toLowerCase();
        const searchAsNumber = parseInt(search, 10);
        filteredData = uniqueDistributions.filter(
          (row) =>
            row.deal?.deal_name?.toLowerCase().includes(searchLower) ||
            (!isNaN(searchAsNumber) && row.id === searchAsNumber)
        );
      }

      return NextResponse.json(
        filteredData as (Tables<"bsi_distributions"> & {
          deal: Pick<Tables<"deal">, "deal_name"> | null;
        })[]
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
