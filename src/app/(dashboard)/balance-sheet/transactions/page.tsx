"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui";
import { Plus, ArrowDownLeft, ArrowUpRight, ListTree } from "lucide-react";
import { TransactionsDataTable } from "./components/tanstack-datatable";
import { CreateTransactionForm } from "./components/create-transaction-form";
import { cn } from "@/lib/utils";
import Link from "next/link";

function TransactionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // Ensure client-only rendering for searchParams-dependent UI to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTab = mounted ? searchParams.get("tab") || "all" : "all";

  // Control sheet via URL query param for shareable state
  const isCreateSheetOpen = mounted && searchParams.get("create") === "true";

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
      icon: ArrowDownLeft,
    },
    {
      id: "distributions",
      label: "Distributions",
      href: "/balance-sheet/transactions?tab=distributions",
      icon: ArrowUpRight,
    },
  ];

  const handleOpenCreateSheet = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("create", "true");
    router.push(`/balance-sheet/transactions?${params.toString()}`, {
      scroll: false,
    });
  };

  const handleCloseCreateSheet = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("create");
    router.push(`/balance-sheet/transactions?${params.toString()}`, {
      scroll: false,
    });
  };

  const handleTransactionSuccess = () => {
    handleCloseCreateSheet();
    // Table will automatically refetch due to useEffect dependencies
  };

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
          <Button onClick={handleOpenCreateSheet}>
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

      {/* TanStack Table Component */}
      <TransactionsDataTable />

      {/* Create Transaction Sheet */}
      <Sheet
        open={isCreateSheetOpen}
        onOpenChange={(open) => !open && handleCloseCreateSheet()}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Create Transaction</SheetTitle>
            <SheetDescription>
              Create a new transaction with deal and investor allocations.
            </SheetDescription>
          </SheetHeader>
          <CreateTransactionForm
            onSuccess={handleTransactionSuccess}
            onCancel={handleCloseCreateSheet}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          Loading...
        </div>
      }
    >
      <TransactionsPageContent />
    </Suspense>
  );
}
