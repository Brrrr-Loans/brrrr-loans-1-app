"use client";

import { DocumentsView } from "./documents-view";

export function PaymentRecords() {
  return (
    <DocumentsView
      bucketName="investors"
      basePath="payments"
      title="Payment Records"
      description="Transaction receipts, payment confirmations, and distribution records"
      allowedTypes={["application/pdf", "image/*", "text/csv"]}
    />
  );
}
