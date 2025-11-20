"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  Button,
  Input,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/supabase-dropzone";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";
import {
  Search,
  Upload,
  FolderPlus,
  MoreHorizontal,
  Download,
  Trash2,
  File,
  Folder,
  Image,
  FileText,
  Sheet,
  Archive,
  Video,
  Music,
  ChevronRight,
  Home,
  Grid3X3,
  List,
} from "lucide-react";
import { formatBytes } from "@/components/ui/supabase-dropzone";
import { format } from "date-fns";

interface FileItem {
  name: string;
  id: string;
  bucket_id: string;
  owner: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  metadata: {
    size?: number;
    mimetype?: string;
    cacheControl?: string;
  };
}

interface FileManagerProps {
  bucketName: string;
  title: string;
  description: string;
  allowedTypes?: string[];
  className?: string;
  readOnly?: boolean; // If true, disables upload and delete actions
  basePath?: string; // Base path in storage bucket (e.g., "payments", "agreements")
}

export function FileManager({
  bucketName,
  title,
  description,
  allowedTypes = ["*/*"],
  className,
  readOnly = false,
  basePath = "",
}: FileManagerProps) {
  const { user } = useUser();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showUploader, setShowUploader] = useState(false);

  // Use service role client for storage operations to avoid UUID issues with Clerk IDs
  const supabase = useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        }
      }
    );
  }, []);

  // Upload configuration
  const uploadPath = basePath 
    ? `${basePath}/${currentPath.join("/")}`
    : currentPath.join("/");
    
  const uploadProps = useSupabaseUpload({
    bucketName,
    path: uploadPath,
    maxFiles: 10,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: allowedTypes,
  });

  const fetchFiles = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Construct full path with basePath
      let fullPath = basePath;
      if (currentPath.length > 0) {
        fullPath = fullPath ? `${fullPath}/${currentPath.join("/")}` : currentPath.join("/");
      }
      const pathPrefix = fullPath ? `${fullPath}/` : "";

      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(fullPath || undefined, {
          limit: 100,
          offset: 0,
        });

      if (error) {
        console.error("Error fetching files:", error);
        return;
      }

      setFiles(data || []);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, bucketName, currentPath, user, basePath]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Handle upload completion
  useEffect(() => {
    if (uploadProps.isSuccess) {
      fetchFiles();
      setShowUploader(false);
    }
  }, [uploadProps.isSuccess, fetchFiles]);

  const getFileIcon = (fileName: string, isFolder: boolean) => {
    if (isFolder) return <Folder className="h-5 w-5 text-blue-500" />;

    const extension = fileName.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "svg":
        return <Image className="h-5 w-5 text-green-500" />;
      case "xlsx":
      case "xls":
      case "csv":
        return <Sheet className="h-5 w-5 text-green-600" />;
      case "zip":
      case "rar":
      case "7z":
        return <Archive className="h-5 w-5 text-orange-500" />;
      case "mp4":
      case "avi":
      case "mov":
        return <Video className="h-5 w-5 text-purple-500" />;
      case "mp3":
      case "wav":
      case "flac":
        return <Music className="h-5 w-5 text-pink-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      let filePath = file.name;
      if (basePath) {
        filePath = `${basePath}/${filePath}`;
      }
      if (currentPath.length > 0) {
        filePath = basePath
          ? `${basePath}/${currentPath.join("/")}/${file.name}`
          : `${currentPath.join("/")}/${file.name}`;
      }

      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(filePath);

      if (error) {
        console.error("Error downloading file:", error);
        return;
      }

      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleDelete = async (file: FileItem) => {
    try {
      let filePath = file.name;
      if (basePath) {
        filePath = `${basePath}/${filePath}`;
      }
      if (currentPath.length > 0) {
        filePath = basePath
          ? `${basePath}/${currentPath.join("/")}/${file.name}`
          : `${currentPath.join("/")}/${file.name}`;
      }

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error("Error deleting file:", error);
        return;
      }

      fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const navigateToFolder = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
  };

  const navigateToPath = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const navigateHome = () => {
    setCurrentPath([]);
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const folders = filteredFiles.filter((file) => !file.metadata?.mimetype);
  const regularFiles = filteredFiles.filter((file) => file.metadata?.mimetype);

  return (
    <Card className={className}>
      {/* Header */}
      <div className="border-b bg-muted/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid3X3 className="h-4 w-4" />
              )}
            </Button>
            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploader(!showUploader)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            )}
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-4 mt-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={navigateHome}
                  className="cursor-pointer flex items-center gap-1"
                >
                  <Home className="h-3 w-3" />
                  {title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {currentPath.map((folder, index) => (
                <div key={index} className="flex items-center">
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-3 w-3" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    {index === currentPath.length - 1 ? (
                      <BreadcrumbPage>{folder}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        onClick={() => navigateToPath(index)}
                        className="cursor-pointer"
                      >
                        {folder}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Search - only show if there are files */}
        {files.length > 0 && (
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 max-w-sm"
            />
          </div>
        )}
      </div>

      <CardContent className="p-0">
        {/* Upload Area */}
        {!readOnly && showUploader && (
          <div className="border-b bg-muted/10 p-6">
            <Dropzone {...uploadProps}>
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>
          </div>
        )}

        {/* File List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading files...</p>
            </div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium mb-2">No files found</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search"
                : "Upload your first file to get started"}
            </p>
            {!searchTerm && !readOnly && (
              <Button onClick={() => setShowUploader(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            )}
          </div>
        ) : (
          <div className="p-6">
            {viewMode === "list" ? (
              <div className="space-y-1">
                {/* Folders first */}
                {folders.map((folder) => (
                  <div
                    key={folder.name}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer group"
                    onClick={() => navigateToFolder(folder.name)}
                  >
                    <div className="flex items-center gap-3">
                      <Folder className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">{folder.name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}

                {/* Files */}
                {regularFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(file.name, false)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {format(new Date(file.created_at), "MMM d, yyyy")}
                          </span>
                          {file.metadata?.size && (
                            <>
                              <span>•</span>
                              <span>{formatBytes(file.metadata.size)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(file)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        {!readOnly && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(file)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Folders */}
                {folders.map((folder) => (
                  <div
                    key={folder.name}
                    className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-muted hover:border-primary/50 cursor-pointer group transition-colors"
                    onClick={() => navigateToFolder(folder.name)}
                  >
                    <Folder className="h-8 w-8 text-blue-500 mb-2" />
                    <span className="text-sm font-medium text-center truncate w-full">
                      {folder.name}
                    </span>
                  </div>
                ))}

                {/* Files */}
                {regularFiles.map((file) => (
                  <div
                    key={file.id}
                    className="relative flex flex-col items-center p-4 rounded-lg border border-muted hover:border-primary/50 group transition-colors"
                  >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDownload(file)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          {!readOnly && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(file)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {getFileIcon(file.name, false)}
                    <span className="text-xs font-medium text-center truncate w-full mt-2">
                      {file.name}
                    </span>
                    {file.metadata?.size && (
                      <span className="text-xs text-muted-foreground">
                        {formatBytes(file.metadata.size)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
