"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

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
  const [canUpload, setCanUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function checkPermission() {
      if (!isUserLoaded) return;
      
      if (!user) {
        setCanUpload(false);
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            auth: {
              persistSession: false,
            },
          }
        );

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
  }, [user, isUserLoaded]);

  return { canUpload, isLoading, error };
}

