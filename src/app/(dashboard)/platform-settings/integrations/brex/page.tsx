"use client";

import { RouteProtection } from "@/components/auth/route-protection";
import { BrexSyncButtons } from "@/components/admin/brex-sync-buttons";
import { BrexVendorMatcher } from "@/components/admin/brex-vendor-matcher";
import { UnmatchedTransfersTable } from "@/components/admin/unmatched-transfers-table";

function BrexPageContent() {
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
      <UnmatchedTransfersTable />
    </div>
  );
}

export default function BrexPage() {
  return (
    <RouteProtection requiredRoles={["admin"]}>
      <BrexPageContent />
    </RouteProtection>
  );
}
