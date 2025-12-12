"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card";
import { Button } from "@/components/ui/forms/button";
import { Stepper, StepContent, StepActions, type Step } from "@/components/ui/layout/stepper";
import { ArrowLeft, ArrowRight, Check, Upload, FileSpreadsheet, Users, Building2, Banknote } from "lucide-react";

// Step components (will be created separately)
import { StepSelectBank } from "./ofb-steps/step-select-bank";
import { StepUploadCSV } from "./ofb-steps/step-upload-csv";
import { StepColumnMapping } from "./ofb-steps/step-column-mapping";
import { StepVendorMatching } from "./ofb-steps/step-vendor-matching";
import { StepOrgLinking } from "./ofb-steps/step-org-linking";
import { StepLedgerSync } from "./ofb-steps/step-ledger-sync";

const STEPS: Step[] = [
  { id: "bank", title: "Connect Bank Account" },
  { id: "upload", title: "Import" },
  { id: "mapping", title: "Map to Columns" },
  { id: "vendors", title: "Match Vendors" },
  { id: "orgs", title: "Link to Orgs" },
  { id: "sync", title: "Sync to Ledger" },
];

interface ImportState {
  bankAccountId: number | null;
  bankCode: string | null;
  csvFile: File | null;
  csvData: Record<string, string>[] | null;
  csvHeaders: string[] | null;
  columnMapping: Record<string, string> | null;
  importedTransferIds: string[] | null;
  manualEntriesCount: number; // Track manually entered transfers
  matchedVendorCount: number;
  linkedOrgCount: number;
  syncedTransactionCount: number;
}

const initialState: ImportState = {
  bankAccountId: null,
  bankCode: null,
  csvFile: null,
  csvData: null,
  csvHeaders: null,
  columnMapping: null,
  importedTransferIds: null,
  manualEntriesCount: 0,
  matchedVendorCount: 0,
  linkedOrgCount: 0,
  syncedTransactionCount: 0,
};

export function OFBImportWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [importState, setImportState] = useState<ImportState>(initialState);
  const [isProcessing, setIsProcessing] = useState(false);

  const updateState = useCallback((updates: Partial<ImportState>) => {
    setImportState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Memoized callback for manual entry changes to prevent infinite loops
  const handleManualEntryChange = useCallback((count: number) => {
    setImportState((prev) => {
      // Only update if count actually changed
      if (prev.manualEntriesCount === count) return prev;
      return { ...prev, manualEntriesCount: count };
    });
  }, []);

  // Check if column mapping step should be skipped (only manual entries, no CSV)
  const shouldSkipColumnMapping = useCallback(() => {
    const hasCSVData = importState.csvData !== null && importState.csvHeaders !== null;
    const hasManualEntries = importState.manualEntriesCount > 0;
    return !hasCSVData && hasManualEntries;
  }, [importState.csvData, importState.csvHeaders, importState.manualEntriesCount]);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0: // Bank selection
        return importState.bankAccountId !== null;
      case 1: // CSV upload OR manual entry
        // Allow proceeding if either CSV is uploaded OR manual entries have been saved
        const hasCSVData = importState.csvData !== null && importState.csvHeaders !== null;
        const hasManualEntries = importState.manualEntriesCount > 0;
        return hasCSVData || hasManualEntries;
      case 2: // Column mapping (skip if only manual entries)
        return importState.columnMapping !== null || importState.manualEntriesCount > 0;
      case 3: // Vendor matching
        return true; // Can skip if no unmatched vendors
      case 4: // Org linking
        return true; // Can skip if all vendors already linked
      case 5: // Sync
        return true;
      default:
        return false;
    }
  }, [currentStep, importState]);

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      let nextStep = currentStep + 1;
      // Skip Column Mapping (step 2) if only manual entries exist
      if (nextStep === 2 && shouldSkipColumnMapping()) {
        nextStep = 3; // Jump to Vendor Matching
      }
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      let prevStep = currentStep - 1;
      // Skip Column Mapping (step 2) when going back if only manual entries exist
      if (prevStep === 2 && shouldSkipColumnMapping()) {
        prevStep = 1; // Go back to Upload CSV
      }
      setCurrentStep(prevStep);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setImportState(initialState);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepSelectBank
            selectedBankId={importState.bankAccountId}
            onSelect={(id, code) => updateState({ bankAccountId: id, bankCode: code })}
          />
        );
      case 1:
        return (
          <StepUploadCSV
            file={importState.csvFile}
            onFileUpload={(file, data, headers) =>
              updateState({ csvFile: file, csvData: data, csvHeaders: headers })
            }
            onManualEntryChange={handleManualEntryChange}
          />
        );
      case 2:
        return (
          <StepColumnMapping
            headers={importState.csvHeaders || []}
            sampleData={importState.csvData?.slice(0, 3) || []}
            savedMapping={importState.columnMapping}
            onMappingComplete={(mapping) => updateState({ columnMapping: mapping })}
            onImportComplete={(transferIds) => updateState({ importedTransferIds: transferIds })}
            csvData={importState.csvData || []}
          />
        );
      case 3:
        return (
          <StepVendorMatching
            transferIds={importState.importedTransferIds || []}
            onMatchComplete={(count) => updateState({ matchedVendorCount: count })}
          />
        );
      case 4:
        return (
          <StepOrgLinking
            onLinkComplete={(count) => updateState({ linkedOrgCount: count })}
          />
        );
      case 5:
        return (
          <StepLedgerSync
            transferIds={importState.importedTransferIds || []}
            onSyncComplete={(count) => updateState({ syncedTransactionCount: count })}
            onReset={handleReset}
          />
        );
      default:
        return null;
    }
  };

  const getStepIcon = (index: number) => {
    const icons = [Banknote, Upload, FileSpreadsheet, Users, Building2, Check];
    const Icon = icons[index];
    return <Icon className="h-4 w-4" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStepIcon(currentStep)}
          <span>{STEPS[currentStep].title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Stepper
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={(index) => {
            // Only allow going back to completed steps
            if (index < currentStep) {
              // Prevent navigating to Column Mapping if it should be skipped
              if (index === 2 && shouldSkipColumnMapping()) {
                return;
              }
              setCurrentStep(index);
            }
          }}
        />

        <StepContent>{renderStepContent()}</StepContent>

        <StepActions>
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isProcessing}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isProcessing}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleReset} variant="outline">
              Start New Import
            </Button>
          )}
        </StepActions>
      </CardContent>
    </Card>
  );
}

