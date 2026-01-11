"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

interface FindPanelProps {
  onClose: () => void;
}

export function FindPanel({ onClose }: FindPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Find</span>
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘F
          </kbd>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 transition-colors hover:bg-accent"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="border-b border-border p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find..."
            className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto p-3">
        {searchQuery ? (
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Searching for &ldquo;{searchQuery}&rdquo;...</p>
            <p className="text-xs">
              Search functionality will be integrated with the GrapesJS editor to
              find components, layers, and content.
            </p>
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            <Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>Enter a search term to find elements, components, or content.</p>
          </div>
        )}
      </div>
    </div>
  );
}
