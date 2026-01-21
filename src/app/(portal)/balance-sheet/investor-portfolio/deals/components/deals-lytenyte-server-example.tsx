"use client";

/**
 * LyteNyte Grid - Server-Side Data Example
 *
 * This example shows how to use LyteNyte Grid with server-side data loading.
 * Perfect for large datasets that need to be fetched dynamically.
 *
 * ✅ Server-side pagination
 * ✅ Dynamic data loading
 * ✅ Optimal performance for large datasets
 *
 * API Reference: https://www.1771technologies.com/docs/intro-getting-started
 *
 * Note: The full server data source API uses `dataFetcher` for complex scenarios.
 * This example uses a simpler pattern with client-side data source + async fetch.
 */

import { useId, useEffect, useState } from "react";
import { LyteNyte } from "@/components/lytenyte-pro";
import { useLyteNyte, useClientRowDataSource } from "@/hooks/use-lytenyte-pro";
import { Badge } from "@/components/ui/shadcn/badge";
import type { Column } from "@1771technologies/lytenyte-pro/types";

interface Deal {
  id: string;
  name: string;
  amount: number;
  status: "Active" | "Pending" | "Closed";
  date: string;
  investor: string;
}

/**
 * Server-side data grid using client data source with async fetch.
 *
 * This pattern is simpler than the full server data source API
 * and works well for most use cases.
 */
export function DealsLyteNyteServerGrid() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    async function fetchDeals() {
      try {
        const response = await fetch("/api/deals");
        if (!response.ok) throw new Error("Failed to fetch deals");
        const data = await response.json();
        setDeals(data.deals || []);
      } catch (error) {
        console.error("Error fetching deals:", error);
        setDeals([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDeals();
  }, []);

  // Define columns with correct LyteNyte API
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

  // Create client data source
  const dataSource = useClientRowDataSource<Deal>({
    data: deals,
    rowIdLeaf: (d, i) => d.data?.id ?? String(i),
  });

  // Create the grid instance
  const gridId = useId();
  const grid = useLyteNyte<Deal>({
    gridId,
    columns,
    rowDataSource: dataSource,
    columnBase: {
      uiHints: {
        resizable: true,
        sortable: true,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="h-[600px] w-full rounded-md border flex items-center justify-center">
        <span className="text-muted-foreground">Loading deals...</span>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full rounded-md border">
      <LyteNyte grid={grid} />
    </div>
  );
}

/**
 * Example API Route (/api/deals/route.ts):
 *
 * ```ts
 * import { NextRequest, NextResponse } from "next/server";
 *
 * export async function GET(request: NextRequest) {
 *   const searchParams = request.nextUrl.searchParams;
 *   const page = parseInt(searchParams.get("page") || "0");
 *   const limit = parseInt(searchParams.get("limit") || "100");
 *   const sortBy = searchParams.get("sortBy");
 *   const sortOrder = searchParams.get("sortOrder");
 *
 *   // Fetch from your database (Supabase example)
 *   let query = supabase
 *     .from("deals")
 *     .select("*", { count: "exact" })
 *     .range(page, page + limit - 1);
 *
 *   if (sortBy) {
 *     query = query.order(sortBy, { ascending: sortOrder === "asc" });
 *   }
 *
 *   const { data, count, error } = await query;
 *
 *   if (error) {
 *     return NextResponse.json({ error: error.message }, { status: 500 });
 *   }
 *
 *   return NextResponse.json({
 *     deals: data,
 *     total: count || 0,
 *   });
 * }
 * ```
 */
