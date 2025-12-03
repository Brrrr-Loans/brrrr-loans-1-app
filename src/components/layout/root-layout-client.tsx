"use client";

import { useEffect } from "react";

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

  return <>{children}</>;
}
