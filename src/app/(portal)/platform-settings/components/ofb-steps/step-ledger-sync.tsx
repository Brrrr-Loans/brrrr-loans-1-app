"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/layout/card";
import { Button } from "@/components/ui/forms/button";
import { Badge } from "@/components/ui/feedback/badge";
import { Skeleton } from "@/components/ui/feedback/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/data/table";
import {
  Check,
  AlertCircle,
  ArrowRight,
  Banknote,
  Loader2,
  PartyPopper,
  RefreshCw,
  Building2,
  User,
} from "lucide-react";
import { useSupabaseWithRefresh } from "@/hooks/use-supabase";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface Transfer {
  id: number;
  ofb_transfer_id: string;
  counterparty_name: string | null;
  amount: number | null;
  process_date: string | null;
  description: string | null;
  vendor_name: string | null;
  org_name: string | null;
  org_id: number | null;
  user_name: string | null;
  user_id: number | null;
  already_synced: boolean;
}

interface StepLedgerSyncProps {
  transferIds: string[];
  onSyncComplete: (count: number) => void;
  onReset: () => void;
}

export function StepLedgerSync({
  transferIds,
  onSyncComplete,
  onReset,
}: StepLedgerSyncProps) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    synced: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const [selectedTransfers, setSelectedTransfers] = useState<Set<string>>(new Set());

  const { client: supabase, refreshToken } = useSupabaseWithRefresh();

  useEffect(() => {
    if (supabase) fetchData();
  }, [supabase]);

  const fetchData = async () => {
    if (!supabase) return;
    setIsLoading(true);

    // Fetch matched transfers with vendor and org info
    const { data: transferData } = await supabase
      .from("api_ofb_transfers")
      .select(`
        id,
        ofb_transfer_id,
        counterparty_name,
        amount,
        process_date,
        description
      `)
      .order("process_date", { ascending: false });

    // Get vendor matches
    const { data: vendorMatches } = await supabase
      .from("api_ofb_transfers_vendors")
      .select(`
        ofb_transfer_id,
        ofb_vendor_id,
        api_ofb_vendors(name)
      `)
      .is("deleted_at", null);

    // Get org links
    const { data: orgLinks } = await supabase
      .from("api_ofb_vendors_clerk_orgs")
      .select("ofb_vendor_id, clerk_org_id, auth_clerk_orgs(clerk_org_name)");

    // Get user links
    const { data: userLinks } = await supabase
      .from("api_ofb_vendors_clerk_users")
      .select("ofb_vendor_id, clerk_user_id, auth_clerk_users(full_name)");

    // Get already synced transfers
    const { data: syncedTransfers } = await supabase
      .from("bsi_transactions_api_ofb_transfers")
      .select("ofb_transfer_id");

    const syncedSet = new Set(syncedTransfers?.map((s) => s.ofb_transfer_id) || []);

    // Merge data
    const enrichedTransfers = (transferData || []).map((t) => {
      const vendorMatch = vendorMatches?.find((v) => v.ofb_transfer_id === t.ofb_transfer_id);
      const vendorName = (vendorMatch?.api_ofb_vendors as any)?.name || null;
      
      let orgName = null;
      let orgId = null;
      let userName = null;
      let userId = null;
      
      if (vendorMatch?.ofb_vendor_id) {
        const orgLink = orgLinks?.find((o) => o.ofb_vendor_id === vendorMatch.ofb_vendor_id);
        orgName = (orgLink?.auth_clerk_orgs as any)?.clerk_org_name || null;
        orgId = orgLink?.clerk_org_id || null;
        
        const userLink = userLinks?.find((u) => u.ofb_vendor_id === vendorMatch.ofb_vendor_id);
        userName = (userLink?.auth_clerk_users as any)?.full_name || null;
        userId = userLink?.clerk_user_id || null;
      }

      return {
        ...t,
        vendor_name: vendorName,
        org_name: orgName,
        org_id: orgId,
        user_name: userName,
        user_id: userId,
        already_synced: syncedSet.has(t.ofb_transfer_id),
      };
    });

    // Filter to only show transfers that are matched and have org OR user links
    const readyToSync = enrichedTransfers.filter(
      (t) => t.vendor_name && (t.org_id || t.user_id) && !t.already_synced
    );

    setTransfers(readyToSync);
    setSelectedTransfers(new Set(readyToSync.map((t) => t.ofb_transfer_id)));
    setIsLoading(false);
  };

  const handleSelectAll = () => {
    if (selectedTransfers.size === transfers.length) {
      setSelectedTransfers(new Set());
    } else {
      setSelectedTransfers(new Set(transfers.map((t) => t.ofb_transfer_id)));
    }
  };

  const handleSelectTransfer = (transferId: string) => {
    setSelectedTransfers((prev) => {
      const next = new Set(prev);
      if (next.has(transferId)) {
        next.delete(transferId);
      } else {
        next.add(transferId);
      }
      return next;
    });
  };

  const handleSync = async () => {
    if (!supabase || selectedTransfers.size === 0) {
      toast.error("No transfers selected");
      return;
    }

    setIsSyncing(true);
    const errors: string[] = [];
    let synced = 0;
    let alreadySynced = 0;
    let failed = 0;

    try {
      // Force refresh the JWT token before syncing to prevent "JWT expired" errors
      const freshClient = await refreshToken();
      if (!freshClient) {
        toast.error("Failed to refresh authentication. Please try again.");
        setIsSyncing(false);
        return;
      }

      const selectedTransferData = transfers.filter((t) =>
        selectedTransfers.has(t.ofb_transfer_id)
      );

      for (const transfer of selectedTransferData) {
        try {
          // Double-check: verify this transfer hasn't already been synced
          // (prevents duplicates if user retries or if data is stale)
          const { data: existingLink } = await freshClient
            .from("bsi_transactions_api_ofb_transfers")
            .select("id")
            .eq("ofb_transfer_id", transfer.ofb_transfer_id)
            .maybeSingle();

          if (existingLink) {
            // Already synced - skip silently
            alreadySynced++;
            continue;
          }

          // Determine ledger entry type based on amount
          // Negative = money going out (could be contribution from their perspective)
          // Positive = money coming in (distribution)
          const amount = transfer.amount ?? 0;
          const ledgerEntryType = amount < 0 ? "contribution" : "distribution";

          // Create BSI transaction - link to org OR user
          // Use freshClient to ensure we have a valid JWT
          const { data: txn, error: txnError } = await freshClient
            .from("bsi_transactions")
            .insert({
              transaction_amount: Math.abs(amount),
              transaction_date: transfer.process_date,
              transaction_method: "wire",
              transaction_status: "completed",
              ledger_entry_type: ledgerEntryType,
              external_memo: transfer.description,
              clerk_org_id: transfer.org_id, // Will be null if linked via user
              clerk_user_id: transfer.user_id, // Will be null if linked via org
            })
            .select("id")
            .single();

          if (txnError) throw txnError;

          // Create link record
          const { error: linkError } = await freshClient
            .from("bsi_transactions_api_ofb_transfers")
            .insert({
              transaction_id: txn.id,
              ofb_transfer_id: transfer.ofb_transfer_id,
            });

          if (linkError) throw linkError;

          synced++;
        } catch (error: any) {
          console.error("Sync error for transfer:", transfer.ofb_transfer_id, error);
          errors.push(`${transfer.counterparty_name}: ${error.message}`);
          failed++;
        }
      }

      setSyncResult({ synced, skipped: alreadySynced + failed, errors });
      setSyncComplete(true);
      onSyncComplete(synced);

      if (synced > 0 && errors.length === 0) {
        // Celebrate! 🎉
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        if (alreadySynced > 0) {
          toast.success(`Synced ${synced} transactions! (${alreadySynced} already synced)`);
        } else {
          toast.success(`Successfully synced ${synced} transactions to ledger!`);
        }
      } else if (synced > 0) {
        toast.warning(`Synced ${synced} transactions with ${failed} errors`);
      } else if (alreadySynced > 0 && failed === 0) {
        toast.info(`All ${alreadySynced} transactions were already synced`);
      } else {
        toast.error(`Failed to sync transactions (${failed} errors)`);
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to sync transactions");
    } finally {
      setIsSyncing(false);
    }
  };

  const formatAmount = (amount: number | null) => {
    const value = amount ?? 0;
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(value));
    return value < 0 ? `-${formatted}` : `+${formatted}`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString();
  };

  const totalAmount = transfers
    .filter((t) => selectedTransfers.has(t.ofb_transfer_id))
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (syncComplete) {
    return (
      <Card className="border-green-500">
        <CardContent className="py-12 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-6">
              <PartyPopper className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-2xl mb-2">Import Complete!</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your bank transactions have been imported and synced to the ledger.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-8 py-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{syncResult?.synced || 0}</p>
                <p className="text-sm text-muted-foreground">Synced</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{syncResult?.skipped || 0}</p>
                <p className="text-sm text-muted-foreground">Skipped</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{syncResult?.errors.length || 0}</p>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={onReset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Start New Import
              </Button>
              <Button onClick={() => window.location.href = "/balance-sheet/transactions"}>
                View Transactions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transfers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-4">
              <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">No Transfers Ready to Sync</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Transfers must be matched to a vendor and the vendor must be linked 
                to a Clerk organization or individual user before syncing to the ledger.
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Ready to Sync
          </CardTitle>
          <CardDescription>
            These transfers are matched and linked to organizations or individual users. 
            They will be created as BSI transactions in the ledger.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline">{selectedTransfers.size} selected</Badge>
              <span className="text-sm text-muted-foreground">
                Net amount:{" "}
                <span className={totalAmount >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatAmount(totalAmount)}
                </span>
              </span>
            </div>
            <Button onClick={handleSync} disabled={isSyncing || selectedTransfers.size === 0}>
              {isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  Sync {selectedTransfers.size} to Ledger
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedTransfers.size === transfers.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Counterparty</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Linked To</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer) => (
                  <TableRow key={transfer.ofb_transfer_id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedTransfers.has(transfer.ofb_transfer_id)}
                        onChange={() => handleSelectTransfer(transfer.ofb_transfer_id)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(transfer.process_date)}
                    </TableCell>
                    <TableCell>{transfer.counterparty_name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {transfer.vendor_name}
                    </TableCell>
                    <TableCell>
                      {transfer.org_id ? (
                        <Badge variant="outline" className="gap-1">
                          <Building2 className="h-3 w-3" />
                          {transfer.org_name}
                        </Badge>
                      ) : transfer.user_id ? (
                        <Badge variant="secondary" className="gap-1">
                          <User className="h-3 w-3" />
                          {transfer.user_name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {formatAmount(transfer.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={(transfer.amount ?? 0) < 0 ? "secondary" : "default"}>
                        {(transfer.amount ?? 0) < 0 ? "Contribution" : "Distribution"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

