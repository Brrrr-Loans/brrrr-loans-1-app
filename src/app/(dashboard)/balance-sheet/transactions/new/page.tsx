"use client";

import { CreateTransactionForm } from "../components/create-transaction-form";
import { useRouter } from "next/navigation";

export default function CreateTransactionPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/balance-sheet/transactions");
  };

  const handleCancel = () => {
    router.push("/balance-sheet/transactions");
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <CreateTransactionForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
