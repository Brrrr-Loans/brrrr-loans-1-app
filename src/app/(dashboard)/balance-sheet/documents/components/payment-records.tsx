"use client";

import { FileManager } from "./file-manager";

export function PaymentRecords() {
  return (
    <div className="space-y-6">
      <FileManager
        bucketName="investors"
        basePath="payments"
        title="Payment Records"
        description="Transaction receipts, payment confirmations, and distribution records"
        allowedTypes={["application/pdf", "image/*", "text/csv"]}
      />
    </div>
  );
}
