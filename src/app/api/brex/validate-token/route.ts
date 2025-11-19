import { NextResponse } from "next/server";
import { validateBrexToken } from "@/lib/brex/client";

/**
 * Validate Brex API token
 * GET /api/brex/validate-token
 */
export async function GET() {
  try {
    const result = await validateBrexToken();
    
    return NextResponse.json({
      success: true,
      valid: result.valid,
      error: result.error || null,
    });
  } catch (error) {
    console.error("❌ Error validating Brex token:", error);
    return NextResponse.json(
      {
        success: false,
        valid: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

