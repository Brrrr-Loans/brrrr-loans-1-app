"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Badge } from "@/components/ui/shadcn/badge";
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import { Building2, Plus, Check } from "lucide-react";
import { useSupabase } from "@/hooks/use-supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/shadcn/dialog";

interface BankAccount {
  id: number;
  bank_name: string;
  bank_code: string;
  account_name: string;
  account_number_last4: string | null;
  account_type: string | null;
  integration_type: string;
  is_active: boolean | null;
  // Additional fields from database that may be returned
  api_credentials?: unknown;
  created_at?: string | null;
  csv_column_mapping?: unknown;
  display_color?: string | null;
  routing_number?: string | null;
  updated_at?: string | null;
}

interface StepSelectBankProps {
  selectedBankId: number | null;
  onSelect: (id: number, code: string) => void;
}

export function StepSelectBank({ selectedBankId, onSelect }: StepSelectBankProps) {
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBank, setNewBank] = useState({
    bank_name: "",
    bank_code: "",
    account_name: "",
    account_number_last4: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = useSupabase();

  useEffect(() => {
    if (supabase) fetchBanks();
  }, [supabase]);

  const fetchBanks = async () => {
    if (!supabase) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("is_active", true)
      .order("bank_name");

    if (error) {
      console.error("Error fetching banks:", error);
    } else {
      setBanks(data || []);
      // Auto-select OFB if it exists and nothing is selected
      if (!selectedBankId) {
        const ofb = data?.find((b) => b.bank_code === "ofb");
        if (ofb) {
          onSelect(ofb.id, ofb.bank_code);
        }
      }
    }
    setIsLoading(false);
  };

  const handleAddBank = async () => {
    if (!supabase || !newBank.bank_name || !newBank.bank_code || !newBank.account_name) {
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await supabase
      .from("bank_accounts")
      .insert({
        bank_name: newBank.bank_name,
        bank_code: newBank.bank_code.toLowerCase().replace(/\s+/g, "_"),
        account_name: newBank.account_name,
        account_number_last4: newBank.account_number_last4 || null,
        integration_type: "csv",
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding bank:", error);
    } else if (data) {
      setBanks((prev) => [...prev, data]);
      onSelect(data.id, data.bank_code);
      setIsAddDialogOpen(false);
      setNewBank({ bank_name: "", bank_code: "", account_name: "", account_number_last4: "" });
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center text-muted-foreground">
        <p>Select the bank account you want to import transactions from</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banks.map((bank) => {
          const isSelected = bank.id === selectedBankId;
          const isCSV = bank.integration_type === "csv";

          return (
            <Card
              key={bank.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected
                  ? "border-primary ring-2 ring-primary/20"
                  : "hover:border-primary/50"
              }`}
              onClick={() => onSelect(bank.id, bank.bank_code)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">{bank.bank_name}</CardTitle>
                  </div>
                  {isSelected && (
                    <div className="rounded-full bg-primary p-1">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <CardDescription>{bank.account_name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={isCSV ? "secondary" : "default"}>
                    {isCSV ? "CSV Import" : "API"}
                  </Badge>
                  {bank.account_number_last4 && (
                    <span className="text-xs text-muted-foreground">
                      ****{bank.account_number_last4}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add New Bank Card */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer border-dashed hover:border-primary/50 hover:bg-muted/50 transition-all">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[120px] py-6">
                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Add New Bank</span>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Bank Account</DialogTitle>
              <DialogDescription>
                Add a new bank account for CSV imports
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  placeholder="e.g., Chase Bank"
                  value={newBank.bank_name}
                  onChange={(e) =>
                    setNewBank((prev) => ({ ...prev, bank_name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_code">Bank Code</Label>
                <Input
                  id="bank_code"
                  placeholder="e.g., chase"
                  value={newBank.bank_code}
                  onChange={(e) =>
                    setNewBank((prev) => ({ ...prev, bank_code: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  A short code used internally (lowercase, no spaces)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_name">Account Name</Label>
                <Input
                  id="account_name"
                  placeholder="e.g., Operating Account 1234"
                  value={newBank.account_name}
                  onChange={(e) =>
                    setNewBank((prev) => ({ ...prev, account_name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_number_last4">Last 4 Digits (Optional)</Label>
                <Input
                  id="account_number_last4"
                  placeholder="e.g., 1234"
                  maxLength={4}
                  value={newBank.account_number_last4}
                  onChange={(e) =>
                    setNewBank((prev) => ({
                      ...prev,
                      account_number_last4: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddBank}
                disabled={
                  isSubmitting ||
                  !newBank.bank_name ||
                  !newBank.bank_code ||
                  !newBank.account_name
                }
              >
                {isSubmitting ? "Adding..." : "Add Bank"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

