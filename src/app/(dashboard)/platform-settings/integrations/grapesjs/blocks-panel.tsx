"use client";

import { cn } from "@/lib/utils";
import type { Block } from "grapesjs";
import { Blocks, ChevronRight, Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { useGrapesEditor } from "./grapesjs-editor";

interface BlocksPanelProps {
  onClose: () => void;
}

interface BlocksByCategory {
  category?: { getId: () => string; getLabel: () => string };
  items: Block[];
}

export function BlocksPanel({ onClose }: BlocksPanelProps) {
  const { editor } = useGrapesEditor();
  const [blocksByCategory, setBlocksByCategory] = useState<BlocksByCategory[]>(
    []
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [addedBlockId, setAddedBlockId] = useState<string | null>(null);

  // Load blocks from GrapesJS Block Manager
  const loadBlocks = useCallback(() => {
    if (!editor?.Blocks) return;

    try {
      const blockManager = editor.Blocks;
      const categorizedBlocks = blockManager.getBlocksByCategory();

      setBlocksByCategory(categorizedBlocks as BlocksByCategory[]);

      // Auto-expand all categories on first load
      if (expandedCategories.size === 0 && categorizedBlocks.length > 0) {
        const allCategoryIds = new Set(
          categorizedBlocks.map((bc) =>
            bc.category ? bc.category.getId() : "uncategorized"
          )
        );
        setExpandedCategories(allCategoryIds);
      }
    } catch {
      // Editor may be in an invalid state
    }
  }, [editor, expandedCategories.size]);

  // Subscribe to block events
  useEffect(() => {
    if (!editor?.on) return;

    // Initial load with delay to ensure editor is ready
    const timer = setTimeout(loadBlocks, 200);

    // Listen for block changes
    const handleBlockChange = () => loadBlocks();

    try {
      editor.on("block:add", handleBlockChange);
      editor.on("block:remove", handleBlockChange);
      editor.on("block:update", handleBlockChange);
      editor.on("block:category:update", handleBlockChange);
    } catch {
      // Editor may be in an invalid state
    }

    return () => {
      clearTimeout(timer);
      try {
        editor.off("block:add", handleBlockChange);
        editor.off("block:remove", handleBlockChange);
        editor.off("block:update", handleBlockChange);
        editor.off("block:category:update", handleBlockChange);
      } catch {
        // Editor may already be destroyed
      }
    };
  }, [editor, loadBlocks]);

  const handleToggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  // Handle click to add block to canvas using GrapesJS's native insertion
  const handleAddBlock = useCallback(
    (block: Block) => {
      if (!editor) return;

      const blockId = block.getId();

      try {
        // Get the wrapper (body) to append to
        const wrapper = editor.getWrapper();
        if (!wrapper) {
          console.warn("No wrapper found");
          return;
        }

        // Get the block content
        const content = block.get("content");
        console.log("Adding block:", blockId, "Content type:", typeof content, content);

        // Create component based on content type
        let added;
        
        if (typeof content === 'string') {
          // HTML string content
          added = wrapper.components().add(content);
        } else if (content && typeof content === 'object') {
          // Object content (e.g., { type: "property-address" })
          // Use the wrapper's components collection
          added = wrapper.components().add(content);
        } else {
          console.warn("Unknown content type for block:", blockId);
          return;
        }
        
        // Select the newly added component(s)
        if (added) {
          // wrapper.components().add() returns Component or Component[]
          const component = Array.isArray(added) ? added[0] : added;
          if (component) {
            editor.select(component);
          }
        }

        // Visual feedback
        setAddedBlockId(blockId);
        setTimeout(() => setAddedBlockId(null), 500);

        console.log("Block added successfully:", blockId, added);
      } catch (error) {
        console.error("Failed to add block:", error);
      }
    },
    [editor]
  );

  const totalBlocks = blocksByCategory.reduce(
    (acc, bc) => acc + bc.items.length,
    0
  );

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Blocks className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Blocks</span>
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

      {/* Info */}
      <div className="border-b border-border bg-muted/30 px-3 py-2">
        <p className="text-xs text-muted-foreground">
          Click the <Plus className="inline h-3 w-3" /> button to add blocks to the canvas.
        </p>
      </div>

      {/* Blocks List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {!editor ? (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            Waiting for editor...
          </div>
        ) : blocksByCategory.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            No blocks available.
          </div>
        ) : (
          blocksByCategory.map((categoryGroup) => {
            const categoryId = categoryGroup.category
              ? categoryGroup.category.getId()
              : "uncategorized";
            const categoryLabel = categoryGroup.category
              ? categoryGroup.category.getLabel()
              : "Basic";
            const isExpanded = expandedCategories.has(categoryId);

            return (
              <div
                key={categoryId}
                className="border-b border-border last:border-b-0"
              >
                {/* Category Header */}
                <button
                  type="button"
                  onClick={() => handleToggleCategory(categoryId)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-accent"
                >
                  <ChevronRight
                    className={cn(
                      "h-3 w-3 text-muted-foreground transition-transform",
                      isExpanded && "rotate-90"
                    )}
                  />
                  <span className="flex-1">{categoryLabel}</span>
                  <span className="text-xs text-muted-foreground">
                    {categoryGroup.items.length}
                  </span>
                </button>

                {/* Blocks List */}
                {isExpanded && (
                  <div className="px-2 pb-2 space-y-1">
                    {categoryGroup.items.map((block) => {
                      const blockId = block.getId();
                      const label = block.getLabel() || blockId;
                      const media = block.getMedia();
                      const isAdded = addedBlockId === blockId;

                      return (
                        <div
                          key={blockId}
                          className={cn(
                            "group flex items-center gap-2 rounded-md border border-border p-2 transition-all",
                            "hover:bg-accent hover:border-accent-foreground/20",
                            isAdded && "bg-green-500/10 border-green-500/30"
                          )}
                        >
                          {/* Block icon/media */}
                          {media ? (
                            <div
                              className="h-6 w-6 flex items-center justify-center text-muted-foreground [&>svg]:h-5 [&>svg]:w-5 shrink-0"
                              // biome-ignore lint/security/noDangerouslySetInnerHtml: Block media is trusted SVG from GrapesJS
                              dangerouslySetInnerHTML={{ __html: media }}
                            />
                          ) : (
                            <div className="h-6 w-6 flex items-center justify-center rounded bg-muted text-xs text-muted-foreground shrink-0">
                              {label.charAt(0).toUpperCase()}
                            </div>
                          )}

                          {/* Block label */}
                          <span className="flex-1 text-sm truncate">
                            {label}
                          </span>

                          {/* Add button */}
                          <button
                            type="button"
                            onClick={() => handleAddBlock(block)}
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-md transition-all",
                              "bg-primary text-primary-foreground",
                              "hover:bg-primary/90",
                              "focus:outline-none focus:ring-2 focus:ring-ring",
                              isAdded && "bg-green-500"
                            )}
                            aria-label={`Add ${label} to canvas`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-3 py-2">
        <span className="text-xs text-muted-foreground">
          {totalBlocks} {totalBlocks === 1 ? "block" : "blocks"}
        </span>
      </div>
    </div>
  );
}
