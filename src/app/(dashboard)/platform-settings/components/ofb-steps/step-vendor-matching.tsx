"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card";
import { Button } from "@/components/ui/forms/button";
import { Badge } from "@/components/ui/feedback/badge";
import { Skeleton } from "@/components/ui/feedback/skeleton";
import { Input } from "@/components/ui/forms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/data/table";
import { Check, Search, Users, AlertCircle, Sparkles, Link2 } from "lucide-react";
import { useSupabase } from "@/hooks/use-supabase";
import { toast } from "sonner";

interface Transfer {
  id: number;
  ofb_transfer_id: string;
  counterparty_name: string | null;
  amount: number;
  process_date: string | null;
  description: string | null;
}

interface Vendor {
  id: number;
  name: string;
  email: string | null;
}

interface StepVendorMatchingProps {
  transferIds: string[];
  onMatchComplete: (count: number) => void;
}

export function StepVendorMatching({
  transferIds,
  onMatchComplete,
}: StepVendorMatchingProps) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransfers, setSelectedTransfers] = useState<Set<string>>(new Set());
  const [bulkVendor, setBulkVendor] = useState<number | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);
  // Per-row vendor selection
  const [rowVendorSelections, setRowVendorSelections] = useState<Record<string, number | null>>({});
  const [matchingRows, setMatchingRows] = useState<Set<string>>(new Set());

  const supabase = useSupabase();

  const fetchData = useCallback(async () => {
    if (!supabase) return;
    setIsLoading(true);

    try {
      // Fetch all transfers
      const { data: allTransfers, error: transferError } = await supabase
        .from("api_ofb_transfers")
        .select("id, ofb_transfer_id, counterparty_name, amount, process_date, description")
        .order("process_date", { ascending: false });

      if (transferError) {
        console.error("Error fetching transfers:", transferError);
        toast.error("Failed to load transfers");
        setIsLoading(false);
        return;
      }

      // Fetch already matched transfer IDs
      const { data: matchedTransferIds, error: matchError } = await supabase
        .from("api_ofb_transfers_vendors")
        .select("ofb_transfer_id")
        .is("deleted_at", null);

      if (matchError) {
        console.error("Error fetching matched transfers:", matchError);
      }

      const matchedSet = new Set(matchedTransferIds?.map((m) => m.ofb_transfer_id) || []);
      const unmatchedTransfers = (allTransfers || []).filter(
        (t) => !matchedSet.has(t.ofb_transfer_id)
      );

      setTransfers(unmatchedTransfers);

      // Fetch vendors
      const { data: vendorData, error: vendorError } = await supabase
        .from("api_ofb_vendors")
        .select("id, name, email")
        .order("name");

      if (vendorError) {
        console.error("Error fetching vendors:", vendorError);
        toast.error("Failed to load vendors");
      }

      setVendors(vendorData || []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (supabase) fetchData();
  }, [supabase, fetchData]);

  const filteredTransfers = transfers.filter((t) => {
    const query = searchQuery.toLowerCase();
    return (
      t.counterparty_name?.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query) ||
      t.ofb_transfer_id.toLowerCase().includes(query)
    );
  });

  const handleSelectAll = () => {
    if (selectedTransfers.size === filteredTransfers.length) {
      setSelectedTransfers(new Set());
    } else {
      setSelectedTransfers(new Set(filteredTransfers.map((t) => t.ofb_transfer_id)));
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

  // Handle per-row vendor selection
  const handleRowVendorChange = (transferId: string, vendorId: number | null) => {
    setRowVendorSelections(prev => ({
      ...prev,
      [transferId]: vendorId
    }));
  };

  // Match a single transfer to a vendor
  const handleSingleMatch = async (transferId: string, vendorId: number) => {
    if (!supabase) return;

    setMatchingRows(prev => new Set(prev).add(transferId));

    try {
      const { error } = await supabase
        .from("api_ofb_transfers_vendors")
        .insert({
          ofb_transfer_id: transferId,
          ofb_vendor_id: vendorId,
          match_method: "manual",
        });

      if (error) {
        console.error("Match error:", error);
        toast.error(`Failed to match: ${error.message}`);
        return;
      }

      toast.success("Transfer matched to vendor");
      setMatchedCount((prev) => prev + 1);
      onMatchComplete(matchedCount + 1);

      // Remove from local state and clear selection
      setTransfers(prev => prev.filter(t => t.ofb_transfer_id !== transferId));
      setRowVendorSelections(prev => {
        const next = { ...prev };
        delete next[transferId];
        return next;
      });
    } catch (error) {
      console.error("Match error:", error);
      toast.error("Failed to match transfer");
    } finally {
      setMatchingRows(prev => {
        const next = new Set(prev);
        next.delete(transferId);
        return next;
      });
    }
  };

  // Bulk match selected transfers
  const handleBulkMatch = async () => {
    if (!supabase || !bulkVendor || selectedTransfers.size === 0) {
      toast.error("Please select a vendor and at least one transfer");
      return;
    }

    setIsMatching(true);

    try {
      const matchRecords = Array.from(selectedTransfers).map((transferId) => ({
        ofb_transfer_id: transferId,
        ofb_vendor_id: bulkVendor,
        match_method: "manual",
      }));

      const { error } = await supabase
        .from("api_ofb_transfers_vendors")
        .insert(matchRecords);

      if (error) {
        console.error("Bulk match error:", error);
        toast.error(`Failed to match: ${error.message}`);
        return;
      }

      toast.success(`Matched ${selectedTransfers.size} transfers to vendor`);
      const newCount = matchedCount + selectedTransfers.size;
      setMatchedCount(newCount);
      onMatchComplete(newCount);

      // Refresh data
      setSelectedTransfers(new Set());
      setBulkVendor(null);
      await fetchData();
    } catch (error) {
      console.error("Bulk match error:", error);
      toast.error("Failed to match transfers");
    } finally {
      setIsMatching(false);
    }
  };

  const suggestVendor = (counterpartyName: string | null): Vendor | null => {
    if (!counterpartyName || vendors.length === 0) return null;
    
    const nameLower = counterpartyName.toLowerCase();
    const match = vendors.find((v) => 
      v.name.toLowerCase().includes(nameLower) ||
      nameLower.includes(v.name.toLowerCase())
    );
    return match || null;
  };

  const formatAmount = (amount: number) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));
    return amount < 0 ? `-${formatted}` : formatted;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">All Transfers Matched!</h3>
              <p className="text-muted-foreground">
                All imported transfers have been matched to vendors.
                {matchedCount > 0 && ` ${matchedCount} matched this session.`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{transfers.length} unmatched</Badge>
          {matchedCount > 0 && (
            <Badge variant="default">{matchedCount} matched this session</Badge>
          )}
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transfers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Bulk match controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Bulk Match Selected Transfers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select
                value={bulkVendor?.toString() || ""}
                onValueChange={(v) => setBulkVendor(v ? parseInt(v) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a vendor..." />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.name}
                      {vendor.email && (
                        <span className="text-muted-foreground ml-2">
                          ({vendor.email})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleBulkMatch}
              disabled={selectedTransfers.size === 0 || !bulkVendor || isMatching}
            >
              {isMatching ? "Matching..." : `Match ${selectedTransfers.size} Transfer(s)`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transfers table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedTransfers.size === filteredTransfers.length && filteredTransfers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Counterparty</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[250px]">Match to Vendor</TableHead>
              <TableHead className="w-20">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransfers.slice(0, 50).map((transfer) => {
              const suggestedVendor = suggestVendor(transfer.counterparty_name);
              const selectedVendorId = rowVendorSelections[transfer.ofb_transfer_id];
              const isRowMatching = matchingRows.has(transfer.ofb_transfer_id);
              
              return (
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
                  <TableCell className="font-medium">
                    {transfer.counterparty_name || "—"}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {transfer.description || "—"}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {formatAmount(transfer.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedVendorId?.toString() || ""}
                        onValueChange={(v) => handleRowVendorChange(transfer.ofb_transfer_id, v ? parseInt(v) : null)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select vendor..." />
                        </SelectTrigger>
                        <SelectContent>
                          {vendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id.toString()}>
                              {vendor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {suggestedVendor && !selectedVendorId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs shrink-0"
                          onClick={() => handleRowVendorChange(transfer.ofb_transfer_id, suggestedVendor.id)}
                          title={`Suggested: ${suggestedVendor.name}`}
                        >
                          <Sparkles className="h-3 w-3 text-yellow-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      disabled={!selectedVendorId || isRowMatching}
                      onClick={() => selectedVendorId && handleSingleMatch(transfer.ofb_transfer_id, selectedVendorId)}
                    >
                      {isRowMatching ? (
                        "..."
                      ) : (
                        <>
                          <Link2 className="h-3 w-3 mr-1" />
                          Match
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filteredTransfers.length > 50 && (
          <div className="bg-muted/50 px-4 py-2 text-center text-sm text-muted-foreground">
            Showing 50 of {filteredTransfers.length} transfers
          </div>
        )}
      </div>

      {vendors.length === 0 && (
        <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-800 dark:text-yellow-200">
          <AlertCircle className="h-5 w-5" />
          <span>No vendors found. Add vendors in the OFB vendors table first.</span>
        </div>
      )}
    </div>
  );
}
