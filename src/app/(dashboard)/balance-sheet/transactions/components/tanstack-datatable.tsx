"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { useSearchParams } from "next/navigation";
import { useSupabase } from "@/hooks/use-supabase";
import { useImpersonation } from "@/contexts/impersonation-context";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnOrderState,
  ExpandedState,
  getExpandedRowModel,
  ColumnResizeMode,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { createTransactionColumns } from "./tanstack-columns";
import { TransactionFilterBar } from "./filter-bar";
import { InlineTransactionDetails } from "./inline-transaction-details";
import { TransactionDetailsSheet } from "./transaction-details-sheet";
import { TransactionTableSettingsSheet } from "./tanstack-settings-sheet";
import { exportToCSV, formatTransactionsForExport } from "@/lib/csv-export";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { TransactionWithDetails } from "@/types/transactions";

const isTransactionWithDetailsArray = (
  value: unknown
): value is TransactionWithDetails[] => Array.isArray(value);

export function TransactionsDataTable() {
  // State
  const [data, setData] = useState<TransactionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "transaction_date", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([
    "expand",
    "transaction_date",
    "from",
    "to",
    "transaction_type",
    "status",
    "ledger_type",
    "amount",
    "actions",
  ]);
  const [tableDensity, setTableDensity] = useState<
    "compact" | "simple" | "detailed"
  >("simple");
  const [columnResizeMode] = useState<ColumnResizeMode>("onChange");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState<number | null>(null);

  const supabase = useSupabase();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "all";
  const { impersonatedUserId, isImpersonating } = useImpersonation();

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    if (!supabase) {
      console.log("Supabase client not ready yet");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // If impersonating, fetch the user's organization memberships where they have INVESTMENT interest
      let impersonatedUserOrgIds: number[] = [];
      if (isImpersonating && impersonatedUserId) {
        const { data: orgMemberships } = await supabase
          .from("auth_clerk_orgs_members")
          .select("clerk_org_id, clerk_org_role")
          .eq("auth_clerk_users_id", impersonatedUserId)
          .neq("clerk_org_role", "viewer"); // Exclude viewer role (employees with no investment interest)
        
        impersonatedUserOrgIds = (orgMemberships || [])
          .map((m) => m.clerk_org_id)
          .filter((id): id is number => id !== null);
      }

      // Fetch transactions with all related data
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

        // Try simpler query if complex one fails
        console.log("Attempting simpler query...");
        const { data: simpleData, error: simpleError } = await supabase
          .from("bsi_transactions")
          .select("*")
          .order("transaction_date", { ascending: false })
          .limit(10);

        if (simpleError) {
          console.error("Simple query also failed:", simpleError);
          setError("Unable to load transactions. Please check permissions.");
        } else {
          console.log("Simple query succeeded, complex query has join issue");
          setError("Complex join error - using simplified view");
          setData(simpleData || []);
        }
        return;
      }

      // Filter by impersonated user if active
      // Admin users see all transactions via RLS, so we need client-side filtering when impersonating
      let filteredTransactions = isTransactionWithDetailsArray(data) ? data : [];
      
      if (isImpersonating && impersonatedUserId) {
        filteredTransactions = filteredTransactions.filter((tx) => {
          // Check if impersonated user is associated with this transaction via investors junction
          // Either directly via clerk_user_id OR via an org they are a member of
          return tx.investors?.some(
            (inv) =>
              inv.clerk_user_id === impersonatedUserId ||
              (inv.clerk_org_id !== null && impersonatedUserOrgIds.includes(inv.clerk_org_id))
          );
        });
      }

      setData(filteredTransactions);
    } catch (err) {
      console.error("Unexpected error fetching transactions:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, isImpersonating, impersonatedUserId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter by active tab
  const filteredData = useMemo(() => {
    if (activeTab === "all") return data;
    if (activeTab === "investments")
      return data.filter((t) => t.ledger_entry_type === "contribution");
    if (activeTab === "distributions")
      return data.filter((t) => t.ledger_entry_type === "distribution");
    return data;
  }, [data, activeTab]);

  // Handle row click → opens details sheet
  const handleRowClick = (txId: number) => {
    setSelectedTxId(txId);
    setDetailsSheetOpen(true);
  };

  // Handle PDF download
  const handleDownloadPDF = useCallback(async (transactionId: number) => {
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
  }, []);

  // Handle print
  const handlePrint = useCallback(async (transactionId: number) => {
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
  }, []);

  // Create table with columns
  const columns = createTransactionColumns(handleDownloadPDF, handlePrint);

  const table = useReactTable({
    data: filteredData,
    columns,
    columnResizeMode,
    enableColumnResizing: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      expanded,
      globalFilter,
      columnOrder,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  // Handle CSV export (after table is defined)
  const handleExport = useCallback(() => {
    try {
      const exportData = formatTransactionsForExport(
        table.getFilteredRowModel().rows.map((row) => row.original)
      );

      const timestamp = format(new Date(), "yyyy-MM-dd-HHmmss");
      const filename = `transactions-${activeTab}-${timestamp}.csv`;

      exportToCSV(exportData, filename);

      toast.success(
        `Exported ${exportData.length} transaction(s) to ${filename}`
      );
    } catch (error) {
      console.error("Error exporting transactions:", error);
      toast.error("Failed to export transactions");
    }
  }, [table, activeTab]);

  // Row height based on density
  const rowHeight = {
    compact: "h-10",
    simple: "h-14",
    detailed: "h-16",
  }[tableDensity];

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-[300px] bg-muted animate-pulse rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="rounded-md border">
          <div className="h-[500px] bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-destructive/20 p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-destructive"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-destructive mb-1">
                Unable to load transactions
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null);
                  fetchTransactions();
                }}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Brex-style filter bar */}
      <TransactionFilterBar
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        onSettingsOpen={() => setSettingsOpen(true)}
        onExport={handleExport}
      />

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table style={{ width: "100%", minWidth: table.getTotalSize() }}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted">
                  {headerGroup.headers.map((header) => (
                    <TableHead 
                      key={header.id} 
                      className="h-12 relative"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      <div
                        className={cn(
                          "absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none select-none bg-border opacity-0 hover:opacity-100",
                          header.column.getIsResizing() && "bg-primary opacity-100"
                        )}
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                      />
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  {/* Clickable row */}
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      rowHeight,
                      "cursor-pointer hover:bg-muted/50 transition-colors"
                    )}
                    onClick={() => handleRowClick(row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Inline expanded details (chevron toggle) */}
                  {row.getIsExpanded() && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={9} className="p-0">
                        <InlineTransactionDetails transaction={row.original} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} transaction(s)
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">Rows per page</p>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="w-[80px] h-9">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm font-medium text-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">First page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Last page</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction Details Sheet (opens on row click) */}
      <TransactionDetailsSheet
        transactionId={selectedTxId}
        open={detailsSheetOpen}
        onOpenChange={(open) => {
          setDetailsSheetOpen(open);
          if (!open) setSelectedTxId(null);
        }}
      />

      {/* Table Settings Sheet */}
      <TransactionTableSettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        table={table}
        columnOrder={columnOrder}
        setColumnOrder={setColumnOrder}
        tableDensity={tableDensity}
        setTableDensity={setTableDensity}
      />
    </div>
  );
}
