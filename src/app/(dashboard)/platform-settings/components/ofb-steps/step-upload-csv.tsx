"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { useSupabase } from "@/hooks/use-supabase";
import { toast } from "sonner";

interface ManualEntry {
  id: string;
  bankReference: string;
  date: string;
  counterpartyName: string;
  amount: string;
  description: string;
  paymentType: string;
  isSubmitting: boolean;
  isSubmitted: boolean;
}

const createEmptyEntry = (): ManualEntry => ({
  id: crypto.randomUUID(),
  bankReference: "",
  date: "",
  counterpartyName: "",
  amount: "",
  description: "",
  paymentType: "WIRE",
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

      const { error } = await supabase.from("api_ofb_transfers").upsert(
        {
          ofb_transfer_id: entry.bankReference.trim(),
          process_date: entry.date,
          counterparty_name: entry.counterpartyName.trim(),
          amount,
          description: entry.description.trim() || null,
          payment_type: entry.paymentType || "WIRE",
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
          const headers = results.meta.fields || [];

          if (data.length === 0) {
            setParseError("CSV file is empty or has no valid data rows");
            setIsParsing(false);
            return;
          }

          setPreviewData({
            headers,
            rows: data.slice(0, 5),
            totalRows: data.length,
          });

          onFileUpload(file, data, headers);
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
    (acceptedFiles: File[]) => {
      const csvFile = acceptedFiles[0];
      if (csvFile) {
        parseCSV(csvFile);
      }
    },
    [parseCSV]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // Disable File System Access API to avoid "NotAllowedError: getFile" errors
    useFsAccessApi: false,
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

            {/* Preview table with resizable columns and horizontal scroll */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto overflow-y-visible">
                <table
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
                  <thead className="bg-muted">
                    <tr>
                      {previewData.headers.map((header, i) => (
                        <th
                          key={i}
                          className="px-3 py-2 text-left font-medium text-muted-foreground relative group"
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
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t">
                        {previewData.headers.map((header, colIndex) => {
                          const width = columnWidths[header] || 150;
                          const isExpanded = width >= 300;
                          return (
                            <td
                              key={colIndex}
                              className={`px-3 py-2 align-top ${
                                isExpanded
                                  ? "whitespace-normal break-words"
                                  : "truncate"
                              }`}
                              style={{
                                width: width,
                                minWidth: width,
                              }}
                              title={row[header] || ""}
                            >
                              {row[header] || "—"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-muted/50 px-3 py-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Drag column borders to resize • Click header to
                  expand/collapse
                </span>
                {previewData.totalRows > 5 && (
                  <span>+ {previewData.totalRows - 5} more rows</span>
                )}
              </div>
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
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground w-[180px]">
                      Bank Reference*
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground w-[120px]">
                      Date*
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground w-[180px]">
                      Beneficiary*
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground w-[120px]">
                      Amount*
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground w-[200px]">
                      Description
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground w-[100px]">
                      Type
                    </th>
                    <th className="px-2 py-2 text-center font-medium text-muted-foreground w-[120px]">
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
                      <td className="px-2 py-1">
                        <Input
                          value={entry.bankReference}
                          onChange={(e) =>
                            updateEntry(
                              entry.id,
                              "bankReference",
                              e.target.value
                            )
                          }
                          placeholder="20250210L1LFB91C..."
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          type="date"
                          value={entry.date}
                          onChange={(e) =>
                            updateEntry(entry.id, "date", e.target.value)
                          }
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={entry.counterpartyName}
                          onChange={(e) =>
                            updateEntry(
                              entry.id,
                              "counterpartyName",
                              e.target.value
                            )
                          }
                          placeholder="DAVID BETH"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={entry.amount}
                          onChange={(e) =>
                            updateEntry(entry.id, "amount", e.target.value)
                          }
                          placeholder="6000.52"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={entry.description}
                          onChange={(e) =>
                            updateEntry(entry.id, "description", e.target.value)
                          }
                          placeholder="2025-JAN BL1-RTL-00002..."
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={entry.paymentType}
                          onChange={(e) =>
                            updateEntry(entry.id, "paymentType", e.target.value)
                          }
                          placeholder="WIRE"
                          className="h-8 text-xs"
                          disabled={entry.isSubmitted}
                        />
                      </td>
                      <td className="px-2 py-1">
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
                                disabled={
                                  !isEntryValid(entry) || entry.isSubmitting
                                }
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
