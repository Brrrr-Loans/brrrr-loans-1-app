"use client";

import { RouteProtection } from "@/components/auth/route-protection";
import { OFBImportWizard } from "../../components/ofb-import-wizard";

function OFBPageContent() {
  return (
    <div className="flex flex-1 flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold">OceanFirst Bank Integration</h1>
        <p className="text-muted-foreground">
          Import transactions, match vendors, and sync to the ledger
        </p>
      </div>

      <OFBImportWizard />
    </div>
  );
}

export default function OFBPage() {
  return (
    <RouteProtection requiredRoles={["admin"]}>
      <OFBPageContent />
    </RouteProtection>
  );
}
