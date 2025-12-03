"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui"
import { Badge } from "@/components/ui"

const distributions = [
  {
    id: "DIST-001",
    dealId: "DEAL-001",
    dealName: "Oakwood Apartments",
    amount: "$15,000",
    type: "Monthly Interest",
    date: "2024-05-15",
    status: "Scheduled",
  },
  {
    id: "DIST-002",
    dealId: "DEAL-002",
    dealName: "Riverfront Plaza",
    amount: "$21,250",
    type: "Quarterly Dividend",
    date: "2024-05-22",
    status: "Scheduled",
  },
  {
    id: "DIST-003",
    dealId: "DEAL-003",
    dealName: "Sunset Heights",
    amount: "$8,375",
    type: "Monthly Interest",
    date: "2024-05-05",
    status: "Processing",
  },
  {
    id: "DIST-004",
    dealId: "DEAL-004",
    dealName: "Downtown Office Building",
    amount: "$25,900",
    type: "Quarterly Dividend",
    date: "2024-06-18",
    status: "Scheduled",
  },
  {
    id: "DIST-005",
    dealId: "DEAL-001",
    dealName: "Oakwood Apartments",
    amount: "$15,000",
    type: "Monthly Interest",
    date: "2024-06-15",
    status: "Scheduled",
  },
]

export function UpcomingDistributions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Distributions</CardTitle>
        <CardDescription>Scheduled payments to investors in the next 60 days</CardDescription>
      </CardHeader>
      <CardContent>
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
                <TableCell className="font-medium">{distribution.id}</TableCell>
                <TableCell>{distribution.dealName}</TableCell>
                <TableCell>{distribution.type}</TableCell>
                <TableCell>{distribution.amount}</TableCell>
                <TableCell>{new Date(distribution.date).toLocaleDateString()}</TableCell>
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
  )
}
