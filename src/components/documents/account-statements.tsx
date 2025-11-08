"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Download, Receipt, Calendar } from "lucide-react";
import { useSupabase } from "@/hooks/use-supabase";
import { useUser } from "@clerk/nextjs";
import type { InvestorStatement } from "@/types/investor-statements";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/supabase-dropzone";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";

export function AccountStatements() {
  const [statements, setStatements] = useState<InvestorStatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const supabase = useSupabase();

  // Upload configuration for statement files
  const uploadProps = useSupabaseUpload({
    bucketName: "investors",
    path: user?.id ? `user_${user.id}` : "general",
    maxFiles: 5,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      "application/pdf",
      "application/vnd.ms-excel",
      "text/csv",
    ],
  });

  // Fetch investor statements
  const fetchStatements = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Get user profile to check role and get internal user ID
      const { data: userData, error: userError } = await supabase
        .from("auth_clerk_users")
        .select("id, role, contact_id")
        .eq("clerk_user_id", user.id)
        .single();

      if (userError) {
        console.log("AccountStatements: User query error:", userError);
        setIsLoading(false);
        return;
      }

      // Check if user is a Balance Sheet Investor or admin
      const isInvestor = userData?.role === "balance_sheet_investor";
      const isAdmin = userData?.role === "admin";

      if (!isInvestor && !isAdmin) {
        // If not investor or admin, no statements to show
        setStatements([]);
        setIsLoading(false);
        return;
      }

      // Query directly via Supabase instead of API route
      let query = supabase.from("bsi_statements").select("*");

      // If investor (not admin), filter by their auth_clerk_users_id
      if (isInvestor && !isAdmin) {
        query = query.eq("auth_clerk_users_id", userData.id);
      }

      // Order by date
      query = query.order("statement_date", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching statements:", error);
        throw new Error(
          error.message || error.details || "Failed to fetch statements"
        );
      }

      setStatements(
        (data || []).map((item: Record<string, string | number | null>) => ({
          id: String(item.id),
          created_at: String(item.created_at),
          auth_clerk_users_id: userData.id, // Use the auth_clerk_users.id
          clerk_org_id: item.clerk_org_id ? Number(item.clerk_org_id) : null,
          statement_date: String(item.statement_date),
          statement_period_start: String(item.statement_period_start),
          statement_period_end: String(item.statement_period_end),
          total_upb_open: (item.total_upb_open as number) || 0,
          total_upb_close: (item.total_upb_close as number) || 0,
          total_interest: (item.total_interest as number) || 0,
          total_principal: item.total_principal as number | null,
          total_fees: (item.total_fees as number) || 0,
          deposit_amount: null, // This field doesn't exist in bsi_statements schema
          clerk_organization_id: null, // This field doesn't exist in the schema
          org_id: null, // This field doesn't exist in the schema
          file_path: null, // These file fields don't exist in bsi_statements
          file_name: null,
          file_type: null,
          file_size: null,
          file_url: null,
          uploaded_at: null,
        }))
      );
    } catch (error) {
      console.error("Error fetching statements:", error);
      // Log more detailed error information for debugging
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) {
      fetchStatements();
    } else {
      // If no user after reasonable wait, stop loading
      const timeout = setTimeout(() => {
        if (!user) {
          setIsLoading(false);
        }
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [user, fetchStatements]);

  // Handle statement download
  const handleStatementDownload = async (statement: InvestorStatement) => {
    try {
      if (statement.file_path) {
        const { data, error } = await supabase.storage
          .from("investors")
          .download(statement.file_path);

        if (error) {
          console.error("Error downloading file:", error);
          return;
        }

        // Create a download link
        const fileName = statement.file_name || `statement-${statement.id}.pdf`;
        const url = window.URL.createObjectURL(data);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading statement:", error);
    }
  };

  // Format date for display
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US");
  }

  // Get billing period string
  function getBillingPeriod(statement: InvestorStatement) {
    const startDate = new Date(statement.statement_period_start);
    const endDate = new Date(statement.statement_period_end);
    return `${startDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })} — ${endDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })}`;
  }

  // Format currency
  function formatCurrency(amount: number | null) {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  return <div className="space-y-6">{/* Content removed */}</div>;
}
