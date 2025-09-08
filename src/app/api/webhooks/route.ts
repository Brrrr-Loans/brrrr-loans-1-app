import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { WebhookEvent } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";

// Debug logging for service role key
console.log(
  "Service role key available:",
  !!process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Clerk event types
interface ClerkUser {
  id: string;
  email_addresses: Array<{ email_address: string }>;
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

// User event handlers
async function handleUserCreated(
  data: WebhookEvent["data"],
  supabase: ReturnType<typeof createServiceRoleClient>
) {
  if (!("email_addresses" in data)) return;

  const {
    id: clerkId,
    email_addresses,
    first_name,
    last_name,
    public_metadata,
  } = data;
  const primaryEmail = email_addresses?.[0]?.email_address;

  if (!primaryEmail) {
    throw new Error("No primary email found for user: " + clerkId);
  }

  const clerkRole = (public_metadata?.role as "admin" | "member") || "member";

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
      first_name: first_name || null,
      last_name: last_name || null,
      clerk_role: clerkRole,
      status: "active",
      is_internal_yn: false,
      is_active_yn: true,
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
  data: ClerkUser,
  supabase: ReturnType<typeof createServiceRoleClient>
) {
  const {
    id: clerkId,
    email_addresses,
    first_name,
    last_name,
    public_metadata,
  } = data;
  const primaryEmail = email_addresses?.[0]?.email_address;

  if (!primaryEmail) {
    throw new Error("No primary email found for user: " + clerkId);
  }

  const clerkRole = (public_metadata?.role as "admin" | "member") || "member";

  const { error } = await supabase
    .from("auth_clerk_users")
    .update({
      email: primaryEmail,
      first_name: first_name || null,
      last_name: last_name || null,
      clerk_role: clerkRole,
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
  const { user_id, id: session_id } = data;

  // TODO: The 'clerk_user_sessions' table does not exist in the Supabase types. Replace with a valid table or add to schema.
  // const { error } = await supabase.from("clerk_user_sessions").insert({
  //   clerk_user_id: user_id,
  //   clerk_session_id: session_id,
  //   status: "active",
  //   created_at: new Date().toISOString(),
  // });
  const error = undefined;

  if (error) throw error;
}

async function handleSessionEnded(
  data: { id: string },
  supabase: ReturnType<typeof createServiceRoleClient>
) {
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

  // TODO: The 'clerk_organizations' table does not exist in the Supabase types. Replace with a valid table or add to schema.
  // const { error } = await supabase.from("clerk_organizations").insert({
  //   clerk_org_id: org_id,
  //   name,
  //   slug,
  //   created_by_clerk_id: created_by,
  //   status: "active",
  // });
  const error = undefined;

  if (error) throw error;
}

async function handleOrganizationUpdated(
  data: ClerkOrganization,
  supabase: ReturnType<typeof createServiceRoleClient>
) {
  const { id: org_id, name, slug } = data;

  // TODO: The 'clerk_organizations' table does not exist in the Supabase types. Replace with a valid table or add to schema.
  // const { error } = await supabase
  //   .from("clerk_organizations")
  //   .update({
  //     name,
  //     slug,
  //     updated_at: new Date().toISOString(),
  //   })
  //   .eq("clerk_org_id", org_id);
  const error = undefined;

  if (error) throw error;
}

async function handleOrganizationDeleted(
  data: { id: string },
  supabase: ReturnType<typeof createServiceRoleClient>
) {
  const { id: org_id } = data;

  // TODO: The 'clerk_organizations' table does not exist in the Supabase types. Replace with a valid table or add to schema.
  // const { error } = await supabase
  //   .from("clerk_organizations")
  //   .update({
  //     status: "inactive",
  //     updated_at: new Date().toISOString(),
  //   })
  //   .eq("clerk_org_id", org_id);
  const error = undefined;

  if (error) throw error;
}

// Email event handlers
async function handleEmailVerified(
  data: ClerkEmail,
  supabase: ReturnType<typeof createServiceRoleClient>
) {
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
