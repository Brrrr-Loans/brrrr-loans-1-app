// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Define which routes require authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/deals(.*)",
  "/balance-sheet(.*)",
  "/platform-settings(.*)",
  "/api/auth/permissions(.*)",
  "/api/deals(.*)",
  "/api/distributions(.*)",
  "/api/documents(.*)",
  "/api/investor-summary(.*)",
  "/api/storage(.*)",
  "/api/user-workflows(.*)",
  "/api/brex(.*)",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Allow specific API routes to be public (webhooks, sync operations)
  const publicApiRoutes = [
    "/api/webhooks",
    "/api/sync-clerk",
  ];
  if (publicApiRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    console.log("🔓 Allowing public API route:", req.nextUrl.pathname);
    return NextResponse.next();
  }

  // Allow public access to the /builder page (for both direct access and Builder.io)
  if (req.nextUrl.pathname === "/builder") {
    return NextResponse.next();
  }

  // Check if this is a Builder.io request by looking at various headers and patterns
  const userAgent = req.headers.get("user-agent") || "";
  const referer = req.headers.get("referer") || "";
  const builderHeader = req.headers.get("x-builder-io") || "";

  const isBuilderRequest =
    userAgent.includes("builder.io") ||
    userAgent.includes("Builder.io") ||
    referer.includes("builder.io") ||
    builderHeader === "true" ||
    // Also check for localhost requests that might be from Builder.io
    (req.headers.get("host")?.includes("localhost") &&
      req.headers.get("sec-fetch-site") === "cross-site");

  // Allow Builder.io requests to pass through without authentication
  if (isBuilderRequest) {
    return NextResponse.next();
  }

  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    const { userId } = await auth();

    console.log("🔒 Middleware check:", {
      path: req.nextUrl.pathname,
      isProtected: isProtectedRoute(req),
      userId: userId ? "present" : "missing",
      fullUserId: userId,
    });

    if (!userId) {
      console.log("❌ No userId found, redirecting to sign-in");
      // Redirect to sign-in page for protected routes
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    } else {
      console.log("✅ User authenticated, allowing access");
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
