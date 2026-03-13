"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { formatHex, oklch } from "culori";
import { Loader2, RefreshCw, Search, X, Save } from "lucide-react";
import { toast } from "sonner";

import { useOrgTheme } from "@/contexts/theme-context";
import { EDITABLE_THEME_TOKENS } from "@/lib/theme/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/shadcn/accordion";
import { Button } from "@/components/ui/shadcn/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/shadcn/sheet";
import { Input } from "@/components/ui/shadcn/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import { Textarea } from "@/components/ui/shadcn/textarea";

import { TinteLogo } from "@/components/logos/tinte";
import { convertTinteToShadcn, type TinteTheme } from "@/lib/tinte-to-shadcn";
import { ChatInput } from "./ai-assistant/chat-input";
import { Message as ChatMessage } from "./ai-assistant/chat-message";
import { ColorInput } from "./color-input";

type ShadcnTokens = Record<string, string>;

interface ShadcnTheme {
  light: ShadcnTokens;
  dark: ShadcnTokens;
}

interface TinteThemePreview {
  id: string;
  slug: string;
  name: string;
  concept?: string;
  is_public: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    foreground: string;
    background: string;
  };
  rawTheme?: TinteTheme;
  overrides?: {
    shadcn?: {
      light: ShadcnTokens;
      dark: ShadcnTokens;
    };
  };
}

const TOKEN_GROUPS = [
  {
    label: "Background & Text",
    tokens: ["background", "foreground", "muted", "muted-foreground"],
  },
  {
    label: "Cards & Surfaces",
    tokens: ["card", "card-foreground", "popover", "popover-foreground"],
  },
  {
    label: "Interactive Elements",
    tokens: [
      "primary",
      "primary-foreground",
      "secondary",
      "secondary-foreground",
      "accent",
      "accent-foreground",
    ],
  },
  {
    label: "Forms & States",
    tokens: [
      "border",
      "input",
      "ring",
      "destructive",
      "destructive-foreground",
    ],
  },
  {
    label: "Charts",
    tokens: ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"],
  },
  {
    label: "Sidebar",
    tokens: [
      "sidebar-background",
      "sidebar-foreground",
      "sidebar-primary",
      "sidebar-primary-foreground",
      "sidebar-accent",
      "sidebar-accent-foreground",
      "sidebar-border",
      "sidebar-ring",
    ],
  },
] as const;

interface TinteEditorProps {
  onChange?: (theme: ShadcnTheme) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TinteEditor({ onChange, open, onOpenChange }: TinteEditorProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Controlled/uncontrolled pattern
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen;
  const [theme, setTheme] = useState<ShadcnTheme>({ light: {}, dark: {} });
  const themeRef = useRef<ShadcnTheme>({ light: {}, dark: {} });
  const [_originalFormats, setOriginalFormats] = useState<
    Record<string, Record<string, string>>
  >({
    light: {},
    dark: {},
  });
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [loading, setLoading] = useState(false);
  const [rawCss, setRawCss] = useState("");

  const [tinteThemes, setTinteThemes] = useState<TinteThemePreview[]>([]);
  const [loadingTinteThemes, setLoadingTinteThemes] = useState(false);
  const [tinteError, setTinteError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Save to organization state
  const [showSaveToOrgDialog, setShowSaveToOrgDialog] = useState(false);
  const [saveToOrgName, setSaveToOrgName] = useState("");
  const [saveToOrgAsDefault, setSaveToOrgAsDefault] = useState(false);
  const [isSavingToOrg, setIsSavingToOrg] = useState(false);

  // Get theme context for saving to Supabase
  const { saveNewTheme, isOrgAdmin, internalOrgId } = useOrgTheme();

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const [apiKeyError, setApiKeyError] = useState(false);
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/tinte/chat",
    }),
    onError: (error) => {
      console.error("Chat error:", error);
      // Check if it's an API key error
      if (error.message?.includes("OpenAI API key")) {
        setApiKeyError(true);
      }
    },
  });

  const convertToHex = useCallback((colorValue: string): string => {
    try {
      const trimmed = colorValue.trim();
      if (trimmed.startsWith("#")) {
        return trimmed; // Already hex
      }
      const colorObj = oklch(trimmed);
      if (colorObj) {
        return formatHex(colorObj);
      }
      return colorValue;
    } catch {
      return colorValue;
    }
  }, []);

  const handleApplyTheme = useCallback(
    (newTheme: { light: ShadcnTokens; dark: ShadcnTokens }) => {
      const lightHex: ShadcnTokens = {};
      const darkHex: ShadcnTokens = {};

      Object.entries(newTheme.light).forEach(([key, value]) => {
        lightHex[key] = convertToHex(value);
      });

      Object.entries(newTheme.dark).forEach(([key, value]) => {
        darkHex[key] = convertToHex(value);
      });

      const hexTheme = { light: lightHex, dark: darkHex };

      setTheme(hexTheme);
      onChange?.(hexTheme);

      setOriginalFormats({
        light: { ...lightHex },
        dark: { ...darkHex },
      });

      setHasUnsavedChanges(true);

      setTimeout(() => {
        const styleId = "tinte-dynamic-theme";
        let styleElement = document.getElementById(styleId) as HTMLStyleElement;

        if (!styleElement) {
          styleElement = document.createElement("style");
          styleElement.id = styleId;
          document.head.appendChild(styleElement);
        }

        const lightTokens = Object.entries(hexTheme.light)
          .map(([key, value]) => `  --${key}: ${value};`)
          .join("\n");

        const darkTokens = Object.entries(hexTheme.dark)
          .map(([key, value]) => `  --${key}: ${value};`)
          .join("\n");

        styleElement.textContent = `:root {\n${lightTokens}\n}\n\n.dark {\n${darkTokens}\n}`;
      }, 100);
    },
    [onChange, convertToHex]
  );

  // Detect color format
  const detectColorFormat = useCallback(
    (colorValue: string): "hex" | "oklch" | "rgb" | "hsl" | "unknown" => {
      const trimmed = colorValue.trim();
      if (trimmed.startsWith("#")) return "hex";
      if (trimmed.startsWith("oklch(")) return "oklch";
      if (trimmed.startsWith("rgb(")) return "rgb";
      if (trimmed.startsWith("hsl(")) return "hsl";
      return "unknown";
    },
    []
  );

  // Load theme from DOM CSS variables
  const loadTheme = useCallback(async () => {
    setLoading(true);
    try {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      // Get all CSS variable names that are theme-related
      const allTokens = TOKEN_GROUPS.flatMap((group) => group.tokens);

      const lightHex: ShadcnTokens = {};
      const darkHex: ShadcnTokens = {};

      // Read light mode variables
      allTokens.forEach((token) => {
        const value = computedStyle.getPropertyValue(`--${token}`).trim();
        if (value) {
          lightHex[token] = convertToHex(value);
        }
      });

      // Temporarily switch to dark mode to read dark variables
      const wasDark = root.classList.contains("dark");
      if (!wasDark) {
        root.classList.add("dark");
      }

      const darkComputedStyle = getComputedStyle(root);
      allTokens.forEach((token) => {
        const value = darkComputedStyle.getPropertyValue(`--${token}`).trim();
        if (value) {
          darkHex[token] = convertToHex(value);
        }
      });

      // Restore original theme
      if (!wasDark) {
        root.classList.remove("dark");
      }

      setTheme({ light: lightHex, dark: darkHex });
      setOriginalFormats({ light: lightHex, dark: darkHex });
      toast.success("Theme reloaded from current CSS");
    } catch (error) {
      console.error("Error loading theme from DOM:", error);
      toast.error("Failed to load theme from CSS");
    }
    setLoading(false);
  }, [convertToHex]);

  // Fetch Tinte themes
  const fetchTinteThemes = useCallback(async (page = 1, search?: string) => {
    setLoadingTinteThemes(true);
    setTinteError(null);
    try {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const response = await fetch(
        `https://www.tinte.dev/api/themes/public?limit=20&page=${page}${searchParam}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch themes from Tinte");
      }
      const data = await response.json();
      
      // Filter to only show clean, neutral themes from legitimate sources
      const curatedThemes = (data.themes || []).filter((theme: TinteThemePreview) => {
        const name = theme.name?.toLowerCase() || "";
        const concept = theme.concept?.toLowerCase() || "";
        const slug = theme.slug?.toLowerCase() || "";
        
        // Include themes from known companies/libraries
        const legitimateSources = [
          "vercel",
          "supabase",
          "shadcn",
          "radix",
          "tailwind",
          "github",
          "linear",
          "stripe",
          "next",
          "react",
        ];
        
        // Include neutral/clean theme keywords
        const desiredKeywords = [
          "neutral",
          "clean",
          "minimal",
          "modern",
          "professional",
          "slate",
          "gray",
          "subtle",
        ];
        
        // Check if theme matches legitimate sources or desired keywords
        const matchesSource = legitimateSources.some(source => 
          name.includes(source) || slug.includes(source) || concept.includes(source)
        );
        
        const matchesKeyword = desiredKeywords.some(keyword =>
          name.includes(keyword) || concept.includes(keyword)
        );
        
        return matchesSource || matchesKeyword;
      });
      
      setTinteThemes(curatedThemes);
      setCurrentPage(data.pagination.page);
      setHasMore(data.pagination.hasMore && curatedThemes.length > 0);
      setTotalPages(Math.ceil(curatedThemes.length / 20));
    } catch (error) {
      console.error("Error fetching Tinte themes:", error);
      setTinteError(
        error instanceof Error ? error.message : "Failed to load themes"
      );
    } finally {
      setLoadingTinteThemes(false);
    }
  }, []);

  // Apply Tinte theme
  const applyTinteTheme = useCallback(
    (tinteTheme: TinteThemePreview) => {
      let shadcnTheme: { light: ShadcnTokens; dark: ShadcnTokens } | null =
        null;

      if (tinteTheme.rawTheme) {
        // Convert Tinte format to shadcn format
        shadcnTheme = convertTinteToShadcn(tinteTheme.rawTheme);
      } else if (
        tinteTheme.overrides?.shadcn?.light &&
        tinteTheme.overrides?.shadcn?.dark
      ) {
        // Use shadcn override only if it has light and dark color objects
        shadcnTheme = tinteTheme.overrides.shadcn;
      }

      if (shadcnTheme) {
        // Convert all colors to hex format
        const lightHex: ShadcnTokens = {};
        const darkHex: ShadcnTokens = {};

        Object.entries(shadcnTheme.light).forEach(([key, value]) => {
          lightHex[key] = convertToHex(value);
        });

        Object.entries(shadcnTheme.dark).forEach(([key, value]) => {
          darkHex[key] = convertToHex(value);
        });

        const hexTheme = { light: lightHex, dark: darkHex };

        setTheme(hexTheme);
        onChange?.(hexTheme);
        setSelectedThemeId(tinteTheme.id);
        setHasUnsavedChanges(true);
      }
    },
    [onChange, convertToHex]
  );

  // Initialize theme
  useEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    setMode(isDark ? "dark" : "light");
    loadTheme();
  }, [loadTheme]);

  // Fetch Tinte themes when dialog opens
  useEffect(() => {
    if (isOpen && tinteThemes.length === 0) {
      fetchTinteThemes();
    }
  }, [isOpen, tinteThemes.length, fetchTinteThemes]);

  const handleTokenEdit = useCallback(
    (token: string, newValue: string) => {
      setTheme((prev) => {
        const updated = {
          ...prev,
          [mode]: {
            ...prev[mode],
            [token]: newValue,
          },
        };

        onChange?.(updated);
        return updated;
      });

      // Update original formats with new value
      setOriginalFormats((prev) => ({
        ...prev,
        [mode]: {
          ...prev[mode],
          [token]: newValue,
        },
      }));

      // Mark as unsaved
      setHasUnsavedChanges(true);
    },
    [mode, onChange]
  );

  // Sync mode with DOM changes (controlled by next-themes)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setMode(isDark ? "dark" : "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Generate raw CSS from theme
  const generateRawCss = useCallback(() => {
    if (!theme.light || !theme.dark) return "";

    const lightTokens = Object.entries(theme.light)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join("\n");

    const darkTokens = Object.entries(theme.dark)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join("\n");

    if (!lightTokens && !darkTokens) return "";

    return `:root {\n${lightTokens}\n}\n\n.dark {\n${darkTokens}\n}`;
  }, [theme]);

  // Parse raw CSS and update theme
  const parseRawCss = useCallback(
    (css: string) => {
      try {
        const light: ShadcnTokens = {};
        const dark: ShadcnTokens = {};

        // Match :root block
        const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
        if (rootMatch) {
          const rootContent = rootMatch[1];
          const variableMatches = rootContent.matchAll(
            /--([^:]+):\s*([^;]+);/g
          );
          for (const match of variableMatches) {
            const key = match[1].trim();
            const value = match[2].trim();
            light[key] = value;
          }
        }

        // Match .dark block
        const darkMatch = css.match(/\.dark\s*\{([^}]+)\}/);
        if (darkMatch) {
          const darkContent = darkMatch[1];
          const variableMatches = darkContent.matchAll(
            /--([^:]+):\s*([^;]+);/g
          );
          for (const match of variableMatches) {
            const key = match[1].trim();
            const value = match[2].trim();
            dark[key] = value;
          }
        }

        setTheme({ light, dark });
        onChange?.({ light, dark });
      } catch (error) {
        console.error("Failed to parse CSS:", error);
      }
    },
    [onChange]
  );

  // Update raw CSS when theme changes
  useEffect(() => {
    setRawCss(generateRawCss());
  }, [generateRawCss]);

  // Write to globals.css file
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

  const writeToGlobals = useCallback(async () => {
    // Use ref to get the latest theme state
    const currentTheme = themeRef.current;

    if (!currentTheme.light || !currentTheme.dark) {
      console.error("Theme is not fully loaded");
      return;
    }

    setSaveStatus("saving");

    try {
      // Ensure all colors are in hex format before applying
      const lightHex: ShadcnTokens = {};
      const darkHex: ShadcnTokens = {};

      Object.entries(currentTheme.light).forEach(([key, value]) => {
        lightHex[key] = convertToHex(value);
      });

      Object.entries(currentTheme.dark).forEach(([key, value]) => {
        darkHex[key] = convertToHex(value);
      });

      const styleId = "tinte-dynamic-theme";
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;

      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      const lightTokens = Object.entries(lightHex)
        .map(([key, value]) => `  --${key}: ${value};`)
        .join("\n");

      const darkTokens = Object.entries(darkHex)
        .map(([key, value]) => `  --${key}: ${value};`)
        .join("\n");

      styleElement.textContent = `:root {\n${lightTokens}\n}\n\n.dark {\n${darkTokens}\n}`;

      setSaveStatus("success");
      setHasUnsavedChanges(false);
      toast.success(
        "Theme applied to site! Use 'Saved Themes' in settings to save permanently.",
        {
          duration: 4000,
        }
      );
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Error applying theme to DOM:", error);
      setSaveStatus("error");
      toast.error("Failed to apply theme");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  }, [convertToHex]);

  // Save theme to organization (Supabase)
  const handleSaveToOrg = useCallback(async () => {
    if (!saveToOrgName.trim()) {
      toast.error("Please enter a theme name");
      return;
    }

    if (!internalOrgId) {
      toast.error("Organization not found. Please try again.");
      return;
    }

    setIsSavingToOrg(true);

    try {
      const currentTheme = themeRef.current;

      // Filter to only editable tokens
      const lightTokens: Record<string, string> = {};
      const darkTokens: Record<string, string> = {};

      for (const token of EDITABLE_THEME_TOKENS) {
        if (currentTheme.light[token]) {
          lightTokens[token] = convertToHex(currentTheme.light[token]);
        }
        if (currentTheme.dark[token]) {
          darkTokens[token] = convertToHex(currentTheme.dark[token]);
        }
      }

      const radius = { radius: "0.5rem" };

      const newTheme = await saveNewTheme(
        saveToOrgName.trim(),
        lightTokens,
        darkTokens,
        radius,
        saveToOrgAsDefault
      );

      if (newTheme) {
        toast.success(`Theme "${saveToOrgName}" saved to organization!`);
        setShowSaveToOrgDialog(false);
        setSaveToOrgName("");
        setSaveToOrgAsDefault(false);
      } else {
        toast.error("Failed to save theme. Please try again.");
      }
    } catch (error) {
      console.error("Error saving theme to org:", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSavingToOrg(false);
    }
  }, [
    saveToOrgName,
    saveToOrgAsDefault,
    internalOrgId,
    saveNewTheme,
    convertToHex,
  ]);

  const _availableTokens = TOKEN_GROUPS.flatMap((group) =>
    group.tokens.filter((token) => theme[mode]?.[token] !== undefined)
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="sm:max-w-2xl w-full flex flex-col overflow-hidden">
        {/* Header */}
        <SheetHeader className="pr-8">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <TinteLogo className="w-5 h-5" />
              <SheetTitle className="text-base">Theme Editor</SheetTitle>
              <a
                href="https://tinte.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-1"
              >
                tinte.dev ↗
              </a>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  loadTheme();
                }}
                disabled={loading}
                className="p-1.5 hover:bg-accent rounded-md transition-colors disabled:opacity-50"
                title="Reload theme from current CSS variables"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
              <button
                type="button"
                onClick={writeToGlobals}
                disabled={saveStatus === "saving"}
                className={`relative px-3 py-1.5 text-xs rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  hasUnsavedChanges
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/90 animate-pulse"
                    : "bg-secondary/80 text-secondary-foreground hover:bg-secondary/90"
                }`}
                title="Apply theme to preview (temporary)"
              >
                {hasUnsavedChanges && saveStatus === "idle" && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
                  </span>
                )}
                {saveStatus === "saving" && "Applying..."}
                {saveStatus === "success" && "✅ Applied!"}
                {saveStatus === "error" && "❌ Error"}
                {saveStatus === "idle" &&
                  (hasUnsavedChanges ? "Apply" : "Apply")}
              </button>
              {/* Save to Organization button */}
              {isOrgAdmin && internalOrgId && (
                <button
                  type="button"
                  onClick={() => setShowSaveToOrgDialog(true)}
                  className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-1.5"
                  title="Save theme to your organization permanently"
                >
                  <Save size={12} />
                  Save
                </button>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="animate-spin mr-2" size={20} />
              <span>Loading theme...</span>
            </div>
          ) : (
            <Tabs
              defaultValue="editor"
              className="flex-1 flex flex-col overflow-hidden"
            >
              <TabsList className="mx-4 mt-4 mb-4">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="browse">Browse</TabsTrigger>
                <TabsTrigger value="raw">Raw CSS</TabsTrigger>
                <TabsTrigger value="agent">Agent</TabsTrigger>
              </TabsList>

              <TabsContent
                value="editor"
                className="flex-1 h-0 flex flex-col overflow-hidden px-4 pb-4"
              >
                <div className="flex-1 border rounded-md bg-muted/20 overflow-y-auto p-4">
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full space-y-2"
                    defaultValue="Background & Text"
                  >
                    {TOKEN_GROUPS.map((group) => {
                      const groupTokens = group.tokens.filter(
                        (token) => theme[mode]?.[token] !== undefined
                      );
                      if (groupTokens.length === 0) return null;

                      return (
                        <AccordionItem
                          value={group.label}
                          key={group.label}
                          className="rounded-md border bg-background px-4 py-1 outline-none last:border-b has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
                        >
                          <AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline focus-visible:ring-0">
                            <span className="uppercase tracking-wide">
                              {group.label} ({groupTokens.length})
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="pb-2">
                            <div className="grid gap-3 sm:grid-cols-2">
                              {groupTokens.map((token) => (
                                <div key={token} className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      {token.replace(/-/g, " ")}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-mono">
                                      {detectColorFormat(theme[mode][token])}
                                    </span>
                                  </div>
                                  <ColorInput
                                    value={theme[mode][token]}
                                    onChange={(color) =>
                                      handleTokenEdit(token, color)
                                    }
                                    label={token}
                                  />
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              </TabsContent>

              <TabsContent
                value="browse"
                className="flex-1 h-0 flex flex-col overflow-hidden px-4 pb-4"
              >
                <div className="flex flex-col flex-1 min-h-0 border rounded-md bg-muted/20">
                  {loadingTinteThemes ? (
                    <div className="flex flex-col items-center justify-center flex-1 gap-3 p-4">
                      <Loader2 className="animate-spin" size={32} />
                      <p className="text-sm text-muted-foreground">
                        Loading themes from tinte.dev...
                      </p>
                    </div>
                  ) : tinteError ? (
                    <div className="flex flex-col items-center justify-center flex-1 gap-4 p-4">
                      <div className="text-4xl">⚠️</div>
                      <div className="text-center space-y-2 max-w-md">
                        <h3 className="font-semibold text-lg">
                          Failed to Load Themes
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {tinteError}
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => fetchTinteThemes()}
                          className="mt-2"
                        >
                          <RefreshCw size={16} className="mr-2" />
                          Try Again
                        </Button>
                      </div>
                    </div>
                  ) : tinteThemes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 gap-3 p-4">
                      <p className="text-sm text-muted-foreground">
                        No themes available
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => fetchTinteThemes()}
                        size="sm"
                      >
                        <RefreshCw size={16} className="mr-2" />
                        Refresh
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Search bar - sticky at top */}
                      <div className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm border-b p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Input
                              type="text"
                              placeholder="Search themes..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  setActiveSearch(searchQuery);
                                  fetchTinteThemes(1, searchQuery);
                                }
                              }}
                              className="h-9 pr-8"
                            />
                            {searchQuery && (
                              <button
                                type="button"
                                aria-label="Clear search"
                                onClick={() => {
                                  setSearchQuery("");
                                  setActiveSearch("");
                                  fetchTinteThemes(1);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-sm transition-colors"
                              >
                                <X className="h-3 w-3 text-muted-foreground" />
                              </button>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveSearch(searchQuery);
                              fetchTinteThemes(1, searchQuery);
                            }}
                            disabled={!searchQuery}
                            className="h-9"
                          >
                            <Search className="h-3.5 w-3.5 mr-1.5" />
                            Search
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              fetchTinteThemes(currentPage, activeSearch)
                            }
                            title="Refresh themes"
                            className="h-9 w-9"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {tinteThemes.length} themes
                            {activeSearch
                              ? ` matching "${activeSearch}"`
                              : ""}
                          </p>
                        </div>
                      </div>
                      {/* Scrollable theme grid */}
                      <div className="flex-1 overflow-y-auto p-3">
                        <div className="grid gap-3">
                          {tinteThemes.map((tinteTheme) => {
                            const isSelected =
                              selectedThemeId === tinteTheme.id;
                            return (
                              <button
                                key={tinteTheme.id}
                                type="button"
                                onClick={() => applyTinteTheme(tinteTheme)}
                                className={`group text-left p-4 border-2 rounded-lg transition-all relative ${
                                  isSelected
                                    ? "border-primary bg-primary/10 shadow-md"
                                    : "border-border hover:border-primary hover:bg-accent/50"
                                }`}
                              >
                                {isSelected && (
                                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                                    Selected
                                  </div>
                                )}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 space-y-1.5">
                                    <h4
                                      className={`font-medium transition-colors ${
                                        isSelected
                                          ? "text-primary"
                                          : "group-hover:text-primary"
                                      }`}
                                    >
                                      {tinteTheme.name}
                                    </h4>
                                    {tinteTheme.concept && (
                                      <p className="text-xs text-muted-foreground line-clamp-2">
                                        {tinteTheme.concept}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex gap-1.5 shrink-0">
                                    {[
                                      tinteTheme.colors.background,
                                      tinteTheme.colors.primary,
                                      tinteTheme.colors.secondary,
                                      tinteTheme.colors.accent,
                                      tinteTheme.colors.foreground,
                                    ].map((color, idx) => (
                                      <div
                                        key={`${tinteTheme.id}-color-${idx}`}
                                        className="w-6 h-6 rounded border border-border/50"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {/* Pagination Controls */}
                      <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/50">
                        <div className="text-xs text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              fetchTinteThemes(currentPage - 1, activeSearch)
                            }
                            disabled={currentPage === 1 || loadingTinteThemes}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              fetchTinteThemes(currentPage + 1, activeSearch)
                            }
                            disabled={!hasMore || loadingTinteThemes}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="raw"
                className="flex-1 h-0 flex flex-col overflow-hidden px-4 pb-4"
              >
                <Textarea
                  value={rawCss}
                  onChange={(e) => {
                    setRawCss(e.target.value);
                    parseRawCss(e.target.value);
                  }}
                  className="flex-1 w-full bg-muted/40 font-mono text-xs resize-none border border-border focus-visible:ring-0 p-4"
                  placeholder="Paste your CSS here..."
                  spellCheck={false}
                />
              </TabsContent>

              <TabsContent
                value="agent"
                className="flex-1 h-0 flex flex-col overflow-hidden px-4 pb-4"
              >
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex-1 border rounded-md bg-muted/20 overflow-y-auto p-4 space-y-2">
                    {apiKeyError ? (
                      <div className="flex flex-col items-center justify-center h-full gap-4">
                        <div className="text-center space-y-3 max-w-md">
                          <div className="text-4xl">🔑</div>
                          <h3 className="font-semibold text-lg">
                            OpenAI API Key Required
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            To use the AI Theme Generator, you need to configure
                            your OpenAI API key.
                          </p>
                          <div className="bg-muted rounded-lg p-4 text-left space-y-2">
                            <p className="text-xs font-medium">
                              Add to your{" "}
                              <code className="bg-background px-1.5 py-0.5 rounded">
                                .env.local
                              </code>{" "}
                              file:
                            </p>
                            <pre className="bg-background p-2 rounded text-xs overflow-x-auto">
                              <code>OPENAI_API_KEY=your-api-key-here</code>
                            </pre>
                            <p className="text-xs text-muted-foreground">
                              Get your API key from{" "}
                              <a
                                href="https://platform.openai.com/api-keys"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                platform.openai.com/api-keys
                              </a>
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setApiKeyError(false);
                            }}
                            className="mt-2"
                          >
                            I've added the API key
                          </Button>
                        </div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-6">
                        <div className="text-center space-y-2">
                          <h3 className="font-semibold text-lg">
                            AI Theme Generator
                          </h3>
                          <p className="text-muted-foreground text-sm max-w-md">
                            Describe your ideal theme and let AI generate a
                            complete color palette for you
                          </p>
                        </div>
                        <div className="grid gap-2 w-full max-w-md px-4">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                            Suggested prompts:
                          </p>
                          <Button
                            variant="outline"
                            onClick={() =>
                              sendMessage({
                                text: "Create a purple theme with high contrast for accessibility",
                              })
                            }
                            className="justify-start h-auto py-3 whitespace-normal text-left"
                          >
                            Create a purple theme with high contrast
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              sendMessage({
                                text: "Generate a warm autumn theme with orange and brown tones",
                              })
                            }
                            className="justify-start h-auto py-3 whitespace-normal text-left"
                          >
                            Generate a warm autumn theme
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              sendMessage({
                                text: "Create a modern dark theme with blue accents",
                              })
                            }
                            className="justify-start h-auto py-3 whitespace-normal text-left"
                          >
                            Create a modern dark theme with blue accents
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              sendMessage({
                                text: "Design a soft pastel theme perfect for a wellness app",
                              })
                            }
                            className="justify-start h-auto py-3 whitespace-normal text-left"
                          >
                            Design a soft pastel wellness theme
                          </Button>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          onApplyTheme={handleApplyTheme}
                        />
                      ))
                    )}
                  </div>
                  <ChatInput
                    onSubmit={(msg) => {
                      sendMessage({ text: msg });
                    }}
                    disabled={status === "submitted" || status === "streaming"}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Save to Organization Dialog */}
        {showSaveToOrgDialog && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="bg-card border rounded-lg p-6 w-full max-w-sm shadow-lg">
              <h3 className="text-lg font-semibold mb-4">
                Save Theme to Organization
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="org-theme-name"
                    className="text-sm font-medium block mb-1.5"
                  >
                    Theme Name
                  </label>
                  <Input
                    id="org-theme-name"
                    placeholder="e.g., Dark Professional"
                    value={saveToOrgName}
                    onChange={(e) => setSaveToOrgName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveToOrg()}
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="set-as-default"
                    checked={saveToOrgAsDefault}
                    onChange={(e) => setSaveToOrgAsDefault(e.target.checked)}
                    className="rounded border-input"
                  />
                  <label htmlFor="set-as-default" className="text-sm">
                    Set as default theme for organization
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSaveToOrgDialog(false);
                    setSaveToOrgName("");
                    setSaveToOrgAsDefault(false);
                  }}
                  disabled={isSavingToOrg}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveToOrg}
                  disabled={isSavingToOrg || !saveToOrgName.trim()}
                >
                  {isSavingToOrg ? "Saving..." : "Save Theme"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
