import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import {
  listAllTransfers,
  type BrexTransfer,
  isBrexAuthError,
  BrexApiClientError,
} from "@/lib/brex/client";

/**
 * Sync transfers from Brex API to database
 * POST /api/brex/sync-transfers
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();

    console.log("🔄 Starting Brex transfers sync...");

    // Optional: Get date range from query params
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start_date") || undefined;
    const endDate = searchParams.get("end_date") || undefined;

    // Fetch all transfers from Brex API
    const transfers = await listAllTransfers(startDate, endDate);
    console.log(`📦 Fetched ${transfers.length} transfers from Brex API`);

    if (transfers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No transfers to sync",
        stats: {
          total: 0,
          inserted: 0,
          updated: 0,
          errors: 0,
        },
      });
    }

    let inserted = 0;
    let updated = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    // Process each transfer
    for (const transfer of transfers) {
      try {
        // Map Brex transfer to database row
        const transferRow = mapTransferToRow(transfer);

        // Upsert transfer (insert if new, update if exists)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from("api_brex_transfers")
          .upsert(transferRow, {
            onConflict: "brex_transfer_id",
            ignoreDuplicates: false,
          });

        if (error) {
          console.error(`❌ Error upserting transfer ${transfer.id}:`, error);
          errors++;
          errorDetails.push(`Transfer ${transfer.id}: ${error.message}`);
          continue;
        }

        // Check if this was an insert or update
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existing } = await (supabase as any)
          .from("api_brex_transfers")
          .select("id, created_at, updated_at")
          .eq("brex_transfer_id", transfer.id)
          .single();

        if (existing) {
          const createdAt = new Date(existing.created_at);
          const updatedAt = existing.updated_at
            ? new Date(existing.updated_at)
            : null;
          const now = new Date();

          // If created_at is very recent (within 2 seconds), it's likely an insert
          if (
            Math.abs(now.getTime() - createdAt.getTime()) < 2000 &&
            (!updatedAt ||
              Math.abs(updatedAt.getTime() - createdAt.getTime()) < 2000)
          ) {
            inserted++;
          } else {
            updated++;
          }
        }
      } catch (error) {
        console.error(`❌ Error processing transfer ${transfer.id}:`, error);
        errors++;
        errorDetails.push(
          `Transfer ${transfer.id}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    console.log(
      `✅ Transfers sync completed: ${inserted} inserted, ${updated} updated, ${errors} errors`
    );

    return NextResponse.json({
      success: true,
      message: `Synced ${transfers.length} transfers`,
      stats: {
        total: transfers.length,
        inserted,
        updated,
        errors,
      },
      errors: errors > 0 ? errorDetails : undefined,
    });
  } catch (error) {
    console.error("❌ Error syncing transfers:", error);

    // Check if this is an authentication error
    if (isBrexAuthError(error)) {
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof BrexApiClientError
              ? error.message
              : "Authentication failed",
        },
        { status: 401 }
      );
    }

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
 * Map Brex transfer API response to database row
 */
function mapTransferToRow(transfer: BrexTransfer) {
  // Extract amount values
  // Brex returns amounts in cents (smallest denomination), so:
  // - amount_cents = value as-is from Brex (already in cents)
  // - amount = convert to dollars by dividing by 100
  const amountCents = transfer.amount?.amount || null;
  const amount = amountCents != null ? amountCents / 100 : null;
  const currency = transfer.amount?.currency || null;

  // Extract counterparty info
  const counterparty = transfer.counterparty;
  const counterpartyId = counterparty?.id || null;
  const counterpartyName = counterparty?.name || null; // This is what we'll use for matching

  // Extract originating account info
  const originatingAccount = transfer.originating_account;

  return {
    brex_transfer_id: transfer.id,
    counterparty_id: counterpartyId,
    counterparty_type: counterparty?.type || null,
    counterparty_payment_instrument_id:
      counterparty?.payment_instrument_id || null,
    counterparty_routing_number: counterparty?.routing_number || null,
    counterparty_account_number: counterparty?.account_number || null,
    counterparty_name: counterpartyName,
    description: transfer.description || null,
    payment_type: transfer.payment_type || null,
    amount: amount,
    amount_cents: amountCents,
    currency: currency,
    process_date: transfer.process_date || null,
    originating_account_type: originatingAccount?.type || null,
    originating_account_id: originatingAccount?.id || null,
    originating_account_number: originatingAccount?.account_number || null,
    originating_account_name: originatingAccount?.name || null,
    status: transfer.status || null,
    cancellation_reason: transfer.cancellation_reason || null,
    estimated_delivery_date: transfer.estimated_delivery_date || null,
    creator_user_id: transfer.creator_user_id || null,
    brex_created_at: transfer.created_at || null,
    display_name: transfer.display_name || null,
    external_memo: transfer.external_memo || null,
    is_ppro_enabled: transfer.is_ppro_enabled || null,
    fed_reference_number: counterparty?.fed_reference_number || null,
    updated_at: new Date().toISOString(),
    synced_at: new Date().toISOString(),
    sync_status: "success",
    sync_error_message: null,
    raw_payload: transfer as Record<string, unknown>,
  };
}

/**
 * GET endpoint to check sync status
 */
export async function GET() {
  try {
    const supabase = createServiceRoleClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: lastSync, error } = await (supabase as any)
      .from("api_brex_transfers")
      .select("synced_at")
      .order("synced_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned", which is fine
      throw error;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (supabase as any)
      .from("api_brex_transfers")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      success: true,
      lastSync: lastSync?.synced_at || null,
      totalTransfers: count || 0,
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
