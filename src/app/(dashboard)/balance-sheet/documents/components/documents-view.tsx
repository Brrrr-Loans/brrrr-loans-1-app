"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "@/components/ui/layout/card";
import { Button } from "@/components/ui/forms/button";
import { Input } from "@/components/ui/forms/input";
import { Badge } from "@/components/ui/feedback/badge";
import { Checkbox } from "@/components/ui/forms/checkbox";
import {
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/overlays/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/navigation/command";
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
import { Label } from "@/components/ui/forms/label";
import { Switch } from "@/components/ui/switch";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/forms/supabase-dropzone";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  FileCode,
  File,
  Search,
  Table2,
  LayoutGrid,
  Columns3,
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
import { NotionViewTabs, type ViewDefinition, type CardSize } from "@/components/ui/notion-view-tabs";
import { DocumentsBoardView } from "./documents-board-view";

// Default view settings
const DEFAULT_VIEW_SETTINGS = {
  cardSize: "medium" as CardSize,
  fitImage: false,
  wrapProperties: false,
  showPageIcon: true,
};
import { useSupabase } from "@/hooks/use-supabase";
import { useUser, useOrganizationList, useOrganization } from "@clerk/nextjs";
import { useCanUpload } from "@/hooks/use-can-upload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InvestorAssignment {
  type: "org" | "user";
  id: string;
  name: string;
}

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
  investors: InvestorAssignment[];
}

interface DocumentsViewProps {
  bucketName: string;
  basePath: string;
  title: string;
  description: string;
  allowedTypes?: string[];
  onUpload?: () => void;
}

type ViewMode = "table" | "board" | "gallery";

// View type options for the menu
const VIEW_TYPE_OPTIONS = [
  { id: "table", label: "Table", icon: Table2, description: "Traditional table layout with rows and columns" },
  { id: "board", label: "Board", icon: Columns3, description: "Kanban-style board for organizing items in columns" },
  { id: "gallery", label: "Gallery", icon: LayoutGrid, description: "Grid of cards, use for mood boards and visual content" },
];

// View Options Menu Component (Notion-style "..." button)
interface ViewOptionsMenuProps {
  viewSettings: typeof DEFAULT_VIEW_SETTINGS;
  onViewSettingsChange: (settings: typeof DEFAULT_VIEW_SETTINGS) => void;
  activeView: ViewMode;
  onViewChange: (viewId: ViewMode) => void;
}

function ViewOptionsMenu({
  viewSettings,
  onViewSettingsChange,
  activeView,
  onViewChange,
}: ViewOptionsMenuProps) {
  // Only show card settings for board/gallery views
  const showCardSettings = activeView === "board" || activeView === "gallery";
  const activeViewOption = VIEW_TYPE_OPTIONS.find(v => v.id === activeView);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          suppressHydrationWarning
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">View options</h4>
          </div>

          {/* Current view indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {activeViewOption && (
              <>
                <activeViewOption.icon className="h-4 w-4" />
                <span>Current: {activeViewOption.label}</span>
              </>
            )}
          </div>

          {/* View type grid */}
          <div className="grid grid-cols-3 gap-2">
            {VIEW_TYPE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = activeView === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => onViewChange(option.id as ViewMode)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-muted/30 hover:bg-muted/50"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-xs", isSelected ? "text-primary font-medium" : "text-muted-foreground")}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground">
            {activeViewOption?.description}
          </p>

          {/* Settings section for board/gallery */}
          {showCardSettings && (
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Card size</Label>
                <Select
                  value={viewSettings.cardSize}
                  onValueChange={(value: CardSize) =>
                    onViewSettingsChange({ ...viewSettings, cardSize: value as CardSize })
                  }
                >
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Fit image</Label>
                <Switch
                  checked={viewSettings.fitImage}
                  onCheckedChange={(checked) =>
                    onViewSettingsChange({ ...viewSettings, fitImage: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Wrap properties</Label>
                <Switch
                  checked={viewSettings.wrapProperties}
                  onCheckedChange={(checked) =>
                    onViewSettingsChange({ ...viewSettings, wrapProperties: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Show page icon</Label>
                <Switch
                  checked={viewSettings.showPageIcon}
                  onCheckedChange={(checked) =>
                    onViewSettingsChange({ ...viewSettings, showPageIcon: checked })
                  }
                />
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// View definitions for Notion-style tabs
const VIEW_DEFINITIONS: ViewDefinition[] = [
  { id: "table", label: "Table", icon: Table2 },
  { id: "board", label: "Board", icon: Columns3 },
  { id: "gallery", label: "Gallery", icon: LayoutGrid },
];

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
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [viewSettings, setViewSettings] = useState(DEFAULT_VIEW_SETTINGS);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
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

  // Column resize state - optimized for less whitespace
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    checkbox: 40,
    fileName: 400,
    investors: 180,
    tags: 150,
    size: 70,
    actions: 50,
  });
  const resizingRef = useRef<{
    column: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  // Investor editing state
  const [editingInvestorsDocId, setEditingInvestorsDocId] = useState<
    string | null
  >(null);
  const [investorSearchQuery, setInvestorSearchQuery] = useState("");
  const [isSavingInvestors, setIsSavingInvestors] = useState(false);

  // Tag editing state
  const [editingTagsDocId, setEditingTagsDocId] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState("");
  const [isSavingTags, setIsSavingTags] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  
  // Available tags for auto-complete (from document_tags table)
  const [availableTags, setAvailableTags] = useState<
    { id: number; name: string; slug: string }[]
  >([]);

  // Track if initial fetch has been done to prevent re-fetching on every render
  const initialFetchDoneRef = useRef(false);

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
    { id: number; clerk_org_id: string; clerk_org_name: string }[]
  >([]);
  const [allUsers, setAllUsers] = useState<
    {
      id: number;
      clerk_user_id: string | null;
      email: string | null;
      first_name: string | null;
      last_name: string | null;
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

  // Refs to store latest values without triggering refetches
  // These must be defined AFTER the hooks that provide the values
  const supabaseRef = useRef(supabase);
  const userRef = useRef(user);
  const allUsersRef = useRef(allUsers);
  const allOrgsRef = useRef(allOrgs);
  const userMembershipsRef = useRef(userMemberships?.data);
  const canUploadRef = useRef(canUpload);

  // Keep refs in sync with latest values
  useEffect(() => {
    supabaseRef.current = supabase;
  }, [supabase]);
  useEffect(() => {
    userRef.current = user;
  }, [user]);
  useEffect(() => {
    allUsersRef.current = allUsers;
  }, [allUsers]);
  useEffect(() => {
    allOrgsRef.current = allOrgs;
  }, [allOrgs]);
  useEffect(() => {
    userMembershipsRef.current = userMemberships?.data;
  }, [userMemberships?.data]);
  useEffect(() => {
    canUploadRef.current = canUpload;
  }, [canUpload]);

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

  // Fetch available tags for auto-complete from document_tags table
  useEffect(() => {
    if (!supabase) return;

    const fetchTags = async () => {
      try {
        const { data: tagsData, error } = await supabase
          .from("document_tags")
          .select("id, name, slug")
          .order("name");

        if (error) {
          console.error("Error fetching available tags:", error);
          return;
        }

        if (tagsData) {
          setAvailableTags(tagsData);
        }
      } catch (error) {
        console.error("Error fetching available tags:", error);
      }
    };

    fetchTags();
  }, [supabase]);

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
  const fetchDocuments = useCallback(
    async (forceRefresh = false) => {
      // Use refs to get latest values without dependencies
      const currentSupabase = supabaseRef.current;
      const currentUser = userRef.current;
      const currentAllUsers = allUsersRef.current;
      const currentAllOrgs = allOrgsRef.current;
      const currentMemberships = userMembershipsRef.current;
      const currentCanUpload = canUploadRef.current;

      // Wait for all required data to be loaded
      if (!currentSupabase || !currentUser) {
        setIsLoading(false);
        return;
      }

      // Only show loading spinner on initial fetch or forced refresh
      // This prevents the table from disappearing during background refetches
      if (!initialFetchDoneRef.current || forceRefresh) {
        setIsLoading(true);
      }
      try {
        const clerkUserId = currentUser.id;
        const allDocs: Document[] = [];

        // For admins: query storage.objects directly (much more efficient than individual .list() calls)
        if (currentCanUpload && currentAllUsers.length > 0) {
          // Query all files in the bucket that match our basePath pattern
          // This is a single query instead of N queries per user/org
          // Note: storage_objects_view is a custom view not in generated types
          // Using type assertion to bypass TypeScript check
          const { data: allFiles, error: queryError } = await (currentSupabase as unknown as {
            from: (table: string) => {
              select: (columns: string) => {
                eq: (column: string, value: string) => {
                  like: (column: string, pattern: string) => Promise<{
                    data: Array<{
                      id: string;
                      name: string;
                      bucket_id: string;
                      created_at: string | null;
                      metadata: Record<string, unknown> | null;
                    }> | null;
                    error: Error | null;
                  }>;
                };
              };
            };
          }).from("storage_objects_view")
            .select("id, name, bucket_id, created_at, metadata")
            .eq("bucket_id", bucketName)
            .like("name", `%/${basePath}/%`);

          if (!queryError && allFiles) {
            // Build lookup maps for users and orgs
            const userNameMap = new Map(
              currentAllUsers.map((u) => [
                u.clerk_user_id,
                `${u.first_name} ${u.last_name}`.trim() || u.email,
              ])
            );
            const orgNameMap = new Map(
              currentAllOrgs.map((o) => [o.clerk_org_id, o.clerk_org_name])
            );

            for (const file of allFiles) {
              // Skip placeholder files
              if (file.name.endsWith(".emptyFolderPlaceholder")) continue;

              // Parse the path to determine source
              const pathParts = file.name.split("/");
              const fileName = pathParts[pathParts.length - 1];
              let source: "personal" | "organization" = "personal";
              let sourceName = "Unknown";
              let docId = file.id;

              if (pathParts[0] === "users" && pathParts[1]) {
                const userId = pathParts[1];
                source = "personal";
                sourceName =
                  userId === clerkUserId
                    ? "Personal"
                    : userNameMap.get(userId) || userId;
                docId = `user-${userId}-${file.id}`;
              } else if (pathParts[0] === "orgs" && pathParts[1]) {
                const orgId = pathParts[1];
                source = "organization";
                sourceName = orgNameMap.get(orgId) || orgId;
                docId = `org-${orgId}-${file.id}`;
              }

              const metadata = file.metadata as Record<string, unknown> | null;
              allDocs.push({
                id: docId,
                name: fileName,
                description: getDocumentDescription(fileName),
                tags: getDocumentTags(fileName, metadata || undefined),
                size: (metadata?.size as number) || 0,
                type: (metadata?.mimetype as string) || "application/pdf",
                path: file.name,
                createdAt: file.created_at || new Date().toISOString(),
                thumbnailUrl: undefined,
                source,
                sourceName,
                investors: [],
              });
            }
          } else if (queryError) {
            // Fallback to individual .list() calls if view doesn't exist
            // This handles the case where the view hasn't been created yet
            console.warn(
              "storage_objects_view not available, falling back to individual queries"
            );

            // Fetch from all users' folders (with error suppression)
            const userPromises = currentAllUsers.map(async (u) => {
              const userPath = `users/${u.clerk_user_id}/${basePath}`;
              try {
                const { data: userFiles } = await currentSupabase.storage
                  .from(bucketName)
                  .list(userPath);
                return { user: u, files: userFiles || [], path: userPath };
              } catch {
                return { user: u, files: [], path: userPath };
              }
            });

            const userResults = await Promise.all(userPromises);
            for (const { user: u, files, path: userPath } of userResults) {
              const userDocs = files
                // Filter out folders (id is null) and placeholder files
                .filter(
                  (file) =>
                    file.id !== null && file.name !== ".emptyFolderPlaceholder"
                )
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
                  investors: [],
                }));
              allDocs.push(...userDocs);
            }

            // Fetch from all orgs' folders (with error suppression)
            const orgPromises = currentAllOrgs.map(async (org) => {
              const orgPath = `orgs/${org.clerk_org_id}/${basePath}`;
              try {
                const { data: orgFiles } = await currentSupabase.storage
                  .from(bucketName)
                  .list(orgPath);
                return { org, files: orgFiles || [], path: orgPath };
              } catch {
                return { org, files: [], path: orgPath };
              }
            });

            const orgResults = await Promise.all(orgPromises);
            for (const { org, files, path: orgPath } of orgResults) {
              const orgDocs = files
                // Filter out folders (id is null) and placeholder files
                .filter(
                  (file) =>
                    file.id !== null && file.name !== ".emptyFolderPlaceholder"
                )
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
                  investors: [],
                }));
              allDocs.push(...orgDocs);
            }
          }
        } else {
          // Non-admins: only fetch from their own folders

          // 1. Fetch from user's personal folder: users/{clerk_user_id}/{basePath}
          const userPath = `users/${clerkUserId}/${basePath}`;
          const { data: userFiles, error: userError } =
            await currentSupabase.storage.from(bucketName).list(userPath);

          if (!userError && userFiles) {
            const personalDocs = userFiles
              // Filter out folders (id is null) and placeholder files
              .filter(
                (file) =>
                  file.id !== null && file.name !== ".emptyFolderPlaceholder"
              )
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
                investors: [],
              }));
            allDocs.push(...personalDocs);
          }

          // 2. Fetch from each organization's folder: orgs/{clerk_org_id}/{basePath}
          const memberships = currentMemberships || [];

          for (const membership of memberships) {
            const orgId = membership.organization.id;
            const orgName = membership.organization.name;
            const orgPath = `orgs/${orgId}/${basePath}`;

            const { data: orgFiles, error: orgError } =
              await currentSupabase.storage.from(bucketName).list(orgPath);

            if (!orgError && orgFiles) {
              const orgDocs = orgFiles
                // Filter out folders (id is null) and placeholder files
                .filter(
                  (file) =>
                    file.id !== null && file.name !== ".emptyFolderPlaceholder"
                )
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
                  investors: [],
                }));
              allDocs.push(...orgDocs);
            }
          }
        }

        // Fetch investor assignments for all documents through transaction relationship
        // Path: document_files -> bsi_transactions_document_files -> bsi_transactions_investors -> auth_clerk_orgs
        if (allDocs.length > 0) {
          const paths = allDocs.map((d) => d.path);
          
          // First, try to get investors through the transaction relationship
          // This query joins document_files -> bsi_transactions_document_files -> bsi_transactions_investors
          const { data: transactionInvestors } = await currentSupabase
            .from("document_files")
            .select(`
              storage_path,
              bsi_transactions_document_files!inner (
                transaction_id,
                bsi_transactions_investors:bsi_transactions_investors!bsi_transactions_investors_transaction_id_fkey (
                  clerk_org_id,
                  clerk_user_id,
                  auth_clerk_orgs:clerk_org_id (
                    clerk_org_id,
                    clerk_org_name
                  )
                )
              )
            `)
            .in("storage_path", paths);

          // Build a map of investor names for quick lookup
          const orgNameMap = new Map(
            currentAllOrgs.map((o) => [o.clerk_org_id, o.clerk_org_name])
          );
          const userNameMap = new Map(
            currentAllUsers.map((u) => [
              u.clerk_user_id,
              `${u.first_name} ${u.last_name}`.trim() || u.email,
            ])
          );

          // Also build a map by org ID (numeric) for transaction investor lookups
          const orgIdToNameMap = new Map(
            currentAllOrgs.map((o) => [o.id, { clerk_org_id: o.clerk_org_id, clerk_org_name: o.clerk_org_name }])
          );

          // Group assignments by document path from transaction relationship
          const assignmentsByPath = new Map<string, InvestorAssignment[]>();
          
          if (transactionInvestors && transactionInvestors.length > 0) {
            for (const docFile of transactionInvestors) {
              const filePath = docFile.storage_path;
              if (!filePath) continue;
              
              const investors: InvestorAssignment[] = [];
              const seenInvestors = new Set<string>(); // Deduplicate by type+id
              
              // Process each transaction's investors
              const txDocs = docFile.bsi_transactions_document_files;
              if (Array.isArray(txDocs)) {
                for (const txDoc of txDocs) {
                  const txInvestors = txDoc.bsi_transactions_investors;
                  if (Array.isArray(txInvestors)) {
                    for (const inv of txInvestors) {
                      // Handle org investors
                      if (inv.clerk_org_id) {
                        const orgInfo = inv.auth_clerk_orgs;
                        const orgId = orgInfo?.clerk_org_id || String(inv.clerk_org_id);
                        const orgName = orgInfo?.clerk_org_name || orgNameMap.get(orgId) || `Org ${inv.clerk_org_id}`;
                        const key = `org-${orgId}`;
                        
                        if (!seenInvestors.has(key)) {
                          seenInvestors.add(key);
                          investors.push({
                            type: "org",
                            id: orgId,
                            name: orgName,
                          });
                        }
                      }
                      // Handle user investors
                      if (inv.clerk_user_id) {
                        const userId = String(inv.clerk_user_id);
                        const userName = userNameMap.get(userId) || `User ${inv.clerk_user_id}`;
                        const key = `user-${userId}`;
                        
                        if (!seenInvestors.has(key)) {
                          seenInvestors.add(key);
                          investors.push({
                            type: "user",
                            id: userId,
                            name: userName,
                          });
                        }
                      }
                    }
                  }
                }
              }
              
              if (investors.length > 0) {
                assignmentsByPath.set(filePath, investors);
              }
            }
          }

          // Query direct investor assignments from junction tables
          // Get all storage paths from allDocs
          const storagePaths = allDocs.map((d) => d.path).filter(Boolean);
          
          // Map to store persisted tags by path
          const persistedTagsByPath = new Map<string, string[]>();
          
          if (storagePaths.length > 0) {
            // Query document_files to get IDs for our storage paths
            const { data: docFilesData } = await currentSupabase
              .from("document_files")
              .select("id, storage_path")
              .eq("storage_bucket", bucketName)
              .in("storage_path", storagePaths);
            
            // Build map of document_file IDs to storage paths for tag lookup
            if (docFilesData && docFilesData.length > 0) {
              const docFileIds = docFilesData.map((df) => df.id);
              const idToPathMap = new Map(docFilesData.map((df) => [df.id, df.storage_path]));
              
              // Query tags via junction table with join to document_tags
              const { data: tagAssignments } = await currentSupabase
                .from("document_files_tags")
                .select("document_file_id, document_tags(id, name, slug)")
                .in("document_file_id", docFileIds);
              
              // Build map of tags by storage path
              if (tagAssignments) {
                for (const assignment of tagAssignments) {
                  const storagePath = idToPathMap.get(assignment.document_file_id);
                  if (!storagePath) continue;
                  
                  const tagInfo = assignment.document_tags as { id: number; name: string; slug: string } | null;
                  if (!tagInfo) continue;
                  
                  const existing = persistedTagsByPath.get(storagePath) || [];
                  if (!existing.includes(tagInfo.name)) {
                    existing.push(tagInfo.name);
                    persistedTagsByPath.set(storagePath, existing);
                  }
                }
              }
              
              // Reuse the same docFileIds and idToPathMap for investor queries
              const pathToIdMap = idToPathMap;
              
              // Query org assignments
              const { data: orgAssignments } = await currentSupabase
                .from("document_files_clerk_orgs")
                .select("document_file_id, clerk_org_id, auth_clerk_orgs(clerk_org_id, clerk_org_name)")
                .in("document_file_id", docFileIds);
              
              // Query user assignments
              const { data: userAssignments } = await currentSupabase
                .from("document_files_clerk_users")
                .select("document_file_id, clerk_user_id, auth_clerk_users(clerk_user_id, first_name, last_name, email)")
                .in("document_file_id", docFileIds);
              
              // Merge org assignments into assignmentsByPath
              if (orgAssignments) {
                for (const assignment of orgAssignments) {
                  const storagePath = pathToIdMap.get(assignment.document_file_id);
                  if (!storagePath) continue;
                  
                  const orgInfo = assignment.auth_clerk_orgs as { clerk_org_id: string; clerk_org_name: string } | null;
                  if (!orgInfo) continue;
                  
                  const key = `org-${orgInfo.clerk_org_id}`;
                  const existing = assignmentsByPath.get(storagePath) || [];
                  
                  // Check if already added
                  if (!existing.some((i) => i.type === "org" && i.id === orgInfo.clerk_org_id)) {
                    existing.push({
                      type: "org",
                      id: orgInfo.clerk_org_id,
                      name: orgInfo.clerk_org_name,
                    });
                    assignmentsByPath.set(storagePath, existing);
                  }
                }
              }
              
              // Merge user assignments into assignmentsByPath
              if (userAssignments) {
                for (const assignment of userAssignments) {
                  const storagePath = pathToIdMap.get(assignment.document_file_id);
                  if (!storagePath) continue;
                  
                  const userInfo = assignment.auth_clerk_users as { clerk_user_id: string; first_name: string | null; last_name: string | null; email: string | null } | null;
                  if (!userInfo) continue;
                  
                  const userName = `${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim() || userInfo.email || "Unknown";
                  const existing = assignmentsByPath.get(storagePath) || [];
                  
                  // Check if already added
                  if (!existing.some((i) => i.type === "user" && i.id === userInfo.clerk_user_id)) {
                    existing.push({
                      type: "user",
                      id: userInfo.clerk_user_id,
                      name: userName,
                    });
                    assignmentsByPath.set(storagePath, existing);
                  }
                }
              }
            }
          }

          // Merge assignments and persisted tags into documents
          for (const doc of allDocs) {
            doc.investors = assignmentsByPath.get(doc.path) || [];
            
            // Use persisted tags if they exist, otherwise keep auto-generated tags
            const persistedTags = persistedTagsByPath.get(doc.path);
            if (persistedTags !== undefined) {
              // Use persisted tags (even if empty array - user may have intentionally cleared all tags)
              doc.tags = persistedTags;
            }
            // If no persisted tags, keep the auto-generated tags from getDocumentTags()
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
        initialFetchDoneRef.current = true;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [
      // Only include dependencies that should trigger a refetch
      // supabase client changes shouldn't cause refetch if we already have data
      bucketName,
      basePath,
    ]
  );

  // Track recent delete operations to prevent immediate refetch
  const recentDeleteRef = useRef(false);

  // Initial fetch and refetch when required data becomes available
  useEffect(() => {
    // Don't refetch while editing is in progress to prevent overwriting local changes
    if (
      editingDocId ||
      isRenaming ||
      isSavingInvestors ||
      editingInvestorsDocId
    ) {
      return;
    }

    // Skip refetch if a delete just completed (to prevent bringing back deleted items)
    if (recentDeleteRef.current) {
      recentDeleteRef.current = false;
      return;
    }

    // Only fetch if we have all required data
    if (supabase && user && orgsLoaded && !canUploadLoading) {
      // For admins, also wait for admin data
      if (canUpload && !isAdminDataLoaded) {
        return;
      }
      fetchDocuments();
    }
  }, [
    supabase,
    user,
    orgsLoaded,
    canUpload,
    canUploadLoading,
    isAdminDataLoaded,
    fetchDocuments,
    editingDocId,
    isRenaming,
    isSavingInvestors,
    editingInvestorsDocId,
  ]);

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
        fetchDocuments(true); // Force refresh to show new files
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

  // Investor editing handlers
  // TODO: Implement with new junction tables (document_files_clerk_orgs, document_files_clerk_users)
  // The old document_investors table has been deprecated and removed.
  // New implementation needs to:
  // 1. Find or create a document_files record for the storage path
  // 2. Add/remove entries from document_files_clerk_orgs or document_files_clerk_users
  const handleToggleInvestor = async (
    doc: Document,
    investor: InvestorAssignment
  ) => {
    // Use the current supabase client directly (not ref) to ensure fresh auth
    if (!supabase || !canUpload) {
      toast.error("Not authorized to update investors");
      return;
    }

    setIsSavingInvestors(true);
    try {
      const isCurrentlyAssigned = doc.investors.some(
        (i) => i.type === investor.type && i.id === investor.id
      );

      // First, ensure we have a document_files record for this storage path
      // Upsert the document_files record
      const { data: docFileData, error: upsertError } = await supabase
        .from("document_files")
        .upsert(
          {
            storage_bucket: bucketName,
            storage_path: doc.path,
            document_name: doc.name,
          },
          { onConflict: "storage_bucket,storage_path" }
        )
        .select("id")
        .single();

      if (upsertError || !docFileData) {
        console.error("Error upserting document_files:", upsertError);
        throw new Error(upsertError?.message || "Failed to create document record");
      }

      const documentFileId = docFileData.id;

      if (isCurrentlyAssigned) {
        // Remove the assignment from the appropriate junction table
        if (investor.type === "org") {
          // Need to get the internal clerk_org_id from clerk_org_id string
          const { data: orgData } = await supabase
            .from("auth_clerk_orgs")
            .select("id")
            .eq("clerk_org_id", investor.id)
            .single();

          if (orgData) {
            const { error } = await supabase
              .from("document_files_clerk_orgs")
              .delete()
              .eq("document_file_id", documentFileId)
              .eq("clerk_org_id", orgData.id);

            if (error) throw new Error(error.message);
          }
        } else {
          // User investor
          const { data: userData } = await supabase
            .from("auth_clerk_users")
            .select("id")
            .eq("clerk_user_id", investor.id)
            .single();

          if (userData) {
            const { error } = await supabase
              .from("document_files_clerk_users")
              .delete()
              .eq("document_file_id", documentFileId)
              .eq("clerk_user_id", userData.id);

            if (error) throw new Error(error.message);
          }
        }

        // Update local state
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id
              ? {
                  ...d,
                  investors: d.investors.filter(
                    (i) => !(i.type === investor.type && i.id === investor.id)
                  ),
                }
              : d
          )
        );
        toast.success(`Removed ${investor.name}`);
      } else {
        // Add the assignment to the appropriate junction table
        if (investor.type === "org") {
          // Need to get the internal clerk_org_id from clerk_org_id string
          const { data: orgData } = await supabase
            .from("auth_clerk_orgs")
            .select("id")
            .eq("clerk_org_id", investor.id)
            .single();

          if (orgData) {
            const { error } = await supabase
              .from("document_files_clerk_orgs")
              .insert({
                document_file_id: documentFileId,
                clerk_org_id: orgData.id,
              });

            if (error) throw new Error(error.message);
          } else {
            throw new Error("Organization not found");
          }
        } else {
          // User investor
          const { data: userData } = await supabase
            .from("auth_clerk_users")
            .select("id")
            .eq("clerk_user_id", investor.id)
            .single();

          if (userData) {
            const { error } = await supabase
              .from("document_files_clerk_users")
              .insert({
                document_file_id: documentFileId,
                clerk_user_id: userData.id,
              });

            if (error) throw new Error(error.message);
          } else {
            throw new Error("User not found");
          }
        }

        // Update local state
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id
              ? {
                  ...d,
                  investors: [...d.investors, investor],
                }
              : d
          )
        );
        toast.success(`Added ${investor.name}`);
      }
    } catch (error: unknown) {
      // Extract error message from PostgresError or generic error
      const errorMessage =
        error instanceof Error
          ? error.message
          : error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : String(error);
      console.error("Error updating investor assignment:", errorMessage);
      toast.error(`Failed to update investor: ${errorMessage}`);
    } finally {
      setIsSavingInvestors(false);
    }
  };

  // Get all available investors for selection
  const availableInvestors = useMemo((): InvestorAssignment[] => {
    const investors: InvestorAssignment[] = [];

    // Add all orgs
    for (const org of allOrgs) {
      investors.push({
        type: "org",
        id: org.clerk_org_id,
        name: org.clerk_org_name,
      });
    }

    // Add all users
    for (const u of allUsers) {
      if (!u.clerk_user_id) continue; // Skip users without clerk_user_id
      investors.push({
        type: "user",
        id: u.clerk_user_id,
        name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email || "Unknown",
      });
    }

    return investors;
  }, [allOrgs, allUsers]);

  // Filter investors by search query
  const filteredInvestors = useMemo(() => {
    if (!investorSearchQuery.trim()) return availableInvestors;
    const query = investorSearchQuery.toLowerCase();
    return availableInvestors.filter((inv) =>
      inv.name.toLowerCase().includes(query)
    );
  }, [availableInvestors, investorSearchQuery]);

  // Generate slug from tag name (matches database function)
  const generateTagSlug = (tagName: string): string => {
    return tagName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  // Handle adding a new tag to a document (using junction table)
  const handleAddTag = async (doc: Document, newTag: string) => {
    if (!supabase || !newTag.trim()) return;

    const trimmedTag = newTag.trim();
    const tagSlug = generateTagSlug(trimmedTag);
    
    // Don't add duplicate tags (check by slug for normalization)
    const existingTagSlugs = doc.tags.map(generateTagSlug);
    if (existingTagSlugs.includes(tagSlug)) {
      setNewTagInput("");
      toast.info(`Tag "${trimmedTag}" already exists on this document`);
      return;
    }

    setIsSavingTags(true);
    try {
      // Step 1: Ensure we have a document_files record
      const { data: docFileData, error: upsertError } = await supabase
        .from("document_files")
        .upsert(
          {
            storage_bucket: bucketName,
            storage_path: doc.path,
            document_name: doc.name,
          },
          { onConflict: "storage_bucket,storage_path" }
        )
        .select("id")
        .single();

      if (upsertError || !docFileData) {
        console.error("Error ensuring document_files record:", upsertError);
        throw new Error(upsertError?.message || "Failed to create document record");
      }

      // Step 2: Find or create the tag in document_tags
      // First try to find existing tag by slug
      let tagId: number | null = null;
      const existingTag = availableTags.find((t) => t.slug === tagSlug);
      
      if (existingTag) {
        tagId = existingTag.id;
      } else {
        // Create new tag
        const { data: newTagData, error: tagError } = await supabase
          .from("document_tags")
          .insert({
            name: trimmedTag,
            slug: tagSlug,
          })
          .select("id, name, slug")
          .single();

        if (tagError || !newTagData) {
          console.error("Error creating tag:", tagError);
          throw new Error(tagError?.message || "Failed to create tag");
        }

        tagId = newTagData.id;
        
        // Add to available tags for auto-complete
        setAvailableTags((prev) => [...prev, newTagData].sort((a, b) => a.name.localeCompare(b.name)));
      }

      // Step 3: Create junction table entry
      const { error: junctionError } = await supabase
        .from("document_files_tags")
        .insert({
          document_file_id: docFileData.id,
          document_tag_id: tagId,
        });

      if (junctionError) {
        // Ignore duplicate key errors (tag already assigned)
        if (!junctionError.message?.includes("duplicate")) {
          console.error("Error creating tag assignment:", junctionError);
          throw new Error(junctionError.message || "Failed to assign tag");
        }
      }

      // Update local state - use the display name from existing tag if found
      const displayName = existingTag?.name || trimmedTag;
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === doc.id
            ? { ...d, tags: [...d.tags, displayName] }
            : d
        )
      );

      setNewTagInput("");
      toast.success(`Added tag "${displayName}"`);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
          ? (error as { message: string }).message
          : String(error);
      console.error("Error adding tag:", errorMessage);
      toast.error(`Failed to add tag: ${errorMessage}`);
    } finally {
      setIsSavingTags(false);
    }
  };

  // Handle removing a tag from a document (using junction table)
  const handleRemoveTag = async (doc: Document, tagToRemove: string) => {
    if (!supabase) return;

    setIsSavingTags(true);
    try {
      // Step 1: Find the document_files record
      const { data: docFileData, error: docError } = await supabase
        .from("document_files")
        .select("id")
        .eq("storage_bucket", bucketName)
        .eq("storage_path", doc.path)
        .single();

      if (docError || !docFileData) {
        // If no record exists, the tag was auto-generated and not persisted
        // Just update local state
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id
              ? { ...d, tags: d.tags.filter((t) => t !== tagToRemove) }
              : d
          )
        );
        toast.success(`Removed tag "${tagToRemove}"`);
        return;
      }

      // Step 2: Find the tag by slug
      const tagSlug = generateTagSlug(tagToRemove);
      const tagRecord = availableTags.find((t) => t.slug === tagSlug);
      
      if (!tagRecord) {
        // Tag not in available tags - might be from old TEXT[] column
        // Just update local state
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id
              ? { ...d, tags: d.tags.filter((t) => t !== tagToRemove) }
              : d
          )
        );
        toast.success(`Removed tag "${tagToRemove}"`);
        return;
      }

      // Step 3: Delete from junction table
      const { error: deleteError } = await supabase
        .from("document_files_tags")
        .delete()
        .eq("document_file_id", docFileData.id)
        .eq("document_tag_id", tagRecord.id);

      if (deleteError) {
        console.error("Error removing tag assignment:", deleteError);
        throw new Error(deleteError.message || "Failed to remove tag");
      }

      // Update local state
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === doc.id
            ? { ...d, tags: d.tags.filter((t) => t !== tagToRemove) }
            : d
        )
      );

      toast.success(`Removed tag "${tagToRemove}"`);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
          ? (error as { message: string }).message
          : String(error);
      console.error("Error removing tag:", errorMessage);
      toast.error(`Failed to remove tag: ${errorMessage}`);
    } finally {
      setIsSavingTags(false);
    }
  };

  // Delete handler
  const handleDelete = async (doc: Document) => {
    if (!supabase || !canUpload) return;

    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      return;
    }

    // Set recentDeleteRef BEFORE the async operation to prevent race conditions
    // with useEffect triggering fetchDocuments while delete is in progress
    recentDeleteRef.current = true;

    setIsDeleting(true);
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([doc.path]);

      if (error) {
        // Reset ref on error so fetches can resume
        recentDeleteRef.current = false;
        throw error;
      }

      // Remove from local state
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      setSelectedDocs((prev) => {
        const next = new Set(prev);
        next.delete(doc.id);
        return next;
      });

      toast.success(`Deleted "${doc.name}"`);
    } catch (error) {
      // Reset ref on error so fetches can resume
      recentDeleteRef.current = false;
      console.error("Delete error:", error);
      toast.error("Failed to delete file");
    } finally {
      setIsDeleting(false);
    }
  };

  // Column resize handler
  const handleColumnResizeStart = useCallback(
    (column: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const startWidth = columnWidths[column] || 100;
      resizingRef.current = { column, startX: e.clientX, startWidth };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!resizingRef.current) return;
        const {
          column: resizingColumn,
          startX,
          startWidth,
        } = resizingRef.current;
        const diff = moveEvent.clientX - startX;
        const minWidth =
          resizingColumn === "checkbox" || resizingColumn === "actions"
            ? 48
            : 80;
        const newWidth = Math.max(minWidth, startWidth + diff);
        setColumnWidths((prev) => ({
          ...prev,
          [resizingColumn]: newWidth,
        }));
      };

      const handleMouseUp = () => {
        resizingRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [columnWidths]
  );

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

  // Get appropriate icon and color based on file type
  function getFileIcon(filename: string, mimeType: string) {
    const ext = filename.split(".").pop()?.toLowerCase();

    // PDF files
    if (mimeType === "application/pdf" || ext === "pdf") {
      return {
        icon: FileText,
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
      };
    }

    // Spreadsheets
    if (
      ["xlsx", "xls", "csv", "numbers"].includes(ext || "") ||
      mimeType.includes("spreadsheet") ||
      mimeType.includes("excel")
    ) {
      return {
        icon: FileSpreadsheet,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
      };
    }

    // Images
    if (
      ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext || "") ||
      mimeType.startsWith("image/")
    ) {
      return {
        icon: FileImage,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
      };
    }

    // Archives
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext || "")) {
      return {
        icon: FileArchive,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
      };
    }

    // Code files
    if (
      [
        "js",
        "ts",
        "jsx",
        "tsx",
        "json",
        "html",
        "css",
        "py",
        "rb",
        "go",
      ].includes(ext || "")
    ) {
      return {
        icon: FileCode,
        color: "text-violet-500",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
      };
    }

    // Word documents
    if (
      ["doc", "docx", "odt", "rtf"].includes(ext || "") ||
      mimeType.includes("word") ||
      mimeType.includes("document")
    ) {
      return {
        icon: FileText,
        color: "text-blue-600",
        bg: "bg-blue-600/10",
        border: "border-blue-600/20",
      };
    }

    // Default file icon
    return {
      icon: File,
      color: "text-muted-foreground",
      bg: "bg-muted/50",
      border: "border-border",
    };
  }

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (!supabase || !canUpload || selectedDocs.size === 0) return;

    const docsToDelete = filteredDocuments.filter((d) =>
      selectedDocs.has(d.id)
    );
    const confirmMessage = `Are you sure you want to delete ${
      docsToDelete.length
    } file${docsToDelete.length > 1 ? "s" : ""}? This action cannot be undone.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    // Set recentDeleteRef BEFORE the async operation to prevent race conditions
    recentDeleteRef.current = true;

    setIsBulkDeleting(true);
    try {
      const paths = docsToDelete.map((d) => d.path);
      const { error } = await supabase.storage.from(bucketName).remove(paths);

      if (error) {
        // Reset ref on error so fetches can resume
        recentDeleteRef.current = false;
        throw error;
      }

      // Remove from local state
      setDocuments((prev) => prev.filter((d) => !selectedDocs.has(d.id)));
      setSelectedDocs(new Set());

      toast.success(
        `Deleted ${docsToDelete.length} file${
          docsToDelete.length > 1 ? "s" : ""
        }`
      );
    } catch (error) {
      // Reset ref on error so fetches can resume
      recentDeleteRef.current = false;
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete some files");
    } finally {
      setIsBulkDeleting(false);
    }
  };

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
        {/* Left side: Notion-style View Tabs */}
        <div className="flex items-center gap-2">
          <NotionViewTabs
            views={VIEW_DEFINITIONS}
            activeView={viewMode}
            onViewChange={(viewId) => setViewMode(viewId as ViewMode)}
            showAddButton={true}
            onAddView={(viewType, viewName) => {
              // For now, just switch to the view type
              if (viewType === "table" || viewType === "board" || viewType === "gallery") {
                setViewMode(viewType as ViewMode);
              }
              toast.success(`Created "${viewName}" view`);
            }}
            viewSettings={viewSettings}
            onViewSettingsChange={setViewSettings}
          />
        </div>

        {/* Right side: Search, View Options, and Add Button */}
        <div className="flex items-center gap-2">
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

          {/* View Options Button (Notion-style "..." menu) */}
          <ViewOptionsMenu
            viewSettings={viewSettings}
            onViewSettingsChange={setViewSettings}
            activeView={viewMode}
            onViewChange={setViewMode}
          />

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
          {/* Views */}
          <AnimatePresence mode="wait">
            {viewMode === "gallery" ? (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "grid gap-4",
                  viewSettings.cardSize === "small" && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
                  viewSettings.cardSize === "medium" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                  viewSettings.cardSize === "large" && "grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
                )}
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
                    {(() => {
                      const fileStyle = getFileIcon(doc.name, doc.type);
                      const IconComponent = fileStyle.icon;
                      const thumbnailSizes = {
                        small: { aspect: "aspect-[4/3]", box: "h-10 w-10 rounded-lg", icon: "h-5 w-5" },
                        medium: { aspect: "aspect-[4/3]", box: "h-16 w-16 rounded-xl border-2", icon: "h-8 w-8" },
                        large: { aspect: "aspect-[16/9]", box: "h-20 w-20 rounded-xl border-2", icon: "h-10 w-10" },
                      };
                      const sizes = thumbnailSizes[viewSettings.cardSize];
                      return (
                        <div
                          className={cn(
                            "flex items-center justify-center border-b",
                            sizes.aspect,
                            fileStyle.bg
                          )}
                        >
                          {viewSettings.showPageIcon && (
                            <div
                              className={cn(
                                "flex items-center justify-center",
                                sizes.box,
                                fileStyle.bg,
                                fileStyle.border
                              )}
                            >
                              <IconComponent
                                className={cn(sizes.icon, fileStyle.color)}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })()}

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
            ) : viewMode === "board" ? (
              /* Board View */
              <DocumentsBoardView
                documents={filteredDocuments}
                selectedDocs={selectedDocs}
                onSelectDoc={handleSelectDoc}
                cardSize={viewSettings.cardSize}
                fitImage={viewSettings.fitImage}
                showPageIcon={viewSettings.showPageIcon}
              />
            ) : (
              /* Table View */
              <motion.div
                key="table"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="border rounded-lg overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table
                    className="w-full caption-bottom text-sm"
                    style={{ tableLayout: "fixed" }}
                  >
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead
                          className="relative group px-2"
                          style={{
                            width: columnWidths.checkbox,
                            minWidth: columnWidths.checkbox,
                          }}
                        >
                          <Checkbox
                            checked={
                              selectedDocs.size === filteredDocuments.length &&
                              filteredDocuments.length > 0
                            }
                            onCheckedChange={handleSelectAll}
                          />
                          <div
                            className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50 bg-transparent group-hover:bg-border/50"
                            onMouseDown={(e) =>
                              handleColumnResizeStart("checkbox", e)
                            }
                          />
                        </TableHead>
                        <TableHead
                          className="relative group px-2"
                          style={{ width: columnWidths.fileName, minWidth: 80 }}
                        >
                          File Name
                          <div
                            className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50 bg-transparent group-hover:bg-border/50"
                            onMouseDown={(e) =>
                              handleColumnResizeStart("fileName", e)
                            }
                          />
                        </TableHead>
                        <TableHead
                          className="relative group px-2"
                          style={{
                            width: columnWidths.investors,
                            minWidth: 80,
                          }}
                        >
                          Investor(s)
                          <div
                            className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50 bg-transparent group-hover:bg-border/50"
                            onMouseDown={(e) =>
                              handleColumnResizeStart("investors", e)
                            }
                          />
                        </TableHead>
                        <TableHead
                          className="relative group px-2"
                          style={{ width: columnWidths.tags, minWidth: 80 }}
                        >
                          Tags
                          <div
                            className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50 bg-transparent group-hover:bg-border/50"
                            onMouseDown={(e) =>
                              handleColumnResizeStart("tags", e)
                            }
                          />
                        </TableHead>
                        <TableHead
                          className="relative group px-2"
                          style={{ width: columnWidths.size, minWidth: 60 }}
                        >
                          Size
                          <div
                            className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50 bg-transparent group-hover:bg-border/50"
                            onMouseDown={(e) =>
                              handleColumnResizeStart("size", e)
                            }
                          />
                        </TableHead>
                        <TableHead
                          className="px-2"
                          style={{
                            width: columnWidths.actions,
                            minWidth: columnWidths.actions,
                          }}
                        ></TableHead>
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
                          <TableCell
                            className="px-2"
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: columnWidths.checkbox }}
                          >
                            <Checkbox
                              checked={selectedDocs.has(doc.id)}
                              onCheckedChange={() => handleSelectDoc(doc.id)}
                            />
                          </TableCell>
                          <TableCell
                            className="px-2 pr-2"
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: columnWidths.fileName }}
                          >
                            <div className="flex items-center gap-2 w-full">
                              {(() => {
                                const fileStyle = getFileIcon(
                                  doc.name,
                                  doc.type
                                );
                                const IconComponent = fileStyle.icon;
                                return (
                                  <div
                                    className={cn(
                                      "h-9 w-9 rounded-lg border flex items-center justify-center shrink-0 transition-colors",
                                      fileStyle.bg,
                                      fileStyle.border
                                    )}
                                  >
                                    <IconComponent
                                      className={cn("h-4 w-4", fileStyle.color)}
                                    />
                                  </div>
                                );
                              })()}
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
                                  <span className="font-medium truncate flex-1">
                                    {doc.name}
                                  </span>
                                  {canUpload && (
                                    <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          {/* Investors column */}
                          <TableCell
                            className="px-2 pr-4 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: columnWidths.investors }}
                          >
                            {canUpload ? (
                              <Popover
                                open={editingInvestorsDocId === doc.id}
                                onOpenChange={(open) => {
                                  if (open) {
                                    setEditingInvestorsDocId(doc.id);
                                    setInvestorSearchQuery("");
                                  } else {
                                    setEditingInvestorsDocId(null);
                                  }
                                }}
                              >
                                <PopoverTrigger asChild>
                                  <button
                                    className={cn(
                                      "flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group cursor-pointer w-full max-w-full",
                                      doc.investors.length === 0 && "italic"
                                    )}
                                  >
                                    {doc.investors.length > 0 ? (
                                      <>
                                        {doc.investors[0].type === "org" ? (
                                          <Building2 className="h-3.5 w-3.5 shrink-0" />
                                        ) : (
                                          <User className="h-3.5 w-3.5 shrink-0" />
                                        )}
                                        <span className="truncate">
                                          {doc.investors[0].name}
                                        </span>
                                        {doc.investors.length > 1 && (
                                          <Badge
                                            variant="secondary"
                                            className="text-xs px-1.5 py-0 ml-1"
                                          >
                                            +{doc.investors.length - 1}
                                          </Badge>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-muted-foreground/60">
                                        Add investor...
                                      </span>
                                    )}
                                    <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-[280px] p-0"
                                  align="start"
                                >
                                  <Command shouldFilter={false}>
                                    <CommandInput
                                      placeholder="Search investors..."
                                      value={investorSearchQuery}
                                      onValueChange={setInvestorSearchQuery}
                                    />
                                    <CommandList>
                                      <CommandEmpty>
                                        No investors found.
                                      </CommandEmpty>
                                      {filteredInvestors.filter(
                                        (i) => i.type === "org"
                                      ).length > 0 && (
                                        <CommandGroup heading="Organizations">
                                          {filteredInvestors
                                            .filter((i) => i.type === "org")
                                            .map((investor) => {
                                              const isSelected =
                                                doc.investors.some(
                                                  (i) =>
                                                    i.type === investor.type &&
                                                    i.id === investor.id
                                                );
                                              return (
                                                <CommandItem
                                                  key={`org-${investor.id}`}
                                                  onSelect={() =>
                                                    handleToggleInvestor(
                                                      doc,
                                                      investor
                                                    )
                                                  }
                                                  disabled={isSavingInvestors}
                                                  className="flex items-center gap-2"
                                                >
                                                  <div
                                                    className={cn(
                                                      "h-4 w-4 border rounded flex items-center justify-center shrink-0",
                                                      isSelected
                                                        ? "bg-primary border-primary"
                                                        : "border-muted-foreground/30"
                                                    )}
                                                  >
                                                    {isSelected && (
                                                      <Check className="h-3 w-3 text-primary-foreground" />
                                                    )}
                                                  </div>
                                                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                  <span className="truncate">
                                                    {investor.name}
                                                  </span>
                                                </CommandItem>
                                              );
                                            })}
                                        </CommandGroup>
                                      )}
                                      {filteredInvestors.filter(
                                        (i) => i.type === "user"
                                      ).length > 0 && (
                                        <CommandGroup heading="Users">
                                          {filteredInvestors
                                            .filter((i) => i.type === "user")
                                            .map((investor) => {
                                              const isSelected =
                                                doc.investors.some(
                                                  (i) =>
                                                    i.type === investor.type &&
                                                    i.id === investor.id
                                                );
                                              return (
                                                <CommandItem
                                                  key={`user-${investor.id}`}
                                                  onSelect={() =>
                                                    handleToggleInvestor(
                                                      doc,
                                                      investor
                                                    )
                                                  }
                                                  disabled={isSavingInvestors}
                                                  className="flex items-center gap-2"
                                                >
                                                  <div
                                                    className={cn(
                                                      "h-4 w-4 border rounded flex items-center justify-center shrink-0",
                                                      isSelected
                                                        ? "bg-primary border-primary"
                                                        : "border-muted-foreground/30"
                                                    )}
                                                  >
                                                    {isSelected && (
                                                      <Check className="h-3 w-3 text-primary-foreground" />
                                                    )}
                                                  </div>
                                                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                  <span className="truncate">
                                                    {investor.name}
                                                  </span>
                                                </CommandItem>
                                              );
                                            })}
                                        </CommandGroup>
                                      )}
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground w-full max-w-full overflow-hidden">
                                {doc.investors.length > 0 ? (
                                  <>
                                    {doc.investors[0].type === "org" ? (
                                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                                    ) : (
                                      <User className="h-3.5 w-3.5 shrink-0" />
                                    )}
                                    <span className="truncate">
                                      {doc.investors[0].name}
                                    </span>
                                    {doc.investors.length > 1 && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs px-1.5 py-0 ml-1"
                                      >
                                        +{doc.investors.length - 1}
                                      </Badge>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {doc.source === "organization" ? (
                                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                                    ) : (
                                      <User className="h-3.5 w-3.5 shrink-0" />
                                    )}
                                    <span className="truncate">
                                      {doc.sourceName}
                                    </span>
                                  </>
                                )}
                              </div>
                            )}
                          </TableCell>
                          {/* Tags column - inline editable */}
                          <TableCell
                            className="px-2 cursor-pointer"
                            style={{ width: columnWidths.tags }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (canUpload) {
                                setEditingTagsDocId(doc.id);
                                setNewTagInput("");
                              }
                            }}
                          >
                            {editingTagsDocId === doc.id && canUpload ? (
                              <Popover
                                open={true}
                                onOpenChange={(open) => {
                                  if (!open) {
                                    setEditingTagsDocId(null);
                                    setNewTagInput("");
                                  }
                                }}
                              >
                                <PopoverTrigger asChild>
                                  <div className="flex flex-wrap gap-1 min-h-[24px] p-1 border border-primary/50 rounded bg-muted/50">
                                    {doc.tags.map((tag) => (
                                      <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="text-xs font-mono px-2 py-0.5 gap-1 group"
                                      >
                                        {tag}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveTag(doc, tag);
                                          }}
                                          disabled={isSavingTags}
                                          className="opacity-60 hover:opacity-100 hover:text-destructive transition-opacity"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </Badge>
                                    ))}
                                    {doc.tags.length === 0 && (
                                      <span className="text-xs text-muted-foreground">No tags</span>
                                    )}
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-72 p-2"
                                  align="start"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="space-y-2">
                                    <div className="flex gap-1">
                                      <Input
                                        ref={tagInputRef}
                                        placeholder="Type to search or create..."
                                        value={newTagInput}
                                        onChange={(e) => setNewTagInput(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddTag(doc, newTagInput);
                                          } else if (e.key === "Escape") {
                                            setEditingTagsDocId(null);
                                            setNewTagInput("");
                                          }
                                        }}
                                        className="h-8 text-sm"
                                        autoFocus
                                        disabled={isSavingTags}
                                      />
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 px-2"
                                        onClick={() => handleAddTag(doc, newTagInput)}
                                        disabled={!newTagInput.trim() || isSavingTags}
                                      >
                                        {isSavingTags ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Plus className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                    
                                    {/* Auto-complete suggestions */}
                                    {newTagInput.trim() && (
                                      <div className="max-h-32 overflow-y-auto border rounded">
                                        {(() => {
                                          const inputSlug = generateTagSlug(newTagInput);
                                          const docTagSlugs = doc.tags.map(generateTagSlug);
                                          const filteredSuggestions = availableTags
                                            .filter(
                                              (t) =>
                                                t.name.toLowerCase().includes(newTagInput.toLowerCase()) &&
                                                !docTagSlugs.includes(t.slug)
                                            )
                                            .slice(0, 5);
                                          
                                          if (filteredSuggestions.length === 0) {
                                            return (
                                              <div className="p-2 text-xs text-muted-foreground italic">
                                                Press Enter to create &quot;{newTagInput.trim()}&quot;
                                              </div>
                                            );
                                          }
                                          
                                          return filteredSuggestions.map((tag) => (
                                            <button
                                              key={tag.id}
                                              type="button"
                                              className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted transition-colors flex items-center justify-between"
                                              onClick={() => {
                                                handleAddTag(doc, tag.name);
                                              }}
                                              disabled={isSavingTags}
                                            >
                                              <span>{tag.name}</span>
                                              <span className="text-xs text-muted-foreground">Select</span>
                                            </button>
                                          ));
                                        })()}
                                      </div>
                                    )}
                                    
                                    {doc.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 pt-1 border-t">
                                        {doc.tags.map((tag) => (
                                          <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="text-xs font-mono px-2 py-0.5 gap-1"
                                          >
                                            {tag}
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveTag(doc, tag);
                                              }}
                                              disabled={isSavingTags}
                                              className="opacity-60 hover:opacity-100 hover:text-destructive transition-opacity"
                                            >
                                              <X className="h-3 w-3" />
                                            </button>
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <div className="flex flex-wrap gap-1 hover:bg-muted/50 rounded p-1 -m-1 transition-colors">
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
                                {doc.tags.length === 0 && canUpload && (
                                  <span className="text-xs text-muted-foreground/50 italic">
                                    + Add tags
                                  </span>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell
                            className="px-2 text-muted-foreground"
                            style={{ width: columnWidths.size }}
                          >
                            {formatFileSize(doc.size)}
                          </TableCell>
                          <TableCell
                            className="px-2 text-right"
                            style={{ width: columnWidths.actions }}
                          >
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
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selection Action Bar - Dice UI Style */}
          <AnimatePresence>
            {selectedDocs.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="fixed bottom-6 inset-x-0 z-50 flex justify-center pointer-events-none"
                role="toolbar"
                aria-label="Selection actions"
              >
                <div className="flex items-center gap-1 bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg px-2 py-1.5 pointer-events-auto">
                  {/* Selection Section */}
                  <div className="flex items-center gap-2 px-2 py-1">
                    <span className="text-sm font-medium text-foreground">
                      {selectedDocs.size} selected
                    </span>
                    <div 
                      role="separator" 
                      aria-orientation="vertical" 
                      className="h-4 w-px bg-border ml-0.5"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedDocs(new Set())}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      aria-label="Clear selection"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Main Separator */}
                  <div 
                    role="separator" 
                    aria-orientation="vertical" 
                    className="h-6 w-px bg-border"
                  />

                  {/* Action Group */}
                  <div className="flex items-center gap-0.5 px-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBulkDownload}
                      disabled={isDownloading || isBulkDeleting}
                      className="gap-2 h-8 px-3 text-foreground hover:bg-muted/50"
                    >
                      {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      <span className="text-sm">Download</span>
                    </Button>
                    {canUpload && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBulkDelete}
                        disabled={isDownloading || isBulkDeleting}
                        className="gap-2 h-8 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {isBulkDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span className="text-sm">Delete</span>
                      </Button>
                    )}
                  </div>
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
