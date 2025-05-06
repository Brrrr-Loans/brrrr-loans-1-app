import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await getSupabaseClient();
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const category = searchParams.get("category");
    const dealId = searchParams.get("dealId");
    const search = searchParams.get("search");

    // Get documents uploaded by this user
    let query = supabase
      .from("document_files")
      .select("*")
      .eq("uploaded_at", userId);

    // Apply filters
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (dealId && dealId !== "all-deals") {
      if (dealId === "multiple") {
        query = query.eq("deal_id", "multiple");
      } else {
        query = query.eq("deal_id", dealId);
      }
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,id.ilike.%${search}%`);
    }

    // Order by upload date descending (newest first)
    query = query.order("uploaded_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      if (error instanceof Response) {
        const errJson = await error.json();
        console.error("Error fetching documents:", errJson);
      } else {
        console.error("Error fetching documents:", error);
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await getSupabaseClient();
    const body = await request.json();
    const { name, deal_id, category, file_type, file_size, file_url } = body;

    // Generate a document ID
    const documentId = `DOC-${Math.floor(100000 + Math.random() * 900000)}`;

    // Insert document record
    const { data, error } = await supabase
      .from("document_files")
      .insert({
        id: documentId,
        name,
        deal_id,
        category,
        file_type,
        file_size,
        file_url,
        uploaded_by: userId,
        uploaded_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Error creating document:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0] || { id: documentId });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
