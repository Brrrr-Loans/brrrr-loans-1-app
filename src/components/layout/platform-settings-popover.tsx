"use client";

import Link from "next/link";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plug, ExternalLink, Palette, Settings2, Sparkles, SunMoon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui";
import { ThemeTogglePill } from "@/components/theme/theme-toggle-pill";
import { ThemeEditorWrapper } from "@/components/theme/theme-editor-wrapper";

interface PlatformSettingsPopoverProps {
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PlatformSettingsPopover({
  trigger,
  open,
  onOpenChange,
}: PlatformSettingsPopoverProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [themeManagerOpen, setThemeManagerOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const popoverOpen = isControlled ? open : internalOpen;
  const setPopoverOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen;

  // Check if integration routes are active (for highlighting active menu items)
  const isBrexActive = pathname.startsWith("/platform-settings/integrations/brex");
  const isOFBActive = pathname.startsWith("/platform-settings/integrations/ofb");
  const isTemplateEditorActive = pathname.startsWith("/platform-settings/integrations/template-editor");

  const handleBrexClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push("/platform-settings/integrations/brex");
    setPopoverOpen(false);
  };

  const handleOFBClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push("/platform-settings/integrations/ofb");
    setPopoverOpen(false);
  };

  const handleTemplateEditorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push("/platform-settings/integrations/template-editor");
    setPopoverOpen(false);
  };

  const handleThemeEditorClick = () => {
    // Trigger the floating Tinte editor by clicking its button
    const tinteButton = document.querySelector('[title="Open Theme Editor"]') as HTMLButtonElement;
    if (tinteButton) {
      tinteButton.click();
    }
    setPopoverOpen(false);
  };

  const handleThemeManagerClick = () => {
    setThemeManagerOpen(true);
    setPopoverOpen(false);
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="end"
          className="w-56 p-0"
          sideOffset={8}
        >
          <div className="flex flex-col">
            {/* Integrations Section */}
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">
                Integrations
              </p>
            </div>
            <div className="px-1 pb-2">
              <Link
                href="/platform-settings/integrations/brex"
                onClick={handleBrexClick}
                className={`flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                  isBrexActive
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground"
                }`}
              >
                <Plug className="h-4 w-4 text-muted-foreground" />
                <span>Brex</span>
              </Link>
              <Link
                href="/platform-settings/integrations/ofb"
                onClick={handleOFBClick}
                className={`flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                  isOFBActive
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground"
                }`}
              >
                <Plug className="h-4 w-4 text-muted-foreground" />
                <span>Ocean First</span>
              </Link>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* White Label Section */}
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">
                White Label
              </p>
            </div>
            <div className="px-1 pb-2">
              <Link
                href="/platform-settings/integrations/template-editor"
                onClick={handleTemplateEditorClick}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                  isTemplateEditorActive
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <span>Template Editor</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
              <button
                type="button"
                onClick={handleThemeEditorClick}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <div className="flex items-center gap-3">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <span>Theme Editor</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Preferences Section */}
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">
                Preferences
              </p>
            </div>
            <div className="px-1 pb-2 space-y-1">
              {/* Theme Row */}
              <div className="flex items-center justify-between rounded-md px-2 py-1.5">
                <div className="flex items-center gap-3">
                  <SunMoon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Theme</span>
                </div>
                <ThemeTogglePill />
              </div>

              {/* Theme Manager Link */}
              <button
                type="button"
                onClick={handleThemeManagerClick}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <div className="flex items-center gap-3">
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                  <span>Saved Themes</span>
                </div>
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Theme Manager Dialog */}
      <ThemeEditorWrapper 
        open={themeManagerOpen} 
        onOpenChange={setThemeManagerOpen} 
      />
    </>
  );
}
