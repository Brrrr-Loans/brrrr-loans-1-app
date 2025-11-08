"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui";
import { Plus, FileText, Eye, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { TransactionDocumentUpload } from "@/components/transactions/transaction-document-upload";

interface TransactionWithDetails {
  id: number;
  transaction_amount: number | null;
  transaction_date: string;
  transaction_method: string | null;
  transaction_status: string | null;
  reference_number: string | null;
  notes: string | null;
  deals: Array<{
    deal_id: number;
    allocation_amount: number;
    deal: {
      deal_name: string;
      loan_number: string;
    };
  }>;
  investors: Array<{
    clerk_user_id: number;
    allocation_amount: number;
    auth_clerk_users: {
      full_name: string;
      email: string;
    };
  }>;
  documents: Array<{
    document_file_id: number;
    document_files: {
      id: number;
      document_name: string;
      document_category: string;
      uploaded_at: string;
    };
  }>;
}

const isTransactionWithDetailsArray = (
  value: unknown
): value is TransactionWithDetails[] => Array.isArray(value);

export default function TransactionsPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(
    null
  );
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!supabase) return;

    setLoading(true);
    setError(null);
    try {
      // First, try a simple query to test if basic access works
      const { error: simpleError } = await supabase
        .from("bsi_transactions")
        .select("*")
        .order("transaction_date", { ascending: false })
        .limit(10);

      if (simpleError) {
        console.error("Simple query error:", simpleError);
        throw simpleError;
      }

      // If simple query works, try with relationships
      // Fetch transactions with related data
      // Note: PostgREST requires explicit foreign key syntax for nested relationships
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
              loan_number
            )
          ),
          investors:bsi_transactions_investors(
            id,
            clerk_user_id,
            allocation_amount,
            transaction_id,
            auth_clerk_users:auth_clerk_users!clerk_user_id(
              id,
              full_name,
              email
            )
          ),
          documents:bsi_transactions_document_files(
            id,
            document_file_id,
            transaction_id,
            document_files:document_files!document_file_id(
              id,
              document_name,
              document_category,
              uploaded_at
            )
          )
        `
        )
        .order("transaction_date", { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: JSON.stringify(error, null, 2),
        });
        // PostgREST errors have different structures - handle both cases
        const errorMessage =
          error.message ||
          error.details ||
          error.hint ||
          error.code ||
          JSON.stringify(error) ||
          "Unknown error";
        setError(`Failed to load transactions: ${errorMessage}`);
        return; // Don't throw, just return early
      }

      setTransactions(isTransactionWithDetailsArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      // Handle caught errors (shouldn't happen if we return early above)
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null
            ? JSON.stringify(error)
            : "Failed to load transactions. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Find, filter, or export transaction records to Excel or CSV
          </p>
        </div>
        <Button onClick={() => router.push("/balance-sheet/transactions/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Transaction
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Find, filter, or export transaction records to Excel or CSV
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading transactions...</div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => fetchTransactions()}
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found. Create your first transaction to get
              started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deals</TableHead>
                    <TableHead>Investors</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(
                          new Date(transaction.transaction_date),
                          "MMM d, yyyy"
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.transaction_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getMethodBadgeVariant(
                            transaction.transaction_method
                          )}
                        >
                          {transaction.transaction_method?.toUpperCase() ||
                            "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(
                            transaction.transaction_status
                          )}
                        >
                          {transaction.transaction_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {transaction.deals.map((deal, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium">
                                {deal.deal.deal_name}
                              </span>
                              <span className="text-muted-foreground ml-1">
                                ({formatCurrency(deal.allocation_amount)})
                              </span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {transaction.investors.map((investor, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium">
                                {investor.auth_clerk_users?.full_name || "N/A"}
                              </span>
                              <span className="text-muted-foreground ml-1">
                                ({formatCurrency(investor.allocation_amount)})
                              </span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {transaction.reference_number || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {transaction.documents.length}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedTransaction(transaction.id);
                              setShowDocumentUpload(true);
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(
                              `/balance-sheet/transactions/${transaction.id}`
                            )
                          }
                        >
                          <Eye className="h-4 w-4" />
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

      <Dialog open={showDocumentUpload} onOpenChange={setShowDocumentUpload}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Documents</DialogTitle>
            <DialogDescription>
              Upload documents for transaction #{selectedTransaction}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <ScrollArea className="max-h-[600px]">
              <div className="space-y-4">
                <TransactionDocumentUpload
                  transactionId={selectedTransaction}
                  onUploadComplete={() => {
                    fetchTransactions();
                  }}
                />

                {/* Show existing documents */}
                {transactions
                  .find((t) => t.id === selectedTransaction)
                  ?.documents.map((doc) => (
                    <Card key={doc.document_files.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">
                              {doc.document_files.document_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {doc.document_files.document_category ||
                                "Document"}{" "}
                              • Uploaded{" "}
                              {format(
                                new Date(doc.document_files.uploaded_at),
                                "MMM d, yyyy"
                              )}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
