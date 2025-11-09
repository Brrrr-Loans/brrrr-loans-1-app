import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * Google Drive OAuth Callback Handler
 *
 * This route handles the OAuth callback from Google after user authorization.
 * It:
 * 1. Exchanges the authorization code for an access token
 * 2. Generates a PDF of the transaction detail page
 * 3. Uploads the PDF to Google Drive
 * 4. Redirects back to the transactions page
 */

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(
        new URL("/sign-in?redirect=/balance-sheet/transactions", request.url)
      );
    }

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // Transaction ID
    const error = url.searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        new URL(
          `/balance-sheet/transactions?error=google_auth_failed`,
          request.url
        )
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL(
          `/balance-sheet/transactions?error=missing_parameters`,
          request.url
        )
      );
    }

    const transactionId = parseInt(state, 10);
    if (isNaN(transactionId)) {
      return NextResponse.redirect(
        new URL(
          `/balance-sheet/transactions?error=invalid_transaction_id`,
          request.url
        )
      );
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${url.origin}/api/google-drive/callback`;

    if (!clientId || !clientSecret) {
      console.error("Google Drive credentials not configured");
      return NextResponse.redirect(
        new URL(
          `/balance-sheet/transactions?error=google_not_configured`,
          request.url
        )
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange error:", errorData);
      return NextResponse.redirect(
        new URL(
          `/balance-sheet/transactions?error=token_exchange_failed`,
          request.url
        )
      );
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Generate PDF of transaction detail page
    // Use a print-friendly view with query parameter
    // If you create a dedicated detail page at /balance-sheet/transactions/[id], use that instead
    const transactionUrl = `${url.origin}/balance-sheet/transactions?transaction=${transactionId}&print=true`;

    // Generate PDF using Playwright
    const pdfBuffer = await generateTransactionPDF(transactionUrl);

    // Upload PDF to Google Drive
    const driveFileId = await uploadToGoogleDrive(
      pdfBuffer,
      `Transaction-${transactionId}-${new Date().toISOString().split("T")[0]}.pdf`,
      accessToken
    );

    if (driveFileId) {
      return NextResponse.redirect(
        new URL(
          `/balance-sheet/transactions?success=uploaded_to_drive&file_id=${driveFileId}`,
          request.url
        )
      );
    } else {
      return NextResponse.redirect(
        new URL(`/balance-sheet/transactions?error=upload_failed`, request.url)
      );
    }
  } catch (error) {
    console.error("Google Drive callback error:", error);
    return NextResponse.redirect(
      new URL(`/balance-sheet/transactions?error=unexpected_error`, request.url)
    );
  }
}

/**
 * Generate PDF from transaction detail page using Playwright
 */
async function generateTransactionPDF(transactionUrl: string): Promise<Buffer> {
  try {
    // Dynamic import to avoid loading Playwright in production if not needed
    const { chromium } = await import("playwright");

    const browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage();

    // Navigate to transaction detail page
    await page.goto(transactionUrl, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    // Fallback: Return empty buffer or throw
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Upload file to Google Drive
 */
async function uploadToGoogleDrive(
  fileBuffer: Buffer,
  fileName: string,
  accessToken: string
): Promise<string | null> {
  try {
    // Create file metadata
    const metadata = {
      name: fileName,
      mimeType: "application/pdf",
    };

    // For multipart upload, we need to construct the body manually
    const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`;
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadataPart = JSON.stringify(metadata);
    const body = Buffer.concat([
      Buffer.from(delimiter),
      Buffer.from("Content-Type: application/json\r\n\r\n"),
      Buffer.from(metadataPart),
      Buffer.from(`\r\n--${boundary}\r\n`),
      Buffer.from("Content-Type: application/pdf\r\n\r\n"),
      fileBuffer,
      Buffer.from(closeDelimiter),
    ]);

    const uploadResponse = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: body,
      }
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.text();
      console.error("Google Drive upload error:", errorData);
      return null;
    }

    const fileData = await uploadResponse.json();
    return fileData.id || null;
  } catch (error) {
    console.error("Error uploading to Google Drive:", error);
    return null;
  }
}
