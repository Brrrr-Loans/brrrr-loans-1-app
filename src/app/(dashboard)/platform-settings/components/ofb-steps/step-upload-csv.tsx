"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout/card";
import { Badge } from "@/components/ui/feedback/badge";
import { Button } from "@/components/ui/forms/button";
import { Input } from "@/components/ui/forms/input";
import {
  FileSpreadsheet,
  Upload,
  X,
  Check,
  AlertCircle,
  GripVertical,
  Plus,
  Send,
  Loader2,
  Trash2,
  Pencil,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { useSupabase } from "@/hooks/use-supabase";
import { toast } from "sonner";
import { useVirtualizer } from "@tanstack/react-virtual";

// Custom file extractor that bypasses File System Access API entirely
// This avoids the "NotAllowedError: getFile" error when dragging files
async function getFilesFromEvent(
  event: React.DragEvent<HTMLElement> | Event
): Promise<Array<File | DataTransferItem>> {
  // Handle input element change events (click to browse)
  if (event.type === "change") {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      return Array.from(target.files);
    }
    return [];
  }

  // Handle drag and drop events
  const dragEvent = event as React.DragEvent<HTMLElement>;
  const dataTransfer = dragEvent.dataTransfer;
  
  if (!dataTransfer) {
    return [];
  }

  // Use the traditional DataTransfer.files API which doesn't require FSAA
  // This is the key fix - we avoid using dataTransferItemToFile which uses FSAA
  const files: File[] = [];
  
  if (dataTransfer.files && dataTransfer.files.length > 0) {
    // Direct access to files from DataTransfer - no FSAA needed
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const file = dataTransfer.files[i];
      if (file) {
        files.push(file);
      }
    }
  }
  
  return files;
}

interface ManualEntry {
  id: string;
  // Required fields
  bankReference: string;           // → ofb_transfer_id
  date: string;                    // → process_date
  counterpartyName: string;        // → counterparty_name
  amount: string;                  // → amount
  // Transfer details
  recordTransferName: string;      // → record_transfer_name
  paymentType: string;             // → payment_type
  currency: string;                // → currency
  status: string;                  // → status
  // Bank trace information
  bankTraceNumber: string;         // → bank_trace_number
  fedReferenceNumber: string;      // → fed_reference_number
  // Entry and approval
  transferEnteredBy: string;       // → transfer_entered_by
  transferCreatedAt: string;       // → transfer_created_at
  approverOneName: string;         // → approver_one_name
  approverOneTimestamp: string;    // → approver_one_timestamp
  // Originating account
  originatingAccountName: string;  // → originating_account_name
  originatingAccountNumber: string;// → originating_account_number
  // Counterparty details
  counterpartyAddressLine1: string;// → counterparty_address_line_1
  counterpartyAddressLine2: string;// → counterparty_address_line_2
  counterpartyAddressLine3: string;// → counterparty_address_line_3
  counterpartyBeneficiaryBankName: string; // → counterparty_beneficiary_bank_name
  counterpartyRoutingNumber: string;// → counterparty_routing_number
  counterpartyAccountNumber: string;// → counterparty_account_number
  // Memo fields
  externalMemoLines: string;       // → external_memo_lines (single input, split by newline)
  // Legacy
  description: string;             // → description
  // Status fields
  isSubmitting: boolean;
  isSubmitted: boolean;
}

const createEmptyEntry = (): ManualEntry => ({
  id: crypto.randomUUID(),
  // Required
  bankReference: "",
  date: "",
  counterpartyName: "",
  amount: "",
  // Transfer details
  recordTransferName: "",
  paymentType: "DOMESTIC_WIRE",
  currency: "USD",
  status: "",
  // Bank trace
  bankTraceNumber: "",
  fedReferenceNumber: "",
  // Entry and approval
  transferEnteredBy: "",
  transferCreatedAt: "",
  approverOneName: "",
  approverOneTimestamp: "",
  // Originating account
  originatingAccountName: "",
  originatingAccountNumber: "",
  // Counterparty details
  counterpartyAddressLine1: "",
  counterpartyAddressLine2: "",
  counterpartyAddressLine3: "",
  counterpartyBeneficiaryBankName: "",
  counterpartyRoutingNumber: "",
  counterpartyAccountNumber: "",
  // Memo
  externalMemoLines: "",
  // Legacy
  description: "",
  // Status
  isSubmitting: false,
  isSubmitted: false,
});

interface StepUploadCSVProps {
  file: File | null;
  onFileUpload: (
    file: File,
    data: Record<string, string>[],
    headers: string[]
  ) => void;
  onManualEntryChange?: (count: number) => void;
}

export function StepUploadCSV({
  file,
  onFileUpload,
  onManualEntryChange,
}: StepUploadCSVProps) {
  const [parseError, setParseError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [previewData, setPreviewData] = useState<{
    headers: string[];
    rows: Record<string, string>[];
    totalRows: number;
  } | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const resizingRef = useRef<{
    header: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  // Inline cell editing state
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    header: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);
  
  // Virtualization refs
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Manual entry state
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>([
    createEmptyEntry(),
  ]);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const supabase = useSupabase();

  const updateEntry = (id: string, field: keyof ManualEntry, value: string) => {
    setManualEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const addNewRow = () => {
    setManualEntries((prev) => [...prev, createEmptyEntry()]);
  };

  const removeRow = (id: string) => {
    setManualEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const isEntryValid = (entry: ManualEntry) => {
    return (
      entry.bankReference.trim() !== "" &&
      entry.date.trim() !== "" &&
      entry.counterpartyName.trim() !== "" &&
      entry.amount.trim() !== ""
    );
  };

  const submitEntry = async (entry: ManualEntry) => {
    if (!supabase || !isEntryValid(entry)) {
      toast.error("Please fill in all required fields");
      return;
    }

    setManualEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, isSubmitting: true } : e))
    );

    try {
      const amount = parseFloat(entry.amount.replace(/[$,]/g, "")) || 0;
      
      // Parse memo lines into array (split by newline or semicolon)
      const memoLines = entry.externalMemoLines
        .split(/[;\n]/)
        .map(line => line.trim())
        .filter(line => line.length > 0 && line !== "-");

      // Helper to parse timestamps
      const parseTimestamp = (ts: string): string | null => {
        if (!ts) return null;
        const parsed = new Date(ts);
        return isNaN(parsed.getTime()) ? null : parsed.toISOString();
      };

      const { error } = await supabase.from("api_ofb_transfers").upsert(
        {
          // Required fields
          ofb_transfer_id: entry.bankReference.trim(),
          process_date: entry.date || null,
          counterparty_name: entry.counterpartyName.trim() || null,
          amount,
          // Transfer details
          record_transfer_name: entry.recordTransferName.trim() || null,
          payment_type: entry.paymentType.trim() || "DOMESTIC_WIRE",
          currency: entry.currency.trim() || "USD",
          status: entry.status.trim() || null,
          // Bank trace
          bank_trace_number: entry.bankTraceNumber.trim() || null,
          fed_reference_number: entry.fedReferenceNumber.trim() || null,
          // Entry and approval
          transfer_entered_by: entry.transferEnteredBy.trim() || null,
          transfer_created_at: parseTimestamp(entry.transferCreatedAt),
          approver_one_name: entry.approverOneName.trim() || null,
          approver_one_timestamp: parseTimestamp(entry.approverOneTimestamp),
          // Originating account
          originating_account_name: entry.originatingAccountName.trim() || null,
          originating_account_number: entry.originatingAccountNumber.trim() || null,
          // Counterparty details
          counterparty_address_line_1: entry.counterpartyAddressLine1.trim() || null,
          counterparty_address_line_2: entry.counterpartyAddressLine2.trim() || null,
          counterparty_address_line_3: entry.counterpartyAddressLine3.trim() || null,
          counterparty_beneficiary_bank_name: entry.counterpartyBeneficiaryBankName.trim() || null,
          counterparty_routing_number: entry.counterpartyRoutingNumber.trim() || null,
          counterparty_account_number: entry.counterpartyAccountNumber.trim() || null,
          // Memo lines
          external_memo_lines: memoLines.length > 0 ? memoLines : null,
          // Legacy
          description: entry.description.trim() || null,
          // Import metadata
          import_source: "manual_entry",
        },
        { onConflict: "ofb_transfer_id" }
      );

      if (error) throw error;

      setManualEntries((prev) =>
        prev.map((e) =>
          e.id === entry.id
            ? { ...e, isSubmitting: false, isSubmitted: true }
            : e
        )
      );
      toast.success(`Transfer ${entry.bankReference} saved`);
    } catch (error) {
      console.error("Error saving transfer:", error);
      setManualEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, isSubmitting: false } : e))
      );
      toast.error("Failed to save transfer");
    }
  };

  const submitAllEntries = async () => {
    const validEntries = manualEntries.filter(
      (e) => isEntryValid(e) && !e.isSubmitted
    );
    if (validEntries.length === 0) {
      toast.error("No valid entries to submit");
      return;
    }

    setIsSubmittingAll(true);
    let successCount = 0;

    for (const entry of validEntries) {
      await submitEntry(entry);
      successCount++;
    }

    setIsSubmittingAll(false);
    toast.success(`Submitted ${successCount} transfers`);
  };

  const pendingCount = manualEntries.filter(
    (e) => isEntryValid(e) && !e.isSubmitted
  ).length;
  const submittedCount = manualEntries.filter((e) => e.isSubmitted).length;

  // Use a ref to avoid dependency issues with the callback
  const onManualEntryChangeRef = useRef(onManualEntryChange);
  onManualEntryChangeRef.current = onManualEntryChange;

  // Notify parent when submitted count changes
  useEffect(() => {
    onManualEntryChangeRef.current?.(submittedCount);
  }, [submittedCount]);

  const handleMouseDown = (e: React.MouseEvent, header: string) => {
    e.preventDefault();
    const startWidth = columnWidths[header] || 150;
    resizingRef.current = { header, startX: e.clientX, startWidth };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingRef.current) return;
      const diff = moveEvent.clientX - resizingRef.current.startX;
      const newWidth = Math.max(80, resizingRef.current.startWidth + diff);
      setColumnWidths((prev) => ({
        ...prev,
        [resizingRef.current!.header]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      resizingRef.current = null;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const toggleColumnWrap = (header: string) => {
    setColumnWidths((prev) => {
      const currentWidth = prev[header] || 150;
      // Toggle between narrow (150) and wide (400) to show/hide wrapped content
      return { ...prev, [header]: currentWidth < 300 ? 400 : 150 };
    });
  };

  // Inline cell editing handlers
  const startEditing = useCallback((rowIndex: number, header: string, currentValue: string) => {
    setEditingCell({ rowIndex, header });
    setEditValue(currentValue || "");
  }, []);

  const commitEdit = useCallback(() => {
    if (!editingCell || !previewData) return;
    
    const { rowIndex, header } = editingCell;
    const newValue = editValue;
    
    // Update the row data
    setPreviewData(prev => {
      if (!prev) return prev;
      const newRows = [...prev.rows];
      newRows[rowIndex] = { ...newRows[rowIndex], [header]: newValue };
      return { ...prev, rows: newRows };
    });
    
    // Notify parent of data change
    if (previewData.rows[rowIndex][header] !== newValue) {
      const updatedRows = [...previewData.rows];
      updatedRows[rowIndex] = { ...updatedRows[rowIndex], [header]: newValue };
      // Re-call onFileUpload with updated data
      if (file) {
        onFileUpload(file, updatedRows, previewData.headers);
      }
    }
    
    setEditingCell(null);
    setEditValue("");
  }, [editingCell, editValue, previewData, file, onFileUpload]);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue("");
  }, []);

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    } else if (e.key === "Tab") {
      e.preventDefault();
      commitEdit();
      // Move to next cell
      if (editingCell && previewData) {
        const currentColIndex = previewData.headers.indexOf(editingCell.header);
        if (e.shiftKey) {
          // Move to previous cell
          if (currentColIndex > 0) {
            const prevHeader = previewData.headers[currentColIndex - 1];
            const value = previewData.rows[editingCell.rowIndex][prevHeader] || "";
            startEditing(editingCell.rowIndex, prevHeader, value);
          } else if (editingCell.rowIndex > 0) {
            const lastHeader = previewData.headers[previewData.headers.length - 1];
            const value = previewData.rows[editingCell.rowIndex - 1][lastHeader] || "";
            startEditing(editingCell.rowIndex - 1, lastHeader, value);
          }
        } else {
          // Move to next cell
          if (currentColIndex < previewData.headers.length - 1) {
            const nextHeader = previewData.headers[currentColIndex + 1];
            const value = previewData.rows[editingCell.rowIndex][nextHeader] || "";
            startEditing(editingCell.rowIndex, nextHeader, value);
          } else if (editingCell.rowIndex < previewData.rows.length - 1) {
            const firstHeader = previewData.headers[0];
            const value = previewData.rows[editingCell.rowIndex + 1][firstHeader] || "";
            startEditing(editingCell.rowIndex + 1, firstHeader, value);
          }
        }
      }
    }
  }, [commitEdit, cancelEdit, editingCell, previewData, startEditing]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  // Row virtualizer for infinite scroll
  const rowVirtualizer = useVirtualizer({
    count: previewData?.rows.length ?? 0,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40, // Estimated row height
    overscan: 5,
  });

  const parseCSV = useCallback(
    (file: File) => {
      setIsParsing(true);
      setParseError(null);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setParseError(
              `CSV parsing error: ${results.errors[0].message} (row ${results.errors[0].row})`
            );
            setIsParsing(false);
            return;
          }

          const data = results.data as Record<string, string>[];
          const rawHeaders = results.meta.fields || [];
          
          // Filter out empty headers (caused by trailing commas in CSV)
          const validHeaders = rawHeaders.filter(
            (header): header is string => 
              typeof header === "string" && header.trim().length > 0
          );

          if (data.length === 0) {
            setParseError("CSV file is empty or has no valid data rows");
            setIsParsing(false);
            return;
          }

          // Store ALL rows for inline editing - virtualization handles performance
          setPreviewData({
            headers: validHeaders,
            rows: data,
            totalRows: data.length,
          });

          onFileUpload(file, data, validHeaders);
          setIsParsing(false);
        },
        error: (error) => {
          setParseError(`Failed to parse CSV: ${error.message}`);
          setIsParsing(false);
        },
      });
    },
    [onFileUpload]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        const csvFile = acceptedFiles[0];
        if (csvFile) {
          // Force read the file content to avoid FSAA issues
          // This ensures we have the actual file data before parsing
          const fileContent = await csvFile.text();
          
          // Create a new File object from the text content to avoid FSAA handle issues
          const safeFile = new File([fileContent], csvFile.name, { type: csvFile.type });
          parseCSV(safeFile);
        }
      } catch (error) {
        console.error("File drop error:", error);
        // If there's an FSAA error, show a helpful message
        if (error instanceof Error && error.message.includes("getFile")) {
          setParseError("File access error. Please try clicking to browse instead of dragging.");
        } else {
          setParseError("Failed to read file. Please try again.");
        }
      }
    },
    [parseCSV, setParseError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // Disable File System Access API to avoid "NotAllowedError: getFile" errors
    useFsAccessApi: false,
    // Use custom file extractor that bypasses FSAA entirely
    getFilesFromEvent,
    // Additional settings to prevent FSAA issues
    preventDropOnDocument: true,
    noClick: false,
    noKeyboard: false,
    noDrag: false,
    onError: (err) => {
      console.error("Dropzone error:", err);
      // Silently handle FSAA errors - the fallback will still work
      if (err?.message?.includes("getFile")) {
        console.log("File System Access API error - using fallback");
      }
    },
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleClear = () => {
    setPreviewData(null);
    setParseError(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center text-muted-foreground">
        <p>Upload a CSV or Excel file containing your bank transactions</p>
      </div>

      {!previewData ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-all duration-200
            ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
            }
            ${parseError ? "border-destructive" : ""}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            {isParsing ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                <p className="text-muted-foreground">Parsing file...</p>
              </>
            ) : (
              <>
                <div className="rounded-full bg-muted p-4">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">
                    {isDragActive
                      ? "Drop the file here"
                      : "Drag & drop your CSV file here"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">.csv</Badge>
                  <Badge variant="outline">.xlsx</Badge>
                  <Badge variant="outline">.xls</Badge>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">{file?.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{previewData.totalRows} rows</span>
                    <span>•</span>
                    <span>{previewData.headers.length} columns</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Preview table with virtualization, resizable columns, and inline editing */}
            {/* Single scroll container for synchronized horizontal scrolling */}
            <div
              ref={tableContainerRef}
              className="border rounded-lg overflow-auto"
              style={{ maxHeight: "440px" }}
            >
              <div
                className="text-sm"
                style={{
                  minWidth: Math.max(
                    800,
                    previewData.headers.reduce(
                      (sum, h) => sum + (columnWidths[h] || 150),
                      0
                    )
                  ),
                }}
              >
                {/* Sticky header - stays pinned during vertical scroll, scrolls with horizontal */}
                <div 
                  className="flex bg-muted sticky top-0 z-10"
                  style={{ willChange: "transform" }}
                >
                  {previewData.headers.map((header, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 text-left font-medium text-muted-foreground relative group flex-shrink-0"
                      style={{
                        width: columnWidths[header] || 150,
                        minWidth: columnWidths[header] || 150,
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span
                          className="truncate cursor-pointer hover:text-foreground"
                          onClick={() => toggleColumnWrap(header)}
                          title="Click to expand/collapse"
                        >
                          {header}
                        </span>
                      </div>
                      {/* Resize handle */}
                      <div
                        className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-primary/20 group-hover:bg-primary/10"
                        onMouseDown={(e) => handleMouseDown(e, header)}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Virtualized body */}
                <div
                  className="relative"
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const rowIndex = virtualRow.index;
                    const row = previewData.rows[rowIndex];
                    return (
                      <div
                        key={virtualRow.key}
                        className="flex border-t absolute w-full left-0"
                        style={{
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        {previewData.headers.map((header, colIndex) => {
                          const width = columnWidths[header] || 150;
                          const isExpanded = width >= 300;
                          const isEditing =
                            editingCell?.rowIndex === rowIndex &&
                            editingCell?.header === header;
                          const cellValue = row[header] || "";

                          return (
                            <div
                              key={colIndex}
                              className={`px-3 py-2 flex-shrink-0 relative group cursor-pointer transition-colors ${
                                isEditing
                                  ? "bg-primary/10 ring-2 ring-primary ring-inset"
                                  : "hover:bg-muted/50"
                              }`}
                              style={{
                                width: width,
                                minWidth: width,
                              }}
                              onClick={() => {
                                if (!isEditing) {
                                  startEditing(rowIndex, header, cellValue);
                                }
                              }}
                              title={isEditing ? "" : `${cellValue || "—"}\n\nClick to edit`}
                            >
                              {isEditing ? (
                                <input
                                  ref={editInputRef}
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={commitEdit}
                                  onKeyDown={handleEditKeyDown}
                                  className="w-full h-full bg-transparent border-none outline-none text-sm p-0 m-0"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <div className="flex items-center justify-between w-full">
                                  <span
                                    className={`flex-1 ${
                                      isExpanded
                                        ? "whitespace-normal break-words"
                                        : "truncate"
                                    }`}
                                  >
                                    {cellValue || "—"}
                                  </span>
                                  <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Footer with instructions */}
            <div className="bg-muted/50 px-3 py-2 flex items-center justify-between text-sm text-muted-foreground border rounded-b-lg -mt-px">
              <span className="flex items-center gap-2">
                <Pencil className="h-3 w-3" />
                Click any cell to edit • Tab to move between cells
              </span>
              <span>{previewData.totalRows} rows total</span>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check className="h-4 w-4" />
              <span>File parsed successfully</span>
            </div>
          </CardContent>
        </Card>
      )}

      {parseError && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{parseError}</span>
        </div>
      )}

      {/* Manual Entry Section */}
      <Card className="mt-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Manual Entry</span>
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <Badge variant="secondary">{pendingCount} pending</Badge>
              )}
              <Button size="sm" variant="outline" onClick={addNewRow}>
                <Plus className="h-4 w-4 mr-1" />
                Add Row
              </Button>
              <Button
                size="sm"
                onClick={submitAllEntries}
                disabled={pendingCount === 0 || isSubmittingAll}
              >
                {isSubmittingAll ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-1" />
                )}
                Submit All
              </Button>
            </div>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Enter wire transfer details from your confirmation documents
          </p>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden relative">
            <div className="overflow-x-auto">
              <table className="text-sm" style={{ minWidth: "2400px" }}>
                <thead className="bg-muted">
                  <tr>
                    {/* Required Fields */}
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[180px]">
                      Bank Transfer ID*
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[120px]">
                      Date*
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[160px]">
                      Counterparty*
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[100px]">
                      Amount*
                    </th>
                    {/* Transfer Details */}
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[180px]">
                      Record Name
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[120px]">
                      Type
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[60px]">
                      Currency
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[100px]">
                      Status
                    </th>
                    {/* Bank Trace */}
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[140px]">
                      Trace Number
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[180px]">
                      Fed Reference
                    </th>
                    {/* Entry and Approval */}
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[100px]">
                      Entered By
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[160px]">
                      Created At
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[100px]">
                      Approver
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[160px]">
                      Approved At
                    </th>
                    {/* Originating Account */}
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[180px]">
                      Origin Acct Name
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[120px]">
                      Origin Acct #
                    </th>
                    {/* Counterparty Details */}
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[160px]">
                      Address Line 1
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[160px]">
                      Address Line 2
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[140px]">
                      Address Line 3
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[180px]">
                      Beneficiary Bank
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[100px]">
                      Routing #
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[100px]">
                      Account #
                    </th>
                    {/* Memo */}
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[200px]">
                      Memo Lines
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[180px]">
                      Description
                    </th>
                    {/* Actions - Sticky */}
                    <th className="px-2 py-2 text-center font-medium text-muted-foreground w-[100px] sticky right-0 bg-muted z-10 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {manualEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className={`border-t ${
                        entry.isSubmitted
                          ? "bg-green-50 dark:bg-green-900/10"
                          : ""
                      }`}
                    >
                      {/* Required Fields */}
                      <td className="px-2 py-1">
                        <Input
                          value={entry.bankReference}
                          onChange={(e) => updateEntry(entry.id, "bankReference", e.target.value)}
                          placeholder="20250210L1LFB91C..."
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          type="date"
                          value={entry.date}
                          onChange={(e) => updateEntry(entry.id, "date", e.target.value)}
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={entry.counterpartyName}
                          onChange={(e) => updateEntry(entry.id, "counterpartyName", e.target.value)}
                          placeholder="DAVID BETH"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={entry.amount}
                          onChange={(e) => updateEntry(entry.id, "amount", e.target.value)}
                          placeholder="6000.52"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      {/* Transfer Details */}
                      <td className="px-2 py-1">
                        <Input
                          value={entry.recordTransferName}
                          onChange={(e) => updateEntry(entry.id, "recordTransferName", e.target.value)}
                          placeholder="BL1-RTL-00001 - DAVID BETH"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={entry.paymentType}
                          onChange={(e) => updateEntry(entry.id, "paymentType", e.target.value)}
                          placeholder="DOMESTIC_WIRE"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={entry.currency}
                          onChange={(e) => updateEntry(entry.id, "currency", e.target.value)}
                          placeholder="USD"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={entry.status}
                          onChange={(e) => updateEntry(entry.id, "status", e.target.value)}
                          placeholder="Acknowledged"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      {/* Bank Trace */}
                      <td className="px-2 py-1">
                        <Input
                          value={entry.bankTraceNumber}
                          onChange={(e) => updateEntry(entry.id, "bankTraceNumber", e.target.value)}
                          placeholder="2024166000117"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={entry.fedReferenceNumber}
                          onChange={(e) => updateEntry(entry.id, "fedReferenceNumber", e.target.value)}
                          placeholder="20240614L1LFB91C000158"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      {/* Entry and Approval */}
                      <td className="px-2 py-1">
                        <Input
                          value={entry.transferEnteredBy}
                          onChange={(e) => updateEntry(entry.id, "transferEnteredBy", e.target.value)}
                          placeholder="AKRAUT"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          type="datetime-local"
                          value={entry.transferCreatedAt}
                          onChange={(e) => updateEntry(entry.id, "transferCreatedAt", e.target.value)}
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={entry.approverOneName}
                          onChange={(e) => updateEntry(entry.id, "approverOneName", e.target.value)}
                          placeholder="JKRAUT"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          type="datetime-local"
                          value={entry.approverOneTimestamp}
                          onChange={(e) => updateEntry(entry.id, "approverOneTimestamp", e.target.value)}
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      {/* Originating Account */}
                      <td className="px-2 py-1">
                        <Input
                          value={entry.originatingAccountName}
                          onChange={(e) => updateEntry(entry.id, "originatingAccountName", e.target.value)}
                          placeholder="BRRRRLOANS 1 LLC - ****3598"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={entry.originatingAccountNumber}
                          onChange={(e) => updateEntry(entry.id, "originatingAccountNumber", e.target.value)}
                          placeholder="****3598"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      {/* Counterparty Details */}
                      <td className="px-2 py-1">
                        <Input
                          value={entry.counterpartyAddressLine1}
                          onChange={(e) => updateEntry(entry.id, "counterpartyAddressLine1", e.target.value)}
                          placeholder="7681 FENWCK PL"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={entry.counterpartyAddressLine2}
                          onChange={(e) => updateEntry(entry.id, "counterpartyAddressLine2", e.target.value)}
                          placeholder="BOCA RATON FL 33496"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={entry.counterpartyAddressLine3}
                          onChange={(e) => updateEntry(entry.id, "counterpartyAddressLine3", e.target.value)}
                          placeholder=""
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={entry.counterpartyBeneficiaryBankName}
                          onChange={(e) => updateEntry(entry.id, "counterpartyBeneficiaryBankName", e.target.value)}
                          placeholder="JPMORGAN CHASE BANK, NA"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={entry.counterpartyRoutingNumber}
                          onChange={(e) => updateEntry(entry.id, "counterpartyRoutingNumber", e.target.value)}
                          placeholder="021000021"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={entry.counterpartyAccountNumber}
                          onChange={(e) => updateEntry(entry.id, "counterpartyAccountNumber", e.target.value)}
                          placeholder="1228"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      {/* Memo */}
                      <td className="px-2 py-1">
                        <Input
                          value={entry.externalMemoLines}
                          onChange={(e) => updateEntry(entry.id, "externalMemoLines", e.target.value)}
                          placeholder="Memo lines (;-separated)"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={entry.description}
                          onChange={(e) => updateEntry(entry.id, "description", e.target.value)}
                          placeholder="2025-JAN BL1-RTL-00002..."
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      {/* Actions - Sticky */}
                      <td className={`px-2 py-1 sticky right-0 z-10 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)] ${
                        entry.isSubmitted 
                          ? "bg-green-50 dark:bg-green-900/10" 
                          : "bg-background"
                      }`}>
                        <div className="flex items-center justify-center gap-1">
                          {entry.isSubmitted ? (
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-600"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Saved
                            </Badge>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={() => submitEntry(entry)}
                                disabled={!isEntryValid(entry) || entry.isSubmitting}
                              >
                                {entry.isSubmitting ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Send className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-destructive hover:text-destructive"
                                onClick={() => removeRow(entry.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              Scroll horizontally to view all fields • Actions column is pinned
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
