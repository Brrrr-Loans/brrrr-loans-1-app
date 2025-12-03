"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";

interface OpenAIIconProps {
  className?: string;
  size?: number;
}

export function OpenAIIcon({ className = "", size = 16 }: OpenAIIconProps) {
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
        src="/assets/logos/openai-logo-icon-lightmode.svg"
        alt="OpenAI"
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
    ? "/assets/logos/openai-logo-icon-darkmode.svg"
    : "/assets/logos/openai-logo-icon-lightmode.svg";

  return (
    <Image
      src={logoSrc}
      alt="OpenAI"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
