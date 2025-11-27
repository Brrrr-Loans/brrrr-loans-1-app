import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";

/**
 * Get all manual transfer-vendor matches with audit trail
 * GET /api/brex/manual-matches
 */
export async function GET() {
  try {
    const supabase = createServiceRoleClient();

    console.log("📋 Fetching manual matches with audit trail...");

    // Get all matches with transfer and vendor details
    const { data: matches, error } = await supabase
      .from("api_brex_transfers_vendors")
      .select(
        `
        id,
        brex_transfer_id,
        brex_vendor_id,
        match_method,
        match_notes,
        created_at,
        created_by_user_id,
        updated_at,
        updated_by_user_id,
        deleted_at,
        deleted_by_user_id,
        api_brex_transfers!inner (
          id,
          amount,
          process_date,
          display_name,
          counterparty_name
        ),
        api_brex_vendors!inner (
          id,
          name,
          email
        )
      `
      )
      .is("deleted_at", null) // Only active matches by default
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching manual matches:", error);
      throw error;
    }

    // Fetch user names for audit trail
    const userIds = new Set<number>();
    matches?.forEach((m) => {
      if (m.created_by_user_id) userIds.add(m.created_by_user_id);
      if (m.updated_by_user_id) userIds.add(m.updated_by_user_id);
    });

    const { data: users } = await supabase
      .from("auth_clerk_users")
      .select("id, full_name, email")
      .in("id", Array.from(userIds));

    const userMap = new Map(users?.map((u) => [u.id, u]) || []);

    // Enrich matches with user details
    const enrichedMatches = matches?.map((m) => ({
      ...m,
      created_by_user: m.created_by_user_id
        ? userMap.get(m.created_by_user_id)
        : null,
      updated_by_user: m.updated_by_user_id
        ? userMap.get(m.updated_by_user_id)
        : null,
    }));

    console.log(`✅ Found ${enrichedMatches?.length || 0} manual matches`);

    return NextResponse.json({
      success: true,
      count: enrichedMatches?.length || 0,
      matches: enrichedMatches || [],
    });
  } catch (error) {
    console.error("❌ Error fetching manual matches:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

