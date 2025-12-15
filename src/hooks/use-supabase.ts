"use client";

import { useSession } from "@clerk/nextjs";
import { useEffect, useRef, useState, useCallback } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Type-safe environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Token refresh interval (50 seconds - JWT typically expires in 60s)
const TOKEN_REFRESH_INTERVAL = 50 * 1000;

// Module-level singleton client to avoid multiple instances
let singletonClient: SupabaseClient<Database> | null = null;
let currentToken: string | null = null;

function getOrCreateClient(token: string | null): SupabaseClient<Database> {
  const effectiveToken = token ?? supabaseAnonKey;

  // If token hasn't changed and we have a client, reuse it
  if (singletonClient && currentToken === effectiveToken) {
    return singletonClient;
  }

  // Update token tracking
  currentToken = effectiveToken;

  // Create new client only when token actually changes
  singletonClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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

  return singletonClient;
}

export interface UseSupabaseReturn {
  client: SupabaseClient<Database> | null;
  /** Force refresh the JWT token before critical operations */
  refreshToken: () => Promise<SupabaseClient<Database> | null>;
}

/**
 * Hook to get a Supabase client configured with Clerk's native integration.
 * Returns null until the JWT token is available to prevent race conditions.
 *
 * Uses a singleton pattern to minimize client recreation.
 * Automatically refreshes the token before expiration to prevent "exp claim" errors.
 */
export function useSupabaseWithRefresh(): UseSupabaseReturn {
  const { session, isLoaded } = useSession();
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const clientRef = useRef<SupabaseClient<Database> | null>(null);

  const loadToken = useCallback(async () => {
    if (!isLoaded) {
      return;
    }

    if (!session) {
      tokenRef.current = null;
      clientRef.current = getOrCreateClient(null);
      setIsTokenLoaded(true);
      return;
    }

    try {
      const token = await session.getToken({ template: "supabase" });

      // Only update if token actually changed
      if (token !== tokenRef.current) {
        tokenRef.current = token;
        clientRef.current = getOrCreateClient(token);
      }

      setIsTokenLoaded(true);
    } catch (error) {
      console.error("🔑 Error getting Supabase JWT token:", error);
      tokenRef.current = null;
      clientRef.current = getOrCreateClient(null);
      setIsTokenLoaded(true);
    }
  }, [session, isLoaded]);

  // Force refresh token - useful before critical operations like sync
  const refreshToken = useCallback(async (): Promise<SupabaseClient<Database> | null> => {
    if (!session) {
      return clientRef.current;
    }

    try {
      // Force a fresh token from Clerk
      const token = await session.getToken({ template: "supabase" });
      tokenRef.current = token;
      clientRef.current = getOrCreateClient(token);
      return clientRef.current;
    } catch (error) {
      console.error("🔑 Error force refreshing token:", error);
      return clientRef.current;
    }
  }, [session]);

  // Initial token load
  useEffect(() => {
    loadToken();
  }, [loadToken]);

  // Periodic token refresh to prevent expiration - silent refresh without state changes
  useEffect(() => {
    if (!session || !isLoaded) return;

    const refreshInterval = setInterval(async () => {
      try {
        const token = await session.getToken({ template: "supabase" });
        if (token !== tokenRef.current) {
          tokenRef.current = token;
          clientRef.current = getOrCreateClient(token);
        }
      } catch (error) {
        console.error("🔑 Error refreshing token:", error);
      }
    }, TOKEN_REFRESH_INTERVAL);

    return () => clearInterval(refreshInterval);
  }, [session, isLoaded]);

  return {
    client: isTokenLoaded ? clientRef.current : null,
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
