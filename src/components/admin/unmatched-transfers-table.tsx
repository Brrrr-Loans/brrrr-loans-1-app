"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/forms/checkbox";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { Textarea } from "@/components/ui/forms/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/navigation/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/overlays/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select";
import { Loader2, Link as LinkIcon, Check, ChevronsUpDown, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Transfer {
  id: number;
  brex_transfer_id: string;
  counterparty_name: string | null;
  display_name: string | null;
  description: string | null;
  amount: number | null;
  process_date: string | null;
}

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
    accessorKey: "display_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2"
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const displayName = row.original.display_name;
      const counterpartyName = row.original.counterparty_name;
      return displayName || counterpartyName || "No name";
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
      return description || "-";
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
      return <div className="text-right font-semibold">{formatCurrency(amount)}</div>;
    },
  },
];

export function UnmatchedTransfersTable() {
  const supabase = useSupabase();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [vendorOpen, setVendorOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: transfers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      rowSelection,
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  useEffect(() => {
    if (supabase) {
      loadData();
    }
  }, [supabase]);

  const loadData = async () => {
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
  };

  const handleBulkMatch = async () => {
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

    setMatching(true);
    try {
      const response = await fetch("/api/brex/match-transfer-to-vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transfer_ids: selectedTransferIds,
          vendor_id: parseInt(selectedVendor),
          notes: notes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Success!",
          description: data.message || `Matched ${selectedTransferIds.length} transfer(s)`,
        });

        // Reset selections and reload data
        setRowSelection({});
        setSelectedVendor("");
        setNotes("");
        await loadData();
      } else {
        throw new Error(data.error || "Failed to match transfers");
      }
    } catch (error) {
      console.error("Error matching transfers:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to match transfers",
      });
    } finally {
      setMatching(false);
    }
  };

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

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
                value={(table.getColumn("display_name")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("display_name")?.setFilterValue(event.target.value)
                }
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
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search vendor..." />
                      <CommandList>
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
                disabled={selectedCount === 0 || !selectedVendor || matching}
                className="w-full"
              >
                {matching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Matching...
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Match {selectedCount} Transfer{selectedCount !== 1 ? "s" : ""} to Vendor
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

