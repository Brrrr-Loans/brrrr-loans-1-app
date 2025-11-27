import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";

/**
 * Preview the impact of matching transfers to a vendor
 * POST /api/brex/match-impact-preview
 * Body: { transfer_ids: number[], vendor_id: number }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    const body = await request.json();

    const { transfer_ids, vendor_id } = body;

    if (!transfer_ids || transfer_ids.length === 0 || !vendor_id) {
      return NextResponse.json(
        { error: "transfer_ids and vendor_id are required" },
        { status: 400 }
      );
    }

    console.log(
      `🔍 Previewing impact of matching ${transfer_ids.length} transfer(s) to vendor ${vendor_id}...`
    );

    // Get transfers
    const { data: transfers, error: transfersError } = await supabase
      .from("api_brex_transfers")
      .select("id, brex_transfer_id, amount, amount_cents, process_date, display_name")
      .in("id", transfer_ids);

    if (transfersError || !transfers) {
      throw new Error("Failed to fetch transfers");
    }

    // Get vendor (use left joins, not inner joins)
    const { data: vendor, error: vendorError } = await supabase
      .from("api_brex_vendors")
      .select(
        `
        id,
        name,
        email
      `
      )
      .eq("id", vendor_id)
      .single();

    if (vendorError || !vendor) {
      throw new Error("Failed to fetch vendor");
    }

    // Get clerk user matches separately
    const { data: userMatches } = await supabase
      .from("api_brex_vendors_clerk_users")
      .select(
        `
        clerk_user_id,
        auth_clerk_users!inner (
          id,
          full_name,
          email
        )
      `
      )
      .eq("brex_vendor_id", vendor_id);

    // Get clerk org matches separately
    const { data: orgMatches } = await supabase
      .from("api_brex_vendors_clerk_orgs")
      .select(
        `
        clerk_org_id,
        auth_clerk_orgs!inner (
          id,
          clerk_org_name
        )
      `
      )
      .eq("brex_vendor_id", vendor_id);

    // Determine allocations
    const clerkAllocations: Array<{
      type: "user" | "org";
      name: string;
      amount: number;
    }> = [];

    let willCreateTransactions = 0;
    let willSkipTransactions = 0;
    const warnings: string[] = [];

    const hasUserMatch = userMatches && userMatches.length > 0;
    const hasOrgMatch = orgMatches && orgMatches.length > 0;

    if (!hasUserMatch && !hasOrgMatch) {
      willSkipTransactions = transfers.length;
      warnings.push(
        `Vendor "${vendor.name}" has no clerk user or org matches. Transactions will be created but won't be allocated to any investors.`
      );
    } else {
      willCreateTransactions = transfers.length;

      // Calculate allocation per investor
      transfers.forEach((transfer) => {
        const amountDollars = transfer.amount_cents
          ? transfer.amount_cents / 100.0
          : transfer.amount
          ? transfer.amount / 100.0
          : 0;

        // Keep the sign - negative for contributions, positive for distributions
        const amount = amountDollars;

        if (hasUserMatch) {
          const userMatch = userMatches[0];
          const userName = userMatch.auth_clerk_users.full_name || "Unknown User";
          
          const existing = clerkAllocations.find((a) => a.name === userName && a.type === "user");
          if (existing) {
            existing.amount += amount;
          } else {
            clerkAllocations.push({
              type: "user",
              name: userName,
              amount: amount,
            });
          }
        } else if (hasOrgMatch) {
          const orgMatch = orgMatches[0];
          const orgName = orgMatch.auth_clerk_orgs.clerk_org_name || "Unknown Org";
          
          const existing = clerkAllocations.find((a) => a.name === orgName && a.type === "org");
          if (existing) {
            existing.amount += amount;
          } else {
            clerkAllocations.push({
              type: "org",
              name: orgName,
              amount: amount,
            });
          }
        }
      });
    }

    console.log(
      `✅ Impact preview: ${willCreateTransactions} transactions, ${clerkAllocations.length} allocations`
    );

    return NextResponse.json({
      success: true,
      preview: {
        transfer_count: transfers.length,
        will_create_transactions: willCreateTransactions,
        will_skip_transactions: willSkipTransactions,
        clerk_allocations: clerkAllocations,
        warnings,
        vendor_name: vendor.name,
      },
    });
  } catch (error) {
    console.error("❌ Error previewing match impact:", error);
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

