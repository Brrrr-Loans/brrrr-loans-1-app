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

    // Get deals for this user via bsi_deals (links investors to deals)
    const { data, error } = await supabase
      .from("bsi_deals")
      .select(
        `
        id,
        deal:deal_id(
        id,
        deal_name,
          deal_disposition_1
        )
      `
      )
      .eq("auth_clerk_users_id", targetUserId);

    if (error) {
      // Fallback: just return empty array if query fails
      console.error("Error fetching deals:", error);
      return NextResponse.json([]);
    }

    // Map to expected format - get status from the linked deal
    const deals = (data || [])
      .filter((row) => row.deal) // Filter out rows without a linked deal
      .map((row) => ({
        status: row.deal?.deal_disposition_1 || "unknown",
    }));

    return NextResponse.json(deals);
  } catch (error) {
    console.error("Error fetching deals:", error);
    return NextResponse.json([]);
  }
}

