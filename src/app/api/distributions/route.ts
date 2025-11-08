import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import type { Tables } from "@/types/supabase";

export async function GET(request: Request) {
  try {
    // TEMPORARY WORKAROUND: Use service role client and default investor ID while we fix Clerk auth
    console.log("🛠️ Using temporary workaround for distributions API");

    const supabase = createServiceRoleClient();

    // Use default investor ID (contact_id = 1) for development
    const investorId = 1;

    const url = new URL(request.url);
    const searchParams = url.searchParams;
    // const status = searchParams.get("status") ?? ""; // TODO: Add status field to bsi_distributions table
    // const type = searchParams.get("type") ?? ""; // TODO: Add distribution_type field to bsi_distributions table
    const search = searchParams.get("search") ?? "";
    const period = searchParams.get("period") ?? "all";

    // Query distributions for this investor
    let query = supabase
      .from("bsi_distributions")
      .select(
        `
        *,
        deal:deal_id(deal_name)
      `
      )
      .eq("bsi_contact_id", investorId);

    // Apply filters
    if (period !== "all") {
      const now = new Date();
      const startDate = new Date();
      if (period === "3m") startDate.setMonth(now.getMonth() - 3);
      else if (period === "6m") startDate.setMonth(now.getMonth() - 6);
      else if (period === "1y") startDate.setFullYear(now.getFullYear() - 1);
      query = query.gte("created_at", startDate.toISOString());
    }
    // Note: status and distribution_type fields don't exist in bsi_distributions table
    // if (status) query = query.eq("status", status);
    // if (type) query = query.eq("distribution_type", type);
    if (search) {
      // For numeric id search, try to parse as number, otherwise skip id search
      const searchAsNumber = parseInt(search, 10);
      if (!isNaN(searchAsNumber)) {
        query = query.eq("id", searchAsNumber);
      }
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching distributions:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter by deal_name in JS if search is provided
    let filteredData = data || [];
    if (search) {
      filteredData = filteredData.filter(
        (row) =>
          row.deal?.deal_name?.toLowerCase().includes(search.toLowerCase()) ||
          String(row.id).includes(search)
      );
    }

    return NextResponse.json(
      filteredData as (Tables<"bsi_distributions"> & {
        deal: Pick<Tables<"deal">, "deal_name">;
      })[]
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
