"use client";

import { cn } from "@/lib/utils";
import {
  Check,
  ChevronRight,
  Download,
  Edit2,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";

import { useGrapesEditor } from "./grapesjs-editor";

// Token categories for the template design system
interface DesignToken {
  name: string;
  cssVar: string;
  value: string;
  category: "color" | "typography" | "spacing" | "radius";
}

interface TokenGroup {
  name: string;
  tokens: DesignToken[];
}

// Default template tokens (these are injected into the GrapesJS canvas)
const defaultTemplateTokens: TokenGroup[] = [
  {
    name: "Colors",
    tokens: [
      {
        name: "Primary",
        cssVar: "--template-primary",
        value: "#0f172a",
        category: "color",
      },
      {
        name: "Primary Foreground",
        cssVar: "--template-primary-foreground",
        value: "#f8fafc",
        category: "color",
      },
      {
        name: "Secondary",
        cssVar: "--template-secondary",
        value: "#64748b",
        category: "color",
      },
      {
        name: "Accent",
        cssVar: "--template-accent",
        value: "#3b82f6",
        category: "color",
      },
      {
        name: "Background",
        cssVar: "--template-background",
        value: "#ffffff",
        category: "color",
      },
      {
        name: "Foreground",
        cssVar: "--template-foreground",
        value: "#0f172a",
        category: "color",
      },
      {
        name: "Muted",
        cssVar: "--template-muted",
        value: "#f1f5f9",
        category: "color",
      },
      {
        name: "Muted Foreground",
        cssVar: "--template-muted-foreground",
        value: "#64748b",
        category: "color",
      },
      {
        name: "Border",
        cssVar: "--template-border",
        value: "#e2e8f0",
        category: "color",
      },
    ],
  },
  {
    name: "Typography",
    tokens: [
      {
        name: "Font Sans",
        cssVar: "--template-font-sans",
        value: "system-ui, -apple-system, sans-serif",
        category: "typography",
      },
      {
        name: "Font Serif",
        cssVar: "--template-font-serif",
        value: "Georgia, Cambria, serif",
        category: "typography",
      },
      {
        name: "Font Mono",
        cssVar: "--template-font-mono",
        value: "ui-monospace, SFMono-Regular, monospace",
        category: "typography",
      },
    ],
  },
  {
    name: "Spacing",
    tokens: [
      {
        name: "XS",
        cssVar: "--template-spacing-xs",
        value: "0.25rem",
        category: "spacing",
      },
      {
        name: "SM",
        cssVar: "--template-spacing-sm",
        value: "0.5rem",
        category: "spacing",
      },
      {
        name: "MD",
        cssVar: "--template-spacing-md",
        value: "1rem",
        category: "spacing",
      },
      {
        name: "LG",
        cssVar: "--template-spacing-lg",
        value: "1.5rem",
        category: "spacing",
      },
      {
        name: "XL",
        cssVar: "--template-spacing-xl",
        value: "2rem",
        category: "spacing",
      },
      {
        name: "2XL",
        cssVar: "--template-spacing-2xl",
        value: "3rem",
        category: "spacing",
      },
    ],
  },
  {
    name: "Border Radius",
    tokens: [
      {
        name: "SM",
        cssVar: "--template-radius-sm",
        value: "0.25rem",
        category: "radius",
      },
      {
        name: "MD",
        cssVar: "--template-radius-md",
        value: "0.5rem",
        category: "radius",
      },
      {
        name: "LG",
        cssVar: "--template-radius-lg",
        value: "0.75rem",
        category: "radius",
      },
      {
        name: "Full",
        cssVar: "--template-radius-full",
        value: "9999px",
        category: "radius",
      },
    ],
  },
];

// App design system presets that can be imported into templates
const appDesignPresets = {
  name: "App Design System",
  description: "Import colors from the main application",
  tokens: [
    {
      name: "Primary",
      cssVar: "--template-primary",
      value: "hsl(0 0% 9%)",
      category: "color" as const,
    },
    {
      name: "Primary Foreground",
      cssVar: "--template-primary-foreground",
      value: "hsl(0 0% 98%)",
      category: "color" as const,
    },
    {
      name: "Secondary",
      cssVar: "--template-secondary",
      value: "hsl(240 4.8% 95.9%)",
      category: "color" as const,
    },
    {
      name: "Accent",
      cssVar: "--template-accent",
      value: "hsl(240 4.8% 95.9%)",
      category: "color" as const,
    },
    {
      name: "Background",
      cssVar: "--template-background",
      value: "hsl(0 0% 100%)",
      category: "color" as const,
    },
    {
      name: "Foreground",
      cssVar: "--template-foreground",
      value: "hsl(0 0% 4%)",
      category: "color" as const,
    },
    {
      name: "Muted",
      cssVar: "--template-muted",
      value: "hsl(240 4.8% 95.9%)",
      category: "color" as const,
    },
    {
      name: "Muted Foreground",
      cssVar: "--template-muted-foreground",
      value: "hsl(240 3.8% 46.1%)",
      category: "color" as const,
    },
    {
      name: "Border",
      cssVar: "--template-border",
      value: "hsl(240 5.9% 90%)",
      category: "color" as const,
    },
  ],
};

interface GlobalStylesPanelProps {
  onClose: () => void;
}

function TokenSwatch({
  token,
  onEdit,
  isEditing,
  onSave,
  onCancel,
}: {
  token: DesignToken;
  onEdit: () => void;
  isEditing: boolean;
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const [editValue, setEditValue] = useState(token.value);
  const isColor = token.category === "color";

  const handleSave = () => {
    onSave(editValue);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-accent/50 px-2 py-1.5">
        {isColor && (
          <input
            type="color"
            value={editValue.startsWith("#") ? editValue : "#000000"}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
            aria-label="Color picker"
          />
        )}
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="flex-1 rounded border border-input bg-background px-2 py-1 text-xs"
          aria-label="Token value"
          // biome-ignore lint/a11y/noAutofocus: UX requires immediate focus when editing
          autoFocus
        />
        <button
          type="button"
          title="save"
          onClick={handleSave}
          className="rounded p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30"
        >
          <Check className="h-3 w-3" />
        </button>
        <button
          type="button"
          title="cancel"
          onClick={onCancel}
          className="rounded p-1 text-destructive hover:bg-destructive/10"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      title="edit"
      onClick={onEdit}
      className="group flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent"
    >
      {isColor ? (
        <div
          className="h-5 w-5 shrink-0 rounded border border-border shadow-sm"
          style={{ backgroundColor: token.value }}
        />
      ) : (
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border bg-muted text-[10px] text-muted-foreground">
          {token.category === "spacing"
            ? "px"
            : token.category === "radius"
            ? "r"
            : "T"}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm">{token.name}</div>
        <div className="truncate text-xs text-muted-foreground">
          {token.value}
        </div>
      </div>
      <Edit2 className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-50" />
    </button>
  );
}

function CollapsibleGroup({
  group,
  onTokenEdit,
  editingToken,
  onSaveToken,
  onCancelEdit,
}: {
  group: TokenGroup;
  onTokenEdit: (cssVar: string) => void;
  editingToken: string | null;
  onSaveToken: (cssVar: string, value: string) => void;
  onCancelEdit: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-accent"
      >
        <ChevronRight
          className={cn(
            "h-3 w-3 text-muted-foreground transition-transform",
            isOpen && "rotate-90"
          )}
        />
        <span className="flex-1">{group.name}</span>
        <span className="text-xs text-muted-foreground">
          {group.tokens.length}
        </span>
      </button>
      {isOpen && (
        <div className="pb-2 pl-2">
          {group.tokens.map((token) => (
            <TokenSwatch
              key={token.cssVar}
              token={token}
              onEdit={() => onTokenEdit(token.cssVar)}
              isEditing={editingToken === token.cssVar}
              onSave={(value) => onSaveToken(token.cssVar, value)}
              onCancel={onCancelEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function GlobalStylesPanel({ onClose }: GlobalStylesPanelProps) {
  const { editor, injectStyles } = useGrapesEditor();
  const [tokens, setTokens] = useState<TokenGroup[]>(defaultTemplateTokens);
  const [editingToken, setEditingToken] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleTokenEdit = useCallback((cssVar: string) => {
    setEditingToken(cssVar);
  }, []);

  const handleSaveToken = useCallback(
    (cssVar: string, newValue: string) => {
      // Update local state
      setTokens((prevTokens) =>
        prevTokens.map((group) => ({
          ...group,
          tokens: group.tokens.map((token) =>
            token.cssVar === cssVar ? { ...token, value: newValue } : token
          ),
        }))
      );

      // Inject updated CSS into the GrapesJS canvas
      if (editor) {
        const css = `:root { ${cssVar}: ${newValue}; }`;
        injectStyles(css);
      }

      setEditingToken(null);
    },
    [editor, injectStyles]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingToken(null);
  }, []);

  const handleImportPreset = useCallback(async () => {
    setIsImporting(true);

    // Small delay to show loading state for better UX feedback
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Update tokens with preset values
    setTokens((prevTokens) =>
      prevTokens.map((group) => ({
        ...group,
        tokens: group.tokens.map((token) => {
          const presetToken = appDesignPresets.tokens.find(
            (p) => p.cssVar === token.cssVar
          );
          return presetToken ? { ...token, value: presetToken.value } : token;
        }),
      }))
    );

    // Generate and inject CSS for all preset tokens
    if (editor) {
      const cssVars = appDesignPresets.tokens
        .map((t) => `${t.cssVar}: ${t.value};`)
        .join("\n  ");
      const css = `:root {\n  ${cssVars}\n}`;
      injectStyles(css);
    }

    setIsImporting(false);
    setShowPresets(false);
  }, [editor, injectStyles]);

  const totalTokens = tokens.reduce((acc, g) => acc + g.tokens.length, 0);

  return (
    <div className="flex h-full w-72 flex-col border-r border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <h3 className="text-sm font-semibold">Template Styles</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 transition-colors hover:bg-accent"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Info Banner */}
      <div className="border-b border-border bg-muted/30 px-3 py-2">
        <p className="text-xs text-muted-foreground">
          Define design tokens for your templates. These styles apply to all
          pages created in this editor.
        </p>
      </div>

      {/* Import Presets */}
      <div className="border-b border-border px-3 py-2">
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
        >
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-muted-foreground" />
            <span>Import from Presets</span>
          </div>
          <ChevronRight
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              showPresets && "rotate-90"
            )}
          />
        </button>
        {showPresets && (
          <div className="mt-2 rounded-md border border-border bg-background p-2">
            <button
              type="button"
              onClick={handleImportPreset}
              disabled={isImporting}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                {isImporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="text-xs font-bold">A</span>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">
                  {isImporting ? "Importing..." : appDesignPresets.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {appDesignPresets.description}
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Token Count */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Design Tokens
        </div>
        <span className="text-xs text-muted-foreground">{totalTokens}</span>
      </div>

      {/* Token Groups */}
      <div className="flex-1 overflow-y-auto">
        {tokens.map((group) => (
          <CollapsibleGroup
            key={group.name}
            group={group}
            onTokenEdit={handleTokenEdit}
            editingToken={editingToken}
            onSaveToken={handleSaveToken}
            onCancelEdit={handleCancelEdit}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-3 py-2">
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Plus className="h-3 w-3" />
          <span>Add token</span>
        </button>
        {!editor && (
          <span className="text-xs text-amber-600">Editor not ready</span>
        )}
      </div>
    </div>
  );
}
