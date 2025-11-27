import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

/**
 * Soft delete a transfer-vendor match
 * DELETE /api/brex/match-transfer-to-vendor/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceRoleClient();

    // Get current user for audit trail
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's database ID
    const { data: currentUser } = await supabase
      .from("auth_clerk_users")
      .select("id")
      .eq("clerk_user_id", clerkUserId)
      .single();

    const currentUserDbId = currentUser?.id || null;

    console.log(`🗑️ Soft deleting match ID ${id}...`);

    // Soft delete: Set deleted_at and deleted_by_user_id
    const { error } = await supabase
      .from("api_brex_transfers_vendors")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by_user_id: currentUserDbId,
      })
      .eq("id", parseInt(id))
      .is("deleted_at", null); // Only delete if not already deleted

    if (error) {
      console.error("❌ Error soft deleting match:", error);
      throw error;
    }

    console.log(`✅ Soft deleted match ID ${id}`);

    return NextResponse.json({
      success: true,
      message: "Match deleted successfully (synced transactions preserved)",
    });
  } catch (error) {
    console.error("❌ Error deleting match:", error);
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

