"use client";

import * as React from "react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { StackedAvatars } from "@/components/ui/custom/stacked-avatars";
import { MoreHorizontal, Search, Filter, Download } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
}

interface LoanFile {
  id: string;
  loanNumber: string;
  borrowerName: string;
  propertyAddress: string;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  closingDate: string;
  assignedTeam: TeamMember[];
  priority: "high" | "medium" | "low";
  stage: "underwriting" | "processing" | "closing" | "funded" | "docs";
}

// Sample data - replace with real data from your API
const sampleLoanFiles: LoanFile[] = [
  {
    id: "1",
    loanNumber: "LN-2024-001",
    borrowerName: "John Smith",
    propertyAddress: "123 Main St, Anytown, CA 90210",
    loanAmount: 450000,
    interestRate: 6.25,
    loanTerm: 30,
    closingDate: "2024-02-15",
    assignedTeam: [
      {
        id: "1",
        name: "Sarah Johnson",
        email: "sarah@company.com",
        role: "Loan Officer",
      },
      {
        id: "2",
        name: "Mike Chen",
        email: "mike@company.com",
        role: "Underwriter",
      },
      {
        id: "3",
        name: "Lisa Davis",
        email: "lisa@company.com",
        role: "Processor",
      },
    ],
    priority: "high",
    stage: "underwriting",
  },
  {
    id: "2",
    loanNumber: "LN-2024-002",
    borrowerName: "Emily Rodriguez",
    propertyAddress: "456 Oak Ave, Springfield, TX 75001",
    loanAmount: 325000,
    interestRate: 6.75,
    loanTerm: 30,
    closingDate: "2024-02-22",
    assignedTeam: [
      {
        id: "4",
        name: "Tom Wilson",
        email: "tom@company.com",
        role: "Loan Officer",
      },
      {
        id: "5",
        name: "Anna Kim",
        email: "anna@company.com",
        role: "Processor",
      },
    ],
    priority: "medium",
    stage: "processing",
  },
  {
    id: "3",
    loanNumber: "LN-2024-003",
    borrowerName: "David Brown",
    propertyAddress: "789 Pine St, Riverside, FL 33101",
    loanAmount: 275000,
    interestRate: 6.5,
    loanTerm: 15,
    closingDate: "2024-03-01",
    assignedTeam: [
      {
        id: "1",
        name: "Sarah Johnson",
        email: "sarah@company.com",
        role: "Loan Officer",
      },
      {
        id: "6",
        name: "Carlos Martinez",
        email: "carlos@company.com",
        role: "Underwriter",
      },
      {
        id: "7",
        name: "Jennifer Lee",
        email: "jen@company.com",
        role: "Closer",
      },
      {
        id: "8",
        name: "Robert Taylor",
        email: "robert@company.com",
        role: "Processor",
      },
    ],
    priority: "low",
    stage: "closing",
  },
];

const priorityColors = {
  high: "destructive",
  medium: "default",
  low: "secondary",
} as const;

const stageColors = {
  underwriting: "default",
  processing: "secondary",
  closing: "outline",
  funded: "default",
  docs: "secondary",
} as const;

interface LoanFilesTableProps {
  className?: string;
}

export function LoanFilesTable({ className }: LoanFilesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loanFiles] = useState<LoanFile[]>(sampleLoanFiles);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredFiles = loanFiles.filter(
    (file) =>
      file.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={className}>
      {/* Header with search and actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search loan files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loan #</TableHead>
              <TableHead>Borrower</TableHead>
              <TableHead>Property Address</TableHead>
              <TableHead>Loan Amount</TableHead>
              <TableHead>Rate/Term</TableHead>
              <TableHead>Closing Date</TableHead>
              <TableHead>Assigned Team</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFiles.map((file) => (
              <TableRow key={file.id}>
                <TableCell className="font-medium">{file.loanNumber}</TableCell>
                <TableCell>{file.borrowerName}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {file.propertyAddress}
                </TableCell>
                <TableCell>{formatCurrency(file.loanAmount)}</TableCell>
                <TableCell>
                  {file.interestRate}% / {file.loanTerm}yr
                </TableCell>
                <TableCell>
                  {new Date(file.closingDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <StackedAvatars
                    members={file.assignedTeam}
                    maxVisible={3}
                    size="sm"
                  />
                </TableCell>
                <TableCell>
                  <Badge variant={priorityColors[file.priority]}>
                    {file.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={stageColors[file.stage]}>{file.stage}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Assignment</DropdownMenuItem>
                      <DropdownMenuItem>Update Status</DropdownMenuItem>
                      <DropdownMenuItem>Download Docs</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No loan files found matching your search.
        </div>
      )}
    </div>
  );
}
