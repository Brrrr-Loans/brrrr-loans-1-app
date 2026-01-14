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
 *
 * API Reference: https://www.1771technologies.com/docs/intro-getting-started
 */

import { useId } from "react";
import { LyteNyte } from "@/components/lytenyte-pro";
import { useLyteNyte, useClientRowDataSource } from "@/hooks/use-lytenyte-pro";
import { Badge } from "@/components/ui/feedback/badge";
import type { Column } from "@1771technologies/lytenyte-pro/types";

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
  // Define columns with correct LyteNyte API
  // Note: resizable/sortable are set via columnBase, not per-column
  const columns: Column<Deal>[] = [
    {
      id: "name",
      name: "Deal Name",
      width: 250,
      widthMin: 150,
    },
    {
      id: "amount",
      name: "Amount",
      width: 150,
      widthMin: 100,
      type: "number",
      // Use cellRenderer for custom formatting
      cellRenderer: ({ row, grid, column }) => {
        const value = grid.api.columnField(column, row) as number | null;
        if (value == null) return null;
        return (
          <div className="flex h-full w-full items-center px-2">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value)}
          </div>
        );
      },
    },
    {
      id: "status",
      name: "Status",
      width: 120,
      widthMin: 100,
      // Custom cell renderer with Badge
      cellRenderer: ({ row, grid, column }) => {
        const status = grid.api.columnField(column, row) as Deal["status"] | null;
        if (!status) return null;

        const variant =
          status === "Active"
            ? "default"
            : status === "Pending"
              ? "secondary"
              : "outline";

        return (
          <div className="flex h-full w-full items-center px-2">
            <Badge variant={variant}>{status}</Badge>
          </div>
        );
      },
    },
    {
      id: "investor",
      name: "Investor",
      width: 200,
      widthMin: 150,
    },
    {
      id: "date",
      name: "Date",
      width: 150,
      widthMin: 100,
      type: "date",
      // Format date using cellRenderer
      cellRenderer: ({ row, grid, column }) => {
        const dateStr = grid.api.columnField(column, row) as string | null;
        if (!dateStr) return null;

        const date = new Date(dateStr);
        return (
          <div className="flex h-full w-full items-center px-2">
            {date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        );
      },
    },
  ];

  // Create client-side data source
  const dataSource = useClientRowDataSource<Deal>({
    data: deals,
    // rowIdLeaf is the correct property (not getRowId)
    rowIdLeaf: (d, i) => d.data?.id ?? String(i),
  });

  // Create the grid instance
  const gridId = useId();
  const grid = useLyteNyte<Deal>({
    gridId,
    columns,
    // rowDataSource is the correct property (not dataSource)
    rowDataSource: dataSource,
    // Column defaults (resizable, sortable set via uiHints)
    columnBase: {
      uiHints: {
        resizable: true,
        sortable: true,
      },
    },
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
