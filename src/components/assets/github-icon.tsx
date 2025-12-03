"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";

interface GitHubIconProps {
  className?: string;
  size?: number;
}

export function GitHubIcon({ className = "", size = 16 }: GitHubIconProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render theme-dependent content after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use a default (light mode) during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <Image
        src="/assets/logos/github-invertocat-black.svg"
        alt="GitHub"
        width={size}
        height={size}
        className={className}
        priority
      />
    );
  }

  // Determine if we're in dark mode (only after mount)
  const isDark =
    theme === "dark" || (theme === "system" && systemTheme === "dark");

  const logoSrc = isDark
    ? "/assets/logos/github-invertocat-white.svg"
    : "/assets/logos/github-invertocat-black.svg";

  return (
    <Image
      src={logoSrc}
      alt="GitHub"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
