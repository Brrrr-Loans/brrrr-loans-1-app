import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import {
  listAllVendors,
  type BrexVendor,
  isBrexAuthError,
  BrexApiClientError,
} from "@/lib/brex/client";

/**
 * Sync vendors from Brex API to database
 * POST /api/brex/sync-vendors
 */
export async function POST() {
  try {
    const supabase = createServiceRoleClient();

    console.log("🔄 Starting Brex vendors sync...");

    // Fetch all vendors from Brex API
    const vendors = await listAllVendors();
    console.log(`📦 Fetched ${vendors.length} vendors from Brex API`);

    if (vendors.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No vendors to sync",
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

    // Process each vendor
    for (const vendor of vendors) {
      try {
        // Map Brex vendor to database row
        const vendorRow = mapVendorToRow(vendor);

        // Upsert vendor (insert if new, update if exists)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from("api_brex_vendors")
          .upsert(vendorRow, {
            onConflict: "brex_vendor_id",
            ignoreDuplicates: false,
          });

        if (error) {
          console.error(`❌ Error upserting vendor ${vendor.id}:`, error);
          errors++;
          errorDetails.push(`Vendor ${vendor.id}: ${error.message}`);
          continue;
        }

        // Check if this was an insert or update by querying
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existing } = await (supabase as any)
          .from("api_brex_vendors")
          .select("id")
          .eq("brex_vendor_id", vendor.id)
          .single();

        if (existing) {
          // Check if it was just created (within last second) or updated
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: check } = await (supabase as any)
            .from("api_brex_vendors")
            .select("created_at, updated_at")
            .eq("brex_vendor_id", vendor.id)
            .single();

          if (check) {
            const createdAt = new Date(check.created_at);
            const updatedAt = check.updated_at
              ? new Date(check.updated_at)
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
        }
      } catch (error) {
        console.error(`❌ Error processing vendor ${vendor.id}:`, error);
        errors++;
        errorDetails.push(
          `Vendor ${vendor.id}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    console.log(
      `✅ Vendors sync completed: ${inserted} inserted, ${updated} updated, ${errors} errors`
    );

    return NextResponse.json({
      success: true,
      message: `Synced ${vendors.length} vendors`,
      stats: {
        total: vendors.length,
        inserted,
        updated,
        errors,
      },
      errors: errors > 0 ? errorDetails : undefined,
    });
  } catch (error) {
    console.error("❌ Error syncing vendors:", error);

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
 * Map Brex vendor API response to database row
 */
function mapVendorToRow(vendor: BrexVendor) {
  // Extract payment account details from the first payment account in the array
  const firstPaymentAccount =
    vendor.payment_accounts && vendor.payment_accounts.length > 0
      ? vendor.payment_accounts[0]
      : null;
  const paymentDetails = firstPaymentAccount?.details || null;

  // Extract address from the first address in the address array
  const firstAddress =
    firstPaymentAccount?.address && firstPaymentAccount.address.length > 0
      ? firstPaymentAccount.address[0]
      : null;

  return {
    brex_vendor_id: vendor.id,
    name: vendor.company_name || null,
    email: vendor.email || null,
    payment_instrument_id: paymentDetails?.payment_instrument_id || null,
    routing_number: paymentDetails?.routing_number || null,
    account_number: paymentDetails?.account_number || null,
    bank_account_type: paymentDetails?.account_type || null, // RENAMED: was account_type
    payment_account_address_line1: firstAddress?.line1 || null, // RENAMED: was address_line1
    payment_account_address_line2: firstAddress?.line2 || null, // RENAMED: was address_line2
    payment_account_city: firstAddress?.city || null, // RENAMED: was city
    payment_account_state: firstAddress?.state || null, // RENAMED: was state
    payment_account_postal_code: firstAddress?.postal_code || null, // RENAMED: was postal_code
    payment_account_country: firstAddress?.country || null, // RENAMED: was country
    phone: vendor.phone || null,
    vendor_type: null, // Not available in Brex API - reserved for manual categorization
    updated_at: new Date().toISOString(),
    synced_at: new Date().toISOString(),
    raw_payload: vendor as Record<string, unknown>,
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
      .from("api_brex_vendors")
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
      .from("api_brex_vendors")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      success: true,
      lastSync: lastSync?.synced_at || null,
      totalVendors: count || 0,
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
