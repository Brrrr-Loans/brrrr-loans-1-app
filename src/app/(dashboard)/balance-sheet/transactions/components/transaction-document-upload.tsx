"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useSupabase } from "@/hooks/use-supabase";
import { uploadTransactionDocument } from "@/lib/transaction-document-helpers";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionDocumentUploadProps {
  transactionId: number;
  onUploadComplete?: () => void;
}

const documentTypes = [
  { value: "wire_confirmation", label: "Wire Confirmation" },
  { value: "bank_statement", label: "Bank Statement" },
  { value: "invoice", label: "Invoice" },
  { value: "receipt", label: "Receipt" },
  { value: "other", label: "Other" },
];

export function TransactionDocumentUpload({
  transactionId,
  onUploadComplete,
}: TransactionDocumentUploadProps) {
  const { user } = useUser();
  const supabase = useSupabase();
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file size (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setUploadStatus({
          type: "error",
          message: "File size must be less than 50MB",
        });
        return;
      }

      setFile(selectedFile);
      setUploadStatus({ type: null, message: "" });
    }
  };

  const handleUpload = async () => {
    if (!file || !documentType || !user || !supabase) {
      setUploadStatus({
        type: "error",
        message: "Please select a file and document type",
      });
      return;
    }

    setUploading(true);
    setUploadStatus({ type: null, message: "" });

    try {
      const orgId = user.organizationMemberships?.[0]?.organization?.id || null;

      const { error } = await uploadTransactionDocument(
        supabase,
        transactionId,
        file,
        documentType,
        user.id,

        orgId
      );

      if (error) throw error;

      setUploadStatus({
        type: "success",
        message: "Document uploaded successfully",
      });

      // Reset form
      setFile(null);
      setDocumentType("");

      // Notify parent component
      onUploadComplete?.();
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Upload failed",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Transaction Document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="document-type" className="text-sm font-medium">
            Document Type
          </label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger id="document-type">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="file-upload" className="text-sm font-medium">
            File
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.xls,.xlsx"
              disabled={uploading}
            />
            {file && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {file.name}
              </div>
            )}
          </div>
        </div>

        {uploadStatus.type && (
          <div
            className={cn(
              "flex items-center gap-2 p-3 rounded-md text-sm",
              uploadStatus.type === "success"
                ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200"
            )}
          >
            {uploadStatus.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {uploadStatus.message}
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || !documentType || uploading}
          className="w-full"
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </Button>
      </CardContent>
    </Card>
  );
}
