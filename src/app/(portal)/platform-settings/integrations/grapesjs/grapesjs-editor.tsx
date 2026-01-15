"use client";

import "@grapesjs/studio-sdk/style";

import type { Editor } from "grapesjs";

import createStudioEditor from "@grapesjs/studio-sdk";
import { useTheme } from "next-themes";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { BlocksPanel } from "./blocks-panel";
import { registerCustomFormComponents } from "./components";
import { EditorSlimSidebar, type SidebarPanel } from "./editor-slim-sidebar";
import { FindPanel } from "./find-panel";
import { GlobalStylesPanel } from "./global-styles-panel";
import { LayersPanel } from "./layers-panel";
import { PagesPanel } from "./pages-panel";

// Context to share GrapesJS editor instance
interface EditorContextType {
  editor: Editor | null;
  injectStyles: (css: string) => void;
  getStyles: () => string;
}

const EditorContext = createContext<EditorContextType>({
  editor: null,
  injectStyles: () => {},
  getStyles: () => "",
});

export const useGrapesEditor = () => useContext(EditorContext);

interface GrapesJSEditorProps {
  licenseKey: string;
}

// Default global styles for the canvas
// Note: These are injected into the GrapesJS iframe canvas, so we define
// values matching globals.css light mode (canvas content is typically light for documents)
const DEFAULT_CANVAS_STYLES = `
/* Simple, visible default styles for the canvas */
* {
  box-sizing: border-box;
}

html {
  background-color: #fff;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #111;
  background-color: #fff;
  line-height: 1.6;
  margin: 0;
  padding: 24px;
  min-height: 100vh;
}

/* Hide scrollbars or make them blend in */
html::-webkit-scrollbar,
body::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

html, body {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

/* Make elements visible in editor */
h1, h2, h3, h4, h5, h6 {
  color: #111;
  margin: 0 0 0.5em 0;
}

h1 { font-size: 2em; font-weight: bold; }
h2 { font-size: 1.5em; font-weight: bold; }
h3 { font-size: 1.25em; font-weight: 600; }

p {
  color: #333;
  margin: 0 0 1em 0;
}

/* Form elements - visible styling */
input, textarea, select {
  display: block;
  width: 100%;
  padding: 10px 12px;
  margin: 4px 0;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: #fff;
  color: #111;
  font-family: inherit;
  font-size: 14px;
}

input:focus, textarea:focus, select:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 1px;
  border-color: #3b82f6;
}

button {
  display: inline-block;
  padding: 10px 16px;
  background-color: #111;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
}

button:hover {
  background-color: #333;
}

label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #111;
}

form {
  padding: 16px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background-color: #f9fafb;
  min-height: 60px;
}

/* Sections and divs should have min-height */
section, div {
  min-height: 20px;
}

/* Utility classes */
.hidden { display: none !important; }
.relative { position: relative; }
.absolute { position: absolute; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.text-center { text-align: center; }
.space-y-2 > * + * { margin-top: 0.5rem; }
.space-y-3 > * + * { margin-top: 0.75rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.grid { display: grid; }
.grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
.col-span-1 { grid-column: span 1; }
.col-span-2 { grid-column: span 2; }
.col-span-3 { grid-column: span 3; }
.w-full { width: 100%; }
.h-10 { height: 2.5rem; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.rounded-lg { border-radius: 0.5rem; }
.bg-muted { background-color: #f3f4f6; }
.text-muted-foreground { color: #6b7280; }
.text-foreground { color: #111; }
.border-border { border-color: #e5e7eb; }
`;

// Inner component that handles the actual editor
function GrapesJSEditorInner({
  licenseKey,
  theme,
  onEditorReady,
}: {
  licenseKey: string;
  theme: "dark" | "light";
  onEditorReady: (editor: Editor) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const initializingRef = useRef(false);
  const mountedRef = useRef(true);

  const initEditor = useCallback(async () => {
    if (!containerRef.current || initializingRef.current) {
      return;
    }

    initializingRef.current = true;

    try {
      await createStudioEditor({
        root: containerRef.current,
        licenseKey,
        theme,
        customTheme: {
          default: {
            colors: {
              global: {
                background1:
                  theme === "dark" ? "hsl(0 0% 9%)" : "hsl(0 0% 100%)",
                background2:
                  theme === "dark"
                    ? "hsl(240 3.7% 15.9%)"
                    : "hsl(240 4.8% 95.9%)",
                background3:
                  theme === "dark" ? "hsl(0 0% 4%)" : "hsl(0 0% 100%)",
                backgroundHover:
                  theme === "dark" ? "hsl(240 3.7% 20%)" : "hsl(240 4.8% 90%)",
                text: theme === "dark" ? "hsl(0 0% 98%)" : "hsl(0 0% 4%)",
                border:
                  theme === "dark"
                    ? "hsl(240 3.7% 15.9%)"
                    : "hsl(240 5.9% 90%)",
                focus:
                  theme === "dark" ? "hsl(240 4.9% 83.9%)" : "hsl(0 0% 4%)",
                placeholder:
                  theme === "dark" ? "hsl(0 0% 64%)" : "hsl(240 3.8% 46.1%)",
              },
              primary: {
                background1:
                  theme === "dark" ? "hsl(0 0% 90%)" : "hsl(0 0% 9%)",
                background2:
                  theme === "dark" ? "hsl(0 0% 85%)" : "hsl(0 0% 15%)",
                background3:
                  theme === "dark" ? "hsl(0 0% 80%)" : "hsl(0 0% 20%)",
                backgroundHover:
                  theme === "dark" ? "hsl(0 0% 75%)" : "hsl(0 0% 25%)",
                text: theme === "dark" ? "hsl(240 5.9% 10%)" : "hsl(0 0% 98%)",
              },
            },
          },
        },
        onEditor: (editor) => {
          console.log("[GrapesJS] Editor initialized", editor);

          // Don't set the editor if component has unmounted
          if (!mountedRef.current) {
            try {
              if (typeof editor?.destroy === "function") {
                editor.destroy();
              }
            } catch {
              // Ignore errors during cleanup
            }
            return;
          }

          editorRef.current = editor;

          // Register custom form components (wrapped in try-catch)
          try {
            registerCustomFormComponents(editor);
          } catch (e) {
            console.warn("Failed to register custom components:", e);
          }

          // Wait for canvas to be ready before injecting styles
          editor.on("canvas:frame:load", () => {
            console.log("[GrapesJS] Canvas frame loaded");
            console.log(
              "[GrapesJS] Canvas element:",
              editor.Canvas?.getElement?.()
            );
            console.log("[GrapesJS] Frame:", editor.Canvas?.getFrameEl?.());

            // Inject default global styles into the canvas
            try {
              const css = editor.Css;
              if (css?.addRules) {
                css.addRules(DEFAULT_CANVAS_STYLES);
              }
            } catch (e) {
              console.warn("Failed to inject canvas styles:", e);
            }
          });

          onEditorReady(editor);
        },
        project: {
          type: "web",
          default: {
            pages: [
              {
                name: "Home",
                component: `
                  <div style="font-family: system-ui, sans-serif; padding: 20px;">
                    <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem; color: #111;">
                      Document Template
                    </h1>
                    <p style="color: #666; margin-bottom: 2rem;">
                      Start creating your document template by adding blocks from the sidebar.
                    </p>
                    <div style="padding: 24px; background: #f5f5f5; border-radius: 8px; border: 2px dashed #ccc;">
                      <p style="text-align: center; color: #888; margin: 0;">
                        Click the + button on blocks to add them here
                      </p>
                    </div>
                  </div>
                `,
              },
            ],
          },
        },
      });
    } catch (error) {
      console.error("Failed to initialize GrapesJS editor:", error);
      initializingRef.current = false;
    }
  }, [licenseKey, theme, onEditorReady]);

  useEffect(() => {
    mountedRef.current = true;
    initEditor();

    return () => {
      mountedRef.current = false;
      const editor = editorRef.current;
      if (editor) {
        try {
          // Safely check if editor has a destroy function and is in a valid state
          // Wrap property access in try-catch since editor may be partially initialized
          const hasDestroy = typeof editor.destroy === "function";
          let hasPages = false;
          try {
            hasPages = editor.Pages !== undefined;
          } catch {
            // Pages property access failed - editor is in invalid state
          }

          if (hasDestroy && hasPages) {
            editor.destroy();
          }
        } catch (e) {
          // Editor may already be destroyed or in an invalid state
          // This is expected during hot reload or strict mode
          console.debug("Editor cleanup (expected during hot reload):", e);
        }
      }
      editorRef.current = null;
      initializingRef.current = false;
    };
  }, [initEditor]);

  return (
    <div
      ref={containerRef}
      className="grapesjs-editor-container h-full w-full overflow-hidden relative"
      style={{ minHeight: "600px" }}
    />
  );
}

// Panel renderer component
function EditorPanel({
  activePanel,
  onClose,
}: {
  activePanel: SidebarPanel;
  onClose: () => void;
}) {
  switch (activePanel) {
    case "blocks":
      return <BlocksPanel onClose={onClose} />;
    case "pages":
      return <PagesPanel onClose={onClose} />;
    case "layers":
      return <LayersPanel onClose={onClose} />;
    case "find":
      return <FindPanel onClose={onClose} />;
    case "global-styles":
      return <GlobalStylesPanel onClose={onClose} />;
    default:
      return null;
  }
}

// Wrapper component that handles theme changes via key-based remounting
export function GrapesJSEditor({ licenseKey }: GrapesJSEditorProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activePanel, setActivePanel] = useState<SidebarPanel>(null);
  const [editor, setEditor] = useState<Editor | null>(null);

  // Track theme for key-based remounting
  const editorTheme = resolvedTheme === "dark" ? "dark" : "light";

  // Ensure we're mounted before rendering (to avoid hydration mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setActivePanel(null);
  }, []);

  const handleEditorReady = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance);
  }, []);

  // Functions to interact with editor styles
  const injectStyles = useCallback(
    (css: string) => {
      if (editor) {
        editor.Css.addRules(css);
      }
    },
    [editor]
  );

  const getStyles = useCallback(() => {
    if (editor) {
      return editor.getCss() || "";
    }
    return "";
  }, [editor]);

  const editorContextValue: EditorContextType = {
    editor,
    injectStyles,
    getStyles,
  };

  if (!mounted) {
    return (
      <div className="h-[calc(100vh-200px)] w-full rounded-lg border border-border overflow-hidden flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  return (
    <EditorContext.Provider value={editorContextValue}>
      {/* CSS overrides for additional GrapesJS theme consistency */}
      <style jsx global>{`
        /* GrapesJS Studio SDK Theme Sync */
        .grapesjs-editor-container {
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
        }

        /* Override any GrapesJS elements that may not respect customTheme */
        .gjs-studio-editor,
        [data-gjs-studio] {
          font-family: inherit;
        }

        /* ========================================
           GrapesJS Studio SDK CSS Variable Overrides
           Force theme-aware colors throughout the editor
           ======================================== */

        /* Light mode */
        :root:not(.dark) .grapesjs-editor-container,
        html:not(.dark) .grapesjs-editor-container {
          --gs-color-bg-default: hsl(var(--background));
          --gs-color-bg-canvas: hsl(var(--background));
          --gs-color-bg-secondary: hsl(var(--muted));
          --gs-color-text: hsl(var(--foreground));
          --gs-color-border: hsl(var(--border));
          --gjs-main-bg: hsl(var(--background));
          --gjs-main-color: hsl(var(--foreground));
          --gjs-secondary-bg: hsl(var(--muted));
        }

        /* Dark mode */
        .dark .grapesjs-editor-container {
          --gs-color-bg-default: hsl(var(--background));
          --gs-color-bg-canvas: hsl(var(--background));
          --gs-color-bg-secondary: hsl(var(--muted));
          --gs-color-text: hsl(var(--foreground));
          --gs-color-border: hsl(var(--border));
          --gjs-main-bg: hsl(var(--background));
          --gjs-main-color: hsl(var(--foreground));
          --gjs-secondary-bg: hsl(var(--muted));
        }

        /* Ensure panels match our theme */
        .dark .gjs-studio-editor,
        .dark [data-gjs-studio] {
          --gjs-main-bg: hsl(var(--background));
          --gjs-main-color: hsl(var(--foreground));
        }

        :root:not(.dark) .gjs-studio-editor,
        :root:not(.dark) [data-gjs-studio],
        html:not(.dark) .gjs-studio-editor,
        html:not(.dark) [data-gjs-studio] {
          --gjs-main-bg: hsl(var(--background));
          --gjs-main-color: hsl(var(--foreground));
        }

        /* ========================================
           Editor Canvas Area
           ======================================== */

        /* Editor layout with slim sidebar */
        .editor-layout-container {
          display: flex;
          height: calc(100vh - 200px);
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid hsl(var(--border));
          overflow: hidden;
        }

        .editor-main-area {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
        }

        /* Ensure the GrapesJS container fills the editor area */
        .editor-main-area .grapesjs-editor-container {
          flex: 1;
          height: 100%;
          min-height: 500px;
          position: relative;
        }

        /* Force the Studio SDK to show its canvas and contain it */
        .editor-main-area .grapesjs-editor-container > div {
          height: 100% !important;
          min-height: 500px !important;
          position: relative !important;
        }

        /* Ensure Studio SDK root element is properly contained */
        [data-gjs-studio] {
          position: relative !important;
          height: 100% !important;
          width: 100% !important;
          max-width: 100% !important;
          overflow: hidden !important;
        }

        /* Force all Studio SDK children to respect container bounds */
        [data-gjs-studio] > * {
          max-width: 100% !important;
        }

        /* Fix canvas wrapper to stay within bounds */
        [data-gjs-studio] [class*="canvas"],
        [data-gjs-studio] [class*="Canvas"] {
          position: relative !important;
          max-width: 100% !important;
          width: 100% !important;
        }

        /* ========================================
           GrapesJS Topbar - Match table header (bg-muted)
           ======================================== */

        /* Main topbar background - white/background to be distinct from grey canvas */
        [data-gjs-studio] .gs-cmp-editor-topbar,
        [data-gjs-studio] .gs-cmp-topbar,
        .gjs-studio-editor .gs-cmp-editor-topbar,
        .gjs-studio-editor .gs-cmp-topbar {
          background-color: hsl(var(--background)) !important;
          border-bottom: 1px solid hsl(var(--border)) !important;
        }

        /* Topbar wrapper height */
        [data-gjs-studio] .gs-cmp-editor-topbar__wrp,
        .gjs-studio-editor .gs-cmp-editor-topbar__wrp {
          height: 38px !important;
        }

        /* GrapesJS Canvas iframe - reset positioning */
        .gjs-frame {
          left: unset !important;
          top: unset !important;
        }

        /* Hide the frame wrapper edges around the canvas */
        .gjs-frame-wrapper__right,
        .gjs-frame-wrapper__left,
        .gjs-frame-wrapper__top,
        .gjs-frame-wrapper__bottom {
          display: none !important;
        }

        /* Topbar text colors */
        [data-gjs-studio] .gs-cmp-editor-topbar *,
        [data-gjs-studio] .gs-cmp-topbar *,
        .gjs-studio-editor .gs-cmp-editor-topbar *,
        .gjs-studio-editor .gs-cmp-topbar * {
          color: hsl(var(--foreground)) !important;
        }

        /* ========================================
           GrapesJS Left Sidebar - Keep native blocks panel visible
           Only hide other panels that we're replacing with custom ones
           ======================================== */

        /* Hide the entire GrapesJS left sidebar (we have custom panels) */
        .gs-sidebar-left,
        .grapesjs-editor-container .gs-sidebar-left,
        [data-gjs-studio] .gs-sidebar-left {
          display: none !important;
        }

        /* Also hide individual panel managers if they appear elsewhere */
        .gs-panel-page-manager,
        .gs-panel-layer-manager,
        .gs-layer-manager {
          display: none !important;
        }

        /* ========================================
           GrapesJS Panel Styling Overrides
           Match the app's sidebar aesthetic
           ======================================== */

        /* Layer panel - selected layer highlight */
        [data-gjs-studio] [data-layer-item][data-selected="true"],
        [data-gjs-studio] .gjs-layer.gjs-selected,
        [data-gjs-studio] [aria-selected="true"] {
          background-color: hsl(var(--accent)) !important;
          color: hsl(var(--accent-foreground)) !important;
          border-radius: 0.375rem !important;
        }

        /* Layer panel - hover states */
        [data-gjs-studio] [data-layer-item]:hover,
        [data-gjs-studio] .gjs-layer:hover {
          background-color: hsl(var(--accent) / 0.5) !important;
          border-radius: 0.375rem !important;
        }

        /* Panel headers and sections */
        [data-gjs-studio] [data-panel-header],
        [data-gjs-studio] .gjs-title {
          font-weight: 500 !important;
          font-size: 0.875rem !important;
          color: hsl(var(--foreground)) !important;
        }

        /* Panel backgrounds */
        [data-gjs-studio] [data-panel],
        [data-gjs-studio] .gjs-pn-panel {
          background-color: hsl(var(--background)) !important;
          border-color: hsl(var(--border)) !important;
        }

        /* Buttons inside GrapesJS panels */
        [data-gjs-studio] button:not([data-gjs-type]),
        [data-gjs-studio] [role="button"] {
          border-radius: 0.375rem !important;
          transition: background-color 0.15s, color 0.15s !important;
        }

        [data-gjs-studio] button:not([data-gjs-type]):hover,
        [data-gjs-studio] [role="button"]:hover {
          background-color: hsl(var(--accent)) !important;
          color: hsl(var(--accent-foreground)) !important;
        }

        /* Icons in layer panel */
        [data-gjs-studio] [data-layer-item] svg,
        [data-gjs-studio] .gjs-layer svg {
          opacity: 0.7;
        }

        [data-gjs-studio] [data-layer-item]:hover svg,
        [data-gjs-studio] [data-layer-item][data-selected="true"] svg,
        [data-gjs-studio] .gjs-layer:hover svg,
        [data-gjs-studio] .gjs-layer.gjs-selected svg {
          opacity: 1;
        }

        /* Scrollbar styling for GrapesJS panels */
        [data-gjs-studio] ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        [data-gjs-studio] ::-webkit-scrollbar-track {
          background: transparent;
        }

        [data-gjs-studio] ::-webkit-scrollbar-thumb {
          background-color: hsl(var(--muted-foreground) / 30%);
          border-radius: 3px;
        }

        [data-gjs-studio] ::-webkit-scrollbar-thumb:hover {
          background-color: hsl(var(--muted-foreground) / 50%);
        }

        /* Input fields in GrapesJS */
        [data-gjs-studio] input,
        [data-gjs-studio] select,
        [data-gjs-studio] textarea {
          background-color: hsl(var(--background)) !important;
          border-color: hsl(var(--border)) !important;
          border-radius: 0.375rem !important;
          color: hsl(var(--foreground)) !important;
        }

        [data-gjs-studio] input:focus,
        [data-gjs-studio] select:focus,
        [data-gjs-studio] textarea:focus {
          border-color: hsl(var(--ring)) !important;
          outline: none !important;
          box-shadow: 0 0 0 2px hsl(var(--ring) / 20%) !important;
        }

        /* Separator lines */
        [data-gjs-studio] hr,
        [data-gjs-studio] [data-separator] {
          border-color: hsl(var(--border)) !important;
        }

        /* Tree view connectors in layer panel */
        [data-gjs-studio] [data-tree-line],
        [data-gjs-studio] .gjs-layer-children::before {
          border-color: hsl(var(--border)) !important;
        }

        /* Collapse/expand icons */
        [data-gjs-studio] [data-collapse-icon],
        [data-gjs-studio] .gjs-layer-caret {
          color: hsl(var(--muted-foreground)) !important;
        }

        /* Tooltips */
        [data-gjs-studio] [role="tooltip"] {
          background-color: hsl(var(--popover)) !important;
          color: hsl(var(--popover-foreground)) !important;
          border: 1px solid hsl(var(--border)) !important;
          border-radius: 0.375rem !important;
          font-size: 0.75rem !important;
        }
      `}</style>

      {/* Layout with slim sidebar + optional panel + editor */}
      <div className="editor-layout-container">
        {/* Slim icon sidebar (Figma-style) */}
        <EditorSlimSidebar
          activePanel={activePanel}
          onPanelChange={setActivePanel}
          editor={editor}
        />

        {/* Expandable panel (shows when an icon is clicked) */}
        {activePanel && (
          <EditorPanel activePanel={activePanel} onClose={handleClosePanel} />
        )}

        {/* Main GrapesJS editor area */}
        <div className="editor-main-area">
          <GrapesJSEditorInner
            key={editorTheme}
            licenseKey={licenseKey}
            theme={editorTheme}
            onEditorReady={handleEditorReady}
          />
        </div>
      </div>
    </EditorContext.Provider>
  );
}
