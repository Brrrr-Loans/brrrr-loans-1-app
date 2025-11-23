"use client";

import { useState } from "react";
import { Badge, Button } from "@/components/ui";
import { ScrollArea } from "@/components/ui/layout/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FileText, Eye, Building, User, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { TransactionWithDetails } from "@/types/transactions";

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
    case "processed":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "danger";
    case "processing":
      return "info";
    default:
      return "outline";
  }
};

export function InlineTransactionDetails({
  transaction,
}: {
  transaction: TransactionWithDetails;
}) {
  const router = useRouter();
  const [isTransferDetailsOpen, setIsTransferDetailsOpen] = useState(true);
  const [isInvestorsOpen, setIsInvestorsOpen] = useState(true);

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
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Column: Stacked Cards (50% width) */}
        <div className="flex-1 lg:max-w-[50%] space-y-4">
          {/* Transfer Details - Collapsible Vertical List */}
          <Collapsible
            open={isTransferDetailsOpen}
            onOpenChange={setIsTransferDetailsOpen}
          >
            <div className="rounded-lg border bg-card shadow-sm">
              <CollapsibleTrigger className="flex w-full items-center justify-between p-4 font-semibold border-b hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base">Transfer Details</h3>
                  <Badge
                    variant={getStatusBadgeVariant(
                      transaction.transaction_status
                    )}
                  >
                    {transaction.transaction_status || "N/A"}
                  </Badge>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isTransferDetailsOpen ? "rotate-180" : ""}`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t">
                <div className="grid grid-cols-2 gap-4 p-4">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Amount</p>
                    <p className="font-semibold text-base">
                      {formatCurrency(
                        transaction.transaction_amount
                          ? Math.abs(Number(transaction.transaction_amount))
                          : null
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Date</p>
                    <p className="font-semibold text-base">
                      {format(
                        new Date(transaction.transaction_date),
                        "MMM d, yyyy"
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">
                      Payment Method
                    </p>
                    <Badge variant="outline" className="text-sm">
                      {transaction.transaction_method?.toUpperCase() || "N/A"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">
                      Ledger Classification
                    </p>
                    <Badge variant="outline" className="text-sm">
                      {transaction.ledger_entry_type === "contribution"
                        ? "Contribution"
                        : transaction.ledger_entry_type === "distribution"
                          ? "Distribution"
                          : transaction.ledger_entry_type === "redemption"
                            ? "Redemption"
                            : transaction.ledger_entry_type}
                    </Badge>
                  </div>
                  {transaction.reference_number && (
                    <div className="col-span-2 space-y-1">
                      <p className="text-muted-foreground text-sm">
                        Reference Number
                      </p>
                      <p className="font-semibold text-base">
                        {transaction.reference_number}
                      </p>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Investors - Collapsible ScrollArea */}
          {investors.length > 0 && (
            <Collapsible
              open={isInvestorsOpen}
              onOpenChange={setIsInvestorsOpen}
            >
              <div className="rounded-lg border bg-card shadow-sm">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4 font-semibold border-b hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base">Investors</h3>
                    <Badge 
                      variant="outline" 
                      className="h-5 min-w-5 rounded-full px-1 font-mono text-xs tabular-nums"
                    >
                      {investors.length}
                    </Badge>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isInvestorsOpen ? "rotate-180" : ""}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="border-t">
                  <ScrollArea className="h-[280px]">
                    <div className="space-y-2 p-4">
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
                  </ScrollArea>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}
        </div>

        {/* Right Column: Deals & Custom Table (40%+ width) */}
        <div className="flex-1 lg:min-w-[40%] space-y-4">
          {/* Deals (if allocated) */}
          {transaction.deals && transaction.deals.length > 0 && (
            <div className="rounded-lg border bg-card shadow-sm">
              <div className="flex items-center gap-2 p-4 font-semibold border-b">
                <h3 className="font-semibold text-base">Associated Deals</h3>
                <Badge 
                  variant="outline" 
                  className="h-5 min-w-5 rounded-full px-1 font-mono text-xs tabular-nums"
                >
                  {transaction.deals.length}
                </Badge>
              </div>
              <div className="divide-y">
                {transaction.deals.map((deal, idx) => (
                  <div key={idx} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm mb-1">
                          {deal.deal.deal_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Loan #{deal.deal.loan_number || "N/A"}
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

          {/* Placeholder for your custom table component */}
        </div>
      </div>

      {/* Documents */}
      {transaction.documents && transaction.documents.length > 0 && (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="flex items-center gap-2 p-4 font-semibold border-b">
            <h3 className="font-semibold text-base">Documents</h3>
            <Badge 
              variant="outline" 
              className="h-5 min-w-5 rounded-full px-1 font-mono text-xs tabular-nums"
            >
              {transaction.documents.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
            {transaction.documents.map((doc) => (
              <div
                key={doc.document_files.id}
                className="flex items-center gap-2 p-3 rounded-md bg-background border"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
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
