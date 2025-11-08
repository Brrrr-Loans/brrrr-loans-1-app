"use client";

/**
 * LyteNyte Grid Example for Deals
 * 
 * This is a practical example showing how to use LyteNyte Grid
 * with your existing deals data.
 * 
 * ✅ Follows optimal bundling practices
 * ✅ Uses specific imports for tree shaking
 * ✅ Integrates with shadcn/ui theming
 */

import { LyteNyte } from "@/components/lytenyte-pro";
import { useLyteNyte, useClientRowDataSource } from "@/hooks/use-lytenyte-pro";
import { Badge } from "@/components/ui/badge";

// Example deal type - replace with your actual Deal type
interface Deal {
  id: string;
  name: string;
  amount: number;
  status: "Active" | "Pending" | "Closed";
  date: string;
  investor: string;
}

interface DealsLyteNyteGridProps {
  deals: Deal[];
}

export function DealsLyteNyteGrid({ deals }: DealsLyteNyteGridProps) {
  // Create the grid instance
  const grid = useLyteNyte<Deal>({
    columns: [
      {
        id: "name",
        title: "Deal Name",
        width: 250,
        minWidth: 150,
        resizable: true,
        sortable: true,
      },
      {
        id: "amount",
        title: "Amount",
        width: 150,
        minWidth: 100,
        resizable: true,
        sortable: true,
        // Format currency
        valueFormatter: (params) => {
          const value = params.value as number;
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value);
        },
      },
      {
        id: "status",
        title: "Status",
        width: 120,
        minWidth: 100,
        resizable: true,
        sortable: true,
        // Custom cell renderer with Badge
        cellRenderer: (params) => {
          const status = params.value as Deal["status"];
          const variant = 
            status === "Active" ? "default" :
            status === "Pending" ? "secondary" :
            "outline";
          
          return <Badge variant={variant}>{status}</Badge>;
        },
      },
      {
        id: "investor",
        title: "Investor",
        width: 200,
        minWidth: 150,
        resizable: true,
        sortable: true,
      },
      {
        id: "date",
        title: "Date",
        width: 150,
        minWidth: 100,
        resizable: true,
        sortable: true,
        // Format date
        valueFormatter: (params) => {
          const date = new Date(params.value as string);
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        },
      },
    ],
    // Use client-side data source for static data
    dataSource: useClientRowDataSource({
      data: deals,
      getRowId: (row) => row.id,
    }),
    // Optional: Enable features
    // enableSorting: true,
    // enableFiltering: true,
    // enableRowSelection: true,
    
    // Optional: Callbacks
    // onRowClick: (row) => {
    //   console.log("Deal clicked:", row.data);
    //   // Navigate to deal details
    //   // router.push(`/dashboard/deals/${row.data.id}`);
    // },
  });

  return (
    <div className="h-[600px] w-full rounded-md border">
      <LyteNyte grid={grid} />
    </div>
  );
}

/**
 * Example usage in a page:
 * 
 * ```tsx
 * import { DealsLyteNyteGrid } from "@/components/deals/deals-lytenyte-grid-example";
 * 
 * export default function DealsPage() {
 *   const deals = [
 *     {
 *       id: "1",
 *       name: "Multifamily Deal - Austin TX",
 *       amount: 1500000,
 *       status: "Active",
 *       date: "2024-01-15",
 *       investor: "John Smith",
 *     },
 *     // ... more deals
 *   ];
 * 
 *   return (
 *     <div className="container mx-auto py-6">
 *       <h1 className="text-2xl font-bold mb-4">Deals</h1>
 *       <DealsLyteNyteGrid deals={deals} />
 *     </div>
 *   );
 * }
 * ```
 */

