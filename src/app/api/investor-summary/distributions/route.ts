import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const supabase = createServiceRoleClient();
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for impersonation
    const url = new URL(request.url);
    const impersonatedUserIdParam = url.searchParams.get("impersonate_user_id");
    
    let targetUserId: number;

    if (impersonatedUserIdParam) {
      targetUserId = parseInt(impersonatedUserIdParam);
    } else {
      const { data: currentUser } = await supabase
        .from("auth_clerk_users")
        .select("id")
        .eq("clerk_user_id", clerkUserId)
        .single();

      if (!currentUser) {
        return NextResponse.json([]);
      }

      targetUserId = currentUser.id;
    }

    // Get distributions for this user
    const { data, error } = await supabase
      .from("bsi_transactions")
      .select(
        `
        id,
        transaction_amount,
        transaction_status,
        transaction_date,
        bsi_transactions_investors!inner(clerk_user_id)
      `
      )
      .eq("bsi_transactions_investors.clerk_user_id", targetUserId)
      .eq("ledger_entry_type", "distribution")
      .order("transaction_date", { ascending: false });

    if (error) throw error;

    // Map to expected format
    const distributions = (data || []).map((tx) => ({
      total_payment_amount: parseFloat(tx.transaction_amount || "0"),
      payment_date: tx.transaction_date,
      status: tx.transaction_status || "pending",
    }));

    return NextResponse.json(distributions);
  } catch (error) {
    console.error("Error fetching distributions:", error);
    return NextResponse.json([]);
  }
}

