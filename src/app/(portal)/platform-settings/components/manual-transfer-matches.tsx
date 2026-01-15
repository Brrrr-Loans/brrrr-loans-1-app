"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
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
} from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select";
import {
  Loader2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlays/dialog";

// The Brex account name (used as FROM/TO for internal account)
const BREX_ACCOUNT_NAME = "Brrrr Loans 1 LLC";

// Derive FROM and TO based on amount direction
// Negative amount = incoming (FROM: counterparty, TO: Brex)
// Positive amount = outgoing (FROM: Brex, TO: counterparty)
const getTransferDirection = (transfer: { display_name: string | null; counterparty_name: string | null; amount: number | null }) => {
  const counterparty = transfer.display_name || transfer.counterparty_name || "Unknown";
  const amount = transfer.amount ?? 0;
  
  if (amount < 0) {
    // Incoming transfer (contribution, payment received)
    return { from: counterparty, to: BREX_ACCOUNT_NAME };
  } else {
    // Outgoing transfer (distribution, payment sent)
    return { from: BREX_ACCOUNT_NAME, to: counterparty };
  }
};

interface ManualMatch {
  id: number;
  brex_transfer_id: string;
  match_method: string;
  match_notes: string | null;
  created_at: string;
  updated_at: string | null;
  api_brex_transfers: {
    id: number;
    amount: number | null;
    process_date: string | null;
    display_name: string | null;
    counterparty_name: string | null;
  };
  api_brex_vendors: {
    id: number;
    name: string | null;
    email: string | null;
  };
  created_by_user: {
    id: number;
    full_name: string | null;
    email: string | null;
  } | null;
  updated_by_user: {
    id: number;
    full_name: string | null;
    email: string | null;
  } | null;
}

interface ManualTransferMatchesProps {
  onMatchDeleted?: () => void;
}

const formatCurrency = (amount: number | null) => {
  if (amount === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString();
};

export function ManualTransferMatches({ onMatchDeleted }: ManualTransferMatchesProps) {
  const [matches, setMatches] = useState<ManualMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteMatchId, setDeleteMatchId] = useState<number | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<ManualMatch>[] = [
    {
      accessorKey: "api_brex_transfers.id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.api_brex_transfers.id}
        </span>
      ),
    },
    {
      accessorKey: "api_brex_transfers.process_date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.original.api_brex_transfers.process_date;
        return date ? new Date(date).toLocaleDateString() : "No date";
      },
    },
    {
      id: "from",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          From
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { from } = getTransferDirection(row.original.api_brex_transfers);
        return <span className="text-sm">{from}</span>;
      },
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const fromA = getTransferDirection(rowA.original.api_brex_transfers).from;
        const fromB = getTransferDirection(rowB.original.api_brex_transfers).from;
        return fromA.localeCompare(fromB);
      },
    },
    {
      id: "to",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          To
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { to } = getTransferDirection(row.original.api_brex_transfers);
        return <span className="text-sm">{to}</span>;
      },
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const toA = getTransferDirection(rowA.original.api_brex_transfers).to;
        const toB = getTransferDirection(rowB.original.api_brex_transfers).to;
        return toA.localeCompare(toB);
      },
    },
    {
      accessorKey: "api_brex_transfers.amount",
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const amount = row.original.api_brex_transfers.amount;
        return (
          <div className="text-right font-semibold">
            {formatCurrency(amount)}
          </div>
        );
      },
    },
    {
      accessorKey: "api_brex_vendors.name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Vendor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.original.api_brex_vendors.name || "Unknown",
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Matched On
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground">
          {formatDate(row.original.created_at)}
        </div>
      ),
    },
    {
      accessorKey: "created_by_user",
      header: "Matched By",
      cell: ({ row }) => {
        const user = row.original.created_by_user;
        return user?.full_name || row.original.match_method === "automatic" ? "Automatic" : "-";
      },
    },
    {
      accessorKey: "match_notes",
      header: "Notes",
      cell: ({ row }) => row.original.match_notes || "-",
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteMatchId(row.original.id)}
            className="h-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: matches,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/brex/manual-matches");
      const data = await response.json();

      if (data.success) {
        setMatches(data.matches || []);
      }
    } catch (error) {
      console.error("Error loading manual matches:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load manual matches",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async () => {
    if (!deleteMatchId) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/brex/match-transfer-to-vendor/${deleteMatchId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Match Deleted",
          description: data.message,
        });

        setDeleteMatchId(null);
        await loadData();
        onMatchDeleted?.();
      } else {
        throw new Error(data.error || "Failed to delete match");
      }
    } catch (error) {
      console.error("Error deleting match:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete match",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matched Transfers</CardTitle>
          <CardDescription>
            View audit trail and manage matched transfers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Matched Transfers</CardTitle>
          <CardDescription>
            View audit trail and manage matched transfers ({matches.length} matches)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {matches.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No matched transfers yet. Switch to the Unmatched Transfers tab to create matches.
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="bg-muted">
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} className="h-12">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            className="hover:bg-muted/50 transition-colors"
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                          >
                            No results.
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
                  {table.getFilteredRowModel().rows.length} match(es)
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
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={table.getState().pagination.pageSize} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[10, 20, 30, 50].map((pageSize) => (
                          <SelectItem key={pageSize} value={pageSize.toString()}>
                            {pageSize}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-sm font-medium text-foreground">
                      Page {table.getState().pagination.pageIndex + 1} of{" "}
                      {table.getPageCount()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteMatchId !== null} onOpenChange={() => setDeleteMatchId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Match?</DialogTitle>
            <DialogDescription>
              This will remove the transfer-vendor match, but won't delete any synced transactions.
              The transfer will appear in the Unmatched tab again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteMatchId(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              variant="destructive"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Match"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

