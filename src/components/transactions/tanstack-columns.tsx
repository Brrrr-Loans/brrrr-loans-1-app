"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/overlays/dropdown-menu";
import {
  ChevronRight,
  MoreHorizontal,
  Download,
  Printer,
  ArrowUpDown,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TransactionWithDetails } from "@/types/transactions";

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
    case "processed": // Brex uses "PROCESSED" to mean complete
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "danger";
    case "processing":
      return "info";
    default:
      return "secondary";
  }
};

export const createTransactionColumns = (
  onDownload: (txId: number) => void,
  onPrint: (txId: number) => void
): ColumnDef<TransactionWithDetails>[] => [
  // Column 1: Expand chevron
  {
    id: "expand",
    enableHiding: false,
    size: 50,
    header: () => null,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.stopPropagation(); // Don't trigger row click
          row.toggleExpanded();
        }}
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 transition-transform",
            row.getIsExpanded() && "rotate-90"
          )}
        />
      </Button>
    ),
  },

  // Column 2: Date (sortable) - Use Brex process_date, date only
  {
    id: "transaction_date",
    size: 130,
    accessorFn: (row) => {
      const brexTransfer = row.brex_link?.[0]?.brex_transfer;
      return brexTransfer?.process_date || row.transaction_date;
    },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-1"
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const brexTransfer = row.original.brex_link?.[0]?.brex_transfer;
      const dateStr =
        brexTransfer?.process_date || row.original.transaction_date;
      return (
        <div className="text-sm text-muted-foreground">
          {format(new Date(dateStr), "MMM d, yyyy")}
        </div>
      );
    },
  },

  // Column 3: From - Use matched investor name
  {
    id: "from",
    size: 180,
    header: "From",
    accessorFn: (row) => {
      // Get matched investor/org name
      const investor = row.investors?.[0];
      const investorName =
        investor?.auth_clerk_users?.full_name ||
        investor?.auth_clerk_orgs?.clerk_org_name ||
        "Unknown";

      const amount = row.transaction_amount
        ? Number(row.transaction_amount)
        : 0;

      if (amount > 0) {
        // Outgoing (Distribution/Redemption): Brrrr sends TO investor
        return "Brrrr Loans 1 LLC";
      } else {
        // Incoming (Contribution): Investor sends TO Brrrr
        return investorName;
      }
    },
    cell: ({ row }) => {
      const fromName = row.getValue("from") as string;
      return (
        <div className="max-w-[180px] truncate text-sm font-medium">
          {fromName}
        </div>
      );
    },
  },

  // Column 4: To - Use matched investor name (opposite of FROM)
  {
    id: "to",
    size: 180,
    header: "To",
    accessorFn: (row) => {
      // Get matched investor/org name
      const investor = row.investors?.[0];
      const investorName =
        investor?.auth_clerk_users?.full_name ||
        investor?.auth_clerk_orgs?.clerk_org_name ||
        "Unknown";

      const amount = row.transaction_amount
        ? Number(row.transaction_amount)
        : 0;

      if (amount > 0) {
        // Outgoing (Distribution/Redemption): Brrrr sends to INVESTOR
        return investorName;
      } else {
        // Incoming (Contribution): Investor sends to BRRRR
        return "Brrrr Loans 1 LLC";
      }
    },
    cell: ({ row }) => {
      const toName = row.getValue("to") as string;
      return (
        <div className="max-w-[180px] truncate text-sm font-medium">
          {toName}
        </div>
      );
    },
  },

  // Column 5: Transaction Type - Simple text display
  {
    id: "transaction_type",
    size: 150,
    accessorKey: "transaction_method",
    header: "Transaction Type",
    cell: ({ row }) => {
      const method = row.getValue("transaction_type") as string | null;
      return (
        <span className="text-sm text-muted-foreground">
          {method?.toUpperCase() || "N/A"}
        </span>
      );
    },
  },

  // Column 6: Status - Use transaction_status
  {
    id: "status",
    size: 120,
    accessorKey: "transaction_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string | null;
      return (
        <Badge variant={getStatusBadgeVariant(status)}>{status || "N/A"}</Badge>
      );
    },
  },

  // Column 7: Ledger Type
  {
    id: "ledger_type",
    size: 140,
    accessorKey: "ledger_entry_type",
    header: "Ledger Type",
    cell: ({ row }) => {
      const type = row.getValue("ledger_type") as string | null;
      const label = type === "contribution" ? "Contribution" :
                    type === "distribution" ? "Distribution" :
                    type === "redemption" ? "Redemption" : type;
      return (
        <Badge variant="outline" className="text-sm">
          {label || "N/A"}
        </Badge>
      );
    },
  },

  // Column 8: Amount (sortable, right-aligned) - Use absolute value
  {
    id: "amount",
    size: 150,
    accessorKey: "transaction_amount",
    header: ({ column}) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-1 ml-auto"
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number | null;
      // Use absolute value (distributions are positive, contributions are negative)
      const absAmount = amount ? Math.abs(Number(amount)) : null;
      return (
        <div className="text-right font-semibold">
          {formatCurrency(absAmount)}
        </div>
      );
    },
  },

  // Column 9: Actions dropdown (MoreHorizontal)
  {
    id: "actions",
    enableHiding: false,
    size: 50,
    header: () => null,
    cell: ({ row }) => {
      const tx = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()} // Don't trigger row click
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDownload(tx.id);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onPrint(tx.id);
              }}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
              <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
