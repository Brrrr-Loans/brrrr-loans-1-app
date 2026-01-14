"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/feedback/badge";
import { Checkbox } from "@/components/ui/forms/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/layout/scroll-area";
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  FileCode,
  File,
  Building2,
  User,
  Calendar,
  Tag,
  Users,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CardSize } from "@/components/ui/notion-view-tabs";

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
  periodStart: string | null;
  periodEnd: string | null;
}

type BoardGroupBy = "dateCreated" | "period" | "tags" | "investors" | "source";

interface DocumentsBoardViewProps {
  documents: Document[];
  selectedDocs: Set<string>;
  onSelectDoc: (docId: string) => void;
  cardSize?: CardSize;
  fitImage?: boolean;
  showPageIcon?: boolean;
  groupBy?: BoardGroupBy;
}

interface BoardColumn {
  id: string;
  title: string;
  icon: typeof Calendar;
  documents: Document[];
}

// Card size configurations - fixed column widths so cards fill completely
const CARD_SIZE_CONFIG = {
  small: {
    width: "w-[240px]",
    iconSize: "h-8 w-8",
    iconInner: "h-4 w-4",
    titleClamp: "line-clamp-1",
    showDescription: false,
    showMeta: false,
    padding: "p-2",
    gap: "gap-2",
  },
  medium: {
    width: "w-[300px]",
    iconSize: "h-10 w-10",
    iconInner: "h-5 w-5",
    titleClamp: "line-clamp-2",
    showDescription: true,
    showMeta: true,
    padding: "p-3",
    gap: "gap-3",
  },
  large: {
    width: "w-[380px]",
    iconSize: "h-12 w-12",
    iconInner: "h-6 w-6",
    titleClamp: "line-clamp-3",
    showDescription: true,
    showMeta: true,
    padding: "p-4",
    gap: "gap-4",
  },
};

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
  if (
    ["zip", "rar", "7z", "tar", "gz"].includes(ext || "") ||
    mimeType.includes("zip") ||
    mimeType.includes("archive")
  ) {
    return {
      icon: FileArchive,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    };
  }

  // Code files
  if (
    ["js", "ts", "jsx", "tsx", "html", "css", "json", "xml", "py", "java"].includes(ext || "") ||
    mimeType.includes("javascript") ||
    mimeType.includes("json")
  ) {
    return {
      icon: FileCode,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    };
  }

  // Default
  return {
    icon: File,
    color: "text-muted-foreground",
    bg: "bg-muted/30",
    border: "border-muted",
  };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function DocumentCard({
  doc,
  isSelected,
  onSelect,
  cardSize = "medium",
  showPageIcon = true,
}: {
  doc: Document;
  isSelected: boolean;
  onSelect: () => void;
  cardSize?: CardSize;
  showPageIcon?: boolean;
}) {
  const fileStyle = getFileIcon(doc.name, doc.type);
  const IconComponent = fileStyle.icon;
  const config = CARD_SIZE_CONFIG[cardSize];

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative w-full border rounded-lg bg-card hover:shadow-md transition-shadow cursor-pointer overflow-hidden",
        config.padding,
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onSelect}
    >
      {/* File icon and info */}
      <div className={cn("flex items-start", config.gap)}>
        {showPageIcon && (
          <div
            className={cn(
              "rounded-lg border flex items-center justify-center shrink-0",
              config.iconSize,
              fileStyle.bg,
              fileStyle.border
            )}
          >
            <IconComponent className={cn(config.iconInner, fileStyle.color)} />
          </div>
        )}

        <div className="flex-1 min-w-0 overflow-hidden">
          <h4 className={cn("font-medium text-sm truncate", config.titleClamp)}>
            {doc.description || doc.name}
          </h4>
          {config.showDescription && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {doc.name}
            </p>
          )}
        </div>
      </div>

      {/* Meta info */}
      {config.showMeta && (
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground gap-2">
          <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
            {doc.source === "organization" ? (
              <Building2 className="h-3 w-3 shrink-0" />
            ) : (
              <User className="h-3 w-3 shrink-0" />
            )}
            <span className="truncate">{doc.sourceName}</span>
          </div>
          <span className="shrink-0">{formatFileSize(doc.size)}</span>
        </div>
      )}

      {/* Tags */}
      {doc.tags.length > 0 && config.showMeta && (
        <div className="mt-2 flex flex-wrap gap-1">
          {doc.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-[10px] font-mono px-1.5 py-0"
            >
              {tag}
            </Badge>
          ))}
          {doc.tags.length > 2 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              +{doc.tags.length - 2}
            </Badge>
          )}
        </div>
      )}

      {/* Selection checkbox */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          className="bg-background"
        />
      </div>
    </motion.div>
  );
}

function BoardColumnComponent({
  column,
  selectedDocs,
  onSelectDoc,
  cardSize = "medium",
  showPageIcon = true,
}: {
  column: BoardColumn;
  selectedDocs: Set<string>;
  onSelectDoc: (docId: string) => void;
  cardSize?: CardSize;
  showPageIcon?: boolean;
}) {
  const IconComponent = column.icon;
  const config = CARD_SIZE_CONFIG[cardSize];

  return (
    <div className={cn("flex-shrink-0 flex flex-col overflow-hidden", config.width)}>
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30 rounded-t-lg">
        <IconComponent className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm">{column.title}</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {column.documents.length}
        </Badge>
      </div>

      {/* Column content - vertical scroll only, Notion-style */}
      <div className="flex-1 border border-t-0 rounded-b-lg bg-muted/10 overflow-y-auto overflow-x-hidden">
        <div className="p-2 min-h-[400px]">
          {column.documents.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              No documents
            </div>
          ) : (
            <div className="space-y-2">
              {column.documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  isSelected={selectedDocs.has(doc.id)}
                  onSelect={() => onSelectDoc(doc.id)}
                  cardSize={cardSize}
                  showPageIcon={showPageIcon}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to format period as column title
function formatPeriodColumnTitle(start: string | null, end: string | null): string {
  if (!start && !end) return "No Period";
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };
  
  if (start && end) {
    const startFormatted = formatDate(start);
    const endFormatted = formatDate(end);
    if (startFormatted === endFormatted) {
      return startFormatted;
    }
    return `${startFormatted} - ${endFormatted}`;
  }
  
  if (start) return `From ${formatDate(start)}`;
  if (end) return `Until ${formatDate(end)}`;
  return "No Period";
}

// Get unique period key for grouping
function getPeriodKey(doc: Document): string {
  if (!doc.periodStart && !doc.periodEnd) return "no-period";
  return `${doc.periodStart || ""}_${doc.periodEnd || ""}`;
}

export function DocumentsBoardView({
  documents,
  selectedDocs,
  onSelectDoc,
  cardSize = "medium",
  fitImage = false,
  showPageIcon = true,
  groupBy = "dateCreated",
}: DocumentsBoardViewProps) {
  // Group documents based on groupBy setting
  const columns = useMemo<BoardColumn[]>(() => {
    switch (groupBy) {
      case "dateCreated": {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const thisWeek: Document[] = [];
        const thisMonth: Document[] = [];
        const older: Document[] = [];

        for (const doc of documents) {
          const createdDate = new Date(doc.createdAt);
          if (createdDate >= oneWeekAgo) {
            thisWeek.push(doc);
          } else if (createdDate >= oneMonthAgo) {
            thisMonth.push(doc);
          } else {
            older.push(doc);
          }
        }

        return [
          { id: "this-week", title: "This Week", icon: Calendar, documents: thisWeek },
          { id: "this-month", title: "This Month", icon: Calendar, documents: thisMonth },
          { id: "older", title: "Older", icon: Calendar, documents: older },
        ];
      }

      case "period": {
        // Group by document period (date range)
        const periodGroups = new Map<string, { title: string; docs: Document[]; sortKey: string }>();
        
        for (const doc of documents) {
          const key = getPeriodKey(doc);
          const title = formatPeriodColumnTitle(doc.periodStart, doc.periodEnd);
          const sortKey = doc.periodStart || doc.periodEnd || "0000-00-00";
          
          if (!periodGroups.has(key)) {
            periodGroups.set(key, { title, docs: [], sortKey });
          }
          periodGroups.get(key)!.docs.push(doc);
        }

        // Sort by date (most recent first), with "No Period" at the end
        const sortedGroups = Array.from(periodGroups.entries())
          .sort((a, b) => {
            if (a[0] === "no-period") return 1;
            if (b[0] === "no-period") return -1;
            return b[1].sortKey.localeCompare(a[1].sortKey);
          });

        return sortedGroups.map(([key, group]) => ({
          id: key,
          title: group.title,
          icon: Calendar,
          documents: group.docs,
        }));
      }

      case "tags": {
        // Group by tags (documents can appear in multiple columns)
        const tagGroups = new Map<string, Document[]>();
        const untagged: Document[] = [];

        for (const doc of documents) {
          if (doc.tags.length === 0) {
            untagged.push(doc);
          } else {
            for (const tag of doc.tags) {
              if (!tagGroups.has(tag)) {
                tagGroups.set(tag, []);
              }
              tagGroups.get(tag)!.push(doc);
            }
          }
        }

        // Sort tags alphabetically
        const sortedTags = Array.from(tagGroups.entries())
          .sort((a, b) => a[0].localeCompare(b[0]));

        const columns: BoardColumn[] = sortedTags.map(([tag, docs]) => ({
          id: `tag-${tag}`,
          title: tag,
          icon: Tag,
          documents: docs,
        }));

        // Add untagged column at the end if there are any
        if (untagged.length > 0) {
          columns.push({
            id: "untagged",
            title: "Untagged",
            icon: Inbox,
            documents: untagged,
          });
        }

        return columns;
      }

      case "investors": {
        // Group by assigned investors
        const investorGroups = new Map<string, { name: string; docs: Document[] }>();
        const unassigned: Document[] = [];

        for (const doc of documents) {
          if (doc.investors.length === 0) {
            unassigned.push(doc);
          } else {
            for (const investor of doc.investors) {
              const key = `${investor.type}-${investor.id}`;
              if (!investorGroups.has(key)) {
                investorGroups.set(key, { name: investor.name, docs: [] });
              }
              investorGroups.get(key)!.docs.push(doc);
            }
          }
        }

        // Sort by name
        const sortedInvestors = Array.from(investorGroups.entries())
          .sort((a, b) => a[1].name.localeCompare(b[1].name));

        const columns: BoardColumn[] = sortedInvestors.map(([key, group]) => ({
          id: key,
          title: group.name,
          icon: Users,
          documents: group.docs,
        }));

        // Add unassigned column at the end if there are any
        if (unassigned.length > 0) {
          columns.push({
            id: "unassigned",
            title: "Unassigned",
            icon: Inbox,
            documents: unassigned,
          });
        }

        return columns;
      }

      case "source": {
        // Group by source (personal vs organization)
        const personal: Document[] = [];
        const organizations = new Map<string, Document[]>();

        for (const doc of documents) {
          if (doc.source === "personal") {
            personal.push(doc);
          } else {
            if (!organizations.has(doc.sourceName)) {
              organizations.set(doc.sourceName, []);
            }
            organizations.get(doc.sourceName)!.push(doc);
          }
        }

        const columns: BoardColumn[] = [];

        // Add personal column first if there are any
        if (personal.length > 0) {
          columns.push({
            id: "personal",
            title: "Personal",
            icon: User,
            documents: personal,
          });
        }

        // Add organization columns sorted by name
        const sortedOrgs = Array.from(organizations.entries())
          .sort((a, b) => a[0].localeCompare(b[0]));

        for (const [orgName, docs] of sortedOrgs) {
          columns.push({
            id: `org-${orgName}`,
            title: orgName,
            icon: Building2,
            documents: docs,
          });
        }

        return columns;
      }

      default:
        return [];
    }
  }, [documents, groupBy]);

  return (
    <motion.div
      key="board"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4">
          {columns.map((column) => (
            <BoardColumnComponent
              key={column.id}
              column={column}
              selectedDocs={selectedDocs}
              onSelectDoc={onSelectDoc}
              cardSize={cardSize}
              showPageIcon={showPageIcon}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </motion.div>
  );
}
