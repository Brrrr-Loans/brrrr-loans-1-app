import { NextResponse } from "next/server";
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

function canAccessAdminFeatures(
  contactType: ContactType,
  role: UserRole
): boolean {
  return role === "admin";
}

export async function GET() {
  try {
    // Try both auth methods
    const { userId } = await auth();
    const user = await currentUser();

    console.log("🔍 Auth check - userId:", userId, "currentUser:", user?.id);

    if (!userId && !user) {
      console.log("❌ No authentication found with either method");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const finalUserId = userId || user?.id;

    if (!finalUserId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const finalUser =
      user ||
      (await (async () => {
        const { clerkClient } = await import("@clerk/nextjs/server");
        const client = await clerkClient();
        return await client.users.getUser(finalUserId as string);
      })());

    console.log("👤 Clerk user:", {
      id: finalUser.id,
      email: finalUser.emailAddresses[0]?.emailAddress,
      metadata: finalUser.publicMetadata,
    });

    const supabase = await getSupabaseClient();

    // Get user profile from auth_user_profile table
    const { data: profile, error: profileError } = await supabase
      .from("auth_clerk_users")
      .select("id, email, clerk_user_id")
      .eq("clerk_user_id", finalUserId as string)
      .single();

    console.log("📊 Profile lookup:", { profile, profileError });

    if (profileError) {
      console.error("Profile fetch error:", profileError);

      // Development fallback - create a default profile
      if (process.env.NODE_ENV === "development") {
        console.log("🛠️ Creating development fallback permissions");
        const fallbackPermissions: UserPermissions = {
          userId: finalUserId as string,
          email: finalUser.emailAddresses[0]?.emailAddress || "dev@example.com",
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
          userId: finalUserId as string,
          email: finalUser.emailAddresses[0]?.emailAddress || "dev@example.com",
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

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Confirm profile exists before using it
    const confirmedProfileForContact = profile!;

    // Get contact info
    const { data: contact, error: contactError } = await supabase
      .from("contact")
      .select("id, contact_type, contact_types")
      .eq("user_id", confirmedProfileForContact.id)
      .single();

    console.log("👥 Contact lookup:", { contact, contactError });

    if (contactError) {
      console.error("Contact fetch error:", contactError);

      // Development fallback
      if (process.env.NODE_ENV === "development") {
        console.log(
          "🛠️ Creating development fallback permissions (contact error)"
        );
        const profileEmail = profile?.email || "";
        const profileId = profile?.id || 1;
        const fallbackPermissions: UserPermissions = {
          userId: finalUserId as string,
          email: profileEmail,
          contactType: "Balance Sheet Investor",
          role: "admin",
          contactId: 1,
          authUserProfileId: profileId,
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
      console.log("❌ No contact found for user:", profile?.id);

      // Development fallback
      if (process.env.NODE_ENV === "development") {
        console.log(
          "🛠️ Creating development fallback permissions (no contact)"
        );
        const profileEmail = profile?.email || "";
        const profileId = profile?.id || 1;
        const fallbackPermissions: UserPermissions = {
          userId: finalUserId as string,
          email: profileEmail,
          contactType: "Balance Sheet Investor",
          role: "admin",
          contactId: 1,
          authUserProfileId: profileId,
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

    if (!contact) {
      return NextResponse.json(
        { error: "Contact info not found" },
        { status: 404 }
      );
    }

    // At this point, both profile and contact are confirmed to exist
    const confirmedProfile = profile!;
    const confirmedContact = contact!;

    // Determine primary contact type
    const contactTypes = confirmedContact.contact_types || [];
    const primaryContactType =
      confirmedContact.contact_type ||
      ((contactTypes.length > 0
        ? contactTypes[0]
        : "Balance Sheet Investor") as ContactType);

    // Also check line 200 for profile.id usage
    if (!profile) {
      return NextResponse.json(
        { error: "Profile unexpectedly null" },
        { status: 500 }
      );
    }

    // Determine role from public metadata or default to viewer
    const role = (finalUser.publicMetadata?.role as UserRole) || "viewer";

    const userPermissions: UserPermissions = {
      userId: finalUserId as string,
      email: confirmedProfile.email || "",
      contactType: primaryContactType,
      role,
      contactId: confirmedContact.id,
      authUserProfileId: confirmedProfile.id,
      canAccessDeals: canAccessDeals(primaryContactType, role),
      canAccessDistributions: canAccessDistributions(primaryContactType, role),
      canAccessDocuments: canAccessDocuments(primaryContactType, role),
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
