"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "@/components/ui/layout/card";
import { Button } from "@/components/ui/forms/button";
import { Input } from "@/components/ui/forms/input";
import { Badge } from "@/components/ui/feedback/badge";
import { Checkbox } from "@/components/ui/forms/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/data/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/overlays/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlays/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/forms/supabase-dropzone";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";
import {
  Download,
  FileText,
  Search,
  Grid3X3,
  List,
  Plus,
  MoreHorizontal,
  Loader2,
  Filter,
  Eye,
  Building2,
  User,
  Upload,
  Pencil,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { useSupabase } from "@/hooks/use-supabase";
import { useUser, useOrganizationList, useOrganization } from "@clerk/nextjs";
import { useCanUpload } from "@/hooks/use-can-upload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  size: number;
  type: string;
  path: string;
  createdAt: string;
  thumbnailUrl?: string;
  source: "personal" | "organization";
  sourceName: string;
}

interface DocumentsViewProps {
  bucketName: string;
  basePath: string;
  title: string;
  description: string;
  allowedTypes?: string[];
  onUpload?: () => void;
}

type ViewMode = "grid" | "list";

export function DocumentsView({
  bucketName,
  basePath,
  title,
  description,
  allowedTypes = ["application/pdf"],
  onUpload,
}: DocumentsViewProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<"personal" | string>(
    "personal"
  );

  // Inline editing state
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Preserve dialog state across auth hiccups using a ref
  const dialogStateRef = useRef(false);

  // Custom setter that syncs with ref
  const setDialogOpen = useCallback((open: boolean) => {
    dialogStateRef.current = open;
    setShowUploadDialog(open);
  }, []);

  const { user, isLoaded: isUserLoaded } = useUser();
  const supabase = useSupabase();
  const { canUpload, isLoading: canUploadLoading } = useCanUpload();
  const { organization } = useOrganization();

  // Admin-only: all orgs and users for upload target selection
  const [allOrgs, setAllOrgs] = useState<
    { id: string; clerk_org_id: string; clerk_org_name: string }[]
  >([]);
  const [allUsers, setAllUsers] = useState<
    {
      id: number;
      clerk_user_id: string;
      email: string;
      first_name: string;
      last_name: string;
    }[]
  >([]);
  const [isAdminDataLoaded, setIsAdminDataLoaded] = useState(false);

  // Restore dialog state if it was lost during auth refresh
  useEffect(() => {
    if (isUserLoaded && user && dialogStateRef.current && !showUploadDialog) {
      // Auth is back and dialog should be open - restore it
      setShowUploadDialog(true);
    }
  }, [isUserLoaded, user, showUploadDialog]);

  // Get user's organization memberships from Clerk
  const { userMemberships, isLoaded: orgsLoaded } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  // Fetch all orgs and users for admin upload target selection
  useEffect(() => {
    if (!supabase || !canUpload || isAdminDataLoaded) return;

    const fetchAdminData = async () => {
      try {
        // Fetch all orgs
        const { data: orgsData } = await supabase
          .from("auth_clerk_orgs")
          .select("id, clerk_org_id, clerk_org_name")
          .order("clerk_org_name");

        if (orgsData) {
          setAllOrgs(orgsData);
        }

        // Fetch all users
        const { data: usersData } = await supabase
          .from("auth_clerk_users")
          .select("id, clerk_user_id, email, first_name, last_name")
          .order("email");

        if (usersData) {
          setAllUsers(usersData);
        }

        setIsAdminDataLoaded(true);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    fetchAdminData();
  }, [supabase, canUpload, isAdminDataLoaded]);

  // Compute upload path based on target selection
  const uploadPath = useMemo(() => {
    if (!user) return "";
    if (uploadTarget === "personal") {
      return `users/${user.id}/${basePath}`;
    }
    // Check if target is a user (format: "user:{clerk_user_id}")
    if (uploadTarget.startsWith("user:")) {
      const targetUserId = uploadTarget.replace("user:", "");
      return `users/${targetUserId}/${basePath}`;
    }
    // uploadTarget is an org ID
    return `orgs/${uploadTarget}/${basePath}`;
  }, [user, uploadTarget, basePath]);

  // Upload hook - will be used in the dialog
  const uploadProps = useSupabaseUpload({
    bucketName,
    path: uploadPath,
    allowedMimeTypes: allowedTypes,
    maxFiles: 10,
    maxFileSize: 50 * 1024 * 1024, // 50MB
  });

  // Refs to avoid dependency issues and track state
  const setFilesRef = useRef(uploadProps.setFiles);
  setFilesRef.current = uploadProps.setFiles;
  const prevSuccessCountRef = useRef(0);

  // Open upload dialog handler
  const handleOpenUpload = useCallback(() => {
    // Default to current org if available, otherwise personal
    if (organization?.id) {
      setUploadTarget(organization.id);
    } else {
      setUploadTarget("personal");
    }
    // Reset files and open dialog
    setFilesRef.current([]);
    // Reset the success count ref to prevent false triggers
    prevSuccessCountRef.current = 0;
    setDialogOpen(true);
  }, [organization?.id, setDialogOpen]);

  // Fetch documents from storage - both personal and organization folders
  // Admins see ALL files across all users and orgs
  const fetchDocuments = useCallback(async () => {
    // Wait for all required data to be loaded
    if (!supabase || !user || !orgsLoaded || canUploadLoading) {
      setIsLoading(false);
      return;
    }

    // For admins, wait for admin data to load before fetching
    if (canUpload && !isAdminDataLoaded) {
      // Keep loading state while waiting for admin data
      return;
    }

    setIsLoading(true);
    try {
      const clerkUserId = user.id;
      const allDocs: Document[] = [];

      // For admins: fetch from ALL users and ALL orgs
      if (canUpload && isAdminDataLoaded) {
        // Fetch from all users' folders
        for (const u of allUsers) {
          const userPath = `users/${u.clerk_user_id}/${basePath}`;
          const { data: userFiles, error: userError } = await supabase.storage
            .from(bucketName)
            .list(userPath);

          if (!userError && userFiles) {
            const userDocs = userFiles
              .filter((file) => file.name !== ".emptyFolderPlaceholder")
              .map((file) => ({
                id: `user-${u.clerk_user_id}-${file.id || file.name}`,
                name: file.name,
                description: getDocumentDescription(file.name),
                tags: getDocumentTags(file.name, file.metadata),
                size:
                  file.metadata?.size ||
                  (file as unknown as { size?: number }).size ||
                  0,
                type: file.metadata?.mimetype || "application/pdf",
                path: `${userPath}/${file.name}`,
                createdAt: file.created_at || new Date().toISOString(),
                thumbnailUrl: undefined,
                source: "personal" as const,
                sourceName:
                  u.clerk_user_id === clerkUserId
                    ? "Personal"
                    : `${u.first_name} ${u.last_name}`,
              }));
            allDocs.push(...userDocs);
          }
        }

        // Fetch from all orgs' folders
        for (const org of allOrgs) {
          const orgPath = `orgs/${org.clerk_org_id}/${basePath}`;
          const { data: orgFiles, error: orgError } = await supabase.storage
            .from(bucketName)
            .list(orgPath);

          if (!orgError && orgFiles) {
            const orgDocs = orgFiles
              .filter((file) => file.name !== ".emptyFolderPlaceholder")
              .map((file) => ({
                id: `org-${org.clerk_org_id}-${file.id || file.name}`,
                name: file.name,
                description: getDocumentDescription(file.name),
                tags: getDocumentTags(file.name, file.metadata),
                size:
                  file.metadata?.size ||
                  (file as unknown as { size?: number }).size ||
                  0,
                type: file.metadata?.mimetype || "application/pdf",
                path: `${orgPath}/${file.name}`,
                createdAt: file.created_at || new Date().toISOString(),
                thumbnailUrl: undefined,
                source: "organization" as const,
                sourceName: org.clerk_org_name,
              }));
            allDocs.push(...orgDocs);
          }
        }
      } else {
        // Non-admins: only fetch from their own folders

        // 1. Fetch from user's personal folder: users/{clerk_user_id}/{basePath}
        const userPath = `users/${clerkUserId}/${basePath}`;
        const { data: userFiles, error: userError } = await supabase.storage
          .from(bucketName)
          .list(userPath);

        if (!userError && userFiles) {
          const personalDocs = userFiles
            .filter((file) => file.name !== ".emptyFolderPlaceholder")
            .map((file) => ({
              id: `personal-${file.id || file.name}`,
              name: file.name,
              description: getDocumentDescription(file.name),
              tags: getDocumentTags(file.name, file.metadata),
              size:
                file.metadata?.size ||
                (file as unknown as { size?: number }).size ||
                0,
              type: file.metadata?.mimetype || "application/pdf",
              path: `${userPath}/${file.name}`,
              createdAt: file.created_at || new Date().toISOString(),
              thumbnailUrl: undefined,
              source: "personal" as const,
              sourceName: "Personal",
            }));
          allDocs.push(...personalDocs);
        }

        // 2. Fetch from each organization's folder: orgs/{clerk_org_id}/{basePath}
        const memberships = userMemberships?.data || [];

        for (const membership of memberships) {
          const orgId = membership.organization.id;
          const orgName = membership.organization.name;
          const orgPath = `orgs/${orgId}/${basePath}`;

          const { data: orgFiles, error: orgError } = await supabase.storage
            .from(bucketName)
            .list(orgPath);

          if (!orgError && orgFiles) {
            const orgDocs = orgFiles
              .filter((file) => file.name !== ".emptyFolderPlaceholder")
              .map((file) => ({
                id: `org-${orgId}-${file.id || file.name}`,
                name: file.name,
                description: getDocumentDescription(file.name),
                tags: getDocumentTags(file.name, file.metadata),
                size:
                  file.metadata?.size ||
                  (file as unknown as { size?: number }).size ||
                  0,
                type: file.metadata?.mimetype || "application/pdf",
                path: `${orgPath}/${file.name}`,
                createdAt: file.created_at || new Date().toISOString(),
                thumbnailUrl: undefined,
                source: "organization" as const,
                sourceName: orgName,
              }));
            allDocs.push(...orgDocs);
          }
        }
      }

      // Sort by creation date, newest first
      allDocs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setDocuments(allDocs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    supabase,
    user,
    bucketName,
    basePath,
    orgsLoaded,
    userMemberships?.data,
    canUpload,
    canUploadLoading,
    isAdminDataLoaded,
    allUsers,
    allOrgs,
  ]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Handle successful upload - only trigger on NEW successes
  useEffect(() => {
    const currentSuccessCount = uploadProps.successes.length;
    const isNewSuccess =
      uploadProps.isSuccess &&
      currentSuccessCount > prevSuccessCountRef.current;

    if (isNewSuccess) {
      toast.success(`Uploaded ${currentSuccessCount} file(s)`);
      setDialogOpen(false);
      // Reset upload state after a brief delay to allow toast to show
      setTimeout(() => {
        setFilesRef.current([]);
        fetchDocuments();
      }, 100);
    }

    prevSuccessCountRef.current = currentSuccessCount;
  }, [
    uploadProps.isSuccess,
    uploadProps.successes.length,
    fetchDocuments,
    setDialogOpen,
  ]);

  // Filter documents by search query
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const query = searchQuery.toLowerCase();
    return documents.filter(
      (doc) =>
        doc.name.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [documents, searchQuery]);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedDocs.size === filteredDocuments.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(filteredDocuments.map((d) => d.id)));
    }
  };

  const handleSelectDoc = (docId: string) => {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  };

  // Download handlers
  const handleDownload = async (doc: Document) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(doc.path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Downloaded ${doc.name}`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  const handleBulkDownload = async () => {
    if (!supabase || selectedDocs.size === 0) return;

    setIsDownloading(true);
    try {
      const docsToDownload = filteredDocuments.filter((d) =>
        selectedDocs.has(d.id)
      );

      for (const doc of docsToDownload) {
        await handleDownload(doc);
        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      toast.success(`Downloaded ${docsToDownload.length} files`);
      setSelectedDocs(new Set());
    } catch (error) {
      console.error("Bulk download error:", error);
      toast.error("Failed to download some files");
    } finally {
      setIsDownloading(false);
    }
  };

  // Inline rename handlers
  const startEditing = (doc: Document) => {
    if (!canUpload) return; // Only admins can rename
    setEditingDocId(doc.id);
    setEditingName(doc.name);
    // Focus the input after render
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const cancelEditing = () => {
    setEditingDocId(null);
    setEditingName("");
  };

  const handleRename = async (doc: Document) => {
    if (!supabase || !editingName.trim() || editingName === doc.name) {
      cancelEditing();
      return;
    }

    setIsRenaming(true);
    try {
      // Get the directory path and new file path
      const pathParts = doc.path.split("/");
      pathParts.pop(); // Remove old filename
      const newPath = [...pathParts, editingName].join("/");

      // Move (rename) the file in storage
      const { error } = await supabase.storage
        .from(bucketName)
        .move(doc.path, newPath);

      if (error) throw error;

      // Update local state
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === doc.id
            ? {
                ...d,
                name: editingName,
                path: newPath,
                description: getDocumentDescription(editingName),
                tags: getDocumentTags(editingName),
              }
            : d
        )
      );

      toast.success(`Renamed to "${editingName}"`);
    } catch (error) {
      console.error("Rename error:", error);
      toast.error("Failed to rename file");
    } finally {
      setIsRenaming(false);
      cancelEditing();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, doc: Document) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRename(doc);
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  // Delete handler
  const handleDelete = async (doc: Document) => {
    if (!supabase || !canUpload) return;

    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([doc.path]);

      if (error) throw error;

      // Remove from local state
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      setSelectedDocs((prev) => {
        const next = new Set(prev);
        next.delete(doc.id);
        return next;
      });

      toast.success(`Deleted "${doc.name}"`);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete file");
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper functions
  function getDocumentDescription(filename: string): string {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    return nameWithoutExt.replace(/[-_]/g, " ");
  }

  function getDocumentTags(
    filename: string,
    metadata?: Record<string, unknown>
  ): string[] {
    const tags: string[] = [];
    const ext = filename.split(".").pop()?.toUpperCase();
    if (ext) tags.push(ext);

    // Add tags based on filename patterns
    const lowerName = filename.toLowerCase();
    if (lowerName.includes("statement")) tags.push("Statement");
    if (lowerName.includes("receipt")) tags.push("Receipt");
    if (lowerName.includes("invoice")) tags.push("Invoice");
    if (lowerName.includes("agreement")) tags.push("Agreement");
    if (lowerName.includes("contract")) tags.push("Contract");

    return tags;
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "kB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(0))} ${sizes[i]}`;
  }

  // Upload Dialog - extracted to render in all cases
  const uploadDialog = (
    <Dialog open={showUploadDialog} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Target Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload to</label>
            <Select value={uploadTarget} onValueChange={setUploadTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {/* Personal option - always shown */}
                <SelectItem value="personal">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Personal (My Files)</span>
                  </div>
                </SelectItem>

                {/* For admins: show all orgs from database */}
                {canUpload && allOrgs.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">
                      Organizations
                    </div>
                    {allOrgs.map((org) => (
                      <SelectItem
                        key={org.clerk_org_id}
                        value={org.clerk_org_id}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{org.clerk_org_name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}

                {/* For admins: show all users from database */}
                {canUpload && allUsers.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">
                      Users
                    </div>
                    {allUsers.map((u) => (
                      <SelectItem
                        key={u.clerk_user_id}
                        value={`user:${u.clerk_user_id}`}
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>
                            {u.first_name} {u.last_name} ({u.email})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}

                {/* For non-admins: show only their org memberships */}
                {!canUpload &&
                  (userMemberships?.data || []).map((membership) => (
                    <SelectItem
                      key={membership.organization.id}
                      value={membership.organization.id}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{membership.organization.name}</span>
                      </div>
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
                setDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={uploadProps.onUpload}
              disabled={uploadProps.files.length === 0 || uploadProps.loading}
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
  );

  // Empty state
  if (!isLoading && documents.length === 0) {
    return (
      <>
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
              {description}
            </p>
            {canUpload && (
              <Button onClick={handleOpenUpload}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            )}
          </div>
        </Card>
        {uploadDialog}
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search or type filter"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          >
            <Filter className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-l-none border-l"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Add Button */}
          {canUpload && (
            <Button size="icon" className="h-9 w-9" onClick={handleOpenUpload}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Grid View */}
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {filteredDocuments.map((doc) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "group relative border rounded-lg bg-card overflow-hidden hover:shadow-md transition-shadow cursor-pointer",
                      selectedDocs.has(doc.id) && "ring-2 ring-primary"
                    )}
                    onClick={() => handleSelectDoc(doc.id)}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-[4/3] bg-muted/50 flex items-center justify-center border-b">
                      <FileText className="h-12 w-12 text-muted-foreground/50" />
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {doc.description || doc.name}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {doc.name}
                      </p>

                      {/* Source badge */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {doc.source === "organization" ? (
                          <Building2 className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        <span>{doc.sourceName}</span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {doc.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs font-mono px-2 py-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Selection indicator */}
                    <div className="absolute top-2 left-2">
                      <Checkbox
                        checked={selectedDocs.has(doc.id)}
                        onCheckedChange={() => handleSelectDoc(doc.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-background"
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              /* List View */
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="border rounded-lg overflow-hidden"
              >
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedDocs.size === filteredDocuments.length &&
                            filteredDocuments.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Investor(s)</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow
                        key={doc.id}
                        className={cn(
                          "cursor-pointer",
                          selectedDocs.has(doc.id) && "bg-muted/50"
                        )}
                        onClick={() => handleSelectDoc(doc.id)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedDocs.has(doc.id)}
                            onCheckedChange={() => handleSelectDoc(doc.id)}
                          />
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded border bg-muted/50 flex items-center justify-center shrink-0">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                            {editingDocId === doc.id ? (
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Input
                                  ref={editInputRef}
                                  value={editingName}
                                  onChange={(e) =>
                                    setEditingName(e.target.value)
                                  }
                                  onKeyDown={(e) => handleKeyDown(e, doc)}
                                  onBlur={() => handleRename(doc)}
                                  className="h-7 text-sm font-medium"
                                  disabled={isRenaming}
                                />
                                {isRenaming ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 shrink-0"
                                      onClick={() => handleRename(doc)}
                                    >
                                      <Check className="h-3.5 w-3.5 text-green-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 shrink-0"
                                      onClick={cancelEditing}
                                    >
                                      <X className="h-3.5 w-3.5 text-destructive" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            ) : (
                              <div
                                className={cn(
                                  "flex items-center gap-2 group min-w-0",
                                  canUpload && "cursor-text"
                                )}
                                onClick={() => canUpload && startEditing(doc)}
                              >
                                <span className="font-medium truncate max-w-[250px]">
                                  {doc.name}
                                </span>
                                {canUpload && (
                                  <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        {/* Source column */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            {doc.source === "organization" ? (
                              <Building2 className="h-3.5 w-3.5" />
                            ) : (
                              <User className="h-3.5 w-3.5" />
                            )}
                            <span className="truncate max-w-[120px]">
                              {doc.sourceName}
                            </span>
                          </div>
                        </TableCell>
                        {/* Tags column */}
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {doc.tags.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs font-mono px-2 py-0"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {doc.tags.length > 2 && (
                              <Badge
                                variant="outline"
                                className="text-xs px-1.5 py-0"
                              >
                                +{doc.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatFileSize(doc.size)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleDownload(doc)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              {canUpload && (
                                <DropdownMenuItem
                                  onClick={() => startEditing(doc)}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Rename
                                </DropdownMenuItem>
                              )}
                              {canUpload && (
                                <DropdownMenuItem
                                  onClick={() => handleDelete(doc)}
                                  disabled={isDeleting}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selection Action Bar */}
          <AnimatePresence>
            {selectedDocs.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
              >
                <div className="flex items-center gap-4 bg-background border rounded-full shadow-lg px-6 py-3">
                  <span className="text-sm text-muted-foreground">
                    {selectedDocs.size} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDocs(new Set())}
                  >
                    Deselect all
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleBulkDownload}
                    disabled={isDownloading}
                    className="rounded-full"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Download
                        <Download className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Upload Dialog */}
      {uploadDialog}
    </div>
  );
}
