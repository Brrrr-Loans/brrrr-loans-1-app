"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
} from "@/components/ui";
import { Loader2, Search, X, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Vendor {
  id: number;
  brex_vendor_id: string;
  name: string | null;
  email: string | null;
  account_number: string | null;
}

interface ClerkUser {
  id: number;
  clerk_user_id: string;
  full_name: string | null;
  email: string | null;
}

interface ClerkOrg {
  id: number;
  clerk_org_id: string;
  clerk_org_name: string;
}

interface VendorMatch {
  id: number;
  brex_vendor_id: number;
  clerk_user_id?: number;
  clerk_org_id?: number;
  match_method: string | null;
  match_confidence: number | null;
  matchType: 'user' | 'org';
}

export function BrexVendorMatcher() {
  const supabase = useSupabase();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [clerkUsers, setClerkUsers] = useState<ClerkUser[]>([]);
  const [clerkOrgs, setClerkOrgs] = useState<ClerkOrg[]>([]);
  const [vendorMatches, setVendorMatches] = useState<VendorMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorSearch, setVendorSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [orgSearch, setOrgSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);

  useEffect(() => {
    if (supabase) {
      loadData();
    }
  }, [supabase]);

  const loadData = async () => {
    if (!supabase) return;

    setLoading(true);
    try {
      // Load vendors
      const { data: vendorsData } = await supabase
        .from("api_brex_vendors")
        .select("id, brex_vendor_id, name, email, account_number")
        .order("name");

      // Load Clerk users
      const { data: usersData } = await supabase
        .from("auth_clerk_users")
        .select("id, clerk_user_id, full_name, email")
        .order("full_name");

      // Load Clerk orgs
      const { data: orgsData } = await supabase
        .from("auth_clerk_orgs")
        .select("id, clerk_org_id, clerk_org_name")
        .order("clerk_org_name");

      // Load existing matches
      const { data: userMatches } = await supabase
        .from("api_brex_vendors_clerk_users")
        .select("*");

      const { data: orgMatches } = await supabase
        .from("api_brex_vendors_clerk_orgs")
        .select("*");

      setVendors(vendorsData || []);
      setClerkUsers(usersData || []);
      setClerkOrgs(orgsData || []);

      const allMatches: VendorMatch[] = [
        ...(userMatches || []).map((m) => ({
          id: m.id,
          brex_vendor_id: m.brex_vendor_id,
          clerk_user_id: m.clerk_user_id,
          match_method: m.match_method,
          match_confidence: m.match_confidence,
          matchType: 'user' as const,
        })),
        ...(orgMatches || []).map((m) => ({
          id: m.id,
          brex_vendor_id: m.brex_vendor_id,
          clerk_org_id: m.clerk_org_id,
          match_method: m.match_method,
          match_confidence: m.match_confidence,
          matchType: 'org' as const,
        })),
      ];

      setVendorMatches(allMatches);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load vendor matching data",
      });
    } finally {
      setLoading(false);
    }
  };

  const createUserMatch = async () => {
    if (!supabase || !selectedVendor || !selectedUser) return;

    try {
      const { error } = await supabase
        .from("api_brex_vendors_clerk_users")
        .insert({
          brex_vendor_id: selectedVendor,
          clerk_user_id: selectedUser,
          match_method: "manual",
          match_confidence: 1.0,
        });

      if (error) throw error;

      toast({
        title: "Match created",
        description: "Vendor matched to user successfully",
      });

      setSelectedVendor(null);
      setSelectedUser(null);
      loadData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create match",
      });
    }
  };

  const createOrgMatch = async () => {
    if (!supabase || !selectedVendor || !selectedOrg) return;

    try {
      const { error } = await supabase
        .from("api_brex_vendors_clerk_orgs")
        .insert({
          brex_vendor_id: selectedVendor,
          clerk_org_id: selectedOrg,
          match_method: "manual",
          match_confidence: 1.0,
        });

      if (error) throw error;

      toast({
        title: "Match created",
        description: "Vendor matched to organization successfully",
      });

      setSelectedVendor(null);
      setSelectedOrg(null);
      loadData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create match",
      });
    }
  };

  const deleteMatch = async (matchId: number, isUserMatch: boolean) => {
    if (!supabase) return;

    try {
      const tableName = isUserMatch
        ? "api_brex_vendors_clerk_users"
        : "api_brex_vendors_clerk_orgs";

      const { error } = await supabase.from(tableName).delete().eq("id", matchId);

      if (error) throw error;

      toast({
        title: "Match deleted",
        description: "Vendor match removed successfully",
      });

      loadData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete match",
      });
    }
  };

  const filteredVendors = vendors.filter(
    (v) =>
      !vendorSearch ||
      v.name?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      v.email?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      v.brex_vendor_id.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  const filteredUsers = clerkUsers.filter(
    (u) =>
      !userSearch ||
      u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredOrgs = clerkOrgs.filter(
    (o) =>
      !orgSearch ||
      o.clerk_org_name.toLowerCase().includes(orgSearch.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Vendor Matching</CardTitle>
          <CardDescription>
            Manually match Brex vendors to Clerk users and organizations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create New Match */}
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold">Create New Match</h3>

            {/* Vendor Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Vendor</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={selectedVendor?.toString() || ""}
                onValueChange={(value) =>
                  setSelectedVendor(value ? parseInt(value) : null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {filteredVendors.map((vendor) => (
                    <SelectItem
                      key={vendor.id}
                      value={vendor.id.toString()}
                    >
                      {vendor.name || vendor.brex_vendor_id}
                      {vendor.email && ` (${vendor.email})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User Match */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Match to User</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={selectedUser?.toString() || ""}
                  onValueChange={(value) =>
                    setSelectedUser(value ? parseInt(value) : null)
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUsers.map((user) => (
                      <SelectItem
                        key={user.id}
                        value={user.id.toString()}
                      >
                        {user.full_name || user.email || user.clerk_user_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={createUserMatch}
                  disabled={!selectedVendor || !selectedUser}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Match User
                </Button>
              </div>
            </div>

            {/* Org Match */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Match to Organization</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  value={orgSearch}
                  onChange={(e) => setOrgSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={selectedOrg?.toString() || ""}
                  onValueChange={(value) =>
                    setSelectedOrg(value ? parseInt(value) : null)
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredOrgs.map((org) => (
                      <SelectItem
                        key={org.id}
                        value={org.id.toString()}
                      >
                        {org.clerk_org_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={createOrgMatch}
                  disabled={!selectedVendor || !selectedOrg}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Match Org
                </Button>
              </div>
            </div>
          </div>

          {/* Existing Matches */}
          <div className="space-y-2">
            <h3 className="font-semibold">Existing Matches</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Matched To</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorMatches.map((match) => {
                    const vendor = vendors.find(
                      (v) => v.id === match.brex_vendor_id
                    );
                    const user = match.clerk_user_id
                      ? clerkUsers.find((u) => u.id === match.clerk_user_id)
                      : null;
                    const org = match.clerk_org_id
                      ? clerkOrgs.find((o) => o.id === match.clerk_org_id)
                      : null;

                    return (
                      <TableRow key={`${match.matchType}-${match.id}`}>
                        <TableCell>
                          {vendor?.name || vendor?.brex_vendor_id || "Unknown"}
                        </TableCell>
                        <TableCell>
                          {user
                            ? user.full_name || user.email
                            : org
                              ? org.clerk_org_name
                              : "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {match.matchType === 'user' ? 'User' : 'Organization'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {match.match_confidence
                            ? `${(match.match_confidence * 100).toFixed(0)}%`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              deleteMatch(
                                match.id,
                                match.matchType === 'user'
                              )
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {vendorMatches.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No matches found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

