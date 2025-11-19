"use client";

import { BrexSyncButtons } from "@/components/admin/brex-sync-buttons";
import { BrexVendorMatcher } from "@/components/admin/brex-vendor-matcher";

export default function BrexPage() {
  return (
    <div className="flex flex-1 flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Brex Settings</h1>
        <p className="text-muted-foreground">
          Manage Brex API integration and vendor matching
        </p>
      </div>

      <BrexSyncButtons />
      <BrexVendorMatcher />
    </div>
  );
}
