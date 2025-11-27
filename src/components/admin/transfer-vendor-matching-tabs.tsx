"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { UnmatchedTransfersTable } from "./unmatched-transfers-table";
import { ManualTransferMatches } from "./manual-transfer-matches";

export function TransferVendorMatchingTabs() {
  const [unmatchedCount, setUnmatchedCount] = useState<number>(0);
  const [matchedCount, setMatchedCount] = useState<number>(0);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      // Get unmatched count
      const unmatchedResponse = await fetch("/api/brex/match-transfer-to-vendor");
      const unmatchedData = await unmatchedResponse.json();
      setUnmatchedCount(unmatchedData.count || 0);

      // Get matched count
      const matchedResponse = await fetch("/api/brex/manual-matches");
      const matchedData = await matchedResponse.json();
      setMatchedCount(matchedData.count || 0);
    } catch (error) {
      console.error("Error loading counts:", error);
    }
  };

  const handleMatchCreated = () => {
    // Refresh counts when a match is created
    loadCounts();
  };

  const handleMatchDeleted = () => {
    // Refresh counts when a match is deleted
    loadCounts();
  };

  return (
    <Tabs defaultValue="unmatched" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="unmatched">
          Unmatched Transfers
          {unmatchedCount > 0 && (
            <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-xs">
              {unmatchedCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="matched">
          Manual Matches
          {matchedCount > 0 && (
            <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-xs">
              {matchedCount}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="unmatched" className="mt-6">
        <UnmatchedTransfersTable onMatchCreated={handleMatchCreated} />
      </TabsContent>

      <TabsContent value="matched" className="mt-6">
        <ManualTransferMatches onMatchDeleted={handleMatchDeleted} />
      </TabsContent>
    </Tabs>
  );
}

