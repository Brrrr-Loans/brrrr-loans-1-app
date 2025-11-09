import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * Google Drive OAuth Authorization Route
 *
 * This route initiates the OAuth flow with Google Drive.
 * It redirects the user to Google's authorization page with the transaction ID
 * stored in the 'state' parameter.
 */

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(
        new URL("/sign-in?redirect=/balance-sheet/transactions", request.url)
      );
    }

    const url = new URL(request.url);
    const transactionId = url.searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.redirect(
        new URL(
          `/balance-sheet/transactions?error=missing_transaction_id`,
          request.url
        )
      );
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${url.origin}/api/google-drive/callback`;

    if (!clientId) {
      console.error("Google Drive client ID not configured");
      return NextResponse.redirect(
        new URL(
          `/balance-sheet/transactions?error=google_not_configured`,
          request.url
        )
      );
    }

    // Build Google OAuth authorization URL
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "https://www.googleapis.com/auth/drive.file");
    authUrl.searchParams.set("access_type", "offline"); // Request refresh token
    authUrl.searchParams.set("prompt", "consent"); // Force consent screen to get refresh token
    authUrl.searchParams.set("state", transactionId); // Store transaction ID in state

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error("Google Drive authorize error:", error);
    return NextResponse.redirect(
      new URL(`/balance-sheet/transactions?error=authorize_failed`, request.url)
    );
  }
}

