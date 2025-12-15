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

// Target fields in api_ofb_transfers - organized by category
const TARGET_FIELDS = [
  // Required fields
  { key: "ofb_transfer_id", label: "Bank Transfer ID", required: true, description: "Unique reference number from the bank (used for deduplication)" },
  { key: "process_date", label: "Transaction Date", required: true, description: "Date the transaction was processed" },
  { key: "counterparty_name", label: "Counterparty Name", required: true, description: "Name of the beneficiary/recipient" },
  { key: "amount", label: "Amount", required: true, description: "Transaction amount" },
  
  // Transfer details
  { key: "record_transfer_name", label: "Record/Transfer Name", required: false, description: "Descriptive name for the transfer record" },
  { key: "payment_type", label: "Payment Type", required: false, description: "DOMESTIC_WIRE, ACH, CHECK, etc." },
  { key: "currency", label: "Currency", required: false, description: "Currency code (default: USD)" },
  { key: "status", label: "Status", required: false, description: "Transaction status (e.g., Acknowledged)" },
  
  // Bank trace information
  { key: "bank_trace_number", label: "Bank Trace Number", required: false, description: "Bank internal trace number" },
  { key: "fed_reference_number", label: "Fed Reference Number", required: false, description: "Federal Reserve reference number for wires" },
  
  // Entry and approval
  { key: "transfer_entered_by", label: "Entered By", required: false, description: "User who entered the transfer" },
  { key: "transfer_created_at", label: "Created At", required: false, description: "When the transfer was created in the bank system" },
  { key: "approver_one_name", label: "Approver Name", required: false, description: "Name of the approver" },
  { key: "approver_one_timestamp", label: "Approver Timestamp", required: false, description: "When the transfer was approved" },
  
  // Originating account
  { key: "originating_account_name", label: "Originating Account Name", required: false, description: "Name of the sending account" },
  { key: "originating_account_number", label: "Originating Account Number", required: false, description: "Account number of the sending account" },
  
  // Counterparty details
  { key: "counterparty_address_line_1", label: "Counterparty Address Line 1", required: false, description: "First line of counterparty address" },
  { key: "counterparty_address_line_2", label: "Counterparty Address Line 2", required: false, description: "Second line of counterparty address" },
  { key: "counterparty_address_line_3", label: "Counterparty Address Line 3", required: false, description: "Third line of counterparty address" },
  { key: "counterparty_beneficiary_bank_name", label: "Beneficiary Bank Name", required: false, description: "Name of the counterparty's bank" },
  { key: "counterparty_routing_number", label: "Routing Number", required: false, description: "Bank routing number" },
  { key: "counterparty_account_number", label: "Account Number", required: false, description: "Counterparty account number" },
  
  // Memo fields (will be combined into external_memo_lines array)
  { key: "external_memo_line_1", label: "External Memo Line 1", required: false, description: "First line of external memo" },
  { key: "external_memo_line_2", label: "External Memo Line 2", required: false, description: "Second line of external memo" },
  { key: "external_memo_line_3", label: "External Memo Line 3", required: false, description: "Third line of external memo" },
  { key: "external_memo_line_4", label: "External Memo Line 4", required: false, description: "Fourth line of external memo" },
  { key: "external_memo_line_5", label: "External Memo Line 5", required: false, description: "Fifth line of external memo" },
  { key: "external_memo_line_6", label: "External Memo Line 6", required: false, description: "Sixth line of external memo" },
  
  // Legacy fields
  { key: "description", label: "Description", required: false, description: "Transaction memo or description (legacy)" },
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

      // Common variations for each field - maps CSV column names to database fields
      const variations: Record<string, string[]> = {
        // Required fields
        ofb_transfer_id: ["bank_transfer_id", "bank transfer id", "bank reference", "bank ref", "reference", "ref", "confirmation", "transaction id", "trans id"],
        process_date: ["transaction_date", "transaction date", "date", "post date", "effective date", "posted"],
        counterparty_name: ["counterparty_name", "counterparty name", "beneficiary", "name", "payee", "recipient", "vendor"],
        amount: ["amount", "debit", "credit", "total", "sum", "value"],
        
        // Transfer details
        record_transfer_name: ["record_transfer_name", "record transfer name", "transfer name", "record name"],
        payment_type: ["payment_type", "payment type", "type", "method", "transaction type"],
        currency: ["currency", "curr", "ccy"],
        status: ["status", "state", "transfer status"],
        
        // Bank trace
        bank_trace_number: ["bank_trace_number", "bank trace number", "trace number", "trace"],
        fed_reference_number: ["fed_reference_number", "fed reference number", "federal reference", "fed ref"],
        
        // Entry and approval
        transfer_entered_by: ["transfer_entered_by", "entered by", "entered_by", "creator", "created by"],
        transfer_created_at: ["transfer_created_at", "created at", "created_at", "creation date"],
        approver_one_name: ["approver_one_name", "approver name", "approver", "approved by"],
        approver_one_timestamp: ["approver_one_timestamp", "approver timestamp", "approval date", "approved at"],
        
        // Originating account
        originating_account_name: ["originating_account_name", "originating account name", "from account", "source account"],
        originating_account_number: ["originating_account_number", "originating account number", "from account number"],
        
        // Counterparty details
        counterparty_address_line_1: ["counterparty_address_line_1", "address line 1", "address_line_1", "address 1", "street"],
        counterparty_address_line_2: ["counterparty_address_line_2", "address line 2", "address_line_2", "address 2", "city state"],
        counterparty_address_line_3: ["counterparty_address_line_3", "address line 3", "address_line_3", "address 3"],
        counterparty_beneficiary_bank_name: ["counterparty_beneficiary_bank_name", "beneficiary bank", "bank name", "receiving bank"],
        counterparty_routing_number: ["counterparty_routing_number", "routing number", "routing", "aba"],
        counterparty_account_number: ["counterparty_account_number", "account number", "acct number", "beneficiary account"],
        
        // Memo fields
        external_memo_line_1: ["external_memo_line_1", "memo line 1", "memo_line_1", "memo 1"],
        external_memo_line_2: ["external_memo_line_2", "memo line 2", "memo_line_2", "memo 2"],
        external_memo_line_3: ["external_memo_line_3", "memo line 3", "memo_line_3", "memo 3"],
        external_memo_line_4: ["external_memo_line_4", "memo line 4", "memo_line_4", "memo 4"],
        external_memo_line_5: ["external_memo_line_5", "memo line 5", "memo_line_5", "memo 5"],
        external_memo_line_6: ["external_memo_line_6", "memo line 6", "memo_line_6", "memo 6"],
        
        // Legacy
        description: ["description", "transaction description", "memo", "note", "details", "purpose"],
        check_number: ["check_number", "check", "check #", "check number", "check no"],
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
        // Helper to get mapped value
        const getMapped = (key: string): string | null => {
          const csvCol = mapping[key];
          if (!csvCol) return null;
          const val = row[csvCol]?.trim();
          return val || null;
        };

        // Parse amount - handle currency formatting and debit/credit columns
        let amountStr = row[mapping.amount] || "0";
        amountStr = amountStr.replace(/[$,]/g, "").trim();
        const numAmount = parseFloat(amountStr) || 0;

        // Parse date helper
        const parseDate = (dateStr: string | null): string | null => {
          if (!dateStr) return null;
          const parsed = new Date(dateStr);
          return isNaN(parsed.getTime()) ? null : parsed.toISOString().split("T")[0];
        };

        // Parse timestamp helper
        const parseTimestamp = (tsStr: string | null): string | null => {
          if (!tsStr) return null;
          const parsed = new Date(tsStr);
          return isNaN(parsed.getTime()) ? null : parsed.toISOString();
        };

        // Bank reference is required - use directly from the mapped column
        const bankReference = row[mapping.ofb_transfer_id]?.trim() || "";

        // Combine external memo lines into an array
        const memoLines: string[] = [];
        for (let i = 1; i <= 6; i++) {
          const line = getMapped(`external_memo_line_${i}`);
          if (line && line !== "'-" && line !== "-") {
            memoLines.push(line);
          }
        }

        return {
          // Required fields
          ofb_transfer_id: bankReference,
          process_date: parseDate(getMapped("process_date")),
          counterparty_name: getMapped("counterparty_name"),
          amount: numAmount,
          
          // Transfer details
          record_transfer_name: getMapped("record_transfer_name"),
          payment_type: getMapped("payment_type"),
          currency: getMapped("currency") || "USD",
          status: getMapped("status"),
          
          // Bank trace information
          bank_trace_number: getMapped("bank_trace_number"),
          fed_reference_number: getMapped("fed_reference_number"),
          
          // Entry and approval
          transfer_entered_by: getMapped("transfer_entered_by"),
          transfer_created_at: parseTimestamp(getMapped("transfer_created_at")),
          approver_one_name: getMapped("approver_one_name"),
          approver_one_timestamp: parseTimestamp(getMapped("approver_one_timestamp")),
          
          // Originating account
          originating_account_name: getMapped("originating_account_name"),
          originating_account_number: getMapped("originating_account_number"),
          
          // Counterparty details
          counterparty_address_line_1: getMapped("counterparty_address_line_1"),
          counterparty_address_line_2: getMapped("counterparty_address_line_2"),
          counterparty_address_line_3: getMapped("counterparty_address_line_3"),
          counterparty_beneficiary_bank_name: getMapped("counterparty_beneficiary_bank_name"),
          counterparty_routing_number: getMapped("counterparty_routing_number"),
          counterparty_account_number: getMapped("counterparty_account_number"),
          
          // Memo lines as array
          external_memo_lines: memoLines.length > 0 ? memoLines : null,
          
          // Legacy fields
          description: getMapped("description"),
          check_number: getMapped("check_number"),
          
          // Import metadata
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

