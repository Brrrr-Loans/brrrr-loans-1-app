import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

/**
 * Match Brex transfer(s) to a vendor
 * POST /api/brex/match-transfer-to-vendor
 * Body: { transfer_ids: number[], vendor_id: number, notes?: string }
 * OR (legacy single): { transfer_id: number, vendor_id: number, notes?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    const body = await request.json();

    // Get current user for audit trail
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's database ID
    const { data: currentUser } = await supabase
      .from("auth_clerk_users")
      .select("id")
      .eq("clerk_user_id", clerkUserId)
      .single();

    const currentUserDbId = currentUser?.id || null;

    // Support both bulk and single matching
    const transferIds = body.transfer_ids 
      ? body.transfer_ids 
      : body.transfer_id 
      ? [body.transfer_id] 
      : [];
    const { vendor_id, notes } = body;

    // Validate required fields
    if (!transferIds || transferIds.length === 0 || !vendor_id) {
      return NextResponse.json(
        { error: "transfer_ids and vendor_id are required" },
        { status: 400 }
      );
    }

    console.log(
      `🔗 Matching ${transferIds.length} transfer(s) to vendor ${vendor_id}...`
    );

    // Get all transfers' brex_transfer_ids
    const { data: transfers, error: transferError } = await supabase
      .from("api_brex_transfers")
      .select("id, brex_transfer_id, counterparty_name, amount")
      .in("id", transferIds);

    if (transferError || !transfers || transfers.length === 0) {
      console.error("❌ Transfers not found:", transferError);
      return NextResponse.json(
        { error: "Transfers not found" },
        { status: 404 }
      );
    }

    // Get the vendor name
    const { data: vendor, error: vendorError } = await supabase
      .from("api_brex_vendors")
      .select("id, name, brex_vendor_id")
      .eq("id", vendor_id)
      .single();

    if (vendorError || !vendor) {
      console.error("❌ Vendor not found:", vendorError);
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each transfer
    for (const transfer of transfers) {
      try {
        // Check if match already exists (including soft-deleted)
        const { data: existingMatch } = await supabase
          .from("api_brex_transfers_vendors")
          .select("id, brex_vendor_id, deleted_at")
          .eq("brex_transfer_id", transfer.brex_transfer_id)
          .maybeSingle();

        if (existingMatch) {
          if (existingMatch.deleted_at) {
            // Un-delete and update soft-deleted match
            const { error: updateError } = await supabase
              .from("api_brex_transfers_vendors")
              .update({
                brex_vendor_id: vendor_id,
                match_notes: notes || null,
                match_method: "manual",
                deleted_at: null, // Un-delete
                deleted_by_user_id: null,
                updated_at: new Date().toISOString(),
                updated_by_user_id: currentUserDbId,
              })
              .eq("id", existingMatch.id);

            if (updateError) throw updateError;
            updatedCount++;
          } else {
            // Update existing active match (re-match to different vendor)
            const { error: updateError } = await supabase
              .from("api_brex_transfers_vendors")
              .update({
                brex_vendor_id: vendor_id,
                match_notes: notes || null,
                match_method: "manual",
                updated_at: new Date().toISOString(),
                updated_by_user_id: currentUserDbId,
              })
              .eq("id", existingMatch.id);

            if (updateError) throw updateError;
            updatedCount++;
          }
        } else {
          // Create new match
          const { error: insertError } = await supabase
            .from("api_brex_transfers_vendors")
            .insert({
              brex_transfer_id: transfer.brex_transfer_id,
              brex_vendor_id: vendor_id,
              match_method: "manual",
              match_notes: notes || null,
              created_by_user_id: currentUserDbId,
            });

          if (insertError) throw insertError;
          createdCount++;
        }
      } catch (error) {
        console.error(`❌ Error matching transfer ${transfer.id}:`, error);
        errors.push(`Transfer ${transfer.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        errorCount++;
      }
    }

    const totalProcessed = createdCount + updatedCount;
    console.log(
      `✅ Matched ${totalProcessed} transfer(s) to vendor ${vendor.name} (${createdCount} created, ${updatedCount} updated, ${errorCount} errors)`
    );

    return NextResponse.json({
      success: errorCount === 0,
      message: `Matched ${totalProcessed} transfer(s) to ${vendor.name}`,
      stats: {
        created: createdCount,
        updated: updatedCount,
        errors: errorCount,
      },
      errors: errors.length > 0 ? errors : undefined,
      data: {
        vendor_id: vendor_id,
        vendor_name: vendor.name,
        transfer_count: totalProcessed,
      },
    });
  } catch (error) {
    console.error("❌ Error matching transfer to vendor:", error);
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
 * Get unmatched transfers
 * GET /api/brex/match-transfer-to-vendor
 */
export async function GET() {
  try {
    const supabase = createServiceRoleClient();

    console.log("📋 Fetching unmatched transfers...");

    // Get all transfers
    const { data: allTransfers, error: allError } = await supabase
      .from("api_brex_transfers")
      .select(
        `
        id,
        brex_transfer_id,
        counterparty_id,
        counterparty_name,
        counterparty_account_number,
        amount,
        amount_cents,
        process_date,
        status,
        description,
        display_name,
        external_memo
      `
      )
      .order("id", { ascending: true });

    if (allError) {
      console.error("❌ Error fetching transfers:", allError);
      throw allError;
    }

    // Get all matched transfer IDs (excluding soft-deleted)
    const { data: matches } = await supabase
      .from("api_brex_transfers_vendors")
      .select("brex_transfer_id")
      .is("deleted_at", null); // Only active matches

    const matchedIds = new Set(
      matches?.map((m) => m.brex_transfer_id) || []
    );

    // Filter out matched transfers
    const unmatched = allTransfers?.filter(
      (t) => !matchedIds.has(t.brex_transfer_id)
    );

    console.log(`✅ Found ${unmatched?.length || 0} unmatched transfers`);

    return NextResponse.json({
      success: true,
      count: unmatched?.length || 0,
      transfers: unmatched || [],
    });
  } catch (error) {
    console.error("❌ Error fetching unmatched transfers:", error);
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

