"use client";

import { Table } from "@tanstack/react-table";
import { Button, Badge, Input } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
import { Search, Plus, Settings, Download, X } from "lucide-react";

interface TransactionFilterBarProps<TData> {
  table: Table<TData>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  onSettingsOpen: () => void;
  onExport: () => void;
}

export function TransactionFilterBar<TData>({
  table,
  globalFilter,
  setGlobalFilter,
  onSettingsOpen,
  onExport,
}: TransactionFilterBarProps<TData>) {
  const activeFilters = table.getState().columnFilters;

  const formatFilterLabel = (filter: { id: string; value: unknown }) => {
    const columnName = filter.id
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    return `${columnName}: ${filter.value}`;
  };

  return (
    <div className="flex items-center gap-3">
      {/* Left: Search */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder="Search"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-9 h-8 text-sm"
        />
        {globalFilter && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => setGlobalFilter("")}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filter Pills (when active) */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="gap-1 pr-1 h-8 text-xs"
            >
              {formatFilterLabel(filter)}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-transparent"
                onClick={() =>
                  table.getColumn(filter.id)?.setFilterValue(undefined)
                }
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => table.resetColumnFilters()}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Center: Add Filter button */}
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Plus className="h-4 w-4 mr-2" />
              Add filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem
              onClick={() => {
                const column = table.getColumn("status");
                if (column) {
                  column.setFilterValue("pending");
                }
              }}
            >
              Status: Pending
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const column = table.getColumn("status");
                if (column) {
                  column.setFilterValue("processing");
                }
              }}
            >
              Status: Processing
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const column = table.getColumn("status");
                if (column) {
                  column.setFilterValue("processed");
                }
              }}
            >
              Status: Processed
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const column = table.getColumn("status");
                if (column) {
                  column.setFilterValue("failed");
                }
              }}
            >
              Status: Failed
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const column = table.getColumn("transaction_type");
                if (column) {
                  column.setFilterValue("wire");
                }
              }}
            >
              Type: Wire
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const column = table.getColumn("transaction_type");
                if (column) {
                  column.setFilterValue("ach");
                }
              }}
            >
              Type: ACH
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const column = table.getColumn("ledger_type");
                if (column) {
                  column.setFilterValue("contribution");
                }
              }}
            >
              Ledger: Contribution
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const column = table.getColumn("ledger_type");
                if (column) {
                  column.setFilterValue("distribution");
                }
              }}
            >
              Ledger: Distribution
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      {/* Right: Settings + Download */}
      <div className="flex items-center gap-3 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onSettingsOpen}
          title="Table settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-8" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
}

