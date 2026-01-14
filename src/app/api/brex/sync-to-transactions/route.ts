import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";

/**
 * Trigger sync of matched transfers to bsi_transactions
 * POST /api/brex/sync-to-transactions
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();

    console.log("🔄 Starting sync of matched transfers to bsi_transactions...");

    // Call the database function
    const { data, error } = await supabase.rpc(
      "sync_matched_api_brex_transfers_to_bsi_transactions"
    );

    if (error) {
      console.error("❌ Error calling sync function:", error);
      throw error;
    }

    const result = (Array.isArray(data) && data.length > 0 ? data[0] : data) as {
      inserted_count: number;
      updated_count: number;
      error_count: number;
      errors: unknown[];
    } | null;

    console.log("✅ Sync completed:", result);

    return NextResponse.json({
      success: true,
      message: "Synced matched transfers to bsi_transactions",
      stats: {
        inserted: result?.inserted_count || 0,
        updated: result?.updated_count || 0,
        errors: result?.error_count || 0,
      },
      errors: result?.errors || [],
    });
  } catch (error) {
    console.error("❌ Error syncing to transactions:", error);
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

/**
 * GET endpoint to check sync status
 */
export async function GET() {
  try {
    const supabase = createServiceRoleClient();

    // Use database function to count pending syncs
    const { data: pendingCount, error } = await supabase.rpc(
      "count_pending_brex_transfer_syncs"
    );

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      pendingSync: pendingCount || 0,
    });
  } catch (error) {
    console.error("❌ Error getting sync status:", error);
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

