"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Monitor, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeTogglePillProps {
  className?: string;
}

export function ThemeTogglePill({ className }: ThemeTogglePillProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("flex h-[26px] w-[78px] rounded-full border bg-background", className)} />
    );
  }

  const options = [
    { value: "system", icon: Monitor, label: "System" },
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
  ] as const;

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        "flex h-[26px] items-center gap-0.5 overflow-hidden rounded-full border bg-background p-0",
        className
      )}
    >
      {options.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setTheme(value)}
            className={cn(
              "relative inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-all",
              "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive && "text-foreground"
            )}
          >
            {isActive && (
              <div
                className="absolute inset-0 rounded-md bg-muted"
                style={{ opacity: 1 }}
              />
            )}
            <div className="relative z-10 flex items-center">
              <Icon className="h-3 w-3" />
            </div>
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

