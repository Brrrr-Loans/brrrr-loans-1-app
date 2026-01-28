"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { Card } from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Badge } from "@/components/ui/shadcn/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/shadcn/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/custom/supabase-dropzone";
import { useDocumentUploadRpc } from "@/hooks/use-document-upload-rpc";
import {
  Download,
  FileText,
  MoreHorizontal,
  Loader2,
  Plus,
  Trash2,
  Upload,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface DealDocument {
  id: number;
  document_name: string;
  storage_bucket: string;
  storage_path: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_at: string;
  category_name: string | null;
  deal_names: string[];
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DealDocuments() {
  const supabase = useSupabase();
  const [documents, setDocuments] = useState<DealDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Document categories and deals for upload
  const [documentCategories, setDocumentCategories] = useState<
    { id: number; name: string }[]
  >([]);
  const [deals, setDeals] = useState<{ id: number; deal_name: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedDealId, setSelectedDealId] = useState<string>("");

  // Upload hook for documents bucket
  const uploadProps = useDocumentUploadRpc({
    documentCategoryId: selectedCategoryId
      ? parseInt(selectedCategoryId, 10)
      : null,
    dealId:
      selectedDealId && selectedDealId !== "none"
        ? parseInt(selectedDealId, 10)
        : null,
    allowedMimeTypes: [
      "application/pdf",
      "image/*",
      "text/*",
      "application/zip",
    ],
    maxFiles: 10,
    maxFileSize: 50 * 1024 * 1024,
  });

  const fetchDocuments = useCallback(async () => {
    if (!supabase) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("document_files")
        .select(
          `
          id,
          document_name,
          storage_bucket,
          storage_path,
          file_type,
          file_size,
          uploaded_at,
          document_category:document_categories(name),
          document_files_deals(deal:deal(deal_name))
        `,
        )
        .eq("storage_bucket", "documents")
        .not("uploaded_at", "is", null)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching deal documents:", error);
        toast.error("Failed to load documents");
        return;
      }

      // Transform to flat structure
      const docs: DealDocument[] = (data || []).map((df) => ({
        id: df.id,
        document_name: df.document_name,
        storage_bucket: df.storage_bucket,
        storage_path: df.storage_path,
        file_type: df.file_type,
        file_size: df.file_size,
        uploaded_at: df.uploaded_at,
        category_name:
          (df.document_category as { name: string } | null)?.name || null,
        deal_names: (
          (df.document_files_deals as
            | { deal: { deal_name: string } | null }[]
            | null) || []
        )
          .map((d) => d.deal?.deal_name)
          .filter((n): n is string => Boolean(n)),
      }));

      setDocuments(docs);
    } catch (error) {
      console.error("Error fetching deal documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Fetch categories and deals for upload dialog
  const fetchCategoriesAndDeals = useCallback(async () => {
    if (!supabase) return;

    try {
      const [categoriesRes, dealsRes] = await Promise.all([
        supabase.from("document_categories").select("id, name").order("name"),
        supabase.from("deal").select("id, deal_name").order("deal_name"),
      ]);

      if (categoriesRes.data) {
        setDocumentCategories(categoriesRes.data);
      }
      if (dealsRes.data) {
        setDeals(dealsRes.data);
      }
    } catch (error) {
      console.error("Error fetching categories/deals:", error);
    }
  }, [supabase]);

  useEffect(() => {
    fetchDocuments();
    fetchCategoriesAndDeals();
  }, [fetchDocuments, fetchCategoriesAndDeals]);

  // Destructure for dependency tracking
  const {
    isSuccess: uploadIsSuccess,
    successes: uploadSuccesses,
    setFiles: uploadSetFiles,
  } = uploadProps;

  // Handle successful upload
  useEffect(() => {
    if (uploadIsSuccess) {
      toast.success(`Uploaded ${uploadSuccesses.length} file(s)`);
      setShowUploadDialog(false);
      uploadSetFiles([]);
      setSelectedCategoryId("");
      setSelectedDealId("");
      fetchDocuments();
    }
  }, [uploadIsSuccess, uploadSuccesses.length, uploadSetFiles, fetchDocuments]);

  const handleDownload = async (doc: DealDocument) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase.storage
        .from(doc.storage_bucket)
        .download(doc.storage_path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.document_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  const handleDelete = async (doc: DealDocument) => {
    if (!supabase) return;

    setDeleting(doc.id);
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(doc.storage_bucket)
        .remove([doc.storage_path]);

      if (storageError) throw storageError;

      // Delete from document_files (RLS will cascade to junction tables)
      const { error: dbError } = await supabase
        .from("document_files")
        .delete()
        .eq("id", doc.id);

      if (dbError) throw dbError;

      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success("Document deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete document");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Deal Documents</h3>
            <Badge variant="secondary">{documents.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchDocuments}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowUploadDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No deal documents</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
              Documents uploaded to the Deals bucket with RBAC permissions will
              appear here.
            </p>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Linked Deals</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {doc.document_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {doc.category_name ? (
                      <Badge variant="outline">{doc.category_name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {doc.deal_names.length > 0 ? (
                        doc.deal_names.map((name, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs"
                          >
                            {name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(doc.uploaded_at), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          {deleting === doc.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(doc)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(doc)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Deal Documents
            </DialogTitle>
            <DialogDescription>
              Upload documents to the Deals bucket with RBAC-based permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Document Category Selector (required) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Document Category <span className="text-destructive">*</span>
              </label>
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deal Selector (optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Link to Deal (optional)
              </label>
              <Select value={selectedDealId} onValueChange={setSelectedDealId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select deal (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No deal link</SelectItem>
                  {deals.map((deal) => (
                    <SelectItem key={deal.id} value={String(deal.id)}>
                      {deal.deal_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dropzone */}
            <Dropzone {...uploadProps}>
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>

            {/* Upload Button */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  uploadProps.setFiles([]);
                  setShowUploadDialog(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={uploadProps.onUpload}
                disabled={
                  uploadProps.files.length === 0 ||
                  uploadProps.loading ||
                  !selectedCategoryId
                }
              >
                {uploadProps.loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload{" "}
                    {uploadProps.files.length > 0
                      ? `(${uploadProps.files.length})`
                      : ""}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
