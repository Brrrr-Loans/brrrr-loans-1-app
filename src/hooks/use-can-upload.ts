"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useSupabase } from "@/hooks/use-supabase";

interface UseCanUploadReturn {
  canUpload: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to check if the current user has permission to upload files.
 * Requires: is_internal_yn = true AND personal_role = 'admin'
 *
 * Uses the shared useSupabase hook to avoid creating multiple clients.
 */
export function useCanUpload(): UseCanUploadReturn {
  const { user, isLoaded: isUserLoaded } = useUser();
  const supabase = useSupabase();
  const [result, setResult] = useState<{
    userId: string;
    canUpload: boolean;
    error: Error | null;
  } | null>(null);
  const userId = user?.id;
  const hasResult = !!userId && result?.userId === userId;

  useEffect(() => {
    if (!isUserLoaded || !userId || !supabase || hasResult) return;

    const checkPermission = async () => {
      try {
        const { data, error: queryError } = await supabase
          .from("auth_clerk_users")
          .select("personal_role, is_internal_yn")
          .eq("clerk_user_id", userId)
          .single();

        if (queryError) {
          // PGRST116 = no rows found, which means user not in table yet
          if (queryError.code === "PGRST116") {
            console.log("User not found in auth_clerk_users table");
            setResult({ userId, canUpload: false, error: null });
          } else {
            console.error(
              "Error checking upload permission:",
              queryError.message || queryError
            );
            setResult({
              userId,
              canUpload: false,
              error: new Error(
                queryError.message || "Failed to check permissions"
              ),
            });
          }
        } else {
          // User can upload if they are an internal admin
          const hasPermission =
            data?.personal_role === "admin" && data?.is_internal_yn === true;
          setResult({ userId, canUpload: hasPermission, error: null });
        }
      } catch (err) {
        console.error("Error in useCanUpload:", err);
        setResult({
          userId,
          canUpload: false,
          error: err instanceof Error ? err : new Error("Unknown error"),
        });
      }
    };

    checkPermission();
  }, [userId, isUserLoaded, supabase, hasResult]);

  const canUpload = hasResult ? result.canUpload : false;
  const error = hasResult ? result.error : null;
  const isLoading = !isUserLoaded || (!!userId && !hasResult);

  return { canUpload, isLoading, error };
}
