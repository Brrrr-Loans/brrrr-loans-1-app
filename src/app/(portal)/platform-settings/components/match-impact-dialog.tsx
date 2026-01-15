"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlays/dialog";
import { Loader2, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";

interface MatchImpactPreview {
  transfer_count: number;
  will_create_transactions: number;
  will_skip_transactions: number;
  clerk_allocations: Array<{
    type: "user" | "org";
    name: string;
    amount: number;
  }>;
  warnings: string[];
  vendor_name: string | null;
}

interface MatchImpactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transferIds: number[];
  vendorId: number;
  notes?: string;
  onMatchComplete: () => void;
}

type DialogStep = "preview" | "sync-prompt" | "sync-result";

export function MatchImpactDialog({
  open,
  onOpenChange,
  transferIds,
  vendorId,
  notes,
  onMatchComplete,
}: MatchImpactDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<DialogStep>("preview");
  const [preview, setPreview] = useState<MatchImpactPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (open && transferIds.length > 0 && vendorId) {
      // Reset to preview step and load data when dialog opens
      setStep("preview");
      setPreview(null);
      setSyncError(null);
      loadPreview();
    }
  }, [open, transferIds.length, vendorId]);

  const loadPreview = async () => {
    if (transferIds.length === 0 || !vendorId) {
      onOpenChange(false);
      return;
    }
    
    setLoading(true);
    setSyncError(null);
    setStep("preview");
    setPreview(null);
    
    try {
      const response = await fetch("/api/brex/match-impact-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transfer_ids: transferIds,
          vendor_id: vendorId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPreview(data.preview);
      } else {
        throw new Error(data.error || "Failed to load preview");
      }
    } catch (error) {
      console.error("Error loading preview:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load match impact preview",
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMatch = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/brex/match-transfer-to-vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transfer_ids: transferIds,
          vendor_id: vendorId,
          notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onMatchComplete(); // Clear selections and reload
        setStep("sync-prompt");
      } else {
        throw new Error(data.error || "Failed to match transfers");
      }
    } catch (error) {
      console.error("Error matching transfers:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to match transfers",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncError(null);
    
    try {
      const response = await fetch("/api/brex/sync-to-transactions", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        // Fire confetti! 🎉
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        setStep("sync-result");
      } else {
        throw new Error(data.error || "Failed to sync transactions");
      }
    } catch (error) {
      console.error("Error syncing:", error);
      setSyncError(
        error instanceof Error ? error.message : "Failed to sync transactions"
      );
      setStep("sync-result");
    } finally {
      setSyncing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {/* Step 1: Preview */}
        {step === "preview" && (
          <>
            <DialogHeader>
              <DialogTitle>Match Impact Preview</DialogTitle>
              <DialogDescription>
                Review what will happen when you match {transferIds.length} transfer(s) to{" "}
                {preview?.vendor_name || "this vendor"}
              </DialogDescription>
            </DialogHeader>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : preview ? (
              <div className="space-y-4">
                {/* Summary */}
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Transactions to Create:</span>
                    <span className="text-lg font-bold">
                      {preview.will_create_transactions}
                    </span>
                  </div>
                  {preview.will_skip_transactions > 0 && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-sm">Will Skip:</span>
                      <span className="text-sm">{preview.will_skip_transactions}</span>
                    </div>
                  )}
                </div>

                {/* Allocations */}
                {preview.clerk_allocations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Allocated To:</h4>
                    <div className="space-y-2">
                      {preview.clerk_allocations.map((allocation, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {allocation.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {allocation.type === "user" ? "Individual" : "Organization"}
                            </span>
                          </div>
                          <span className="font-semibold">
                            {formatCurrency(allocation.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {preview.warnings.length > 0 && (
                  <div className="rounded-lg border border-warning bg-warning/10 p-3">
                    <div className="flex gap-2">
                      <AlertTriangle className="h-5 w-5 text-warning-foreground flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        {preview.warnings.map((warning, idx) => (
                          <p key={idx} className="text-sm text-warning-foreground">
                            {warning}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmMatch} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Confirm Match"
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 2: Sync Prompt */}
        {step === "sync-prompt" && (
          <>
            <DialogHeader>
              <DialogTitle>✅ Matches Created!</DialogTitle>
              <DialogDescription>
                Successfully matched {transferIds.length} transfer(s) to{" "}
                {preview?.vendor_name || "vendor"}
              </DialogDescription>
            </DialogHeader>

            {preview && (
              <div className="space-y-4">
                {/* Same preview as Step 1 */}
                <div className="rounded-lg bg-success/10 border border-success p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-success-foreground">
                        Ready to sync {preview.will_create_transactions} transaction(s)
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Allocated to {preview.clerk_allocations.length} investor(s)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Allocations */}
                {preview.clerk_allocations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Allocations:</h4>
                    <div className="space-y-1">
                      {preview.clerk_allocations.map((allocation, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>{allocation.name}</span>
                          <span className="font-semibold">
                            {formatCurrency(allocation.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={handleSyncNow} disabled={syncing}>
                {syncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  "Sync to Transactions Now"
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 3: Sync Result */}
        {step === "sync-result" && (
          <>
            <DialogHeader>
              <DialogTitle>
                {syncError ? "Sync Failed" : "🎉 Sync Complete!"}
              </DialogTitle>
              <DialogDescription>
                {syncError
                  ? "There was an error syncing the transactions"
                  : `Successfully synced ${preview?.will_create_transactions || 0} transaction(s)`}
              </DialogDescription>
            </DialogHeader>

            {syncError ? (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{syncError}</p>
              </div>
            ) : (
              <div className="rounded-lg bg-success/10 border border-success p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-success-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-success-foreground">
                      Transactions have been created and allocated to investors
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You can now view them in the Transactions table
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  setStep("preview");
                }}
              >
                Close
              </Button>
              {!syncError && (
                <Button
                  onClick={() => {
                    router.push("/balance-sheet/transactions?tab=investments");
                    onOpenChange(false);
                  }}
                >
                  View Transactions
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

