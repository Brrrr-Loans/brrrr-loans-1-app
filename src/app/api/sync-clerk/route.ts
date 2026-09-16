import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { syncExistingClerkData } from "../../../../scripts/sync-clerk-data";
import {
  CLERK_SYNC_SECRET_HEADER,
  authorizeClerkSync,
  parseSyncClerkScope,
} from "@/lib/clerk-org-sync";

/**
 * Manual Clerk → Supabase backfill.
 *
 * GET/POST /api/sync-clerk?clerk_org_id=org_...
 *
 * Auth: platform admin session OR `x-clerk-sync-secret` / Bearer matching
 * `CLERK_SYNC_SECRET`. The route stays public in middleware so curl works;
 * this handler still returns 401 without one of those.
 */
async function authorizeSyncRequest(request: Request): Promise<boolean> {
  const { userId } = await auth();
  let email: string | null = null;
  if (userId) {
    const user = await currentUser();
    email = user?.primaryEmailAddress?.emailAddress
      ?? user?.emailAddresses?.[0]?.emailAddress
      ?? null;
  }

  return authorizeClerkSync({
    secretHeader: request.headers.get(CLERK_SYNC_SECRET_HEADER),
    authorizationHeader: request.headers.get("authorization"),
    expectedSecret: process.env.CLERK_SYNC_SECRET ?? null,
    clerkUserId: userId,
    email,
  });
}

function unauthorized() {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}

async function runSync(request: Request, body?: unknown) {
  if (!(await authorizeSyncRequest(request))) {
    return unauthorized();
  }

  const scope = parseSyncClerkScope({
    searchParams: new URL(request.url).searchParams,
    body,
  });

  if (scope.mode === "invalid") {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid clerk_org_id "${scope.value}". Expected an id starting with org_.`,
      },
      { status: 400 }
    );
  }

  const clerkOrgId = scope.mode === "one" ? scope.clerkOrgId : undefined;
  const result = await syncExistingClerkData({ clerkOrgId });
  return NextResponse.json({
    success: true,
    message: clerkOrgId
      ? `Clerk org ${clerkOrgId} synced`
      : "Clerk data sync completed",
    ...result,
  });
}

export async function GET(request: Request) {
  try {
    return await runSync(request);
  } catch (error) {
    console.error("Clerk sync failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    return await runSync(request, body);
  } catch (error) {
    console.error("Clerk sync failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
