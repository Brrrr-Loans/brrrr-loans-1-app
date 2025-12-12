import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase-server";

// Route segment config for App Router
export const maxDuration = 60; // Allow longer uploads (seconds)
export const dynamic = "force-dynamic";

/**
 * Server-side file upload API
 *
 * This endpoint handles file uploads using the service role key,
 * bypassing the Clerk/Supabase owner_id UUID incompatibility issue.
 *
 * Only admins can upload files (checked via auth_clerk_users table).
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create service role client
    const supabase = createServiceRoleClient();

    // Check if user is an admin
    const { data: user, error: userError } = await supabase
      .from("auth_clerk_users")
      .select("role, is_internal_yn")
      .eq("clerk_user_id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 403 });
    }

    if (user.role !== "admin" || !user.is_internal_yn) {
      return NextResponse.json(
        { error: "Only admins can upload files" },
        { status: 403 }
      );
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucketName = formData.get("bucket") as string | null;
    const filePath = formData.get("path") as string | null;

    if (!file || !bucketName || !filePath) {
      return NextResponse.json(
        { error: "Missing required fields: file, bucket, path" },
        { status: 400 }
      );
    }

    // Validate bucket (only allow specific buckets)
    const allowedBuckets = [
      "investors",
      "transaction-documents",
      "document_upload",
    ];
    if (!allowedBuckets.includes(bucketName)) {
      return NextResponse.json(
        { error: `Invalid bucket: ${bucketName}` },
        { status: 400 }
      );
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage using service role
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      path: data.path,
      fullPath: data.fullPath,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
