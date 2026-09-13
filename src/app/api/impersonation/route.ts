import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getImpersonationView,
  startImpersonationSession,
  stopImpersonationSession,
} from "@/lib/impersonation";

function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function requireSignedInUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}

function requestedUserIdFromBody(body: unknown): unknown {
  if (!body || typeof body !== "object") return null;
  return (body as { userId?: unknown }).userId;
}

export async function GET(): Promise<NextResponse> {
  const userId = await requireSignedInUserId();
  if (!userId) return unauthorized();

  return NextResponse.json(await getImpersonationView());
}

export async function POST(request: Request): Promise<NextResponse> {
  const userId = await requireSignedInUserId();
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => null);
  const result = await startImpersonationSession(requestedUserIdFromBody(body));
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    canImpersonate: true,
    isImpersonating: true,
    impersonatedUserId: result.impersonatedUserId,
    impersonatedUserName: result.impersonatedUserName,
  });
}

export async function DELETE(): Promise<NextResponse> {
  const userId = await requireSignedInUserId();
  if (!userId) return unauthorized();

  await stopImpersonationSession();
  return NextResponse.json(await getImpersonationView());
}
