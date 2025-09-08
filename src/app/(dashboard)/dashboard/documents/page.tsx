"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/layout/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/data/table";
import { Button } from "@/components/ui/forms/button";
import { Input } from "@/components/ui/forms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select";
import { Badge } from "@/components/ui/feedback/badge";
import { Download, Plus, Search, BarChart, FileText } from "lucide-react";
import { useSupabase } from "@/hooks/use-supabase";
import { useUser } from "@/hooks/use-clerk-auth";
import type { Tables } from "@/types/supabase";
import { SiteHeader } from "@/components/layout/site-header";
import type { InvestorStatement } from "@/types/investor-statements";
import Link from "next/link";

// Sample deals data - in a real app, this would come from the database
const deals = [
  { id: "1", name: "Oakwood Apartments" },
  { id: "2", name: "Riverfront Plaza" },
  { id: "3", name: "Sunset Heights" },
  { id: "4", name: "Downtown Office Building" },
];

// Define valid categories as a type guard
const validCategories = [
  "application",
  "appraisal",
  "assets",
  "closing",
  "credit_and_background",
  "construction",
  "environmental",
  "experience",
  "id",
  "insurance",
  "pricing",
  "property",
  "seasoning",
  "servicing",
  "title",
  "entity",
] as const;
type CategoryType = (typeof validCategories)[number];

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<Tables<"document_files">[]>([]);
  const [statements, setStatements] = useState<InvestorStatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatementsLoading, setIsStatementsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDeal, setSelectedDeal] = useState("all-deals");
  const [selectedFrequency, setSelectedFrequency] = useState("All Frequencies");
  const [searchStatements, setSearchStatements] = useState("");
  const { user } = useUser();
  const supabase = useSupabase();

  // Fetch documents from Supabase
  const fetchDocuments = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Start with a query that filters by the current user's ID
      // RLS will enforce this anyway, but it's good practice to be explicit
      let query = supabase
        .from("document_files")
        .select("*")
        .eq("uploaded_by", user.id);

      // Apply additional filters if selected
      if (
        selectedCategory !== "all" &&
        validCategories.includes(selectedCategory as CategoryType)
      ) {
        query = query.eq("category", selectedCategory as CategoryType);
      }

      if (selectedDeal !== "all-deals" && selectedDeal !== "multiple") {
        const dealIdNum = Number(selectedDeal);
        if (!isNaN(dealIdNum)) {
          query = query.eq("deal_id", dealIdNum);
        }
      } else if (selectedDeal === "multiple") {
        // Only filter if your schema allows 'multiple' as a string, otherwise skip
        // query = query.eq("deal_id", "multiple");
      }

      const response = await query.order("uploaded_at", {
        ascending: false,
      });

      if (response.error) {
        let errorMsg = `Error: ${response.error.message}`;
        if (response.error.details) {
          errorMsg += ` - ${response.error.details}`;
        }
        throw new Error(errorMsg);
      }

      setDocuments(response.data || []);
    } catch (error) {
      console.error(
        "Error fetching documents:",
        error instanceof Error ? error.message : error
      );
      // Optionally, set an error state here for the UI
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedCategory, selectedDeal, supabase]);

  // Fetch investor statements
  const fetchStatements = useCallback(async () => {
    if (!user) return;

    setIsStatementsLoading(true);
    try {
      // Get the user's contact ID (for investor role check)
      const { data: contactData } = await supabase
        .from("contact")
        .select("id, contact_types_id")
        .eq("clerk_user_id", user.id)
        .single();

      // Get user profile to check role
      const { data: authUserProfiles } = await supabase
        .from("auth_clerk_users")
        .select("role")
        .eq("id", Number(user.id))
        .single();

      // Check if user is a Balance Sheet Investor or admin
      const isInvestor =
        contactData &&
        "contact_types_id" in contactData &&
        contactData.contact_types_id === 12;
      const isAdmin = authUserProfiles?.role === "admin";

      if (!isInvestor && !isAdmin) {
        // If not investor or admin, no statements to show
        setStatements([]);
        setIsStatementsLoading(false);
        return;
      }

      // Query directly via Supabase instead of API route
      let query = supabase.from("bsi_statements").select("*");

      // If investor, filter by their ID
      if (isInvestor && contactData && "id" in contactData) {
        query = query.eq("investor_id", contactData.id);
      }

      // Order by date
      query = query.order("statement_date", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching statements:", error);
        throw new Error(error.message);
      }

      setStatements(
        (data || []).map((item) => ({
          id: item.id,
          created_at: item.created_at,
          investor_id: item.investor_id,
          statement_date: item.statement_date,
          statement_period_start: item.statement_period_start,
          statement_period_end: item.statement_period_end,
          total_upb_open: item.total_upb_open,
          total_upb_close: item.total_upb_close,
          total_interest: item.total_interest,
          total_principal: item.total_principal,
          total_fees: item.total_fees,
          clerk_user_id: item.clerk_user_id ?? null,
          clerk_organization_id: item.clerk_organization_id ?? null,
          org_id: item.org_id ?? null,
          file_path: item.file_path ?? null,
          file_name: item.file_name ?? null,
          file_type: item.file_type ?? null,
          file_size: item.file_size ?? null,
          file_url: item.file_url ?? null,
          uploaded_at: item.uploaded_at ?? null,
        }))
      );
    } catch (error) {
      console.error("Error fetching statements:", error);
    } finally {
      setIsStatementsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchStatements();
    }
  }, [selectedCategory, selectedDeal, user, fetchDocuments, fetchStatements]);

  // Handle document download
  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      // Create a download link and trigger it
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Error downloading file:", error);
      // Show error message to user
    }
  };

  // Handle statement download
  const handleStatementDownload = async (statement: InvestorStatement) => {
    try {
      if (statement.file_path) {
        const { data, error } = await supabase.storage
          .from("investor-statements")
          .download(statement.file_path);

        if (error) {
          console.error("Error downloading file:", error);
          return;
        }

        // Create a download link
        const fileName = statement.file_name || `statement-${statement.id}.pdf`;
        const url = window.URL.createObjectURL(data);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading statement:", error);
    }
  };

  // Filter documents based on search term
  const filteredDocuments = documents.filter(
    (doc) =>
      (typeof doc.name === "string" &&
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof doc.id === "string"
        ? (doc.id as string).toLowerCase().includes(searchTerm.toLowerCase())
        : typeof doc.id === "number" &&
          doc.id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.deal_id !== null &&
        (() => {
          const dealName = deals.find(
            (d) => d.id === doc.deal_id?.toString()
          )?.name;
          return (
            typeof dealName === "string" &&
            dealName.toLowerCase().includes(searchTerm.toLowerCase())
          );
        })())
  );

  // Filter statements based on search term and frequency
  const filteredStatements = statements.filter((statement) => {
    // First filter by search term
    const matchesSearch =
      statement.statement_date
        .toLowerCase()
        .includes(searchStatements.toLowerCase()) ||
      statement.id
        .toString()
        .toLowerCase()
        .includes(searchStatements.toLowerCase());

    // Then filter by frequency if needed
    const frequencyMatch =
      selectedFrequency === "All Frequencies" ||
      (selectedFrequency === "Monthly" && isMonthlyStatement(statement)) ||
      (selectedFrequency === "Quarterly" && isQuarterlyStatement(statement)) ||
      (selectedFrequency === "Annually" && isAnnualStatement(statement));

    return matchesSearch && frequencyMatch;
  });

  // Helper functions to determine statement frequency
  function isMonthlyStatement(statement: InvestorStatement) {
    // Simplified logic: if period is roughly a month
    const start = new Date(statement.statement_period_start);
    const end = new Date(statement.statement_period_end);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 28 && diffDays <= 31;
  }

  function isQuarterlyStatement(statement: InvestorStatement) {
    // Simplified logic: if period is roughly a quarter
    const start = new Date(statement.statement_period_start);
    const end = new Date(statement.statement_period_end);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 89 && diffDays <= 92;
  }

  function isAnnualStatement(statement: InvestorStatement) {
    // Simplified logic: if period is roughly a year
    const start = new Date(statement.statement_period_start);
    const end = new Date(statement.statement_period_end);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 364 && diffDays <= 366;
  }

  // Helper to get deal name from deal_id
  function getDealName(deal_id: string | number | null) {
    if (deal_id === null || deal_id === undefined) return "Multiple";
    const deal = deals.find((d) => d.id === deal_id.toString());
    return deal ? deal.name : "Multiple";
  }

  // Format date for display
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US");
  }

  return (
    <>
      <SiteHeader />
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        </div>

        {/* Document Types Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Deal Documents Card */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Deal Documents</CardTitle>
              </div>
              <CardDescription>
                Access documents related to your deals
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                View and manage documents uploaded for specific deals,
                properties, and borrowers.
              </p>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-3">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="#document-list">
                  <FileText className="mr-2 h-4 w-4" />
                  Browse Deal Documents
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Investor Statements Card */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" />
                <CardTitle>Investor Statements</CardTitle>
              </div>
              <CardDescription>
                View and download your investor statements
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Access monthly and quarterly investor statements for your
                balance sheet investments.
              </p>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-3">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="#statements-list">
                  <BarChart className="mr-2 h-4 w-4" />
                  View Investor Statements
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Available Statements Section */}
        <Card id="statements-list">
          <CardHeader>
            <CardTitle>Available Statements</CardTitle>
            <CardDescription>
              Standard statements that can be generated or scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search statements..."
                  value={searchStatements}
                  onChange={(e) => setSearchStatements(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={selectedFrequency}
                onValueChange={setSelectedFrequency}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Frequencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Frequencies">
                    All Frequencies
                  </SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isStatementsLoading ? (
              <div className="flex justify-center py-8">
                <p>Loading statements...</p>
              </div>
            ) : filteredStatements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground mb-2">
                  No statements found
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Investor ID</TableHead>
                    <TableHead>Statement Date</TableHead>
                    <TableHead>Period Start</TableHead>
                    <TableHead>Period End</TableHead>
                    <TableHead>UPB Open</TableHead>
                    <TableHead>UPB Close</TableHead>
                    <TableHead>Total Interest</TableHead>
                    <TableHead>Total Principal</TableHead>
                    <TableHead>Total Fees</TableHead>
                    <TableHead>Clerk ID</TableHead>
                    <TableHead>Clerk Org ID</TableHead>
                    <TableHead>File Path</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>File Type</TableHead>
                    <TableHead>File Size</TableHead>
                    <TableHead>File URL</TableHead>
                    <TableHead>Uploaded At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStatements.map((statement) => (
                    <TableRow key={statement.id}>
                      <TableCell>{statement.id ?? ""}</TableCell>
                      <TableCell>{statement.created_at ?? ""}</TableCell>
                      <TableCell>{statement.investor_id ?? ""}</TableCell>
                      <TableCell>{statement.statement_date ?? ""}</TableCell>
                      <TableCell>
                        {statement.statement_period_start ?? ""}
                      </TableCell>
                      <TableCell>
                        {statement.statement_period_end ?? ""}
                      </TableCell>
                      <TableCell>{statement.total_upb_open ?? ""}</TableCell>
                      <TableCell>{statement.total_upb_close ?? ""}</TableCell>
                      <TableCell>{statement.total_interest ?? ""}</TableCell>
                      <TableCell>{statement.total_principal ?? ""}</TableCell>
                      <TableCell>{statement.total_fees ?? ""}</TableCell>
                      <TableCell>{statement.clerk_user_id ?? ""}</TableCell>
                      <TableCell>
                        {statement.clerk_organization_id ?? ""}
                      </TableCell>
                      <TableCell>{statement.file_path ?? ""}</TableCell>
                      <TableCell>{statement.file_name ?? ""}</TableCell>
                      <TableCell>{statement.file_type ?? ""}</TableCell>
                      <TableCell>{statement.file_size ?? ""}</TableCell>
                      <TableCell>{statement.file_url ?? ""}</TableCell>
                      <TableCell>{statement.uploaded_at ?? ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* My Documents Section */}
        <Card id="document-list">
          <CardHeader>
            <CardTitle>My Documents</CardTitle>
            <CardDescription>
              View and manage your uploaded documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Financial">Financial</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedDeal} onValueChange={setSelectedDeal}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by deal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-deals">All Deals</SelectItem>
                  {deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="multiple">Multiple Deals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <p>Loading documents...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground mb-2">No documents found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Deal ID</TableHead>
                    <TableHead>Borrower ID</TableHead>
                    <TableHead>Entity ID</TableHead>
                    <TableHead>Property ID</TableHead>
                    <TableHead>Guarantor ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>File Type</TableHead>
                    <TableHead>File Size</TableHead>
                    <TableHead>File URL</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Uploaded At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.id ?? ""}</TableCell>
                      <TableCell>{doc.created_at ?? ""}</TableCell>
                      <TableCell>{doc.name ?? ""}</TableCell>
                      <TableCell>{doc.category ?? ""}</TableCell>
                      <TableCell>{doc.deal_id ?? ""}</TableCell>
                      <TableCell>{doc.borrower_id ?? ""}</TableCell>
                      <TableCell>{doc.entity_id ?? ""}</TableCell>
                      <TableCell>{doc.property_id ?? ""}</TableCell>
                      <TableCell>{doc.guarantor_id ?? ""}</TableCell>
                      <TableCell>{doc.status ?? ""}</TableCell>
                      <TableCell>{doc.file_type ?? ""}</TableCell>
                      <TableCell>{doc.file_size ?? ""}</TableCell>
                      <TableCell>{doc.file_url ?? ""}</TableCell>
                      <TableCell>{doc.uploaded_by ?? ""}</TableCell>
                      <TableCell>{doc.uploaded_at ?? ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number | null): string {
  if (bytes == null) return "";
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / 1048576).toFixed(1) + " MB";
}
