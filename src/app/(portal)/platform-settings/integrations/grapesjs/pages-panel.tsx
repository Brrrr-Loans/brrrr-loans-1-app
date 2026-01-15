"use client";

import { cn } from "@/lib/utils";
import { Check, Files, FileText, MoreVertical, Pencil, Plus, Settings, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useGrapesEditor } from "./grapesjs-editor";

interface PagesPanelProps {
  onClose: () => void;
}

interface PageItem {
  id: string;
  name: string;
  isSelected: boolean;
}

export function PagesPanel({ onClose }: PagesPanelProps) {
  const { editor } = useGrapesEditor();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renamingPageId, setRenamingPageId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  // Build pages list from GrapesJS
  const buildPagesList = useCallback(() => {
    if (!editor?.Pages) return;

    try {
      const pm = editor.Pages;
      const allPages = pm.getAll();
      const selectedPage = pm.getSelected();

      const pageItems: PageItem[] = allPages.map((page) => ({
        id: page.getId(),
        name: page.get("name") || `Page ${page.getId()}`,
        isSelected: selectedPage?.getId() === page.getId(),
      }));

      setPages(pageItems);
    } catch {
      // Editor may be in an invalid state
    }
  }, [editor]);

  // Subscribe to page changes
  useEffect(() => {
    if (!editor?.Pages) return;

    buildPagesList();

    const events = ["page:add", "page:remove", "page:select", "page:update"];

    try {
      for (const event of events) {
        editor.on(event, buildPagesList);
      }
    } catch {
      // Editor may be in an invalid state
    }

    return () => {
      try {
        for (const event of events) {
          editor.off(event, buildPagesList);
        }
      } catch {
        // Editor may already be destroyed
      }
    };
  }, [editor, buildPagesList]);

  const handleSelectPage = useCallback(
    (pageId: string) => {
      if (!editor?.Pages) return;
      try {
        editor.Pages.select(pageId);
      } catch {
        // Editor may be in an invalid state
      }
    },
    [editor]
  );

  const handleAddPage = useCallback(() => {
    if (!editor?.Pages || !newPageName.trim()) return;

    try {
      const pm = editor.Pages;
      const newPage = pm.add({
        name: newPageName.trim(),
        component: `
          <div style="padding: 40px; font-family: var(--template-font-sans);">
            <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem; color: var(--template-foreground);">
              ${newPageName.trim()}
            </h1>
            <p style="color: var(--template-muted-foreground);">
              Start building your page by adding components.
            </p>
          </div>
        `,
      });

      if (newPage) {
        pm.select(newPage);
      }

      setNewPageName("");
      setIsAddingPage(false);
    } catch {
      // Editor may be in an invalid state
    }
  }, [editor, newPageName]);

  const handleDeletePage = useCallback(
    (pageId: string) => {
      if (!editor?.Pages) return;

      try {
        const pm = editor.Pages;
        const allPages = pm.getAll();

        // Don't delete if it's the only page
        if (allPages.length <= 1) {
          return;
        }

        // If deleting the selected page, select another one first
        const selectedPage = pm.getSelected();
        if (selectedPage?.getId() === pageId) {
          const otherPage = allPages.find((p) => p.getId() !== pageId);
          if (otherPage) {
            pm.select(otherPage);
          }
        }

        pm.remove(pageId);
      } catch {
        // Editor may be in an invalid state
      }
    },
    [editor]
  );

  const handleOpenPageSettings = useCallback(
    (pageId: string) => {
      if (!editor?.Pages || !editor?.runCommand) return;

      try {
        // First, select the page
        editor.Pages.select(pageId);
        
        // Run the GrapesJS command to open page settings
        // The Studio SDK uses 'gs:open-page-settings' or similar
        editor.runCommand("gs:open-page-settings");
      } catch {
        // If the command doesn't exist, try alternative approaches
        try {
          // Try the core GrapesJS panel command
          editor.runCommand("open-pages");
        } catch {
          // Editor may be in an invalid state
        }
      }
    },
    [editor]
  );

  const handleStartRename = useCallback(
    (pageId: string, currentName: string) => {
      setRenamingPageId(pageId);
      setRenameValue(currentName);
      setOpenMenuId(null);
      // Focus the input after state update
      setTimeout(() => {
        renameInputRef.current?.focus();
        renameInputRef.current?.select();
      }, 0);
    },
    []
  );

  const handleConfirmRename = useCallback(() => {
    if (!editor?.Pages || !renamingPageId || !renameValue.trim()) {
      setRenamingPageId(null);
      setRenameValue("");
      return;
    }

    try {
      const page = editor.Pages.get(renamingPageId);
      if (page) {
        page.set("name", renameValue.trim());
      }
    } catch {
      // Editor may be in an invalid state
    }

    setRenamingPageId(null);
    setRenameValue("");
  }, [editor, renamingPageId, renameValue]);

  const handleCancelRename = useCallback(() => {
    setRenamingPageId(null);
    setRenameValue("");
  }, []);

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirmRename();
    } else if (e.key === "Escape") {
      handleCancelRename();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddPage();
    } else if (e.key === "Escape") {
      setIsAddingPage(false);
      setNewPageName("");
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Files className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Pages</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsAddingPage(true)}
            className="rounded-md p-1 transition-colors hover:bg-accent"
            aria-label="Add page"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 transition-colors hover:bg-accent"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Add Page Input */}
      {isAddingPage && (
        <div className="border-b border-border p-2">
          <input
            type="text"
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Page name..."
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="New page name"
            // biome-ignore lint/a11y/noAutofocus: UX requires immediate focus
            autoFocus
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleAddPage}
              disabled={!newPageName.trim()}
              className="flex-1 rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingPage(false);
                setNewPageName("");
              }}
              className="flex-1 rounded-md border border-input px-2 py-1 text-xs transition-colors hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto py-2">
        {!editor ? (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            Waiting for editor...
          </div>
        ) : pages.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            No pages yet.
          </div>
        ) : (
          <div className="px-1">
            {pages.map((page) => (
              <div
                key={page.id}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors cursor-pointer mx-1",
                  page.isSelected
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                )}
              >
                {renamingPageId === page.id ? (
                  /* Rename Input Mode */
                  <div className="flex flex-1 items-center gap-1">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={handleRenameKeyDown}
                      onBlur={handleConfirmRename}
                      className="flex-1 rounded border border-input bg-background px-1.5 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      aria-label="Rename page"
                    />
                    <button
                      type="button"
                      onClick={handleConfirmRename}
                      className="rounded p-0.5 hover:bg-accent"
                      aria-label="Confirm rename"
                    >
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelRename}
                      className="rounded p-0.5 hover:bg-accent"
                      aria-label="Cancel rename"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  /* Normal Display Mode */
                  <>
                    <button
                      type="button"
                      onClick={() => handleSelectPage(page.id)}
                      className="flex flex-1 items-center gap-2 text-left"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm">{page.name}</span>
                    </button>
                    <div className="relative" ref={openMenuId === page.id ? menuRef : null}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === page.id ? null : page.id);
                        }}
                        className={cn(
                          "rounded p-1 transition-opacity hover:bg-accent",
                          openMenuId === page.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}
                        aria-label={`${page.name} options`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {openMenuId === page.id && (
                        <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border border-border bg-popover py-1 shadow-lg">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartRename(page.id, page.name);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span>Rename</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPageSettings(page.id);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
                          >
                            <Settings className="h-3.5 w-3.5" />
                            <span>Settings</span>
                          </button>
                          {pages.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePage(page.id);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-3 py-2">
        <span className="text-xs text-muted-foreground">
          {pages.length} {pages.length === 1 ? "page" : "pages"}
        </span>
      </div>
    </div>
  );
}
