"use client";

import { useSession } from "@clerk/nextjs";
import { useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Type-safe environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

/**
 * Hook to get a Supabase client configured with Clerk's native integration.
 * Uses the modern accessToken approach as recommended by Clerk docs.
 * https://clerk.com/docs/integrations/databases/supabase
 */
export function useSupabase() {
  const { session } = useSession();

  const supabase = useMemo(() => {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      async accessToken() {
        return session?.getToken() ?? null;
      },
    });
  }, [session]);

  return supabase;
}
