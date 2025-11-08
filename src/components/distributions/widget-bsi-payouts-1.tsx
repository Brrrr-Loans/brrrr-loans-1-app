"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  BarChart,
} from "recharts";
import { DollarSign, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { DealNoticesWidget } from "./widget-bsi-deals-1";
import { LoanFilesTable } from "./table-loan-files";

// Sample data - in a real app, this would come from your Supabase database
const monthlyDistributionData = [
  { month: "Jan", amount: 15000 },
  { month: "Feb", amount: 15000 },
  { month: "Mar", amount: 15000 },
  { month: "Apr", amount: 21250 },
  { month: "May", amount: 21250 },
  { month: "Jun", amount: 21250 },
  { month: "Jul", amount: 21250 },
  { month: "Aug", amount: 21250 },
];

// const quarterlyDistributionData = [
//   { quarter: "Q1", amount: 45000 },
//   { quarter: "Q2", amount: 63750 },
//   { quarter: "Q3", amount: 42500 },
// ];

const yearlyDistributionData = [
  { year: "2022", amount: 120000 },
  { year: "2023", amount: 150000 },
  { year: "2024", amount: 151250 },
];

interface InvestorSummaryWidgetProps {
  totalOutstandingBalance: number;
  totalDistributionsPaid: number;
  nextDistributionDate: string;
  nextDistributionAmount: number;
  fourthColumnComponent?: React.ReactNode;
}

export function InvestorSummaryWidget({
  totalOutstandingBalance = 1200000,
  totalDistributionsPaid = 151250,
  nextDistributionDate = "2024-05-15",
  nextDistributionAmount = 15000,
  fourthColumnComponent,
}: InvestorSummaryWidgetProps) {
  const [timeFilter, setTimeFilter] = useState("6m"); // Default to 6 months

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get filtered distribution data based on time period
  const getFilteredDistributionTotal = () => {
    switch (timeFilter) {
      case "3m":
        return monthlyDistributionData
          .slice(-3)
          .reduce((sum, item) => sum + item.amount, 0);
      case "6m":
        return monthlyDistributionData
          .slice(-6)
          .reduce((sum, item) => sum + item.amount, 0);
      case "1y":
        return monthlyDistributionData.reduce(
          (sum, item) => sum + item.amount,
          0
        );
      case "all":
      default:
        return totalDistributionsPaid;
    }
  };

  // Get chart data based on time period
  const getChartData = () => {
    switch (timeFilter) {
      case "3m":
      case "6m":
        const sliceCount = timeFilter === "3m" ? 3 : 6;
        return monthlyDistributionData.slice(-sliceCount);
      case "1y":
        return monthlyDistributionData;
      case "all":
      default:
        return yearlyDistributionData;
    }
  };

  // Get x-axis data key based on time period
  const getDataKey = () => {
    switch (timeFilter) {
      case "3m":
      case "6m":
      case "1y":
        return "month";
      case "all":
      default:
        return "year";
    }
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        {/* Widget 1: Total Outstanding Balance */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Total Outstanding Balance</CardTitle>
            <CardDescription>
              Total unpaid principal owed to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold">
                  {formatCurrency(totalOutstandingBalance)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Across all active investments
                </p>
              </div>
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Next Distribution:</span>
                <span className="font-medium">
                  {new Date(nextDistributionDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Amount:</span>
                <span className="font-medium">
                  {formatCurrency(nextDistributionAmount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widget 2: Total Distributions Paid with Time Filter */}
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Total Distributions Paid</CardTitle>
              <CardDescription>
                Total payments received over time
              </CardDescription>
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-4xl font-bold">
                  {formatCurrency(getFilteredDistributionTotal())}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {timeFilter === "all"
                    ? "Total distributions received"
                    : `Distributions in selected period`}
                </p>
              </div>
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="w-full aspect-video">
              <ChartContainer
                config={{
                  amount: {
                    label: "Distribution Amount",
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getChartData()}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={getDataKey()} />
                    <YAxis
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("en-US", {
                          notation: "compact",
                          compactDisplay: "short",
                          style: "currency",
                          currency: "USD",
                        }).format(value)
                      }
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="amount"
                      fill="var(--color-amount)"
                      name="Distribution Amount"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Widget 3: Deal Notices Widget */}
        <div className="md:col-span-1">
          <DealNoticesWidget />
        </div>

        {/* Widget 4: Fourth column component (active investments widget) */}
        {fourthColumnComponent && (
          <div className="md:col-span-1">{fourthColumnComponent}</div>
        )}
      </div>

      {/* New Loan Files Table Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Active Loan Files</CardTitle>
            <CardDescription>
              Current loan files with assigned team members and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoanFilesTable />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
