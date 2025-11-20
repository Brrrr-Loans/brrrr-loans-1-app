"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { FileSignature } from "lucide-react";

export function ParticipationAgreements() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Participation Agreements</CardTitle>
          </div>
          <CardDescription>
            View and download your participation agreements and related documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileSignature className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Participation agreements will be available here soon. You&apos;ll be able to
              view, download, and manage all your investment participation documents.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
