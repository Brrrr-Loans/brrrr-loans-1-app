"use client";

import { builder } from "@builder.io/react";
import { useEffect } from "react";

export function BuilderInit() {
  useEffect(() => {
    // Initialize Builder.io with the API key
    if (process.env.NEXT_PUBLIC_BUILDER_API_KEY) {
      builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY);
    }
  }, []);

  // This component doesn't render anything, it just initializes Builder.io
  return null;
}
