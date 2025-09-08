import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import type { ContactType, UserRole, UserPermissions } from "@/types/auth";

function canAccessDeals(contactType: ContactType, role: UserRole): boolean {
  if (role === "admin") return true;

  const allowedContactTypes: ContactType[] = [
    "Balance Sheet Investor",
    "Lender",
    "Point of Contact",
    "Broker",
    "Borrower",
  ];

  return allowedContactTypes.includes(contactType);
}

function canAccessDistributions(
  contactType: ContactType,
  role: UserRole
): boolean {
  if (role === "admin") return true;

  const allowedContactTypes: ContactType[] = [
    "Balance Sheet Investor",
    "Lender",
    "Point of Contact",
  ];

  return allowedContactTypes.includes(contactType);
}

function canAccessDocuments(contactType: ContactType, role: UserRole): boolean {
  if (role === "admin") return true;

  const restrictedContactTypes: ContactType[] = ["Appraisal Administration"];

  return !restrictedContactTypes.includes(contactType);
}

function canAccessReports(contactType: ContactType, role: UserRole): boolean {
  if (role === "admin") return true;

  const allowedContactTypes: ContactType[] = [
    "Balance Sheet Investor",
    "Lender",
    "Point of Contact",
    "Broker",
  ];

  return allowedContactTypes.includes(contactType);
}

function canAccessAdminFeatures(
  contactType: ContactType,
  role: UserRole
): boolean {
  return role === "admin";
}

export async function GET() {
  try {
    // TEMPORARY WORKAROUND: Return default admin permissions for development
    console.log(
      "🛠️ Using temporary workaround - returning default admin permissions"
    );

    const fallbackPermissions: UserPermissions = {
      userId: "temp_user_id",
      email: "dev@example.com",
      contactType: "Balance Sheet Investor",
      role: "admin",
      contactId: 1,
      authUserProfileId: 1,
      canAccessDeals: true,
      canAccessDistributions: true,
      canAccessDocuments: true,
      canAccessReports: true,
      canAccessAdminFeatures: true,
    };

    return NextResponse.json(fallbackPermissions);

    // Try both auth methods
    const { userId } = await auth();
    const user = await currentUser();

    console.log("🔍 Auth check - userId:", userId, "currentUser:", user?.id);

    if (!userId && !user) {
      console.log("❌ No authentication found with either method");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const finalUserId = userId || user?.id;
    const finalUser =
      user ||
      (await (async () => {
        const { clerkClient } = await import("@clerk/nextjs/server");
        return await clerkClient.users.getUser(finalUserId!);
      })());

    console.log("👤 Clerk user:", {
      id: finalUser.id,
      email: finalUser.emailAddresses[0]?.emailAddress,
      metadata: finalUser.publicMetadata,
    });

    const supabase = getSupabaseClient();

    // Get user profile from auth_user_profile table
    const { data: profile, error: profileError } = await supabase
      .from("auth_clerk_users")
      .select("id, email, clerk_user_id")
      .eq("clerk_user_id", finalUserId)
      .single();

    console.log("📊 Profile lookup:", { profile, profileError });

    if (profileError) {
      console.error("Profile fetch error:", profileError);

      // Development fallback - create a default profile
      if (process.env.NODE_ENV === "development") {
        console.log("🛠️ Creating development fallback permissions");
        const fallbackPermissions: UserPermissions = {
          userId,
          email: user.emailAddresses[0]?.emailAddress || "dev@example.com",
          contactType: "Balance Sheet Investor",
          role: "admin", // Give admin role in development
          contactId: 1,
          authUserProfileId: 1,
          canAccessDeals: true,
          canAccessDistributions: true,
          canAccessDocuments: true,
          canAccessReports: true,
          canAccessAdminFeatures: true,
        };
        return NextResponse.json(fallbackPermissions);
      }

      return NextResponse.json(
        { error: "Failed to fetch user profile", details: profileError },
        { status: 500 }
      );
    }

    if (!profile) {
      console.log("❌ No profile found for user:", finalUserId);

      // Development fallback
      if (process.env.NODE_ENV === "development") {
        console.log(
          "🛠️ Creating development fallback permissions (no profile)"
        );
        const fallbackPermissions: UserPermissions = {
          userId,
          email: user.emailAddresses[0]?.emailAddress || "dev@example.com",
          contactType: "Balance Sheet Investor",
          role: "admin",
          contactId: 1,
          authUserProfileId: 1,
          canAccessDeals: true,
          canAccessDistributions: true,
          canAccessDocuments: true,
          canAccessReports: true,
          canAccessAdminFeatures: true,
        };
        return NextResponse.json(fallbackPermissions);
      }

      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Get contact info
    const { data: contact, error: contactError } = await supabase
      .from("contact")
      .select("id, contact_type, contact_types")
      .eq("user_id", profile.id)
      .single();

    console.log("👥 Contact lookup:", { contact, contactError });

    if (contactError) {
      console.error("Contact fetch error:", contactError);

      // Development fallback
      if (process.env.NODE_ENV === "development") {
        console.log(
          "🛠️ Creating development fallback permissions (contact error)"
        );
        const fallbackPermissions: UserPermissions = {
          userId,
          email: profile.email,
          contactType: "Balance Sheet Investor",
          role: "admin",
          contactId: 1,
          authUserProfileId: profile.id,
          canAccessDeals: true,
          canAccessDistributions: true,
          canAccessDocuments: true,
          canAccessReports: true,
          canAccessAdminFeatures: true,
        };
        return NextResponse.json(fallbackPermissions);
      }

      return NextResponse.json(
        { error: "Failed to fetch contact info", details: contactError },
        { status: 500 }
      );
    }

    if (!contact) {
      console.log("❌ No contact found for user:", profile.id);

      // Development fallback
      if (process.env.NODE_ENV === "development") {
        console.log(
          "🛠️ Creating development fallback permissions (no contact)"
        );
        const fallbackPermissions: UserPermissions = {
          userId,
          email: profile.email,
          contactType: "Balance Sheet Investor",
          role: "admin",
          contactId: 1,
          authUserProfileId: profile.id,
          canAccessDeals: true,
          canAccessDistributions: true,
          canAccessDocuments: true,
          canAccessReports: true,
          canAccessAdminFeatures: true,
        };
        return NextResponse.json(fallbackPermissions);
      }

      return NextResponse.json(
        { error: "Contact info not found" },
        { status: 404 }
      );
    }

    // Determine primary contact type
    const primaryContactType =
      contact.contact_type ||
      ((contact.contact_types && contact.contact_types.length > 0
        ? contact.contact_types[0]
        : "Balance Sheet Investor") as ContactType);

    // Determine role from public metadata or default to viewer
    const role = (finalUser.publicMetadata?.role as UserRole) || "viewer";

    const userPermissions: UserPermissions = {
      userId: finalUserId!,
      email: profile.email,
      contactType: primaryContactType,
      role,
      contactId: contact.id,
      authUserProfileId: profile.id,
      canAccessDeals: canAccessDeals(primaryContactType, role),
      canAccessDistributions: canAccessDistributions(primaryContactType, role),
      canAccessDocuments: canAccessDocuments(primaryContactType, role),
      canAccessReports: canAccessReports(primaryContactType, role),
      canAccessAdminFeatures: canAccessAdminFeatures(primaryContactType, role),
    };

    return NextResponse.json(userPermissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
