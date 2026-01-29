"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/shadcn/sheet";
import type { ComponentProps } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import { Separator } from "@/components/ui/shadcn/separator";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import {
  FileText,
  Building,
  User,
  Download,
  Printer,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { TransactionDocumentUpload } from "./transaction-document-upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog";
import { TransactionWithDetails } from "@/types/transactions";

interface TransactionDetailsSheetProps {
  transactionId: number | null;
  open: boolean;
  onOpenChange: ComponentProps<typeof Sheet>["onOpenChange"];
}

export function TransactionDetailsSheet({
  transactionId,
  open,
  onOpenChange,
}: TransactionDetailsSheetProps) {
  const supabase = useSupabase();
  const [transaction, setTransaction] = useState<TransactionWithDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  const fetchTransaction = useCallback(async () => {
    if (!supabase || !transactionId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("bsi_transactions")
        .select(
          `
          *,
          deals:bsi_transactions_deals(
            id,
            deal_id,
            allocation_amount,
            transaction_id,
            deal:deal!deal_id(
              id,
              deal_name,
              loan_number,
              loan_amount_total
            )
          ),
          investors:bsi_transactions_investors(
            id,
            clerk_user_id,
            clerk_org_id,
            allocation_amount,
            transaction_id,
            auth_clerk_users:clerk_user_id(
              id,
              full_name,
              email
            ),
            auth_clerk_orgs:clerk_org_id(
              id,
              clerk_org_name
            )
          ),
          documents:bsi_transactions_document_files(
            id,
            document_file_id,
            transaction_id,
            document_files:document_files!document_file_id(
              id,
              document_name,
              document_category_id,
              document_categories:document_category_id(name),
              uploaded_at
            )
          )
        `,
        )
        .eq("id", transactionId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching transaction with joins:", error);

        // Try simpler query without nested joins
        const { data: simpleData, error: simpleError } = await supabase
          .from("bsi_transactions")
          .select("*")
          .eq("id", transactionId)
          .maybeSingle();

        if (simpleError || !simpleData) {
          console.error("Simple query also failed:", simpleError);
          setError("Transaction not found or you don't have access");
          return;
        }

        console.log("Using simple transaction data without relationships");
        setTransaction({
          ...simpleData,
          deals: [],
          investors: [],
          documents: [],
        } as TransactionWithDetails);
        return;
      }

      if (!data) {
        setError("Transaction not found");
        return;
      }

      setTransaction(data as TransactionWithDetails);
    } catch (err) {
      console.error("Error fetching transaction:", err);
      // Handle caught errors
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null
            ? JSON.stringify(err)
            : "Failed to load transaction. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [supabase, transactionId]);

  useEffect(() => {
    if (open && transactionId) {
      // Small delay to ensure Supabase client is ready
      const timer = setTimeout(() => {
        if (supabase) {
          fetchTransaction();
        } else {
          console.warn("Supabase client not ready, retrying...");
          // Retry after a short delay
          setTimeout(() => {
            if (supabase) fetchTransaction();
          }, 500);
        }
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setTransaction(null);
      setError(null);
    }
  }, [open, transactionId, supabase, fetchTransaction]);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadgeVariant = (
    status: string | null,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "completed":
      case "processed": // Brex uses "PROCESSED" to mean complete
        return "default"; // Green for success
      case "pending":
        return "secondary"; // Yellow for warning
      case "failed":
        return "destructive"; // Red for danger
      case "processing":
        return "outline"; // Blue for info
      default:
        return "secondary";
    }
  };

  const getMethodBadgeVariant = (method: string | null) => {
    switch (method) {
      case "wire":
        return "default";
      case "ach":
        return "secondary";
      case "check":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getLedgerTypeLabel = (type: string | null) => {
    if (!type) return "N/A";
    switch (type) {
      case "contribution":
        return "Investment";
      case "distribution":
        return "Distribution";
      default:
        return type;
    }
  };

  const handleDownloadPDF = async () => {
    if (!transactionId) return;
    try {
      const detailUrl = `/balance-sheet/transactions/${transactionId}`;
      const printWindow = window.open(detailUrl, "_blank");
      if (!printWindow) {
        toast.error("Please allow popups to download PDF");
        return;
      }
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 1500);
      };
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  const handlePrint = async () => {
    if (!transactionId) return;
    try {
      const detailUrl = `/balance-sheet/transactions/${transactionId}`;
      const newWindow = window.open(detailUrl, "_blank");
      if (!newWindow) {
        toast.error("Please allow popups to print");
        return;
      }
      newWindow.onload = () => {
        setTimeout(() => {
          newWindow.print();
        }, 1000);
      };
    } catch (error) {
      console.error("Error printing:", error);
      toast.error("Failed to open print dialog");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col">
        <SheetHeader className="pb-4 border-b">
          {loading ? (
            <SheetTitle className="text-2xl">Loading Transaction...</SheetTitle>
          ) : error ? (
            <SheetTitle className="text-2xl">Error</SheetTitle>
          ) : transaction ? (
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <SheetTitle className="text-2xl">
                  Transaction #{transaction.id}
                </SheetTitle>
                <SheetDescription>
                  {transaction.transaction_date
                    ? format(
                        new Date(transaction.transaction_date),
                        "MMMM d, yyyy 'at' h:mm a",
                      )
                    : "Date not available"}
                </SheetDescription>
              </div>
              <Badge
                variant={getStatusBadgeVariant(transaction.transaction_status)}
                className="text-sm"
              >
                {transaction.transaction_status || "N/A"}
              </Badge>
            </div>
          ) : (
            <SheetTitle className="text-2xl">Transaction Details</SheetTitle>
          )}
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={fetchTransaction}
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : transaction ? (
          <>
            <ScrollArea className="flex-1 py-6">
              <div className="space-y-6 pr-4">
                {/* Transaction Overview */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Transaction Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(transaction.transaction_amount)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Payment Method
                        </p>
                        <Badge
                          variant={getMethodBadgeVariant(
                            transaction.transaction_method,
                          )}
                          className="text-sm"
                        >
                          {transaction.transaction_method?.toUpperCase() ||
                            "N/A"}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">
                          {transaction.transaction_date
                            ? format(
                                new Date(transaction.transaction_date),
                                "MMM d, yyyy",
                              )
                            : "N/A"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Type</p>
                        <Badge variant="outline" className="text-sm">
                          {getLedgerTypeLabel(transaction.ledger_entry_type)}
                        </Badge>
                      </div>
                    </div>

                    {transaction.reference_number && (
                      <div className="space-y-1 pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                          Reference Number
                        </p>
                        <p className="font-medium">
                          {transaction.reference_number}
                        </p>
                      </div>
                    )}

                    {transaction.external_memo && (
                      <div className="space-y-1 pt-2 border-t">
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="text-sm">{transaction.external_memo}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Deals */}
                {transaction.deals && transaction.deals.length > 0 && (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Related Deals
                        <Badge
                          variant="outline"
                          className="h-5 min-w-5 rounded-full px-1 font-mono text-xs tabular-nums"
                        >
                          {transaction.deals.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {transaction.deals.map((dealAllocation, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                          >
                            <div className="flex-1">
                              <p className="font-medium">
                                {dealAllocation.deal.deal_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Loan #{dealAllocation.deal.loan_number || "N/A"}
                              </p>
                            </div>
                            <p className="font-semibold">
                              {formatCurrency(dealAllocation.allocation_amount)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Investors */}
                {transaction.investors && transaction.investors.length > 0 && (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <User className="h-5 w-5" />
                        Investors
                        <Badge
                          variant="outline"
                          className="h-5 min-w-5 rounded-full px-1 font-mono text-xs tabular-nums"
                        >
                          {transaction.investors.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {transaction.investors.map(
                          (investorAllocation, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                            >
                              <div className="flex-1">
                                <p className="font-medium">
                                  {investorAllocation.auth_clerk_users
                                    ?.full_name ||
                                    investorAllocation.auth_clerk_orgs
                                      ?.clerk_org_name ||
                                    "Unknown"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {investorAllocation.auth_clerk_users?.email ||
                                    (investorAllocation.auth_clerk_orgs
                                      ? "Organization"
                                      : "")}
                                </p>
                              </div>
                              {investorAllocation.allocation_amount != null &&
                                investorAllocation.allocation_amount > 0 && (
                                  <p className="font-semibold">
                                    {formatCurrency(
                                      investorAllocation.allocation_amount,
                                    )}
                                  </p>
                                )}
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Documents */}
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-5 w-5" />
                        Documents
                        <Badge
                          variant="outline"
                          className="h-5 min-w-5 rounded-full px-1 font-mono text-xs tabular-nums"
                        >
                          {transaction.documents?.length || 0}
                        </Badge>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDocumentUpload(true)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {transaction.documents &&
                    transaction.documents.length > 0 ? (
                      <div className="space-y-2">
                        {transaction.documents.map((doc) => (
                          <div
                            key={doc.document_files.id}
                            className="flex items-center justify-between p-3 rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">
                                  {doc.document_files.document_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {doc.document_files.document_categories
                                    ?.name || "Document"}{" "}
                                  •{" "}
                                  {format(
                                    new Date(doc.document_files.uploaded_at),
                                    "MMM d, yyyy",
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No documents attached
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>

            <Separator />

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownloadPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </>
        ) : null}

        {/* Document Upload Dialog */}
        {transaction && (
          <Dialog
            open={showDocumentUpload}
            onOpenChange={setShowDocumentUpload}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Transaction Document</DialogTitle>
                <DialogDescription>
                  Upload documents for transaction #{transaction.id}
                </DialogDescription>
              </DialogHeader>
              <TransactionDocumentUpload
                transactionId={transaction.id}
                onUploadComplete={() => {
                  fetchTransaction();
                  setShowDocumentUpload(false);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </SheetContent>
    </Sheet>
  );
}
