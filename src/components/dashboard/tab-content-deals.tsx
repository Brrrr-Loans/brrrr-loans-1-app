"use client";

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
import { Button } from "@/components/ui";
import { Eye } from "lucide-react";

const deals = [
  {
    id: "DEAL-001",
    name: "Oakwood Apartments",
    type: "Multi-Family",
    amount: "$1,200,000",
    status: "Active",
    roi: "12.5%",
    date: "2023-08-15",
  },
  {
    id: "DEAL-002",
    name: "Riverfront Plaza",
    type: "Commercial",
    amount: "$2,500,000",
    status: "Active",
    roi: "10.2%",
    date: "2023-10-22",
  },
  {
    id: "DEAL-003",
    name: "Sunset Heights",
    type: "Multi-Family",
    amount: "$850,000",
    status: "Active",
    roi: "11.8%",
    date: "2024-01-05",
  },
  {
    id: "DEAL-004",
    name: "Downtown Office Building",
    type: "Commercial",
    amount: "$3,200,000",
    status: "Active",
    roi: "9.7%",
    date: "2024-03-18",
  },
  {
    id: "DEAL-005",
    name: "Lakeside Villas",
    type: "Multi-Family",
    amount: "$1,750,000",
    status: "Pending",
    roi: "13.1%",
    date: "2024-04-30",
  },
];

export function RecentDeals() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Deals</CardTitle>
        <CardDescription>
          Overview of your most recent investment deals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>ROI</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => (
              <TableRow key={deal.id}>
                <TableCell className="font-medium">{deal.id}</TableCell>
                <TableCell>{deal.name}</TableCell>
                <TableCell>{deal.type}</TableCell>
                <TableCell>{deal.amount}</TableCell>
                <TableCell>{deal.roi}</TableCell>
                <TableCell>
                  <Badge
                    variant={deal.status === "Active" ? "default" : "secondary"}
                  >
                    {deal.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(deal.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View details</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
