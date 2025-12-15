"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createDistribution } from "@/app/actions/distributions";
import { Button } from "@/components/ui";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui";
import { Input } from "@/components/ui";
import { Textarea } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Calendar } from "@/components/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { useSupabase } from "@/hooks/use-supabase";
import { useUser } from "@/hooks/use-clerk-auth";
import { LoadingAuth } from "@/components/auth/loading-auth";

// Define the form schema with validation
const formSchema = z.object({
  dealId: z.string().min(1, "Please select a deal"),
  distributionType: z.string().min(1, "Please select a distribution type"),
  totalAmount: z.string().min(1, "Please enter a total amount"),
  distributionDate: z.date({
    required_error: "Please select a distribution date",
  }),
  status: z.string().default("Scheduled"),
  notes: z.string().optional(),
});

interface Investor {
  id: string;
  name: string;
  email: string;
  investment: number;
  percentage: number;
}

export function CreateDistributionForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deals, setDeals] = useState<{ id: string; name: string }[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [investorPayments, setInvestorPayments] = useState<
    { contactId: string; amount: string }[]
  >([]);
  const [totalAmount, setTotalAmount] = useState<string>("0");
  // const [isLoading, setIsLoading] = useState(true); // TODO: Consider showing loading state while fetching deals
  const router = useRouter();
  const { user } = useUser();
  const supabase = useSupabase();

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dealId: "",
      distributionType: "",
      totalAmount: "",
      status: "Scheduled",
      notes: "",
    },
  });

  // Watch for changes to dealId and totalAmount
  const watchDealId = form.watch("dealId");
  const watchTotalAmount = form.watch("totalAmount");

  // Fetch deals on component mount
  useEffect(() => {
    async function fetchDeals() {
      // setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("deal")
          .select("id, deal_name")
          .eq("deal_disposition_1", "active")
          .order("deal_name");

        if (error) {
          console.error("Supabase error:", error);
          throw new Error(error.message || "Unknown database error");
        }

        // Format the data to match expected interface
        const formattedDeals = (data || []).map((deal) => ({
          id: deal.id.toString(),
          name: deal.deal_name || `Deal ${deal.id}`,
        }));

        setDeals(formattedDeals);
      } catch (error) {
        console.error("Error fetching deals:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load deals";
        toast.error(errorMessage);
      } finally {
        // setIsLoading(false);
      }
    }

    fetchDeals();
  }, [supabase]);

  // Fetch investors when deal changes
  useEffect(() => {
    async function fetchInvestors() {
      if (!watchDealId) {
        setInvestors([]);
        setInvestorPayments([]);
        return;
      }

      try {
        // Get the user IDs from bsi_deals_clerk_users for this deal
        const { data: dealData, error: dealError } = await supabase
          .from("bsi_deals_clerk_users")
          .select("clerk_user_id")
          .eq("deal_id", Number(watchDealId))
          .not("clerk_user_id", "is", null);

        if (dealError) {
          console.error("Supabase error fetching deal users:", dealError);
          throw new Error(dealError.message || "Unknown database error");
        }

        if (!dealData || dealData.length === 0) {
          setInvestors([]);
          setInvestorPayments([]);
          return;
        }

        // Get the user IDs
        const userIds = dealData
          .map((item) => item.clerk_user_id)
          .filter((id): id is number => id !== null);

        if (userIds.length === 0) {
          setInvestors([]);
          setInvestorPayments([]);
          return;
        }

        // Then fetch the user details for those IDs
        const { data: usersData, error: usersError } = await supabase
          .from("auth_clerk_users")
          .select("id, full_name, email")
          .in("id", userIds);

        if (usersError) {
          console.error("Supabase error fetching users:", usersError);
          throw new Error(usersError.message || "Unknown database error");
        }

        // Format the data
        const formattedInvestors = (usersData || []).map((user) => ({
          id: user.id.toString(),
          name: user.full_name || "Unknown",
          email: user.email || "",
          investment: 0, // TODO: Get this from appropriate table
          percentage: 0, // TODO: Get this from appropriate table
        }));

        setInvestors(formattedInvestors);

        // Initialize investor payments
        const initialPayments = formattedInvestors.map((investor) => ({
          contactId: investor.id,
          amount: "0",
        }));
        setInvestorPayments(initialPayments);
      } catch (error) {
        console.error("Error fetching investors:", error);
        console.error("Deal ID:", watchDealId);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load investors for this deal";
        toast.error(errorMessage);
        // Reset state on error
        setInvestors([]);
        setInvestorPayments([]);
      }
    }

    fetchInvestors();
  }, [watchDealId, supabase]);

  // Update investor payment amounts when total amount changes
  useEffect(() => {
    if (!watchTotalAmount || investors.length === 0) return;

    // Parse the total amount (remove $ and commas)
    const parsedTotal =
      Number.parseFloat(watchTotalAmount.replace(/[$,]/g, "")) || 0;
    setTotalAmount(parsedTotal.toString());

    // Calculate each investor's share based on their percentage
    const updatedPayments = investors.map((investor) => {
      const amount = (parsedTotal * (investor.percentage / 100)).toFixed(2);
      return {
        contactId: investor.id,
        amount,
      };
    });

    setInvestorPayments(updatedPayments);
  }, [watchTotalAmount, investors]);

  // Update an individual investor's payment amount
  const updateInvestorPayment = (index: number, amount: string) => {
    const updatedPayments = [...investorPayments];
    updatedPayments[index] = {
      ...updatedPayments[index],
      amount,
    };
    setInvestorPayments(updatedPayments);

    // Recalculate total
    const newTotal = updatedPayments.reduce((sum, payment) => {
      return (
        sum + (Number.parseFloat(payment.amount.replace(/[$,]/g, "")) || 0)
      );
    }, 0);
    setTotalAmount(newTotal.toString());
    form.setValue("totalAmount", newTotal.toString());
  };

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Validate that we have investors
    if (investors.length === 0) {
      toast.error(
        "This deal has no investors. Please add investors to the deal first."
      );
      return;
    }

    // Validate that the total of investor payments matches the total amount
    const totalInvestorPayments = investorPayments.reduce((sum, payment) => {
      return (
        sum + (Number.parseFloat(payment.amount.replace(/[$,]/g, "")) || 0)
      );
    }, 0);

    const parsedTotalAmount =
      Number.parseFloat(values.totalAmount.replace(/[$,]/g, "")) || 0;

    if (Math.abs(totalInvestorPayments - parsedTotalAmount) > 0.01) {
      toast.error(
        "The sum of investor payments doesn't match the total amount"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the date to ISO string
      const formattedDate = values.distributionDate.toISOString().split("T")[0];

      // Create a FormData object
      const formData = new FormData();
      formData.append("dealId", values.dealId);
      formData.append("distributionType", values.distributionType);
      formData.append("totalAmount", values.totalAmount);
      formData.append("distributionDate", formattedDate);
      formData.append("status", values.status);
      formData.append("notes", values.notes || "");
      formData.append("investorPayments", JSON.stringify(investorPayments));

      // Submit the form
      await createDistribution(formData);

      // If we get here, the function succeeded (no error thrown)
      toast.success("Distribution created successfully");
      form.reset();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/balance-sheet/transactions`);
      }
    } catch (error) {
      console.error("Error creating distribution:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create distribution. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Format currency for display
  const formatCurrency = (value: string) => {
    const number = Number.parseFloat(value.replace(/[$,]/g, "")) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(number);
  };

  if (!user) {
    return <LoadingAuth />;
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="dealId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deal</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a deal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {deals.map((deal) => (
                        <SelectItem key={deal.id} value={deal.id}>
                          {deal.name}
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
              name="distributionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Distribution Type</FormLabel>
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
                      <SelectItem value="Monthly Interest">
                        Monthly Interest
                      </SelectItem>
                      <SelectItem value="Quarterly Dividend">
                        Quarterly Dividend
                      </SelectItem>
                      <SelectItem value="Annual Distribution">
                        Annual Distribution
                      </SelectItem>
                      <SelectItem value="Capital Return">
                        Capital Return
                      </SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Distribution Amount</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="$10,000"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Total amount to be distributed to all investors
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="distributionDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Distribution Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
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
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className="rounded-md border shadow-sm"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter any additional notes about this distribution"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {investors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Investor Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Investor</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Investment %</TableHead>
                      <TableHead>Payment Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investors.map((investor, index) => (
                      <TableRow key={investor.id}>
                        <TableCell>{investor.name}</TableCell>
                        <TableCell>{investor.email}</TableCell>
                        <TableCell>{investor.percentage}%</TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={investorPayments[index]?.amount || "0"}
                            onChange={(e) =>
                              updateInvestorPayment(index, e.target.value)
                            }
                            className="w-32"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 text-right">
                  <p className="text-sm text-muted-foreground">
                    Total: {formatCurrency(totalAmount)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || investors.length === 0}
            >
              {isSubmitting ? "Creating..." : "Create Distribution"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
