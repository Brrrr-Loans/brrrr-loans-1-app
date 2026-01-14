import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await getSupabaseClient();

    // First get the document to check ownership and get storage location
    const { data: document, error: fetchError } = await supabase
      .from("document_files")
      .select("*")
      .eq("id", parseInt(id))
      .eq("uploaded_by", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching document:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // The returned data is: Tables<"document_files"> | null
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete the file from storage if we have bucket and path
    if (document.storage_bucket && document.storage_path) {
      const { error: storageError } = await supabase.storage
        .from(document.storage_bucket)
        .remove([document.storage_path]);

      if (storageError) {
        console.error("Error deleting file from storage:", storageError);
        // Continue anyway to delete the database record
      }
    }

    // Delete the document record
    // Note: Junction table records will be deleted automatically via ON DELETE CASCADE
    const { error: deleteError } = await supabase
      .from("document_files")
      .delete()
      .eq("id", parseInt(id));

    if (deleteError) {
      console.error("Error deleting document record:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
