"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { FileText, Eye, Building, User } from "lucide-react";
import { format } from "date-fns";
import { useSupabase } from "@/hooks/use-supabase";
import { useRouter } from "next/navigation";

interface TransactionWithDetails {
  id: number;
  transaction_amount: number | null;
  transaction_date: string;
  transaction_method: string | null;
  transaction_status: string | null;
  reference_number: string | null;
  external_memo: string | null;
  ledger_entry_type: string;
  // Relationships
  deals?: Array<{
    deal_id: number;
    allocation_amount: number;
    deal: {
      deal_name: string;
      loan_number: string;
      loan_amount_total: number;
    };
  }>;
  investors?: Array<{
    clerk_user_id: number | null;
    clerk_org_id: number | null;
    allocation_amount: number;
    auth_clerk_users: {
      full_name: string;
      email: string;
    } | null;
    auth_clerk_orgs: {
      id: number;
      clerk_org_name: string;
    } | null;
  }>;
  documents?: Array<{
    document_file_id: number;
    document_files: {
      id: number;
      document_name: string;
      document_category: string;
      uploaded_at: string;
    };
  }>;
}

interface ExpandedInvestor {
  type: "user" | "org";
  name: string;
  email?: string;
  amount: number;
  members?: Array<{
    name: string;
    email: string;
  }>;
}

const formatCurrency = (amount: number | null) => {
  if (amount === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const getStatusBadgeVariant = (status: string | null) => {
  switch (status) {
    case "completed":
      return "default";
    case "pending":
      return "secondary";
    case "failed":
      return "destructive";
    case "processing":
      return "outline";
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

export function InlineTransactionDetails({
  transaction,
}: {
  transaction: TransactionWithDetails;
}) {
  const router = useRouter();
  
  // Process investors from already-loaded data
  const investors: ExpandedInvestor[] = (transaction.investors || [])
    .map((link) => {
      // User investor
      if (link.clerk_user_id && link.auth_clerk_users) {
        return {
          type: "user" as const,
          name: link.auth_clerk_users.full_name,
          email: link.auth_clerk_users.email,
          amount: link.allocation_amount || 0,
        };
      }

      // Org investor
      if (link.clerk_org_id && link.auth_clerk_orgs) {
        return {
          type: "org" as const,
          name: link.auth_clerk_orgs.clerk_org_name,
          amount: link.allocation_amount || 0,
          members: [], // Org members shown separately
        };
      }

      return null;
    })
    .filter(Boolean) as ExpandedInvestor[];

  return (
    <div className="p-6 space-y-4 bg-muted/30">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Brex Transfer Details Card */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                Transfer Details
              </CardTitle>
              <Badge 
                variant={getStatusBadgeVariant(transaction.transaction_status)}
                className="w-fit"
              >
                {transaction.transaction_status || "N/A"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Amount</span>
                <span className="font-medium">
                  {formatCurrency(transaction.transaction_amount ? Math.abs(Number(transaction.transaction_amount)) : null)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Date</span>
                <span className="font-medium">
                  {format(new Date(transaction.transaction_date), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Payment Method</span>
                <Badge
                  variant={getMethodBadgeVariant(transaction.transaction_method)}
                  className="w-fit"
                >
                  {transaction.transaction_method?.toUpperCase() || "N/A"}
                </Badge>
              </div>
              {transaction.reference_number && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Reference Number
                  </span>
                  <span className="font-medium text-xs">
                    {transaction.reference_number}
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  Ledger Type
                </span>
                <Badge 
                  variant={transaction.ledger_entry_type === "contribution" ? "default" : "secondary"}
                  className="w-fit"
                >
                  {transaction.ledger_entry_type === "contribution" ? "Contribution" :
                   transaction.ledger_entry_type === "distribution" ? "Distribution" :
                   transaction.ledger_entry_type === "redemption" ? "Redemption" :
                   transaction.ledger_entry_type}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deals (if allocated) */}
        {transaction.deals && transaction.deals.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Associated Deals ({transaction.deals.length})
            </h4>
            <div className="space-y-2">
              {transaction.deals.map((deal, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-md bg-background border border-border"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">
                        {deal.deal.deal_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {deal.deal.loan_number || "No loan number"}
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(deal.allocation_amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matched Investor/Org (from vendor matching) */}
        {investors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Allocated To ({investors.length})
            </h4>
            <div className="space-y-2">
              {investors.map((inv, idx) => (
                <div key={idx}>
                  {inv.type === "org" ? (
                    <div className="p-3 rounded-md bg-background border flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{inv.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Organization
                          </p>
                        </div>
                      </div>
                      <span className="font-medium text-sm">
                        {formatCurrency(inv.amount)}
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-md bg-background border flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{inv.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {inv.email}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium text-sm">
                        {formatCurrency(inv.amount)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Documents */}
      {transaction.documents && transaction.documents.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Documents ({transaction.documents.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {transaction.documents.map((doc) => (
              <div
                key={doc.document_files.id}
                className="flex items-center justify-between p-2 rounded-md bg-background border border-border"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {doc.document_files.document_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doc.document_files.document_category || "Document"} •{" "}
                      {format(
                        new Date(doc.document_files.uploaded_at),
                        "MMM d, yyyy"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            router.push(`/balance-sheet/transactions/${transaction.id}`)
          }
        >
          <Eye className="mr-2 h-4 w-4" />
          View Full Details
        </Button>
      </div>
    </div>
  );
}

