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
import { useSupabase } from "@/hooks/use-supabase";
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
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Textarea } from "@/components/ui/shadcn/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/shadcn/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/shadcn/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";
import { Loader2, Link as LinkIcon, Check, ChevronsUpDown, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { MatchImpactDialog } from "./match-impact-dialog";

interface Transfer {
  id: number;
  brex_transfer_id: string;
  counterparty_name: string | null;
  display_name: string | null;
  description: string | null;
  amount: number | null;
  process_date: string | null;
}

// The Brex account name (used as FROM/TO for internal account)
const BREX_ACCOUNT_NAME = "Brrrr Loans 1 LLC";

// Derive FROM and TO based on amount direction
// Negative amount = incoming (FROM: counterparty, TO: Brex)
// Positive amount = outgoing (FROM: Brex, TO: counterparty)
const getTransferDirection = (transfer: Transfer) => {
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

interface Vendor {
  id: number;
  name: string | null;
  email: string | null;
}

const formatCurrency = (amount: number | null) => {
  if (amount === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const columns: ColumnDef<Transfer>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
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
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue("id")}</span>,
  },
  {
    accessorKey: "process_date",
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
      const date = row.getValue("process_date") as string | null;
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
      const { from } = getTransferDirection(row.original);
      return <span className="text-sm">{from}</span>;
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const fromA = getTransferDirection(rowA.original).from;
      const fromB = getTransferDirection(rowB.original).from;
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
      const { to } = getTransferDirection(row.original);
      return <span className="text-sm">{to}</span>;
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const toA = getTransferDirection(rowA.original).to;
      const toB = getTransferDirection(rowB.original).to;
      return toA.localeCompare(toB);
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2"
      >
        Description
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      return <span className="text-sm text-muted-foreground">{description || "-"}</span>;
    },
  },
  {
    accessorKey: "amount",
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
      const amount = row.getValue("amount") as number | null;
      return (
        <div className="text-right font-semibold">
          {formatCurrency(amount)}
        </div>
      );
    },
  },
];

interface UnmatchedTransfersTableProps {
  onMatchCreated?: () => void;
}

export function UnmatchedTransfersTable({ onMatchCreated }: UnmatchedTransfersTableProps) {
  const supabase = useSupabase();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [vendorOpen, setVendorOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const table = useReactTable({
    data: transfers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const transfer = row.original;
      const { from, to } = getTransferDirection(transfer);
      return (
        from.toLowerCase().includes(search) ||
        to.toLowerCase().includes(search) ||
        (transfer.description?.toLowerCase().includes(search) ?? false) ||
        String(transfer.id).includes(search)
      );
    },
    state: {
      rowSelection,
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const loadData = useCallback(async () => {
    if (!supabase) return;

    setLoading(true);
    try {
      // Fetch unmatched transfers via API
      const response = await fetch("/api/brex/match-transfer-to-vendor");
      const data = await response.json();

      if (data.success) {
        setTransfers(data.transfers || []);
      }

      // Load vendors
      const { data: vendorsData } = await supabase
        .from("api_brex_vendors")
        .select("id, name, email")
        .order("name");

      setVendors(vendorsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load transfer matching data",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBulkMatch = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedTransferIds = selectedRows.map((row) => row.original.id);

    if (selectedTransferIds.length === 0) {
      toast({
        variant: "destructive",
        title: "No Selection",
        description: "Please select at least one transfer",
      });
      return;
    }

    if (!selectedVendor) {
      toast({
        variant: "destructive",
        title: "No Vendor",
        description: "Please select a vendor",
      });
      return;
    }

    // Open the impact preview dialog
    setDialogOpen(true);
  };

  const handleMatchComplete = async () => {
    // Close dialog first
    setDialogOpen(false);
    
    // Reset selections and reload data
    setRowSelection({});
    setSelectedVendor("");
    setNotes("");
    setVendorOpen(false);
    await loadData();
    onMatchCreated?.(); // Notify parent to refresh counts
  };

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const selectedTransferIds = table.getFilteredSelectedRowModel().rows.map((row) => row.original.id);

  // Auto-suggest vendors based on selected transfers
  const suggestedVendors = (() => {
    if (selectedCount === 0) return [];

    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const suggestions: Array<{ vendor: Vendor; confidence: number; reason: string }> = [];

    // Get counterparty names and emails from selected transfers
    const transferNames = selectedRows
      .map((r) => r.original.display_name || r.original.counterparty_name)
      .filter(Boolean);

    vendors.forEach((vendor) => {
      if (!vendor.name && !vendor.email) return;

      let confidence = 0;
      let reason = "";

      // Name match (simple contains check)
      if (vendor.name) {
        const vendorNameLower = vendor.name.toLowerCase();
        transferNames.forEach((transferName) => {
          if (transferName && vendorNameLower.includes(transferName.toLowerCase())) {
            confidence += 0.7;
            reason = `Name match: "${transferName}"`;
          }
        });
      }

      // Email match would go here (if we had counterparty email)

      if (confidence > 0) {
        suggestions.push({ vendor, confidence, reason });
      }
    });

    // Sort by confidence and take top 3
    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  })();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Match Transfers to Vendors</CardTitle>
          <CardDescription>
            Select transfers and match them to vendors in bulk
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
    <Card>
      <CardHeader>
        <CardTitle>Match Transfers to Vendors</CardTitle>
        <CardDescription>
          Select transfers and match them to vendors in bulk ({transfers.length} unmatched)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {transfers.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              All transfers are matched! 🎉
            </p>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search transfers..."
                value={table.getState().globalFilter ?? ""}
                onChange={(event) => table.setGlobalFilter(event.target.value)}
                className="max-w-sm"
              />
              {selectedCount > 0 && (
                <div className="text-sm text-muted-foreground">
                  {selectedCount} selected
                </div>
              )}
            </div>

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
                          data-state={row.getIsSelected() && "selected"}
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
                {table.getFilteredRowModel().rows.length} transfer(s)
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

            {/* Vendor Selection & Match */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Match Selected to Vendor</h3>

              {/* Auto-Suggest */}
              {suggestedVendors.length > 0 && (
                <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Suggested Vendors:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedVendors.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVendor(suggestion.vendor.id.toString());
                          toast({
                            title: "Vendor Selected",
                            description: `${suggestion.vendor.name} - ${suggestion.reason}`,
                          });
                        }}
                        className="text-xs"
                      >
                        {suggestion.vendor.name}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="vendor">Select Vendor</Label>
                <Popover open={vendorOpen} onOpenChange={setVendorOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={vendorOpen}
                      className="w-full justify-between"
                    >
                      {selectedVendor
                        ? vendors.find((v) => v.id.toString() === selectedVendor)?.name || "Select vendor..."
                        : "Select vendor..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Search vendor..." />
                      <CommandList className="max-h-[300px] overflow-y-auto">
                        <CommandEmpty>No vendor found.</CommandEmpty>
                        <CommandGroup>
                          {vendors.map((vendor) => (
                            <CommandItem
                              key={vendor.id}
                              value={vendor.name || ""}
                              onSelect={() => {
                                setSelectedVendor(vendor.id.toString());
                                setVendorOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedVendor === vendor.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {vendor.name || "Unnamed Vendor"}
                                </span>
                                {vendor.email && (
                                  <span className="text-xs text-muted-foreground">
                                    {vendor.email}
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about these matches..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <Button
                onClick={handleBulkMatch}
                disabled={selectedCount === 0 || !selectedVendor}
                className="w-full"
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                Match {selectedCount} Transfer{selectedCount !== 1 ? "s" : ""} to Vendor
              </Button>
            </div>
          </>
        )}
      </CardContent>

      {/* Match Impact Dialog */}
      <MatchImpactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transferIds={selectedTransferIds}
        vendorId={selectedVendor ? parseInt(selectedVendor) : 0}
        notes={notes}
        onMatchComplete={handleMatchComplete}
      />
    </Card>
  );
}

