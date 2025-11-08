"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui";
import { useMemo, useState } from "react";

export function DebugAuth() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const [debugInfo, setDebugInfo] = useState<unknown>(null);
  const formattedDebugInfo = useMemo<string>(() => {
    if (!debugInfo) return "";
    try {
      return JSON.stringify(debugInfo, null, 2);
    } catch (error) {
      console.error("Error formatting debug info", error);
      return "Unable to display debug information";
    }
  }, [debugInfo]);

  const handleDebugCheck = async () => {
    try {
      const response = await fetch("/api/auth/debug");
      const data = await response.json();
      setDebugInfo(data);
      console.log("Debug info:", data);
    } catch (error) {
      console.error("Debug check failed:", error);
      setDebugInfo({ error: "Failed to fetch debug info" });
    }
  };

  const handleForceSignOut = async () => {
    await signOut();
    window.location.href = "/sign-in";
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 space-y-2">
      <h3 className="font-semibold">Debug Authentication</h3>
      <div className="flex gap-2">
        <Button onClick={handleDebugCheck} variant="outline" size="sm">
          Check Auth Status
        </Button>
        <Button onClick={handleForceSignOut} variant="outline" size="sm">
          Force Sign Out
        </Button>
      </div>
      {debugInfo !== null && debugInfo !== undefined && (
        <pre className="text-xs bg-white dark:bg-gray-900 p-2 rounded overflow-auto">
          {formattedDebugInfo}
        </pre>
      )}
      <div className="text-xs">
        <div>User ID: {user?.id}</div>
        <div>Email: {user?.primaryEmailAddress?.emailAddress}</div>
        <div>Session: {user ? "Active" : "None"}</div>
      </div>
    </div>
  );
}
