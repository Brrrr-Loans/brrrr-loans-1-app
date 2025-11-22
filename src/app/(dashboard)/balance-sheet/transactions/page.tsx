"use client";

import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  Fragment,
  Suspense,
} from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
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
  Checkbox,
} from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/overlays/dropdown-menu";
import {
  Plus,
  FileText,
  Eye,
  AlertCircle,
  Download,
  Settings,
  Filter,
  ArrowDownToLine,
  ArrowUpToLine,
  ListTree,
  ChevronRight,
  Archive,
  Trash2,
  MoreHorizontal,
  Printer,
  FileUp,
} from "lucide-react";
import { format } from "date-fns";
import { TransactionDocumentUpload } from "@/components/transactions/transaction-document-upload";
import { TransactionDetailsSheet } from "@/components/transactions/transaction-details-sheet";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

interface TransactionWithDetails {
  id: number;
  transaction_amount: number | null;
  transaction_date: string;
  transaction_method: string | null;
  transaction_status: string | null;
  reference_number: string | null;
  external_memo: string | null;
  ledger_entry_type: string;
  deals: Array<{
    deal_id: number;
    allocation_amount: number;
    deal: {
      deal_name: string;
      loan_number: string;
      loan_amount_total: number;
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

function TransactionsPageContent() {
  const supabase = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(
    null
  );
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const activeTab = searchParams.get("tab") || "all";
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [detailsTransactionId, setDetailsTransactionId] = useState<
    number | null
  >(null);

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

  // Filter transactions based on active tab
  const filteredTransactions = useMemo(() => {
    if (activeTab === "all") return transactions;
    if (activeTab === "investments") {
      return transactions.filter((t) => t.ledger_entry_type === "contribution");
    }
    if (activeTab === "distributions") {
      return transactions.filter((t) => t.ledger_entry_type === "distribution");
    }
    return transactions;
  }, [transactions, activeTab]);

  // Calculate statistics
  const stats = useMemo(() => {
    const all = filteredTransactions.length;
    const completed = filteredTransactions.filter(
      (t) => t.transaction_status === "completed"
    ).length;
    const pending = filteredTransactions.filter(
      (t) => t.transaction_status === "pending"
    ).length;
    const failed = filteredTransactions.filter(
      (t) => t.transaction_status === "failed"
    ).length;
    const processing = filteredTransactions.filter(
      (t) => t.transaction_status === "processing"
    ).length;

    return { all, completed, pending, failed, processing };
  }, [filteredTransactions]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(filteredTransactions.map((t) => t.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  // Handle PDF download
  const handleDownloadPDF = useCallback(async (transactionId: number) => {
    try {
      // Navigate to transaction detail page
      const detailUrl = `/balance-sheet/transactions/${transactionId}`;

      // Open in new window for printing
      const printWindow = window.open(detailUrl, "_blank");

      if (!printWindow) {
        toast.error("Please allow popups to download PDF");
        return;
      }

      // Wait for page to load, then trigger print dialog
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
  }, []);

  // Handle print
  const handlePrint = useCallback(async (transactionId: number) => {
    try {
      // Open transaction detail page in new window
      const detailUrl = `/balance-sheet/transactions/${transactionId}`;
      const newWindow = window.open(detailUrl, "_blank");

      if (!newWindow) {
        toast.error("Please allow popups to print");
        return;
      }

      // Wait for page to load, then trigger print dialog
      newWindow.onload = () => {
        setTimeout(() => {
          newWindow.print();
        }, 1000);
      };
    } catch (error) {
      console.error("Error printing:", error);
      toast.error("Failed to open print dialog");
    }
  }, []);

  const toggleRowExpansion = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const tabs = [
    {
      id: "all",
      label: "All",
      href: "/balance-sheet/transactions?tab=all",
      icon: ListTree,
    },
    {
      id: "investments",
      label: "Investments",
      href: "/balance-sheet/transactions?tab=investments",
      icon: ArrowDownToLine,
    },
    {
      id: "distributions",
      label: "Distributions",
      href: "/balance-sheet/transactions?tab=distributions",
      icon: ArrowUpToLine,
    },
  ];

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push("/balance-sheet/transactions/new")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Transaction
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors flex items-center gap-2",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <button
          onClick={() => router.push("/balance-sheet/transactions?tab=all")}
          className={cn(
            "rounded-lg border-2 p-4 text-left transition-colors",
            "border-border hover:bg-muted/50"
          )}
        >
          <div className="text-sm font-medium text-muted-foreground">All</div>
          <div className="text-2xl font-bold mt-1">{stats.all}</div>
        </button>
        <button
          className={cn(
            "rounded-lg border-2 p-4 text-left transition-colors",
            "border-border hover:bg-muted/50"
          )}
        >
          <div className="text-sm font-medium text-muted-foreground">
            Completed
          </div>
          <div className="text-2xl font-bold mt-1">{stats.completed}</div>
        </button>
        <button
          className={cn(
            "rounded-lg border-2 p-4 text-left transition-colors",
            "border-border hover:bg-muted/50"
          )}
        >
          <div className="text-sm font-medium text-muted-foreground">
            Pending
          </div>
          <div className="text-2xl font-bold mt-1">{stats.pending}</div>
        </button>
        <button
          className={cn(
            "rounded-lg border-2 p-4 text-left transition-colors",
            "border-border hover:bg-muted/50"
          )}
        >
          <div className="text-sm font-medium text-muted-foreground">
            Processing
          </div>
          <div className="text-2xl font-bold mt-1">{stats.processing}</div>
        </button>
        <button
          className={cn(
            "rounded-lg border-2 p-4 text-left transition-colors",
            "border-border hover:bg-muted/50"
          )}
        >
          <div className="text-sm font-medium text-muted-foreground">
            Failed
          </div>
          <div className="text-2xl font-bold mt-1">{stats.failed}</div>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            disabled
            title="Export functionality coming soon"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">Loading transactions...</div>
          ) : error ? (
            <Alert variant="destructive" className="m-6">
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
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {activeTab === "all" 
                  ? "No transactions found"
                  : activeTab === "investments"
                  ? "No investment transactions"
                  : "No distribution transactions"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md text-center">
                {activeTab === "all"
                  ? "Track all your financial transactions including investments and distributions in one place."
                  : activeTab === "investments"
                  ? "Record capital contributions and investments to track incoming funds."
                  : "Track payments and distributions made to investors."}
              </p>
              <Button onClick={() => router.push("/balance-sheet/transactions/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Transaction
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedRows.size === filteredTransactions.length &&
                          filteredTransactions.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment method</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => {
                    const primaryInvestor =
                      transaction.investors[0]?.auth_clerk_users;
                    const description =
                      transaction.external_memo ||
                      transaction.deals
                        .map((d) => d.deal.deal_name)
                        .join(", ") ||
                      "Transaction";
                    const customerName =
                      primaryInvestor?.full_name ||
                      primaryInvestor?.email ||
                      "-";
                    const isExpanded = expandedRows.has(transaction.id);

                    return (
                      <Fragment key={transaction.id}>
                        <TableRow>
                          <TableCell>
                            <Checkbox
                              checked={selectedRows.has(transaction.id)}
                              onCheckedChange={(checked) =>
                                handleSelectRow(transaction.id, !!checked)
                              }
                              aria-label="Select row"
                            />
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
                          <TableCell className="max-w-[300px] truncate">
                            {description}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {customerName}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(
                              new Date(transaction.transaction_date),
                              "MMM d, h:mm a"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusBadgeVariant(
                                transaction.transaction_status
                              )}
                            >
                              {transaction.transaction_status || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleRowExpansion(transaction.id)}
                              className="h-8 w-8"
                              aria-label={
                                isExpanded ? "Collapse row" : "Expand row"
                              }
                            >
                              <ChevronRight
                                className={cn(
                                  "h-4 w-4 transition-transform",
                                  isExpanded && "rotate-90"
                                )}
                              />
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTransaction(transaction.id);
                                  setShowDocumentUpload(true);
                                }}
                                title="Upload Files"
                              >
                                <FileUp className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48"
                                >
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDetailsTransactionId(transaction.id);
                                      setShowDetailsSheet(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadPDF(transaction.id);
                                    }}
                                  >
                                    <Download className="h-4 w-4" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePrint(transaction.id);
                                    }}
                                  >
                                    <Printer className="h-4 w-4" />
                                    Print
                                    <DropdownMenuShortcut>
                                      ⌘P
                                    </DropdownMenuShortcut>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Archive className="h-4 w-4" />
                                    Archive
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                    <DropdownMenuShortcut>
                                      ⌘⌫
                                    </DropdownMenuShortcut>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-muted/30 p-0">
                              <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {/* Transaction Details */}
                                  <Card className="border-2">
                                    <CardHeader className="pb-3">
                                      <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-semibold">
                                          Transaction Details
                                        </CardTitle>
                                        <Badge
                                          variant={getStatusBadgeVariant(
                                            transaction.transaction_status
                                          )}
                                          className="w-fit"
                                        >
                                          {transaction.transaction_status ||
                                            "N/A"}
                                        </Badge>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                      <div className="space-y-3 text-sm">
                                        <div className="flex flex-col gap-1">
                                          <span className="text-xs text-muted-foreground">
                                            Amount
                                          </span>
                                          <span className="font-medium">
                                            {formatCurrency(
                                              transaction.transaction_amount
                                            )}
                                          </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <span className="text-xs text-muted-foreground">
                                            Date
                                          </span>
                                          <span className="font-medium">
                                            {format(
                                              new Date(
                                                transaction.transaction_date
                                              ),
                                              "MMM d, yyyy 'at' h:mm a"
                                            )}
                                          </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <span className="text-xs text-muted-foreground">
                                            Method
                                          </span>
                                          <Badge
                                            variant={getMethodBadgeVariant(
                                              transaction.transaction_method
                                            )}
                                            className="w-fit"
                                          >
                                            {transaction.transaction_method?.toUpperCase() ||
                                              "N/A"}
                                          </Badge>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <span className="text-xs text-muted-foreground">
                                            Reference Number
                                          </span>
                                          <span className="font-medium">
                                            {transaction.reference_number ||
                                              "-"}
                                          </span>
                                        </div>
                                        {transaction.external_memo && (
                                          <div className="flex flex-col gap-1">
                                            <span className="text-xs text-muted-foreground">
                                              Notes
                                            </span>
                                            <span className="font-medium">
                                              {transaction.external_memo}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Deals */}
                                  {transaction.deals.length > 0 && (
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-semibold text-muted-foreground">
                                        Deals ({transaction.deals.length})
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
                                                  {deal.deal.loan_number ||
                                                    "No loan number"}
                                                </p>
                                              </div>
                                              <span className="text-sm font-medium">
                                                {formatCurrency(
                                                  deal.allocation_amount
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Investors */}
                                  {transaction.investors.length > 0 && (
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-semibold text-muted-foreground">
                                        Investors (
                                        {transaction.investors.length})
                                      </h4>
                                      <div className="space-y-2">
                                        {transaction.investors.map(
                                          (investor, idx) => (
                                            <div
                                              key={idx}
                                              className="p-2 rounded-md bg-background border border-border"
                                            >
                                              <div className="flex justify-between items-start">
                                                <div>
                                                  <p className="font-medium text-sm">
                                                    {investor.auth_clerk_users
                                                      ?.full_name || "N/A"}
                                                  </p>
                                                  <p className="text-xs text-muted-foreground">
                                                    {investor.auth_clerk_users
                                                      ?.email || ""}
                                                  </p>
                                                </div>
                                                <span className="text-sm font-medium">
                                                  {formatCurrency(
                                                    investor.allocation_amount
                                                  )}
                                                </span>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Documents */}
                                {transaction.documents.length > 0 && (
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
                                                {
                                                  doc.document_files
                                                    .document_name
                                                }
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                {doc.document_files
                                                  .document_category ||
                                                  "Document"}{" "}
                                                •{" "}
                                                {format(
                                                  new Date(
                                                    doc.document_files.uploaded_at
                                                  ),
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
                                    onClick={() => {
                                      setSelectedTransaction(transaction.id);
                                      setShowDocumentUpload(true);
                                    }}
                                  >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Manage Documents
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      router.push(
                                        `/balance-sheet/transactions/${transaction.id}`
                                      )
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Full Details
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="px-6 py-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {filteredTransactions.length} result
                  {filteredTransactions.length !== 1 ? "s" : ""}
                </p>
              </div>
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

      <TransactionDetailsSheet
        transactionId={detailsTransactionId}
        open={showDetailsSheet}
        onOpenChange={(open) => {
          setShowDetailsSheet(open);
          if (!open) {
            // Reset transaction ID when sheet closes
            setDetailsTransactionId(null);
          }
        }}
      />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <TransactionsPageContent />
    </Suspense>
  );
}
