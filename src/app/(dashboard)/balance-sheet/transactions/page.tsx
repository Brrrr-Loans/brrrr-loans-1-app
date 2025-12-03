"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";
import { Plus, ArrowDownToLine, ArrowUpToLine, ListTree } from "lucide-react";
import { TransactionsDataTable } from "./components/tanstack-datatable";
import { cn } from "@/lib/utils";
import Link from "next/link";

function TransactionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "all";

  const tabs = [
    {
      id: "all",
      label: "All Transactions",
      href: "/balance-sheet/transactions?tab=all",
      icon: ListTree,
    },
    {
      id: "investments",
      label: "Investments",
      href: "/balance-sheet/transactions?tab=investments",
      icon: ArrowDownToLine,
    },
    {
      id: "distributions",
      label: "Distributions",
      href: "/balance-sheet/transactions?tab=distributions",
      icon: ArrowUpToLine,
    },
  ];

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage all your investment and distribution transactions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push("/balance-sheet/transactions/new")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Transaction
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors flex items-center gap-2",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* NEW: TanStack Table Component */}
      <TransactionsDataTable />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <TransactionsPageContent />
    </Suspense>
  );
}
