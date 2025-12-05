"use client";

import { useSession } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Type-safe environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

/**
 * Hook to get a Supabase client configured with Clerk's native integration.
 * Creates a new client when the token changes, with headers pre-configured.
 * 
 * Note: The "Multiple GoTrueClient instances" warning may appear but is harmless
 * since we're using Clerk for auth and have disabled Supabase's session persistence.
 */
export function useSupabase() {
  const { session } = useSession();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadToken = async () => {
      const token = session
        ? await session.getToken({ template: "supabase" })
        : null;

      if (!isActive) return;
      setAccessToken(token);
    };

    loadToken();

    return () => {
      isActive = false;
    };
  }, [session]);

  // Create client with current token - this is the pattern recommended for Clerk
  const client = useMemo(() => {
    const effectiveToken = accessToken ?? supabaseAnonKey;

    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${effectiveToken}`,
        },
      },
    });
  }, [accessToken]);

  return client;
}
