import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { randomUUID } from "crypto";

// Route segment config for App Router
export const maxDuration = 60; // Allow longer uploads (seconds)
export const dynamic = "force-dynamic";

/**
 * Server-side file upload API for Deal Documents ('documents' bucket)
 *
 * This endpoint handles file uploads for deal-linked documents:
 * 1. Verifies user is an internal admin
 * 2. Creates document_files record
 * 3. Creates deal link in document_files_deals (if dealId provided)
 * 4. Uploads file to storage
 * 5. Updates uploaded_at to finalize
 *
 * Access Control:
 * - Document access is derived from deal roles, not org membership
 * - Users with roles on the linked deal get access based on their
 *   deal_role + document_access_permissions per category
 * - The uploaded_by field tracks who uploaded for audit purposes
 *
 * Uses service_role for database operations to bypass RLS.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create service role client for all operations
    const supabase = createServiceRoleClient();

    // Check if user is an internal admin
    const { data: user, error: userError } = await supabase
      .from("auth_clerk_users")
      .select("id, personal_role, is_internal_yn")
      .eq("clerk_user_id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 403 });
    }

    if (user.personal_role !== "admin" || !user.is_internal_yn) {
      return NextResponse.json(
        { error: "Only internal admins can upload deal documents" },
        { status: 403 },
      );
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentName = formData.get("documentName") as string | null;
    const documentCategoryId = formData.get("documentCategoryId") as
      | string
      | null;
    const dealId = formData.get("dealId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Missing required field: file" },
        { status: 400 },
      );
    }

    if (!documentCategoryId) {
      return NextResponse.json(
        { error: "Missing required field: documentCategoryId" },
        { status: 400 },
      );
    }

    // Generate storage path
    const fileExt = file.name.split(".").pop() || "bin";
    const uniqueId = randomUUID();
    const storagePath = `docs/${uniqueId}.${fileExt}`;
    const finalDocName = documentName || file.name;

    // Step 1: Create document_files record
    const { data: docRecord, error: docError } = await supabase
      .from("document_files")
      .insert({
        document_name: finalDocName,
        document_category_id: parseInt(documentCategoryId, 10),
        storage_bucket: "documents",
        storage_path: storagePath,
        file_type: file.type || null,
        file_size: file.size,
        uploaded_by: userId,
      })
      .select("id")
      .single();

    if (docError || !docRecord) {
      console.error("Error creating document_files record:", docError);
      return NextResponse.json(
        { error: docError?.message || "Failed to create document record" },
        { status: 500 },
      );
    }

    const documentFileId = docRecord.id;

    // Step 2: Create deal link if dealId provided
    // Note: Document access is derived from deal roles, not org membership
    if (dealId) {
      const { error: linkError } = await supabase
        .from("document_files_deals")
        .insert({
          document_file_id: documentFileId,
          deal_id: parseInt(dealId, 10),
          created_by: userId,
        });

      if (linkError) {
        console.error("Error creating deal link:", linkError);
        // Clean up the document record
        await supabase.from("document_files").delete().eq("id", documentFileId);
        return NextResponse.json(
          { error: linkError.message || "Failed to create deal link" },
          { status: 500 },
        );
      }
    }

    // Step 3: Upload file to storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      // Clean up the document record
      await supabase.from("document_files").delete().eq("id", documentFileId);
      return NextResponse.json(
        { error: uploadError.message || "Failed to upload file" },
        { status: 500 },
      );
    }

    // Step 4: Finalize by setting uploaded_at
    const { error: finalizeError } = await supabase
      .from("document_files")
      .update({ uploaded_at: new Date().toISOString() })
      .eq("id", documentFileId);

    if (finalizeError) {
      console.error("Error finalizing upload:", finalizeError);
      // File is uploaded but not finalized - non-critical
    }

    return NextResponse.json({
      success: true,
      documentFileId,
      storagePath,
      dealLinked: !!dealId,
      finalized: !finalizeError,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
