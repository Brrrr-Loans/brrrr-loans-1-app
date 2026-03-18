"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import { RouteProtection } from "@/components/auth/route-protection";
import { OFBImportWizard } from "@/app/(portal)/platform-settings/components/ofb-import-wizard";

function ImportTransactionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const step = parseInt(searchParams.get("step") || "1", 10);

  const handleStepChange = useCallback(
    (stepNumber: number) => {
      router.replace(`/tools/import-transactions?step=${stepNumber}`, {
        scroll: false,
      });
    },
    [router]
  );

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Transactions</h1>
        <p className="text-muted-foreground">
          Import bank transactions, match vendors, and sync to the ledger
        </p>
      </div>

      <OFBImportWizard
        initialStep={step}
        onStepChange={handleStepChange}
      />
    </div>
  );
}

export default function ImportTransactionsPage() {
  return (
    <RouteProtection requiredRoles={["admin"]}>
      <ImportTransactionsContent />
    </RouteProtection>
  );
}
