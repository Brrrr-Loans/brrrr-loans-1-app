"use client";

import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Editor } from "grapesjs";
import {
  Blocks,
  FileText,
  Hand,
  Layers,
  MousePointer2,
  Palette,
  Search,
} from "lucide-react";

export type SidebarPanel =
  | "blocks"
  | "pages"
  | "layers"
  | "find"
  | "global-styles"
  | null;

interface EditorSlimSidebarProps {
  activePanel: SidebarPanel;
  onPanelChange: (panel: SidebarPanel) => void;
  editor: Editor | null;
}

interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  shortcut?: string;
}

function SidebarButton({
  icon,
  label,
  isActive,
  onClick,
  shortcut,
}: SidebarButtonProps) {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isActive && "bg-accent text-accent-foreground"
          )}
          aria-label={label}
          data-active={isActive}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-2">
        <span>{label}</span>
        {shortcut && (
          <kbd className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function EditorSlimSidebar({
  activePanel,
  onPanelChange,
  editor,
}: EditorSlimSidebarProps) {
  const [isPanMode, setIsPanMode] = useState(false);

  // Sync pan mode state with GrapesJS command state
  useEffect(() => {
    if (!editor) return;

    editor.on("run:core:canvas-move:before", () => setIsPanMode(true));
    editor.on("stop:core:canvas-move:before", () => setIsPanMode(false));

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key.toLowerCase() === "h") {
        editor.runCommand("core:canvas-move");
      } else if (e.key.toLowerCase() === "v") {
        editor.stopCommand("core:canvas-move");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      editor.off("run:core:canvas-move:before", () => setIsPanMode(true));
      editor.off("stop:core:canvas-move:before", () => setIsPanMode(false));
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]);

  const handlePanelToggle = (panel: SidebarPanel) => {
    // Toggle off if clicking the active panel, otherwise switch to new panel
    onPanelChange(activePanel === panel ? null : panel);
  };

  return (
    <TooltipProvider>
      <div className="flex h-full w-12 flex-col items-center border-r border-border bg-background py-2">
        {/* Top section with main navigation */}
        <div className="flex flex-col items-center gap-1">
          {/* Tool Section (Pointer / Hand) */}
          <SidebarButton
            icon={<MousePointer2 className="h-5 w-5" />}
            label="Select"
            isActive={!isPanMode}
            onClick={() => {
              if (editor) editor.stopCommand("core:canvas-move");
            }}
            shortcut="V"
          />

          <SidebarButton
            icon={<Hand className="h-5 w-5" />}
            label="Hand Tool (Pan)"
            isActive={isPanMode}
            onClick={() => {
              if (editor) {
                if (isPanMode) {
                  editor.stopCommand("core:canvas-move");
                } else {
                  editor.runCommand("core:canvas-move");
                }
              }
            }}
            shortcut="H"
          />

          {/* Separator line */}
          <div className="my-2 h-px w-6 bg-border" />

          <SidebarButton
            icon={<Blocks className="h-5 w-5" />}
            label="Blocks"
            isActive={activePanel === "blocks"}
            onClick={() => handlePanelToggle("blocks")}
          />

          <SidebarButton
            icon={<FileText className="h-5 w-5" />}
            label="Pages"
            isActive={activePanel === "pages"}
            onClick={() => handlePanelToggle("pages")}
          />

          <SidebarButton
            icon={<Layers className="h-5 w-5" />}
            label="Layers"
            isActive={activePanel === "layers"}
            onClick={() => handlePanelToggle("layers")}
          />

          <SidebarButton
            icon={<Search className="h-5 w-5" />}
            label="Find"
            isActive={activePanel === "find"}
            onClick={() => handlePanelToggle("find")}
            shortcut="⌘F"
          />

          {/* Separator line */}
          <div className="my-2 h-px w-6 bg-border" />

          <SidebarButton
            icon={<Palette className="h-5 w-5" />}
            label="Global Styles"
            isActive={activePanel === "global-styles"}
            onClick={() => handlePanelToggle("global-styles")}
          />
        </div>

        {/* Spacer to push any future bottom items down */}
        <div className="flex-1" />
      </div>
    </TooltipProvider>
  );
}
