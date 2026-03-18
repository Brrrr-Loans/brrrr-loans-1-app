"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import {
  Stepper,
  StepperList,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
  StepperContent,
  StepperPrev,
  StepperNext,
} from "@/components/ui/shadcn/stepper";
import { Check, Upload, FileSpreadsheet, Users, Building2, Banknote } from "lucide-react";

// Step components (will be created separately)
import { StepSelectBank } from "./ofb-steps/step-select-bank";
import { StepUploadCSV } from "./ofb-steps/step-upload-csv";
import { StepColumnMapping } from "./ofb-steps/step-column-mapping";
import { StepVendorMatching } from "./ofb-steps/step-vendor-matching";
import { StepOrgLinking } from "./ofb-steps/step-org-linking";
import { StepLedgerSync } from "./ofb-steps/step-ledger-sync";

const STEPS = [
  { id: "bank", title: "Bank Account", description: "Select your bank", icon: Banknote },
  { id: "upload", title: "Import Data", description: "Upload CSV or enter manually", icon: Upload },
  { id: "mapping", title: "Map Columns", description: "Map CSV to fields", icon: FileSpreadsheet },
  { id: "vendors", title: "Match Vendors", description: "Link to vendors", icon: Users },
  { id: "orgs", title: "Assign", description: "Assign to organizations", icon: Building2 },
  { id: "sync", title: "Sync", description: "Sync to ledger", icon: Check },
] as const;

type StepId = (typeof STEPS)[number]["id"];

interface ImportState {
  bankAccountId: number | null;
  bankCode: string | null;
  csvFile: File | null;
  csvData: Record<string, string>[] | null;
  csvHeaders: string[] | null;
  columnMapping: Record<string, string> | null;
  importedTransferIds: string[] | null;
  manualEntriesCount: number;
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

interface OFBImportWizardProps {
  initialStep?: number;
  onStepChange?: (stepNumber: number) => void;
}

export function OFBImportWizard({
  initialStep = 1,
  onStepChange,
}: OFBImportWizardProps = {}) {
  const initialStepId = STEPS[Math.max(0, Math.min(initialStep - 1, STEPS.length - 1))]?.id ?? "bank";
  const [currentStep, setCurrentStepInternal] = useState<StepId>(initialStepId);
  const [importState, setImportState] = useState<ImportState>(initialState);
  const [isProcessing, setIsProcessing] = useState(false);

  const setCurrentStep = useCallback((step: StepId) => {
    setCurrentStepInternal(step);
    const stepIndex = STEPS.findIndex((s) => s.id === step);
    onStepChange?.(stepIndex + 1);
  }, [onStepChange]);

  const currentStepIndex = useMemo(
    () => STEPS.findIndex((s) => s.id === currentStep),
    [currentStep]
  );

  const updateState = useCallback((updates: Partial<ImportState>) => {
    setImportState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Memoized callback for manual entry changes to prevent infinite loops
  const handleManualEntryChange = useCallback((count: number) => {
    setImportState((prev) => {
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
      case "bank":
        return importState.bankAccountId !== null;
      case "upload":
        const hasCSVData = importState.csvData !== null && importState.csvHeaders !== null;
        const hasManualEntries = importState.manualEntriesCount > 0;
        return hasCSVData || hasManualEntries;
      case "mapping":
        return importState.columnMapping !== null || importState.manualEntriesCount > 0;
      case "vendors":
        return true;
      case "orgs":
        return true;
      case "sync":
        return true;
      default:
        return false;
    }
  }, [currentStep, importState]);

  // Validation handler for stepper navigation
  const handleValidate = useCallback(
    async (_value: string, direction: "next" | "prev") => {
      // Always allow going back
      if (direction === "prev") return true;
      
      // Check if current step can proceed
      return canProceed();
    },
    [canProceed]
  );

  const handleStepChange = (value: string) => {
    const stepOrder: StepId[] = ["bank", "upload", "mapping", "vendors", "orgs", "sync"];
    const clickedIndex = stepOrder.indexOf(value as StepId);
    const currentIndex = stepOrder.indexOf(currentStep);
    
    // Only allow going back to completed steps
    if (clickedIndex < currentIndex) {
      // Prevent navigating to Column Mapping if it should be skipped
      if (value === "mapping" && shouldSkipColumnMapping()) {
        return;
      }
      setCurrentStep(value as StepId);
    } else if (clickedIndex === currentIndex + 1 && canProceed()) {
      // Allow moving forward one step if current step is valid
      setCurrentStep(value as StepId);
    }
  };

  const handleReset = () => {
    setCurrentStep("bank");
    setImportState(initialState);
  };

  const currentStepData = STEPS.find((s) => s.id === currentStep);
  const CurrentIcon = currentStepData?.icon || Banknote;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CurrentIcon className="h-4 w-4" />
          <span>{currentStepData?.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Stepper
          value={currentStep}
          onValueChange={handleStepChange}
          onValidate={handleValidate}
          orientation="horizontal"
          className="w-full"
        >
          {/* Step List - Horizontal layout with justified spacing */}
          <StepperList className="w-full justify-between">
            {STEPS.map((step, index) => (
              <StepperItem key={step.id} value={step.id} className="flex-1">
                <StepperTrigger className="flex items-center gap-3">
                  <StepperIndicator />
                  <div className="flex flex-col items-start gap-0.5 text-left">
                    <StepperTitle className="text-sm font-medium">
                      {step.title}
                    </StepperTitle>
                    <StepperDescription className="text-xs text-muted-foreground hidden sm:block">
                      {step.description}
                    </StepperDescription>
                  </div>
                </StepperTrigger>
                <StepperSeparator className="flex-1" />
              </StepperItem>
            ))}
          </StepperList>

          {/* Step Content */}
          <div className="mt-8 min-h-[400px]">
            <StepperContent value="bank">
              <StepSelectBank
                selectedBankId={importState.bankAccountId}
                onSelect={(id, code) => updateState({ bankAccountId: id, bankCode: code })}
              />
            </StepperContent>

            <StepperContent value="upload">
              <StepUploadCSV
                file={importState.csvFile}
                onFileUpload={(file, data, headers) =>
                  updateState({ csvFile: file, csvData: data, csvHeaders: headers })
                }
                onManualEntryChange={handleManualEntryChange}
              />
            </StepperContent>

            <StepperContent value="mapping">
              <StepColumnMapping
                headers={importState.csvHeaders || []}
                sampleData={importState.csvData?.slice(0, 3) || []}
                savedMapping={importState.columnMapping}
                onMappingComplete={(mapping) => updateState({ columnMapping: mapping })}
                onImportComplete={(transferIds) => updateState({ importedTransferIds: transferIds })}
                csvData={importState.csvData || []}
              />
            </StepperContent>

            <StepperContent value="vendors">
              <StepVendorMatching
                transferIds={importState.importedTransferIds || []}
                onMatchComplete={(count) => updateState({ matchedVendorCount: count })}
              />
            </StepperContent>

            <StepperContent value="orgs">
              <StepOrgLinking
                onLinkComplete={(count) => updateState({ linkedOrgCount: count })}
              />
            </StepperContent>

            <StepperContent value="sync">
              <StepLedgerSync
                transferIds={importState.importedTransferIds || []}
                onSyncComplete={(count) => updateState({ syncedTransactionCount: count })}
                onReset={handleReset}
              />
            </StepperContent>
          </div>

          {/* Navigation - Following official Dice UI layout */}
          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <StepperPrev asChild>
              <Button variant="outline">Previous</Button>
            </StepperPrev>

            <div className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {STEPS.length}
            </div>

            {currentStep === "sync" ? (
              <Button onClick={handleReset} variant="outline">
                Start New Import
              </Button>
            ) : (
              <StepperNext asChild>
                <Button>Next</Button>
              </StepperNext>
            )}
          </div>
        </Stepper>
      </CardContent>
    </Card>
  );
}
