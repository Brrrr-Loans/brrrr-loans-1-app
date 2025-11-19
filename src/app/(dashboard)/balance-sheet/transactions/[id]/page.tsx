"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TransactionDetailsSheet } from "@/components/transactions/transaction-details-sheet";

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params?.id ? parseInt(params.id as string, 10) : null;
  const [open, setOpen] = useState(true);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Navigate back to transactions list when sheet closes
      router.push("/balance-sheet/transactions");
    }
  };

  if (!transactionId || isNaN(transactionId)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold">Invalid Transaction ID</p>
          <p className="text-sm text-muted-foreground mt-2">
            The transaction ID is invalid or missing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TransactionDetailsSheet
      transactionId={transactionId}
      open={open}
      onOpenChange={handleOpenChange}
    />
  );
}
