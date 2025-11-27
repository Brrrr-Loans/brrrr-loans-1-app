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

    // Get deals for this user (via transactions)
    const { data, error } = await supabase
      .from("bsi_deals")
      .select(
        `
        id,
        deal_name,
        status,
        bsi_transactions_deals!inner(
          transaction_id,
          bsi_transactions!inner(
            bsi_transactions_investors!inner(clerk_user_id)
          )
        )
      `
      )
      .eq("bsi_transactions_deals.bsi_transactions.bsi_transactions_investors.clerk_user_id", targetUserId);

    if (error) {
      // Fallback: just return empty array if query fails
      console.error("Error fetching deals:", error);
      return NextResponse.json([]);
    }

    // Map to expected format
    const deals = (data || []).map((deal) => ({
      status: deal.status || "active",
    }));

    return NextResponse.json(deals);
  } catch (error) {
    console.error("Error fetching deals:", error);
    return NextResponse.json([]);
  }
}

