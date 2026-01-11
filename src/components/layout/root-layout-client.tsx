"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { OrgThemeProvider } from "@/contexts/theme-context";

// Dynamic import to prevent hydration issues
const TinteEditor = dynamic(
  () => import("@/components/tinte-editor").then((mod) => mod.TinteEditor),
  { ssr: false }
);

const AIAssistant = dynamic(
  () => import("@/components/ai-assistant").then((mod) => mod.AIAssistant),
  { ssr: false }
);

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Function to update the input type attribute
    const updateInputType = (e: MouseEvent | TouchEvent) => {
      document.body.dataset.inputType = e.type.startsWith("mouse")
        ? "mouse"
        : "touch";
    };

    // Add event listeners
    window.addEventListener("mousedown", updateInputType);
    window.addEventListener("touchstart", updateInputType);

    // Clean up
    return () => {
      window.removeEventListener("mousedown", updateInputType);
      window.removeEventListener("touchstart", updateInputType);
    };
  }, []);

  return (
    <OrgThemeProvider>
      {children}
      <TinteEditor />
      <AIAssistant />
    </OrgThemeProvider>
  );
}
