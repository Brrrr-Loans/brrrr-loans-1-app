"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Alert, AlertDescription } from "@/components/ui";
import { Loader2, RefreshCw, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface SyncStatus {
  loading: boolean;
  success: boolean;
  error: string | null;
  lastSync: string | null;
  stats: {
    total: number;
    inserted: number;
    updated: number;
    errors: number;
  } | null;
}

export function BrexSyncButtons() {
  const [vendorStatus, setVendorStatus] = useState<SyncStatus>({
    loading: false,
    success: false,
    error: null,
    lastSync: null,
    stats: null,
  });

  const [transferStatus, setTransferStatus] = useState<SyncStatus>({
    loading: false,
    success: false,
    error: null,
    lastSync: null,
    stats: null,
  });

  const [transactionSyncStatus, setTransactionSyncStatus] = useState<SyncStatus>({
    loading: false,
    success: false,
    error: null,
    lastSync: null,
    stats: null,
  });

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const syncVendors = async () => {
    setVendorStatus((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch("/api/brex/sync-vendors", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to sync vendors");
      }

      setVendorStatus({
        loading: false,
        success: true,
        error: null,
        lastSync: new Date().toISOString(),
        stats: data.stats,
      });

      toast.success("Vendors synced successfully", {
        description: `Inserted: ${data.stats.inserted}, Updated: ${data.stats.updated}`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setVendorStatus({
        loading: false,
        success: false,
        error: errorMessage,
        lastSync: null,
        stats: null,
      });

      toast.error("Sync failed", {
        description: errorMessage,
      });
    }
  };

  const syncTransfers = async () => {
    setTransferStatus((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch("/api/brex/sync-transfers", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to sync transfers");
      }

      setTransferStatus({
        loading: false,
        success: true,
        error: null,
        lastSync: new Date().toISOString(),
        stats: data.stats,
      });

      toast.success("Transfers synced successfully", {
        description: `Inserted: ${data.stats.inserted}, Updated: ${data.stats.updated}`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setTransferStatus({
        loading: false,
        success: false,
        error: errorMessage,
        lastSync: null,
        stats: null,
      });

      toast.error("Sync failed", {
        description: errorMessage,
      });
    }
  };

  const syncToTransactions = async () => {
    setTransactionSyncStatus((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch("/api/brex/sync-to-transactions", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to sync to transactions");
      }

      setTransactionSyncStatus({
        loading: false,
        success: true,
        error: null,
        lastSync: new Date().toISOString(),
        stats: data.stats,
      });

      toast.success("Transactions synced successfully", {
        description: `Inserted: ${data.stats.inserted} transactions from matched transfers`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setTransactionSyncStatus({
        loading: false,
        success: false,
        error: errorMessage,
        lastSync: null,
        stats: null,
      });

      toast.error("Sync failed", {
        description: errorMessage,
      });
    }
  };

  const loadStatus = async () => {
    try {
      // Load vendor status
      const vendorResponse = await fetch("/api/brex/sync-vendors");
      const vendorData = await vendorResponse.json();
      if (vendorData.success) {
        setVendorStatus((prev) => ({
          ...prev,
          lastSync: vendorData.lastSync,
        }));
      }

      // Load transfer status
      const transferResponse = await fetch("/api/brex/sync-transfers");
      const transferData = await transferResponse.json();
      if (transferData.success) {
        setTransferStatus((prev) => ({
          ...prev,
          lastSync: transferData.lastSync,
        }));
      }
    } catch (error) {
      console.error("Error loading sync status:", error);
    }
  };

  const validateToken = async () => {
    try {
      const response = await fetch("/api/brex/validate-token");
      const data = await response.json();
      
      if (data.success) {
        setTokenValid(data.valid);
        setTokenError(data.error || null);
      } else {
        setTokenValid(false);
        setTokenError(data.error || "Failed to validate token");
      }
    } catch (error) {
      console.error("Error validating token:", error);
      setTokenValid(false);
      setTokenError("Failed to validate token");
    }
  };

  // Load status and validate token on mount
  useEffect(() => {
    loadStatus();
    validateToken();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Brex API Sync</CardTitle>
          <CardDescription>
            Manually sync vendors and transfers from Brex Payments API
          </CardDescription>
          {tokenValid === false && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {tokenError || "Brex API token is invalid or revoked. Please check your BREX_API_KEY environment variable."}
              </AlertDescription>
            </Alert>
          )}
          {tokenValid === true && (
            <Alert className="mt-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Brex API token is valid and ready to use.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vendor Sync */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Sync Vendors</h3>
                <p className="text-sm text-muted-foreground">
                  Fetch and update vendor data from Brex
                </p>
              </div>
              <Button
                onClick={syncVendors}
                disabled={vendorStatus.loading}
                variant="outline"
              >
                {vendorStatus.loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Vendors
                  </>
                )}
              </Button>
            </div>

            {vendorStatus.error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{vendorStatus.error}</AlertDescription>
              </Alert>
            )}

            {vendorStatus.success && vendorStatus.stats && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Synced {vendorStatus.stats.total} vendors. Inserted:{" "}
                  {vendorStatus.stats.inserted}, Updated:{" "}
                  {vendorStatus.stats.updated}
                  {vendorStatus.stats.errors > 0 &&
                    `, Errors: ${vendorStatus.stats.errors}`}
                </AlertDescription>
              </Alert>
            )}

            {vendorStatus.lastSync && (
              <p className="text-xs text-muted-foreground">
                Last synced: {new Date(vendorStatus.lastSync).toLocaleString()}
              </p>
            )}
          </div>

          {/* Transfer Sync */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Sync Transfers</h3>
                <p className="text-sm text-muted-foreground">
                  Fetch and update transfer data from Brex
                </p>
              </div>
              <Button
                onClick={syncTransfers}
                disabled={transferStatus.loading}
                variant="outline"
              >
                {transferStatus.loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Transfers
                  </>
                )}
              </Button>
            </div>

            {transferStatus.error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{transferStatus.error}</AlertDescription>
              </Alert>
            )}

            {transferStatus.success && transferStatus.stats && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Synced {transferStatus.stats.total} transfers. Inserted:{" "}
                  {transferStatus.stats.inserted}, Updated:{" "}
                  {transferStatus.stats.updated}
                  {transferStatus.stats.errors > 0 &&
                    `, Errors: ${transferStatus.stats.errors}`}
                </AlertDescription>
              </Alert>
            )}

            {transferStatus.lastSync && (
              <p className="text-xs text-muted-foreground">
                Last synced:{" "}
                {new Date(transferStatus.lastSync).toLocaleString()}
              </p>
            )}
          </div>

          {/* Sync to Transactions */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Sync to Transactions</h3>
                <p className="text-sm text-muted-foreground">
                  Copy matched transfers to bsi_transactions table
                </p>
              </div>
              <Button
                onClick={syncToTransactions}
                disabled={transactionSyncStatus.loading}
                variant="outline"
              >
                {transactionSyncStatus.loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync to Transactions
                  </>
                )}
              </Button>
            </div>

            {transactionSyncStatus.error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{transactionSyncStatus.error}</AlertDescription>
              </Alert>
            )}

            {transactionSyncStatus.success && transactionSyncStatus.stats && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Synced {transactionSyncStatus.stats.inserted} transactions
                  {transactionSyncStatus.stats.errors > 0 &&
                    `, Errors: ${transactionSyncStatus.stats.errors}`}
                </AlertDescription>
              </Alert>
            )}

            {transactionSyncStatus.lastSync && (
              <p className="text-xs text-muted-foreground">
                Last synced:{" "}
                {new Date(transactionSyncStatus.lastSync).toLocaleString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

