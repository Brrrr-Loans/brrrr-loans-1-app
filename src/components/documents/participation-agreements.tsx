"use client";

import { FileManager } from "./file-manager";

export function ParticipationAgreements() {
  return (
    <div className="space-y-6">
      <FileManager
        bucketName="investors"
        title="Participation Agreements"
        description="Investment agreements, subscription documents, and legal contracts"
        allowedTypes={["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]}
        readOnly={true}
      />
    </div>
  );
}
