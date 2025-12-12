"use client";

import { DocumentsView } from "./documents-view";

export function ParticipationAgreements() {
  return (
    <DocumentsView
      bucketName="investors"
      basePath="agreements"
      title="Participation Agreements"
      description="Investment agreements, subscription documents, and legal contracts"
      allowedTypes={[
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]}
    />
  );
}
