"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui";
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
import { Download, FileSpreadsheet, Calendar } from "lucide-react";
import { useSupabase } from "@/hooks/use-supabase";
import { useUser } from "@clerk/nextjs";
import type { InvestorStatement } from "@/types/investor-statements";

export function StatementsTable() {
  const [statements, setStatements] = useState<InvestorStatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const supabase = useSupabase();

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
          auth_clerk_users_id: userData.id,
          clerk_org_id: item.clerk_org_id ? Number(item.clerk_org_id) : null,
          statement_date: String(item.statement_date),
          statement_period_start: String(item.statement_period_start),
          statement_period_end: String(item.statement_period_end),
          total_upb_open: (item.total_upb_open as number) || 0,
          total_upb_close: (item.total_upb_close as number) || 0,
          total_interest: (item.total_interest as number) || 0,
          total_principal: item.total_principal as number | null,
          total_fees: (item.total_fees as number) || 0,
          deposit_amount: item.deposit_amount as number | null,
          file_path: item.file_path as string | null,
          file_name: item.file_name as string | null,
          file_type: item.file_type as string | null,
          file_size: item.file_size as number | null,
          file_url: item.file_url as string | null,
          uploaded_at: item.uploaded_at as string | null,
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

  return (
    <div className="space-y-6">
      <Card>
        {/* Header - matches FileManager styling */}
        <div className="border-b bg-muted/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Account Statements</h3>
              <p className="text-sm text-muted-foreground">
                Monthly statements showing your balance sheet investments and
                returns
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Loading statements...
                </p>
              </div>
            </div>
          ) : statements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
              <h4 className="text-lg font-medium mb-2">No statements found</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Your account statements will appear here once they are generated
              </p>
            </div>
          ) : (
            <div className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Billing Period</TableHead>
                    <TableHead>Statement Date</TableHead>
                    <TableHead className="text-right">
                      Opening Balance
                    </TableHead>
                    <TableHead className="text-right">
                      Closing Balance
                    </TableHead>
                    <TableHead className="text-right">Interest</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statements.map((statement) => (
                    <TableRow key={statement.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {getBillingPeriod(statement)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(statement.statement_date)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(statement.total_upb_open)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(statement.total_upb_close)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(statement.total_interest)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Available</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatementDownload(statement)}
                          disabled={!statement.file_path}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
