import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { WebhookEvent } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import type { Database } from "@/types/supabase";

// Debug logging for service role key
console.log(
  "Service role key available:",
  !!process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Clerk event types
interface ClerkUser {
  id: string;
  email_addresses: Array<{ email_address: string }>;
  phone_numbers?: Array<{ phone_number: string }>;
  first_name: string | null;
  last_name: string | null;
  public_metadata: { role?: "admin" | "member" } | null;
}

interface ClerkSession {
  id: string;
  user_id: string;
}

interface ClerkOrganization {
  id: string;
  name: string;
  slug: string;
  created_by: string;
}

interface ClerkEmail {
  id: string;
  email_address: string;
  user_id: string;
}

interface ClerkOrganizationMembership {
  organization: {
    id: string;
    name?: string;
    slug?: string;
  };
  public_user_data: {
    user_id: string;
  };
  role: string;
}

// Helper function to generate unique username
async function generateUniqueUsername(
  firstName: string,
  lastName: string,
  primaryEmail: string,
  supabase: ReturnType<typeof createServiceRoleClient>
): Promise<string> {
  // Generate base username from full name (first + last name, no spaces, lowercase)
  let baseUsername = (firstName + lastName).toLowerCase().replace(/\s+/g, "");

  // Fallback to email prefix if no name provided
  if (!baseUsername || baseUsername.length < 3) {
    baseUsername = primaryEmail.split("@")[0].toLowerCase();
  }

  // Check for existing usernames and append number if needed
  let username = baseUsername;
  let counter = 0;
  let isUnique = false;

  while (!isUnique) {
    try {
      // Check if username already exists
      const { data: existingUser, error } = await supabase
        .from("auth_clerk_users")
        .select("clerk_username")
        .eq("clerk_username", username)
        .single();

      if (error && error.code === "PGRST116") {
        // No existing user found, username is unique
        isUnique = true;
      } else if (existingUser) {
        // Username exists, try next number
        counter++;
        username = `${baseUsername}${counter}`;
      } else {
        // Other error occurred
        console.error("Error checking username uniqueness:", error);
        isUnique = true; // Proceed and let unique constraint handle it
      }
    } catch (err) {
      console.error("Error in username uniqueness check:", err);
      isUnique = true; // Proceed and let unique constraint handle it
    }
  }

  return username;
}

// User event handlers
async function handleUserCreated(
  data: WebhookEvent["data"],
  supabase: ReturnType<typeof createServiceRoleClient>
) {
  if (!("email_addresses" in data)) return;

  const {
    id: clerkId,
    email_addresses,
    phone_numbers,
    first_name,
    last_name,
    public_metadata,
    image_url,
    has_image,
  } = data as WebhookEvent["data"] & { image_url?: string; has_image?: boolean };
  const primaryEmail = email_addresses?.[0]?.email_address;
  const primaryPhone = phone_numbers?.[0]?.phone_number || null;

  if (!primaryEmail) {
    throw new Error("No primary email found for user: " + clerkId);
  }

  // Validate required fields based on Clerk configuration
  if (!first_name || !last_name) {
    throw new Error(
      `Missing required name fields for user: ${clerkId}. First name: ${first_name}, Last name: ${last_name}`
    );
  }

  // Generate unique username using helper function
  const username = await generateUniqueUsername(
    first_name || "",
    last_name || "",
    primaryEmail,
    supabase
  );

  // Map Clerk roles to valid database enum values
  const customRole = public_metadata?.role as string;

  let dbRole: string;

  // Map Clerk's built-in and custom roles to database enum
  if (customRole === "admin" || customRole === "Admin") {
    dbRole = "admin";
  } else if (customRole === "account_executive") {
    dbRole = "account_executive";
  } else if (customRole === "loan_processor") {
    dbRole = "loan_processor";
  } else if (customRole === "loan_opener") {
    dbRole = "loan_opener";
  } else if (customRole === "balance_sheet_investor") {
    dbRole = "balance_sheet_investor";
  } else {
    // Default for external users (including users with no custom role set)
    dbRole = "balance_sheet_investor";
  }

  // Test service role access
  const { data: testAccess, error: testError } = await supabase
    .from("auth_clerk_users")
    .select("id")
    .limit(1);

  console.log("Test service role access:", {
    testAccess,
    testError,
    hasServiceKey: !!supabase.auth.admin,
  });

  const { data: profile, error } = await supabase
    .from("auth_clerk_users")
    .insert({
      clerk_user_id: clerkId,
      email: primaryEmail,
      clerk_username: username,
      first_name: first_name || null,
      last_name: last_name || null,
      phone_number: primaryPhone,
      role: dbRole as Database["public"]["Enums"]["user_role_internal"],
      is_internal_yn: false,
      is_active_yn: true,
      image_url: image_url || null,
      has_image: has_image || false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
  console.log("Successfully created user profile:", profile);
}

async function handleUserUpdated(
  data: ClerkUser & { image_url?: string; has_image?: boolean },
  supabase: ReturnType<typeof createServiceRoleClient>
) {
  const {
    id: clerkId,
    email_addresses,
    phone_numbers,
    first_name,
    last_name,
    public_metadata,
    image_url,
    has_image,
  } = data;
  const primaryEmail = email_addresses?.[0]?.email_address;
  const primaryPhone = phone_numbers?.[0]?.phone_number || null;

  if (!primaryEmail) {
    throw new Error("No primary email found for user: " + clerkId);
  }

  // Generate unique username using helper function
  const username = await generateUniqueUsername(
    first_name || "",
    last_name || "",
    primaryEmail,
    supabase
  );

  // Map Clerk roles to valid database enum values
  // Handle both built-in roles and custom roles
  const customRole = public_metadata?.role as string;

  let dbRole: string;

  // Check custom roles from metadata
  if (customRole === "admin") {
    dbRole = "admin";
  } else if (customRole === "account_executive") {
    dbRole = "account_executive";
  } else if (customRole === "loan_processor") {
    dbRole = "loan_processor";
  } else if (customRole === "loan_opener") {
    dbRole = "loan_opener";
  } else if (customRole === "balance_sheet_investor") {
    dbRole = "balance_sheet_investor";
  } else {
    // Default for external users
    dbRole = "balance_sheet_investor";
  }

  const { error } = await supabase
    .from("auth_clerk_users")
    .update({
      email: primaryEmail,
      clerk_username: username,
      first_name: first_name || null,
      last_name: last_name || null,
      phone_number: primaryPhone,
      role: dbRole as Database["public"]["Enums"]["user_role_internal"],
      image_url: image_url || null,
      has_image: has_image || false,
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_user_id", clerkId);

  if (error) throw error;
}

async function handleUserDeleted(
  data: { id: string },
  supabase: ReturnType<typeof createServiceRoleClient>
) {
  const { id: clerkId } = data;

  const { error } = await supabase
    .from("auth_clerk_users")
    .update({
      status: "inactive",
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_user_id", clerkId);

  if (error) throw error;
}

// Session event handlers
async function handleSessionCreated(
  data: ClerkSession,
  supabase: ReturnType<typeof createServiceRoleClient>
) {
  const { user_id } = data;

  // Update last_sign_in_at when user signs in
  const { error } = await supabase
    .from("auth_clerk_users")
    .update({
      last_sign_in_at: new Date().toISOString(),
    })
    .eq("clerk_user_id", user_id);

  if (error) {
    console.error("Error updating last_sign_in_at:", error);
    // Don't throw - this is not critical
  }
}

async function handleSessionEnded(
  data: { id: string },
  _supabase: ReturnType<typeof createServiceRoleClient>
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: session_id } = data;

  // TODO: The 'clerk_user_sessions' table does not exist in the Supabase types. Replace with a valid table or add to schema.
  // const { error } = await supabase
  //   .from("clerk_user_sessions")
  //   .update({
  //     status: "ended",
  //     ended_at: new Date().toISOString(),
  //   })
  //   .eq("clerk_session_id", session_id);
  const error = undefined;

  if (error) throw error;
}

// Organization event handlers
async function handleOrganizationCreated(
  data: ClerkOrganization,
  supabase: ReturnType<typeof createServiceRoleClient>
) {
  const { id: org_id, name, slug, created_by } = data;

  const { error } = await supabase.from("auth_clerk_orgs").insert({
    clerk_org_id: org_id,
    clerk_org_name: name,
    clerk_org_slug: slug,
    created_by_clerk_user_id: created_by,
  });

  if (error) {
    console.error("Error creating organization:", error);
    throw error;
  }
  console.log("Successfully created organization:", { org_id, name, slug });
}

async function handleOrganizationUpdated(
  data: ClerkOrganization,
  supabase: ReturnType<typeof createServiceRoleClient>
) {
  const { id: org_id, name, slug } = data;

  const { error } = await supabase
    .from("auth_clerk_orgs")
    .update({
      clerk_org_name: name,
      clerk_org_slug: slug,
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_org_id", org_id);

  if (error) {
    console.error("Error updating organization:", error);
    throw error;
  }
  console.log("Successfully updated organization:", { org_id, name, slug });
}

async function handleOrganizationDeleted(
  data: { id: string },
  supabase: ReturnType<typeof createServiceRoleClient>
) {
  const { id: org_id } = data;

  // Delete the organization and cascade to remove all memberships
  const { error } = await supabase
    .from("auth_clerk_orgs")
    .delete()
    .eq("clerk_org_id", org_id);

  if (error) {
    console.error("Error deleting organization:", error);
    throw error;
  }
  console.log("Successfully deleted organization:", { org_id });
}

// Organization membership event handlers
async function handleOrganizationMembershipCreated(
  data: ClerkOrganizationMembership,
  supabase: ReturnType<typeof createServiceRoleClient>
) {
  const { organization, public_user_data, role } = data;
  const orgId = organization?.id;
  const userId = public_user_data?.user_id;

  if (!orgId || !userId) {
    console.error("Missing org or user ID in membership created event:", data);
    return;
  }

  // Get our internal user ID
  const { data: user, error: userError } = await supabase
    .from("auth_clerk_users")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (userError || !user) {
    console.error("User not found for membership:", userId, userError);
    return;
  }

  // Get our internal org ID
  const { data: org, error: orgError } = await supabase
    .from("auth_clerk_orgs")
    .select("id")
    .eq("clerk_org_id", orgId)
    .single();

  if (orgError || !org) {
    console.error("Organization not found for membership:", orgId, orgError);
    return;
  }

  // Map Clerk organization role to org permissions
  // clerk_org_role enum accepts: "admin" | "member" | "viewer"
  let orgRole: "admin" | "member" | "viewer";

  if (role === "admin" || role === "Admin" || role?.includes("admin")) {
    orgRole = "admin";
  } else if (
    role === "viewer" ||
    role === "Viewer" ||
    role?.includes("viewer")
  ) {
    orgRole = "viewer";
  } else {
    // All other roles (including custom business roles) are "member" at org level
    orgRole = "member";
  }

  const { error } = await supabase.from("auth_clerk_orgs_members").insert({
    auth_clerk_users_id: user.id,
    clerk_org_id: org.id,
    clerk_org_role: orgRole,
  });

  if (error) {
    console.error("Error creating organization membership:", error);
    throw error;
  }
  console.log("Successfully created organization membership:", {
    userId: user.id,
    orgId: org.id,
    role,
  });
}

async function handleOrganizationMembershipUpdated(
  data: ClerkOrganizationMembership,
  supabase: ReturnType<typeof createServiceRoleClient>
) {
  const { organization, public_user_data, role } = data;
  const orgId = organization?.id;
  const userId = public_user_data?.user_id;

  if (!orgId || !userId) return;

  // Get our internal IDs
  const { data: user } = await supabase
    .from("auth_clerk_users")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  const { data: org } = await supabase
    .from("auth_clerk_orgs")
    .select("id")
    .eq("clerk_org_id", orgId)
    .single();

  if (!user || !org) return;

  // Map Clerk organization role to org permissions
  let orgRole: "admin" | "member" | "viewer";

  if (role === "admin" || role === "Admin" || role?.includes("admin")) {
    orgRole = "admin";
  } else if (
    role === "viewer" ||
    role === "Viewer" ||
    role?.includes("viewer")
  ) {
    orgRole = "viewer";
  } else {
    orgRole = "member";
  }

  const { error } = await supabase
    .from("auth_clerk_orgs_members")
    .update({
      clerk_org_role: orgRole,
      updated_at: new Date().toISOString(),
    })
    .eq("auth_clerk_users_id", user.id)
    .eq("clerk_org_id", org.id);

  if (error) {
    console.error("Error updating organization membership:", error);
    throw error;
  }
  console.log("Successfully updated organization membership");
}

async function handleOrganizationMembershipDeleted(
  data: ClerkOrganizationMembership,
  supabase: ReturnType<typeof createServiceRoleClient>
) {
  const { organization, public_user_data } = data;
  const orgId = organization?.id;
  const userId = public_user_data?.user_id;

  if (!orgId || !userId) return;

  // Get our internal IDs
  const { data: user } = await supabase
    .from("auth_clerk_users")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  const { data: org } = await supabase
    .from("auth_clerk_orgs")
    .select("id")
    .eq("clerk_org_id", orgId)
    .single();

  if (!user || !org) return;

  const { error } = await supabase
    .from("auth_clerk_orgs_members")
    .delete()
    .eq("auth_clerk_users_id", user.id)
    .eq("clerk_org_id", org.id);

  if (error) {
    console.error("Error deleting organization membership:", error);
    throw error;
  }
  console.log("Successfully deleted organization membership");
}

// Email event handlers
async function handleEmailVerified(
  data: ClerkEmail,
  _supabase: ReturnType<typeof createServiceRoleClient>
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user_id } = data;

  // TODO: The 'user_profile' table does not have 'email_verified' or 'email_verified_at' fields in the Supabase types. Remove or add to schema.
  // const { error } = await supabase
  //   .from("user_profile")
  //   .update({
  //     email_verified: true,
  //     email_verified_at: new Date().toISOString(),
  //   })
  //   .eq("clerk_id", user_id);
  const error = undefined;

  if (error) throw error;
}

export async function POST(req: NextRequest) {
  try {
    const rawEvt = await verifyWebhook(req);
    console.log(
      "Service role key available:",
      !!process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const supabase = createServiceRoleClient();

    console.log("Webhook received:", { type: rawEvt.type, data: rawEvt.data });

    // Handle events
    const evt = rawEvt as WebhookEvent;
    switch (evt.type) {
      case "user.created":
        await handleUserCreated(evt.data, supabase);
        break;
      case "user.updated":
        if ("email_addresses" in evt.data) {
          await handleUserUpdated(evt.data as ClerkUser, supabase);
        }
        break;
      case "user.deleted":
        if (evt.data.id) {
          await handleUserDeleted({ id: evt.data.id }, supabase);
        }
        break;
      case "session.created":
        if ("user_id" in evt.data) {
          await handleSessionCreated(evt.data as ClerkSession, supabase);
        }
        break;
      case "session.ended":
        if (evt.data.id) {
          await handleSessionEnded({ id: evt.data.id }, supabase);
        }
        break;
      case "session.removed":
        if (evt.data.id) {
          await handleSessionEnded({ id: evt.data.id }, supabase);
        }
        break;
      case "organization.created":
        if ("name" in evt.data && "slug" in evt.data && evt.data.created_by) {
          await handleOrganizationCreated(
            evt.data as ClerkOrganization,
            supabase
          );
        }
        break;
      case "organization.updated":
        if ("name" in evt.data && "slug" in evt.data && evt.data.created_by) {
          await handleOrganizationUpdated(
            evt.data as ClerkOrganization,
            supabase
          );
        }
        break;
      case "organization.deleted":
        if (evt.data.id) {
          await handleOrganizationDeleted({ id: evt.data.id }, supabase);
        }
        break;
      case "organizationMembership.created":
        await handleOrganizationMembershipCreated(evt.data, supabase);
        break;
      case "organizationMembership.updated":
        await handleOrganizationMembershipUpdated(evt.data, supabase);
        break;
      case "organizationMembership.deleted":
        await handleOrganizationMembershipDeleted(evt.data, supabase);
        break;
      default: {
        // Handle non-standard events like email verification
        const eventType = rawEvt.type as string;
        const eventData = rawEvt.data as unknown;
        if (
          eventType === "email.verified" &&
          typeof eventData === "object" &&
          eventData !== null &&
          "email_address" in eventData &&
          "user_id" in eventData &&
          typeof eventData.email_address === "string" &&
          typeof eventData.user_id === "string"
        ) {
          await handleEmailVerified(
            {
              id: eventData.user_id,
              email_address: eventData.email_address,
              user_id: eventData.user_id,
            },
            supabase
          );
        } else {
          console.log("Unhandled event type:", eventType);
        }
      }
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (err) {
    console.error("Error processing webhook:", err);
    if (err instanceof Error && err.message.includes("verification")) {
      return new Response("Error verifying webhook", { status: 400 });
    }
    return new Response("Error processing webhook", { status: 500 });
  }
}
