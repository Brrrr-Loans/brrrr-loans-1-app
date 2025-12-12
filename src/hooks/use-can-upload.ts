"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useSupabase } from "@/hooks/use-supabase";

interface UseCanUploadReturn {
  canUpload: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to check if the current user has permission to upload files.
 * Requires: is_internal_yn = true AND role = 'admin'
 *
 * Uses the shared useSupabase hook to avoid creating multiple clients.
 */
export function useCanUpload(): UseCanUploadReturn {
  const { user, isLoaded: isUserLoaded } = useUser();
  const supabase = useSupabase();
  const [canUpload, setCanUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Track if we've already checked to avoid re-checking on every render
  const hasCheckedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Reset if user changes
    if (user?.id !== lastUserIdRef.current) {
      hasCheckedRef.current = false;
      lastUserIdRef.current = user?.id || null;
    }

    if (!isUserLoaded) return;

    if (!user) {
      setCanUpload(false);
      setIsLoading(false);
      return;
    }

    if (!supabase) {
      // Supabase client not ready yet
      return;
    }

    // Avoid re-checking if we already have a result
    if (hasCheckedRef.current) {
      return;
    }

    const checkPermission = async () => {
      try {
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
            console.error(
              "Error checking upload permission:",
              queryError.message || queryError
            );
            setError(
              new Error(queryError.message || "Failed to check permissions")
            );
            setCanUpload(false);
          }
        } else {
          // User can upload if they are an internal admin
          const hasPermission =
            data?.role === "admin" && data?.is_internal_yn === true;
          setCanUpload(hasPermission);
        }

        hasCheckedRef.current = true;
      } catch (err) {
        console.error("Error in useCanUpload:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setCanUpload(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [user, isUserLoaded, supabase]);

  return { canUpload, isLoading, error };
}
