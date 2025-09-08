import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";
import type { Tables } from "@/types/supabase";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const investorIdParam = url.searchParams.get("investorId");
    // const orgId = url.searchParams.get("orgId"); // Not used

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await getSupabaseClient();

    // Map Clerk userId to contact_id (investor_id) using user_profile
    const { data: profile, error: profileError } = await supabase
      .from("auth_clerk_users")
      .select("contact_id, role")
      .eq("clerk_user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    let investorId: number | null = null;
    if (investorIdParam) {
      const parsedInvestorId = parseInt(investorIdParam, 10);
      if (isNaN(parsedInvestorId)) {
        return NextResponse.json(
          { error: "Invalid investor ID" },
          { status: 400 }
        );
      }
      investorId = parsedInvestorId;
    } else {
      investorId = Number(profile.contact_id ?? 0);
    }

    // Only query bsi_statements
    let query = supabase
      .from("bsi_statements")
      .select("*")
      .eq("investor_id", investorId);
    query = query.order("statement_date", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching investor statements:", error);
      return NextResponse.json(
        { error: "Failed to fetch investor statements" },
        { status: 500 }
      );
    }

    return NextResponse.json({ statements: data });
  } catch (error) {
    console.error("Error in investor statements API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
