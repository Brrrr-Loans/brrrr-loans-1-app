"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Tables } from "@/types/supabase";

type Deal = Tables<"bsi_deals_clerk_users"> & { deal: Tables<"deal"> };

export interface UseDealsOptions {
  status?: string;
  type?: string;
  search?: string;
}

export function useDeals(options: UseDealsOptions = {}) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function fetchDeals() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (options.status) params.append("status", options.status);
        if (options.type) params.append("type", options.type);
        if (options.search) params.append("search", options.search);

        const response = await fetch(`/api/deals?${params.toString()}`);

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/sign-in");
            return;
          }
          if (response.status === 404) {
            setDeals([]);
            setError("No deals found for your account.");
            return;
          }
          // Try to parse error message from API
          let apiError = "Unknown error";
          try {
            const errJson = await response.json();
            apiError = errJson.error || apiError;
          } catch {}
          setError(`Error ${response.status}: ${apiError}`);
          return;
        }

        const data = await response.json();
        if (isMounted) {
          setDeals(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch deals:", err);
        setError(
          err instanceof Error ? err.message : String(err) || "Unknown error"
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDeals();

    return () => {
      isMounted = false;
    };
  }, [options.status, options.type, options.search, router]);

  return { deals, loading, error };
}
