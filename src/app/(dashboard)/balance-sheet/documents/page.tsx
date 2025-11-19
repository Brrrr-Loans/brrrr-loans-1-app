"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Receipt, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { AccountStatements } from "@/components/documents/account-statements";
import { PaymentRecords } from "@/components/documents/payment-records";

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
  ];

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeader
        title="My Documents"
        description="A personalized document repository leveraging serverless storage, enterprise-grade encryption, and row level security (RLS) to distribute monthly distribution statements, investor-specific agreements, loan-level due diligence, deposit details and records to evidence receipt of all prior and planned distributions."
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
