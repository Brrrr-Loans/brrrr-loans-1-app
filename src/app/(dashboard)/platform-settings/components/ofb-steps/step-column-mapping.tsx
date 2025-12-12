"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card";
import { Button } from "@/components/ui/forms/button";
import { Badge } from "@/components/ui/feedback/badge";
import { Label } from "@/components/ui/forms/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select";
import { ArrowRight, Check, AlertCircle, Loader2 } from "lucide-react";
import { useSupabase } from "@/hooks/use-supabase";
import { toast } from "sonner";

// Target fields in api_ofb_transfers
const TARGET_FIELDS = [
  { key: "ofb_transfer_id", label: "Bank Reference", required: true, description: "Unique reference number from the bank (used for deduplication)" },
  { key: "process_date", label: "Date", required: true, description: "Transaction date" },
  { key: "counterparty_name", label: "Counterparty Name", required: true, description: "Name of the other party" },
  { key: "amount", label: "Amount", required: true, description: "Transaction amount (negative = outgoing)" },
  { key: "description", label: "Description", required: false, description: "Transaction memo or description" },
  { key: "payment_type", label: "Payment Type", required: false, description: "CHECK, WIRE, ACH, etc." },
  { key: "check_number", label: "Check Number", required: false, description: "Check number if applicable" },
];

interface StepColumnMappingProps {
  headers: string[];
  sampleData: Record<string, string>[];
  savedMapping: Record<string, string> | null;
  onMappingComplete: (mapping: Record<string, string>) => void;
  onImportComplete: (transferIds: string[]) => void;
  csvData: Record<string, string>[];
}

export function StepColumnMapping({
  headers,
  sampleData,
  savedMapping,
  onMappingComplete,
  onImportComplete,
  csvData,
}: StepColumnMappingProps) {
  const [mapping, setMapping] = useState<Record<string, string>>(savedMapping || {});
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  const supabase = useSupabase();

  // Filter headers to only include valid non-empty strings (memoized to prevent infinite loops)
  const validHeaders = useMemo(
    () => headers.filter(
      (header): header is string => 
        typeof header === "string" && header.trim().length > 0
    ),
    [headers]
  );

  // Auto-map common column names
  useEffect(() => {
    if (savedMapping) return;

    const autoMapping: Record<string, string> = {};
    const headerLower = validHeaders.map((h) => h.toLowerCase().trim());

    TARGET_FIELDS.forEach((field) => {
      const key = field.key;
      let match: string | null = null;

      // Common variations for each field
      const variations: Record<string, string[]> = {
        ofb_transfer_id: ["bank reference", "bank ref", "reference", "ref", "confirmation", "transaction id", "trans id", "id"],
        process_date: ["date", "post date", "transaction date", "effective date", "posted"],
        counterparty_name: ["description", "name", "payee", "recipient", "vendor", "counterparty", "party name"],
        amount: ["debit", "credit", "amount", "total", "sum", "value"],
        description: ["transaction description", "memo", "note", "details", "purpose"],
        payment_type: ["type", "payment type", "method", "transaction type"],
        check_number: ["check", "check #", "check number", "check no"],
      };

      const fieldVariations = variations[key] || [];
      for (const v of fieldVariations) {
        const idx = headerLower.findIndex(
          (h) => h === v || h.includes(v) || v.includes(h)
        );
        if (idx !== -1) {
          match = validHeaders[idx];
          break;
        }
      }

      if (match) {
        autoMapping[key] = match;
      }
    });

    if (Object.keys(autoMapping).length > 0) {
      setMapping(autoMapping);
    }
  }, [validHeaders, savedMapping]);

  const handleMappingChange = (targetField: string, csvColumn: string) => {
    setMapping((prev) => ({
      ...prev,
      [targetField]: csvColumn === "__none__" ? "" : csvColumn,
    }));
  };

  const requiredFieldsMapped = TARGET_FIELDS.filter((f) => f.required).every(
    (f) => mapping[f.key] && mapping[f.key] !== ""
  );

  const handleImport = async () => {
    if (!supabase || !requiredFieldsMapped) {
      toast.error("Please map all required fields");
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      // Generate a batch ID for this import
      const importBatchId = crypto.randomUUID();
      
      const transfersToInsert = csvData.map((row) => {
        // Parse amount - handle currency formatting and debit/credit columns
        let amountStr = row[mapping.amount] || "0";
        amountStr = amountStr.replace(/[$,]/g, "").trim();
        const numAmount = parseFloat(amountStr) || 0;

        // Parse date
        let processDate = row[mapping.process_date] || null;
        if (processDate) {
          const parsed = new Date(processDate);
          if (!isNaN(parsed.getTime())) {
            processDate = parsed.toISOString().split("T")[0];
          }
        }

        // Bank reference is required - use directly from the mapped column
        const bankReference = row[mapping.ofb_transfer_id]?.trim() || "";

        return {
          ofb_transfer_id: bankReference,
          process_date: processDate,
          counterparty_name: row[mapping.counterparty_name]?.trim() || null,
          amount: numAmount,
          description: mapping.description ? row[mapping.description]?.trim() : null,
          payment_type: mapping.payment_type ? row[mapping.payment_type]?.trim() : null,
          check_number: mapping.check_number ? row[mapping.check_number]?.trim() : null,
          import_source: "csv_import",
          import_batch_id: importBatchId,
          raw_data: row,
        };
      }).filter(t => t.ofb_transfer_id); // Skip rows without a bank reference

      // Insert in batches of 100
      const batchSize = 100;
      const imported: string[] = [];
      const errors: string[] = [];

      for (let i = 0; i < transfersToInsert.length; i += batchSize) {
        const batch = transfersToInsert.slice(i, i + batchSize);
        const { data, error } = await supabase
          .from("api_ofb_transfers")
          .upsert(batch, { onConflict: "ofb_transfer_id", ignoreDuplicates: true })
          .select("ofb_transfer_id");

        if (error) {
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        } else if (data) {
          imported.push(...data.map((d) => d.ofb_transfer_id));
        }
      }

      const result = {
        success: errors.length === 0,
        imported: imported.length,
        skipped: csvData.length - imported.length,
        errors,
      };

      setImportResult(result);
      onMappingComplete(mapping);
      onImportComplete(imported);

      if (result.success) {
        toast.success(`Imported ${result.imported} transactions`);
      } else {
        toast.warning(`Imported ${result.imported} with some errors`);
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import transactions");
    } finally {
      setIsImporting(false);
    }
  };

  const getSampleValue = (csvColumn: string) => {
    if (!csvColumn || sampleData.length === 0) return "—";
    return sampleData[0][csvColumn] || "—";
  };

  return (
    <div className="space-y-6">
      <div className="text-center text-muted-foreground">
        <p>Map your CSV columns to the transaction fields</p>
      </div>

      <div className="grid gap-4">
        {TARGET_FIELDS.map((field) => (
          <Card key={field.key} className={field.required ? "" : "opacity-75"}>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">{field.label}</Label>
                    {field.required && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {field.description}
                  </p>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                <div className="flex-1 min-w-[200px]">
                  <Select
                    value={mapping[field.key] || "__none__"}
                    onValueChange={(value) => handleMappingChange(field.key, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Not mapped —</SelectItem>
                      {validHeaders.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[150px] text-sm text-muted-foreground truncate">
                  {mapping[field.key] && (
                    <span className="italic">
                      e.g., "{getSampleValue(mapping[field.key])}"
                    </span>
                  )}
                </div>

                <div className="w-6">
                  {mapping[field.key] && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {importResult && (
        <Card className={importResult.success ? "border-green-500" : "border-yellow-500"}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {importResult.success ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              Import Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{importResult.imported}</p>
                <p className="text-sm text-muted-foreground">Imported</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{importResult.skipped}</p>
                <p className="text-sm text-muted-foreground">Skipped</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{importResult.errors.length}</p>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
            </div>
            {importResult.errors.length > 0 && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-lg text-sm">
                {importResult.errors.map((err, i) => (
                  <p key={i} className="text-destructive">{err}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!importResult && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleImport}
            disabled={!requiredFieldsMapped || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing {csvData.length} transactions...
              </>
            ) : (
              <>Import {csvData.length} Transactions</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

