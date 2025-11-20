"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { Button, Badge } from "@/components/ui";
import { Download, CreditCard, Calendar } from "lucide-react";
import { FileManager } from "./file-manager";

export function PaymentRecords() {
  return (
    <div className="space-y-6">
      <FileManager
        bucketName="investors"
        title="Payment Records"
        description="Transaction receipts, payment confirmations, and distribution records"
        allowedTypes={["application/pdf", "image/*", "text/csv"]}
      />
    </div>
  );
}
