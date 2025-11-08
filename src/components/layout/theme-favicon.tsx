"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeFavicon() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Remove existing favicon links
    const existingLinks = document.querySelectorAll('link[rel*="icon"]');
    existingLinks.forEach((link) => link.remove());

    // Create new favicon link based on theme
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";

    if (resolvedTheme === "dark") {
      link.href = "/brrrr-favicon-white.svg";
    } else {
      link.href = "/brrrr-favicon-black.svg";
    }

    document.head.appendChild(link);

    // Add fallback ICO for older browsers
    const icoLink = document.createElement("link");
    icoLink.rel = "shortcut icon";
    icoLink.type = "image/x-icon";
    icoLink.href =
      resolvedTheme === "dark"
        ? "/brrrr-favicon-white.ico"
        : "/brrrr-favicon-black.ico";
    document.head.appendChild(icoLink);
  }, [resolvedTheme]);

  return null;
}
