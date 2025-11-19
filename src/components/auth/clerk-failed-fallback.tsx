"use client";

import { Button } from "@/components/ui";

export function ClerkFailedFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center max-w-md p-6">
        <div className="mb-4 text-lg font-semibold text-destructive">
          Authentication Error
        </div>
        <div className="mb-4 text-sm text-muted-foreground">
          Failed to load authentication service. Please check your internet
          connection and try again.
        </div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    </div>
  );
}

