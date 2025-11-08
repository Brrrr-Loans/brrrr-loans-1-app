"use client";

import { useSession } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Type-safe environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

/**
 * Hook to get a Supabase client configured with Clerk's native integration.
 * Uses the standard Clerk + Supabase integration pattern.
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

  const supabase = useMemo(() => {
    const token = accessToken ?? supabaseAnonKey;

    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }, [accessToken]);

  return supabase;
}
