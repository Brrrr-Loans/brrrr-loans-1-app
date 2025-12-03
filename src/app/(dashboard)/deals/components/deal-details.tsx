"use client";

import { Button } from "@/components/ui";
import type { FC } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { Badge } from "@/components/ui";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { Building, MapPin, Users, Calendar, DollarSign } from "lucide-react";

// Mock data for the charts
const performanceData = [
  { month: "Jan", value: 10000 },
  { month: "Feb", value: 10200 },
  { month: "Mar", value: 10400 },
  { month: "Apr", value: 10600 },
  { month: "May", value: 10800 },
  { month: "Jun", value: 11000 },
  { month: "Jul", value: 11200 },
  { month: "Aug", value: 11400 },
];

const investorData = [
  { name: "Investor 1", amount: 250000 },
  { name: "Investor 2", amount: 200000 },
  { name: "Investor 3", amount: 150000 },
  { name: "Investor 4", amount: 125000 },
  { name: "Investor 5", amount: 100000 },
  { name: "Others", amount: 375000 },
];

// Mock data for distributions
const distributions = [
  {
    id: "DIST-001",
    amount: "$15,000",
    type: "Monthly Interest",
    date: "2024-04-15",
    status: "Completed",
  },
  {
    id: "DIST-002",
    amount: "$15,000",
    type: "Monthly Interest",
    date: "2024-03-15",
    status: "Completed",
  },
  {
    id: "DIST-003",
    amount: "$15,000",
    type: "Monthly Interest",
    date: "2024-02-15",
    status: "Completed",
  },
  {
    id: "DIST-004",
    amount: "$15,000",
    type: "Monthly Interest",
    date: "2024-05-15",
    status: "Processing",
  },
  {
    id: "DIST-005",
    amount: "$15,000",
    type: "Monthly Interest",
    date: "2024-06-15",
    status: "Scheduled",
  },
];

interface DealDetailsProps {
  deal: {
    name?: string;
    location?: string;
    type?: string;
    status?: string;
    amount?: string;
    roi?: string;
    date?: string;
    investors?: string;
    // Add more fields as needed
  };
}

export function DealDetails({ deal }: DealDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{deal.name}</CardTitle>
            <CardDescription className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" /> {deal.location}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Deal Type</p>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  <p className="font-medium">{deal.type}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant={deal.status === "Active" ? "default" : "secondary"}
                >
                  {deal.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Total Investment
                </p>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <p className="font-medium">{deal.amount}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">ROI</p>
                <p className="font-medium">{deal.roi}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Start Date</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <p className="font-medium">
                    {deal.date ? new Date(deal.date).toLocaleDateString() : "-"}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Investors</p>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <p className="font-medium">{deal.investors}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Monthly return on investment</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Value",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
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
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    name="Value"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="distributions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="distributions">Distributions</TabsTrigger>
          <TabsTrigger value="investors">Investors</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="distributions">
          <Card>
            <CardHeader>
              <CardTitle>Distribution History</CardTitle>
              <CardDescription>All payments made to investors</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
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
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="investors">
          <Card>
            <CardHeader>
              <CardTitle>Investor Breakdown</CardTitle>
              <CardDescription>Capital allocation by investor</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  amount: {
                    label: "Investment Amount",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={investorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
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
                      name="Investment Amount"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Deal Documents</CardTitle>
              <CardDescription>Legal and financial documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="font-medium">Offering Memorandum</p>
                      <p className="text-sm text-muted-foreground">
                        PDF • 2.4 MB • Uploaded on{" "}
                        {new Date("2023-08-10").toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="font-medium">Operating Agreement</p>
                      <p className="text-sm text-muted-foreground">
                        PDF • 1.8 MB • Uploaded on{" "}
                        {new Date("2023-08-10").toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="font-medium">Financial Projections</p>
                      <p className="text-sm text-muted-foreground">
                        XLSX • 0.9 MB • Uploaded on{" "}
                        {new Date("2023-08-12").toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const FileIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
};
