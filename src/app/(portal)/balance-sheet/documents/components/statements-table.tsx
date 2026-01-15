"use client";

import { DocumentsView } from "./documents-view";

export function StatementsTable() {
  return (
    <DocumentsView
      bucketName="investors"
      basePath="statements"
      title="Account Statements"
      description="Monthly statements showing your balance sheet investments and returns"
      allowedTypes={["application/pdf"]}
    />
  );
}
