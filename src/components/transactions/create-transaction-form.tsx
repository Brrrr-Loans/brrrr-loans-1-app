"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSupabase } from "@/hooks/use-supabase";
import { createMultiPartyTransaction } from "@/lib/transaction-document-helpers";
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui";

// Schema for the form
const transactionSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  date: z.date({
    required_error: "Transaction date is required",
  }),
  method: z.enum(["wire", "ach", "check", "cash", "internal", "other"]),
  type: z.enum(["contribution", "redemption", "interest", "fee"]),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  dealAllocations: z
    .array(
      z.object({
        dealId: z.string().min(1, "Deal is required"),
        amount: z
          .string()
          .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: "Amount must be positive",
          }),
      })
    )
    .min(1, "At least one deal allocation is required"),
  investorAllocations: z
    .array(
      z.object({
        investorId: z.string().min(1, "Investor is required"),
        amount: z
          .string()
          .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: "Amount must be positive",
          }),
      })
    )
    .min(1, "At least one investor allocation is required"),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface Deal {
  id: number;
  deal_name: string;
  loan_number: string;
}

interface Investor {
  id: number;
  full_name: string;
  email: string;
  clerk_org_id?: number;
}

interface CreateTransactionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateTransactionForm({
  onSuccess,
  onCancel,
}: CreateTransactionFormProps) {
  const supabase = useSupabase();
  const [loading, setLoading] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [allocationError, setAllocationError] = useState<string | null>(null);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: "",
      date: new Date(),
      method: "wire",
      type: "interest",
      referenceNumber: "",
      notes: "",
      dealAllocations: [{ dealId: "", amount: "" }],
      investorAllocations: [{ investorId: "", amount: "" }],
    },
  });

  const {
    fields: dealFields,
    append: appendDeal,
    remove: removeDeal,
  } = useFieldArray({
    control: form.control,
    name: "dealAllocations",
  });

  const {
    fields: investorFields,
    append: appendInvestor,
    remove: removeInvestor,
  } = useFieldArray({
    control: form.control,
    name: "investorAllocations",
  });

  // Fetch deals and investors
  useEffect(() => {
    if (!supabase) return;

    const fetchData = async () => {
      // Fetch deals
      const { data: dealsData } = await supabase
        .from("deal")
        .select("id, deal_name, loan_number")
        .order("deal_name");

      if (dealsData) {
        setDeals(dealsData as any);
      }

      // Fetch investors (users with BSI role)
      const { data: investorsData } = await supabase
        .from("auth_clerk_users")
        .select("id, full_name, email")
        .in("role", ["balance_sheet_investor", "admin"])
        .order("full_name");

      if (investorsData) {
        setInvestors(investorsData as any);
      }
    };

    fetchData();
  }, [supabase]);

  // Validate allocations sum
  const validateAllocations = () => {
    const totalAmount = parseFloat(form.getValues("amount") || "0");

    const dealSum = form
      .getValues("dealAllocations")
      .reduce((sum, alloc) => sum + parseFloat(alloc.amount || "0"), 0);

    const investorSum = form
      .getValues("investorAllocations")
      .reduce((sum, alloc) => sum + parseFloat(alloc.amount || "0"), 0);

    if (Math.abs(dealSum - totalAmount) > 0.01) {
      setAllocationError(
        `Deal allocations sum ($${dealSum.toFixed(2)}) must equal transaction amount ($${totalAmount.toFixed(2)})`
      );
      return false;
    }

    if (Math.abs(investorSum - totalAmount) > 0.01) {
      setAllocationError(
        `Investor allocations sum ($${investorSum.toFixed(2)}) must equal transaction amount ($${totalAmount.toFixed(2)})`
      );
      return false;
    }

    setAllocationError(null);
    return true;
  };

  const onSubmit = async (values: TransactionFormValues) => {
    if (!supabase) return;

    // Validate allocations before submission
    if (!validateAllocations()) {
      return;
    }

    setLoading(true);
    try {
      // Convert string amounts to numbers
      const transaction = {
        amount: parseFloat(values.amount),
        date: values.date.toISOString(),
        method: values.method,
        type: values.type,
        notes: values.notes,
        referenceNumber: values.referenceNumber,
      };

      const dealAllocations = values.dealAllocations.map((alloc) => ({
        dealId: parseInt(alloc.dealId),
        amount: parseFloat(alloc.amount),
      }));

      const investorAllocations = values.investorAllocations.map((alloc) => {
        const investor = investors.find(
          (inv) => inv.id === parseInt(alloc.investorId)
        );
        return {
          investorId: parseInt(alloc.investorId),
          amount: parseFloat(alloc.amount),
          orgId: investor?.clerk_org_id,
        };
      });

      await createMultiPartyTransaction(
        supabase as any,
        transaction,
        dealAllocations,
        investorAllocations
      );

      toast({
        title: "Transaction created",
        description: "The transaction has been created successfully.",
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create the transaction.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Transaction</CardTitle>
        <CardDescription>
          Create a new transaction with allocations to multiple deals and
          investors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          validateAllocations();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="wire">Wire Transfer</SelectItem>
                        <SelectItem value="ach">ACH</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="internal">
                          Internal Transfer
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="contribution">
                          Contribution
                        </SelectItem>
                        <SelectItem value="redemption">Redemption</SelectItem>
                        <SelectItem value="interest">
                          Interest Payment
                        </SelectItem>
                        <SelectItem value="fee">Fee</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Wire confirmation, check number, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional reference number for tracking
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deal Allocations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Deal Allocations</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendDeal({ dealId: "", amount: "" })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Deal
                </Button>
              </div>

              {dealFields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start">
                  <FormField
                    control={form.control}
                    name={`dealAllocations.${index}.dealId`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Deal</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select deal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {deals.map((deal) => (
                              <SelectItem
                                key={deal.id}
                                value={deal.id.toString()}
                              >
                                {deal.deal_name} ({deal.loan_number})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`dealAllocations.${index}.amount`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              validateAllocations();
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {dealFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-8"
                      onClick={() => removeDeal(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Investor Allocations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Investor Allocations</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendInvestor({ investorId: "", amount: "" })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Investor
                </Button>
              </div>

              {investorFields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start">
                  <FormField
                    control={form.control}
                    name={`investorAllocations.${index}.investorId`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Investor</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select investor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {investors.map((investor) => (
                              <SelectItem
                                key={investor.id}
                                value={investor.id.toString()}
                              >
                                {investor.full_name} ({investor.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`investorAllocations.${index}.amount`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              validateAllocations();
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {investorFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-8"
                      onClick={() => removeInvestor(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {allocationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{allocationError}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this transaction"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Transaction"}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
