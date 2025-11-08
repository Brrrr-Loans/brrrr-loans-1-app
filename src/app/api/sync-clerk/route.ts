import { NextResponse } from "next/server";
import { syncExistingClerkData } from "../../../../scripts/sync-clerk-data";

/**
 * API endpoint to manually trigger sync of existing Clerk data
 * GET /api/sync-clerk
 */
export async function GET(_request: Request) {
  try {
    console.log("🔄 Manual sync triggered via API");
    await syncExistingClerkData();

    return NextResponse.json({
      success: true,
      message: "Clerk data sync completed successfully",
    });
  } catch (error) {
    console.error("Sync failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Require authentication for this endpoint in production
 */
export async function POST(request: Request) {
  // You could add auth checks here if needed
  return GET(request);
}
