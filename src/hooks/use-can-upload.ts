"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser, useSession } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface UseCanUploadReturn {
  canUpload: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to check if the current user has permission to upload files.
 * Requires: is_internal_yn = true AND role = 'admin'
 */
export function useCanUpload(): UseCanUploadReturn {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { session } = useSession();
  const [canUpload, setCanUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkPermission = useCallback(async () => {
    if (!isUserLoaded || !user || !session) {
      return;
    }

    try {
      // Get the Clerk JWT token for Supabase
      const token = await session.getToken({ template: "supabase" });
      
      if (!token) {
        console.warn("No Supabase token available from Clerk session");
        setCanUpload(false);
        setIsLoading(false);
        return;
      }

      // Create authenticated Supabase client with the token
      const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      const { data, error: queryError } = await supabase
        .from("auth_clerk_users")
        .select("role, is_internal_yn")
        .eq("clerk_user_id", user.id)
        .single();

      if (queryError) {
        // PGRST116 = no rows found, which means user not in table yet
        if (queryError.code === "PGRST116") {
          console.log("User not found in auth_clerk_users table");
          setCanUpload(false);
        } else {
          console.error("Error checking upload permission:", queryError.message || queryError);
          setError(new Error(queryError.message || "Failed to check permissions"));
          setCanUpload(false);
        }
      } else {
        // User can upload if they are an internal admin
        const hasPermission = data?.role === "admin" && data?.is_internal_yn === true;
        setCanUpload(hasPermission);
      }
    } catch (err) {
      console.error("Error in useCanUpload:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setCanUpload(false);
    } finally {
      setIsLoading(false);
    }
  }, [user, isUserLoaded, session]);

  useEffect(() => {
    if (!isUserLoaded) return;
    
    if (!user) {
      setCanUpload(false);
      setIsLoading(false);
      return;
    }

    if (!session) {
      // Wait for session to be available
      return;
    }

    checkPermission();
  }, [user, isUserLoaded, session, checkPermission]);

  return { canUpload, isLoading, error };
}

