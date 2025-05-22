import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// Create a server-side Supabase client for Clerk authentication.
// Use in API routes and server components.
export async function getSupabaseClient(): Promise<SupabaseClient<Database>> {
  const { getToken } = await auth();
  const token = await getToken({ template: "supabase" });
  console.log("Clerk Supabase JWT:", token);

  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });

  return client;
}

// Creates a Supabase client using Service Role Key.
// Use for admin/server-to-server operations (e.g., webhooks).
export function createServiceRoleClient(): SupabaseClient<Database> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  }
  return createClient<Database>(supabaseUrl, serviceRoleKey);
}
