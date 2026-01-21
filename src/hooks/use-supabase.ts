"use client";

import { useSession } from "@clerk/nextjs";
import { useMemo } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Type-safe environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export interface UseSupabaseReturn {
  client: SupabaseClient<Database> | null;
  /** Force refresh the JWT token before critical operations */
  refreshToken: () => Promise<SupabaseClient<Database> | null>;
}

/**
 * Hook to get a Supabase client configured with Clerk's native integration.
 * Returns null until the session is loaded to prevent race conditions.
 *
 * Uses the native Supabase third-party auth integration with Clerk.
 * The accessToken callback automatically handles token refresh.
 */
export function useSupabaseWithRefresh(): UseSupabaseReturn {
  const { session, isLoaded } = useSession();

  // Create client with native accessToken integration
  // The accessToken callback is called automatically by Supabase when needed
  const client = useMemo(() => {
    if (!isLoaded) return null;

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1e6b9c17-9ae9-4d73-9c47-7bf63d6f4b57',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'supabase-url-1',hypothesisId:'H6',location:'use-supabase.ts:33',message:'H6: Supabase client init URL',data:{supabaseUrl},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      async accessToken() {
        // Use 'supabase' JWT template - configured in Clerk Dashboard with Supabase's JWT secret
        return await session?.getToken({ template: 'supabase' }) ?? null;
      },
    });
  }, [session, isLoaded]);

  // refreshToken is now a no-op since Supabase handles token refresh automatically
  // via the accessToken callback. Kept for API compatibility.
  const refreshToken = async (): Promise<SupabaseClient<Database> | null> => {
    return client;
  };

  return {
    client,
    refreshToken,
  };
}

/**
 * Simple hook that returns just the Supabase client.
 * For backwards compatibility with existing code.
 */
export function useSupabase(): SupabaseClient<Database> | null {
  const { client } = useSupabaseWithRefresh();
  return client;
}
