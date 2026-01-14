import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";
import type { Tables, TablesInsert } from "@/types/database.types";

const validCategories = [
  "application",
  "appraisal",
  "assets",
  "closing",
  "credit_and_background",
  "construction",
  "environmental",
  "experience",
  "id",
  "insurance",
  "pricing",
  "property",
  "seasoning",
  "servicing",
  "title",
  "entity",
] as const;
type CategoryType = (typeof validCategories)[number];

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await getSupabaseClient();
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const category = searchParams.get("category") ?? "";
    const dealId = searchParams.get("dealId") ?? "";
    const search = searchParams.get("search") ?? "";

    // Get documents uploaded by this user
    let query = supabase
      .from("document_files")
      .select("*")
      .eq("uploaded_by", userId ?? "");

    // Apply category filter
    if (
      category &&
      category !== "all" &&
      validCategories.includes(category as CategoryType)
    ) {
      query = query.eq("document_category", category as CategoryType);
    }

    // Note: dealId filtering now requires a JOIN with document_files_deals junction table
    // For now, we skip deal filtering here - implement in a separate query if needed
    // TODO: If dealId filtering is required, query document_files_deals first to get document_file_ids

    if (search) {
      query = query.or(
        `document_name.ilike.%${search}%,public_notes.ilike.%${search}%`
      );
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

    return NextResponse.json((data || []) as Tables<"document_files">[]);
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
    const {
      document_name,
      category,
      file_type,
      file_size,
      storage_bucket,
      storage_path,
      deal_ids, // Array of deal IDs to link (optional)
    } = body;

    // Insert document record
    const categoryValue = validCategories.includes(category as CategoryType)
      ? (category as CategoryType)
      : undefined;

    const insertObj: TablesInsert<"document_files"> = {
      document_name,
      document_category: categoryValue,
      file_type,
      file_size,
      storage_bucket,
      storage_path,
      uploaded_by: userId,
      uploaded_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("document_files")
      .insert(insertObj)
      .select()
      .single();

    if (error) {
      console.error("Error creating document:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If deal_ids provided, create junction table entries
    if (deal_ids && Array.isArray(deal_ids) && deal_ids.length > 0 && data) {
      const junctionEntries = deal_ids.map((dealId: number) => ({
        document_file_id: data.id,
        deal_id: dealId,
        created_by: userId,
      }));

      const { error: junctionError } = await supabase
        .from("document_files_deals")
        .insert(junctionEntries);

      if (junctionError) {
        console.error("Error linking document to deals:", junctionError);
        // Document was created, but linking failed - still return success with warning
        return NextResponse.json({
          ...data,
          warning: "Document created but failed to link to deals",
        });
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
