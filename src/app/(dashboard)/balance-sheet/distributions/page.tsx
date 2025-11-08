"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlays/dialog";
import { Download, Plus } from "lucide-react";
import { InvestorSummaryWidget } from "@/components/distributions/widget-bsi-payouts-1";
import { InvestorDealsWidget } from "@/components/distributions/widget-bsi-insights-1";
import { CreateDistributionForm } from "@/components/distributions/form-create-distribution";
import { useDistributions } from "@/hooks/use-distributions";
import { useInvestorSummary } from "@/hooks/use-investor-summary";

export default function DistributionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Use custom hooks to fetch data
  const { summary, loading: summaryLoading } = useInvestorSummary();
  const { distributions: rawDistributions, loading: distributionsLoading } =
    useDistributions({
      status: selectedTab !== "all" ? selectedTab : undefined,
      type: selectedType !== "all" ? selectedType : undefined,
      search: searchTerm || undefined,
    });

  // The API returns: (Tables<"bsi_distributions"> & { deal: Pick<Tables<"deal">, "deal_name"> })[]
  // Map to a UI-friendly shape
  const distributions: Array<{
    id: string;
    dealName: string;
    type: string;
    amount: string;
    date: string;
    status: string;
    raw: unknown;
  }> = (rawDistributions || []).map((d) => {
    const dealName =
      (d as { deal?: { deal_name?: string } | null } | null)?.deal?.deal_name ??
      "";
    return {
      id: d.id.toString(),
      dealName,
      type: "", // Add mapping if you have a type field
      amount: d.deposit_amount?.toString() ?? "",
      date: d.created_at ?? "",
      status: "", // Add mapping if you have a status field
      raw: d,
    };
  });

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Distribution
          </Button>
        </div>
      </div>

      {/* Add the Investor Summary Widget with 3-column grid */}
      {summaryLoading ? (
        <div className="h-[200px] flex items-center justify-center">
          Loading summary data...
        </div>
      ) : summary ? (
        <InvestorSummaryWidget
          totalOutstandingBalance={summary.totalOutstandingBalance}
          totalDistributionsPaid={summary.totalDistributionsPaid}
          nextDistributionDate={summary.nextDistributionDate || ""}
          nextDistributionAmount={summary.nextDistributionAmount}
          fourthColumnComponent={<InvestorDealsWidget />}
        />
      ) : (
        <div className="h-[200px] flex items-center justify-center">
          Error loading summary data
        </div>
      )}

      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Distributions</TabsTrigger>
            <TabsTrigger value="Completed">Completed</TabsTrigger>
            <TabsTrigger value="Processing">Processing</TabsTrigger>
            <TabsTrigger value="Scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="On Hold">On Hold</TabsTrigger>
            <TabsTrigger value="Canceled or Failed">
              Canceled or Failed
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search distributions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[250px]"
            />
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Monthly Interest">
                  Monthly Interest
                </SelectItem>
                <SelectItem value="Quarterly Dividend">
                  Quarterly Dividend
                </SelectItem>
                <SelectItem value="Annual Distribution">
                  Annual Distribution
                </SelectItem>
                <SelectItem value="Capital Return">Capital Return</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <TabsContent value={selectedTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedTab === "all"
                  ? "All Distributions"
                  : `${selectedTab} Distributions`}
              </CardTitle>
              <CardDescription>
                View and manage distribution payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {distributionsLoading ? (
                <div className="flex justify-center py-8">
                  Loading distributions...
                </div>
              ) : distributions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    No distributions found
                  </p>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create a Distribution
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Deal</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distributions.map((distribution) => (
                      <TableRow key={distribution.id}>
                        <TableCell className="font-medium">
                          {distribution.id}
                        </TableCell>
                        <TableCell>{distribution.dealName}</TableCell>
                        <TableCell>{distribution.type}</TableCell>
                        <TableCell>{distribution.amount}</TableCell>
                        <TableCell>
                          {new Date(distribution.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              distribution.status === "Processing"
                                ? "secondary"
                                : distribution.status === "Scheduled"
                                  ? "outline"
                                  : "default"
                            }
                          >
                            {distribution.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Distribution Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Distribution</DialogTitle>
            <DialogDescription>
              Enter the details for the new investor distribution
            </DialogDescription>
          </DialogHeader>
          <CreateDistributionForm
            onSuccess={() => {
              setIsCreateModalOpen(false);
              // Optionally refresh data here
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
