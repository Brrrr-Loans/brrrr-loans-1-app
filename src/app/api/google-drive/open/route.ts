import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * Google Drive Open URL Handler
 *
 * This route handles requests from Google Drive when users click "Open with [Your App]"
 * It:
 * 1. Receives the Google Drive file ID
 * 2. Attempts to fetch file metadata to get the filename
 * 3. Extracts the transaction ID from the filename pattern (Transaction-{id}-{date}.pdf)
 * 4. Redirects to the transaction detail page
 *
 * Note: Fetching file metadata requires an access token. If we can't get one,
 * we'll redirect to the transactions page and let the user find it manually.
 */

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    // Google Drive passes the file ID in the 'state' parameter
    const fileId = url.searchParams.get("state") || url.searchParams.get("id");
    
    // Log for debugging (remove in production if needed)
    console.log("Google Drive Open URL called:", {
      fileId,
      pathname: url.pathname,
      searchParams: url.searchParams.toString(),
      userAgent: request.headers.get("user-agent"),
    });

    // Google Console validates the URL by making a request with {FILE_ID} literally
    // We need to return a 200 OK response for validation, even without auth
    // Check if this is a validation request (no file ID, or literal {FILE_ID} placeholder)
    // Handle both URL-encoded and plain versions
    const decodedFileId = fileId ? decodeURIComponent(fileId) : null;
    const isValidationRequest = 
      !fileId || 
      !decodedFileId ||
      fileId === "{FILE_ID}" || 
      fileId === "{fileId}" ||
      fileId === "FILE_ID" || // Google might send without braces
      decodedFileId === "{FILE_ID}" ||
      decodedFileId === "{fileId}" ||
      decodedFileId === "FILE_ID" ||
      fileId.includes("{") ||
      decodedFileId.includes("{") ||
      fileId.toLowerCase() === "file_id" ||
      decodedFileId.toLowerCase() === "file_id";

    if (isValidationRequest) {
      // Return 200 OK for Google Console validation
      // Google expects a simple 200 response
      console.log("Returning validation response");
      return new NextResponse("OK", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Actual file opening request - check authentication
    const { userId } = await auth();
    if (!userId) {
      // If user is not authenticated, redirect to sign in
      // After sign in, they'll be redirected back to open the file
      return NextResponse.redirect(
        new URL(
          `/sign-in?redirect=${encodeURIComponent(`/api/google-drive/open?state=${fileId}`)}`,
          request.url
        )
      );
    }

    // Try to get file metadata from Google Drive
    // This requires an access token. We'll attempt to get it from the user's session
    // or prompt them to authorize if needed.
    
    // For now, we'll redirect to transactions page
    // In the future, you could:
    // 1. Store Google Drive file ID -> transaction ID mapping in database when uploading
    // 2. Use a service account to fetch file metadata
    // 3. Prompt user to re-authorize if needed
    
    // Attempt to extract transaction ID from filename if we can get file metadata
    // For now, redirect to transactions page - users can search if needed
    return NextResponse.redirect(
      new URL(
        `/balance-sheet/transactions?drive_file_id=${fileId}`,
        request.url
      )
    );
  } catch (error) {
    console.error("Google Drive open error:", error);
    // Return 200 even on error for validation requests
    const url = new URL(request.url);
    const fileId = url.searchParams.get("state") || url.searchParams.get("id");
    
    const isValidationRequest = 
      !fileId || 
      fileId === "{FILE_ID}" || 
      fileId === "{fileId}" ||
      fileId.includes("{");
    
    if (isValidationRequest) {
      return new NextResponse("OK", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return NextResponse.redirect(
      new URL(`/balance-sheet/transactions?error=open_failed`, request.url)
    );
  }
}

/**
 * Helper function to fetch file metadata from Google Drive
 * Requires an access token (user auth or service account)
 */
async function getFileMetadata(
  fileId: string,
  accessToken: string
): Promise<GoogleDriveFile | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch file metadata:", await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching file metadata:", error);
    return null;
  }
}

/**
 * Extract transaction ID from filename
 * Filename pattern: Transaction-{transactionId}-{date}.pdf
 */
function extractTransactionId(filename: string): number | null {
  const match = filename.match(/Transaction-(\d+)-/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}

