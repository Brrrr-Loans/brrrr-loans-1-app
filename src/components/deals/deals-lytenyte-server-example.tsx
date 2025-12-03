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
 */

import { LyteNyte } from "@/components/lytenyte-pro";
import { useLyteNyte, useServerDataSource } from "@/hooks/use-lytenyte-pro";
import { Badge } from "@/components/ui/feedback/badge";

interface Deal {
  id: string;
  name: string;
  amount: number;
  status: "Active" | "Pending" | "Closed";
  date: string;
  investor: string;
}

export function DealsLyteNyteServerGrid() {
  // Server-side data source
  const dataSource = useServerDataSource<Deal>({
    // Fetch function - called when grid needs data
    getRows: async (params) => {
      try {
        // Build query parameters
        const queryParams = new URLSearchParams({
          page: String(params.startRow || 0),
          limit: String(params.endRow ? params.endRow - (params.startRow || 0) : 100),
        });

        // Add sorting if available
        if (params.sortModel && params.sortModel.length > 0) {
          const sort = params.sortModel[0];
          queryParams.append("sortBy", sort.colId);
          queryParams.append("sortOrder", sort.sort);
        }

        // Add filtering if available
        if (params.filterModel) {
          queryParams.append("filter", JSON.stringify(params.filterModel));
        }

        // Fetch data from your API
        const response = await fetch(`/api/deals?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch deals");
        }

        const data = await response.json();

        return {
          rows: data.deals,
          totalCount: data.total,
        };
      } catch (error) {
        console.error("Error fetching deals:", error);
        return {
          rows: [],
          totalCount: 0,
        };
      }
    },
    getRowId: (row) => row.id,
  });

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
        filterable: true,
      },
      {
        id: "amount",
        title: "Amount",
        width: 150,
        minWidth: 100,
        resizable: true,
        sortable: true,
        filterable: true,
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
        filterable: true,
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
        filterable: true,
      },
      {
        id: "date",
        title: "Date",
        width: 150,
        minWidth: 100,
        resizable: true,
        sortable: true,
        filterable: true,
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
    dataSource,
    
    // Enable server-side features
    enableSorting: true,
    enableFiltering: true,
    enableRowSelection: true,
    
    // Row click handler
    onRowClick: (row) => {
      console.log("Deal clicked:", row.data);
      // Example: Navigate to deal details
      // router.push(`/dashboard/deals/${row.data.id}`);
    },
  });

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

