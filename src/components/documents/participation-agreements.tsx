"use client";

import { FileManager } from "./file-manager";

export function ParticipationAgreements() {
  return (
    <FileManager
      bucketName="document_upload"
      title="Loan Level Due Diligence"
      description="Loan agreements, due diligence reports, and legal documents"
      allowedTypes={[
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]}
    />
  );
}
