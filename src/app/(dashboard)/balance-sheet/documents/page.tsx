"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Receipt, CreditCard, FileSignature } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { AccountStatements } from "@/components/documents/account-statements";
import { PaymentRecords } from "@/components/documents/payment-records";
import { ParticipationAgreements } from "@/components/documents/participation-agreements";

function DocumentsPageContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "statements";

  const tabs = [
    {
      id: "statements",
      label: "Statements",
      href: "/balance-sheet/documents?tab=statements",
      icon: Receipt,
      content: <AccountStatements />,
    },
    {
      id: "payments",
      label: "Payments",
      href: "/balance-sheet/documents?tab=payments",
      icon: CreditCard,
      content: <PaymentRecords />,
    },
    {
      id: "agreements",
      label: "Agreements",
      href: "/balance-sheet/documents?tab=agreements",
      icon: FileSignature,
      content: <ParticipationAgreements />,
    },
  ];

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeader
        title="My Documents"
        description="Lookup or download monthly distribution statements, transaction detail records, participation agreements, and confidential due diligence materials"
        tabs={tabs}
        defaultTab={activeTab}
      />
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <DocumentsPageContent />
    </Suspense>
  );
}
