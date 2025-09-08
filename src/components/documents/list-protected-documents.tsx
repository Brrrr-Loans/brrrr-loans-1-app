"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { withInvestorPermission } from "@/components/auth/with-investor-permission";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { Button } from "@/components/ui";
import { Download, FileText } from "lucide-react";
import type { Database } from "@/types/supabase";

interface Document {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  storage_path: string;
}

interface DocumentsListProps {
  dealId: string;
}

function UnprotectedDocumentsList({ dealId }: DocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabase();

  useEffect(() => {
    async function fetchDocuments() {
      const { data, error } = await supabase
        .from("document_files")
        .select("*")
        .eq("deal_id", Number(dealId))
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Map Supabase data to Document interface
        const mapped = data.map((doc: any) => ({
          id: String(doc.id),
          name: doc.name ?? "Untitled Document",
          description: doc.description ?? null,
          created_at: doc.created_at ?? "",
          storage_path: doc.file_path ?? doc.storage_path ?? "",
        }));
        setDocuments(mapped);
      }
      setLoading(false);
    }

    fetchDocuments();
  }, [dealId]);

  const handleDownload = async (storagePath: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from("documents")
      .download(storagePath);

    if (error) {
      console.error("Error downloading file:", error);
      return;
    }

    // Create a download link
    const url = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div>Loading documents...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {doc.name}
                </TableCell>
                <TableCell>{doc.description}</TableCell>
                <TableCell>
                  {new Date(doc.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(doc.storage_path, doc.name)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {documents.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No documents available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Create a permission-protected version of DocumentsList
export const ProtectedDocumentsList =
  withInvestorPermission<DocumentsListProps>(UnprotectedDocumentsList);

// Usage example:
export function DocumentsListWrapper({ dealId }: DocumentsListProps) {
  return (
    <ProtectedDocumentsList
      resourceType="deal"
      resourceId={dealId}
      fallback={
        <Card>
          <CardHeader>
            <CardTitle>Deal Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
              You don&apos;t have permission to view documents for this deal.
            </div>
          </CardContent>
        </Card>
      }
      dealId={dealId}
    />
  );
}
