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
 */
export function useCanUpload(): UseCanUploadReturn {
  const { user, isLoaded: isUserLoaded } = useUser();
  const supabase = useSupabase();
  const [canUpload, setCanUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasChecked = useRef(false);

  useEffect(() => {
    async function checkPermission() {
      if (!isUserLoaded) return;
      
      if (!user) {
        setCanUpload(false);
        setIsLoading(false);
        return;
      }

      // Prevent duplicate checks
      if (hasChecked.current) return;
      hasChecked.current = true;

      try {
        const { data, error: queryError } = await supabase
          .from("auth_clerk_users")
          .select("role, is_internal_yn")
          .eq("clerk_user_id", user.id)
          .single();

        if (queryError) {
          console.error("Error checking upload permission:", queryError);
          setError(new Error(queryError.message));
          setCanUpload(false);
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
    }

    checkPermission();
  }, [user, isUserLoaded, supabase]);

  return { canUpload, isLoading, error };
}

