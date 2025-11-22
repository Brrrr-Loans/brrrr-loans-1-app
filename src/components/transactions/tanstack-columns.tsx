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

interface TransactionWithDetails {
  id: number;
  transaction_amount: number | null;
  transaction_date: string;
  transaction_method: string | null;
  transaction_status: string | null;
  reference_number: string | null;
  external_memo: string | null;
  ledger_entry_type: string;
  // Brex transfer data
  brex_link?: Array<{
    brex_transfer_id: string;
    brex_transfer: {
      brex_transfer_id: string;
      display_name: string;
      payment_type: string;
      status: string;
      process_date: string;
      amount: number;
      counterparty_id: string | null;
    };
  }>;
  // Internal allocations
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
      const dateStr = brexTransfer?.process_date || row.original.transaction_date;
      return (
        <div className="text-sm text-muted-foreground">
          {format(new Date(dateStr), "MMM d, yyyy")}
        </div>
      );
    },
  },

  // Column 3: From - Based on Brex originating_account
  {
    id: "from",
    header: "From",
    accessorFn: (row) => {
      const brexTransfer = row.brex_link?.[0]?.brex_transfer;
      const vendorName = brexTransfer?.display_name;
      
      // Check if Brrrr is the originator (outgoing transfer)
      // Note: originating_account.id stored in raw_payload
      // If amount is positive OR we can check originating account ID
      const amount = row.transaction_amount ? Number(row.transaction_amount) : 0;
      
      if (amount > 0) {
        // Outgoing: Brrrr sends TO investor
        return "Brrrr Loans 1 LLC";
      } else {
        // Incoming: Investor sends TO Brrrr
        return vendorName || "Unknown Sender";
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

  // Column 4: To - Based on Brex originating_account (opposite of FROM)
  {
    id: "to",
    header: "To",
    accessorFn: (row) => {
      const brexTransfer = row.brex_link?.[0]?.brex_transfer;
      const vendorName = brexTransfer?.display_name;
      
      // Check transaction amount direction
      const amount = row.transaction_amount ? Number(row.transaction_amount) : 0;
      
      if (amount > 0) {
        // Outgoing: Brrrr sends to INVESTOR
        return vendorName || "Unknown Recipient";
      } else {
        // Incoming: Investor sends to BRRRR
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

  // Column 5: Transaction Type - Use Brex payment_type
  {
    id: "transaction_type",
    header: "Transaction Type",
    accessorFn: (row) => {
      const brexTransfer = row.brex_link?.[0]?.brex_transfer;
      return brexTransfer?.payment_type || "Unknown";
    },
    cell: ({ row }) => {
      const type = row.getValue("transaction_type") as string;
      const variant =
        type === "DOMESTIC_WIRE" ? "default" :
        type === "ACH" ? "secondary" :
        type === "BOOK_TRANSFER" ? "outline" : "secondary";
      
      const displayText =
        type === "DOMESTIC_WIRE" ? "Wire" :
        type === "ACH" ? "ACH" :
        type === "BOOK_TRANSFER" ? "Book Transfer" : type;
      
      return <Badge variant={variant}>{displayText}</Badge>;
    },
  },

  // Column 6: Status - Use Brex status
  {
    id: "status",
    header: "Status",
    accessorFn: (row) => {
      const brexTransfer = row.brex_link?.[0]?.brex_transfer;
      return brexTransfer?.status || row.transaction_status || "Unknown";
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant =
        status === "PROCESSED" ? "default" :
        status === "PENDING" ? "secondary" :
        status === "CANCELLED" ? "destructive" :
        status === "FAILED" ? "destructive" : "outline";
      
      const displayText =
        status === "PROCESSED" ? "Processed" :
        status === "PENDING" ? "Pending" :
        status === "CANCELLED" ? "Cancelled" :
        status === "FAILED" ? "Failed" : status;
      
      return <Badge variant={variant}>{displayText}</Badge>;
    },
  },

  // Column 7: Amount (sortable, right-aligned) - Use absolute value
  {
    id: "amount",
    accessorKey: "transaction_amount",
    header: ({ column }) => (
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

  // Column 8: Actions dropdown (MoreHorizontal)
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

