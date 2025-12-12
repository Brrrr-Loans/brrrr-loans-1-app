"use client";

import Link from "next/link";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plug } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui";

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
  const isControlled = open !== undefined;
  const popoverOpen = isControlled ? open : internalOpen;
  const setPopoverOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen;

  // Check if integration routes are active
  const isBrexActive = pathname.startsWith("/platform-settings/integrations/brex");
  const isOFBActive = pathname.startsWith("/platform-settings/integrations/ofb");

  // Auto-open popover if any integration route is active
  React.useEffect(() => {
    if ((isBrexActive || isOFBActive) && !isControlled) {
      setInternalOpen(true);
    }
  }, [isBrexActive, isOFBActive, isControlled]);

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

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="w-56 p-2"
        sideOffset={8}
      >
        <div className="flex flex-col gap-1">
          {/* Integrations Section */}
          <div className="px-2 py-1.5 text-xs font-semibold text-sidebar-foreground/70">
            Integrations
          </div>
          <Link
            href="/platform-settings/integrations/brex"
            onClick={handleBrexClick}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
              isBrexActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground"
            }`}
          >
            <Plug className="h-4 w-4" />
            <span>Brex</span>
          </Link>
          <Link
            href="/platform-settings/integrations/ofb"
            onClick={handleOFBClick}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
              isOFBActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground"
            }`}
          >
            <Plug className="h-4 w-4" />
            <span>Ocean First</span>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

