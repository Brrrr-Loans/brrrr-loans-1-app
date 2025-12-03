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
  Badge,
} from "@/components/ui";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/navigation/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/overlays/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/overlays/dialog";
import { Loader2, X, Plus, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  matchType: "user" | "org";
}

export function BrexVendorMatcher() {
  const supabase = useSupabase();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [clerkUsers, setClerkUsers] = useState<ClerkUser[]>([]);
  const [clerkOrgs, setClerkOrgs] = useState<ClerkOrg[]>([]);
  const [vendorMatches, setVendorMatches] = useState<VendorMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);
  const [vendorOpen, setVendorOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [orgOpen, setOrgOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Close all popovers when dialog closes
  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setVendorOpen(false);
      setUserOpen(false);
      setOrgOpen(false);
    }
  };

  useEffect(() => {
    if (supabase) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          matchType: "user" as const,
        })),
        ...(orgMatches || []).map((m) => ({
          id: m.id,
          brex_vendor_id: m.brex_vendor_id,
          clerk_org_id: m.clerk_org_id,
          match_method: m.match_method,
          match_confidence: m.match_confidence,
          matchType: "org" as const,
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
      setDialogOpen(false);
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
      setDialogOpen(false);
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

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", matchId);

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

  // Command component handles filtering internally, no need for filtered lists

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
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>Match Vendors to Users or Companies</CardTitle>
                {vendorMatches.length > 0 && (
                  <Badge variant="secondary" className="rounded-full">
                    {vendorMatches.length}
                  </Badge>
                )}
              </div>
              <CardDescription>
                Link Brex vendors to Clerk users and organizations
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Match Vendor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Match</DialogTitle>
                  <DialogDescription>
                    Match a Brex vendor to a Clerk user or organization
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">

            {/* Vendor Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Vendor</label>
              <Popover open={vendorOpen} onOpenChange={setVendorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={vendorOpen}
                    className="w-full justify-between"
                  >
                    {selectedVendor
                      ? vendors.find((v) => v.id === selectedVendor)?.name ||
                        vendors.find((v) => v.id === selectedVendor)
                          ?.brex_vendor_id ||
                        "Select a vendor..."
                      : "Select a vendor..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search vendors..." />
                    <CommandList>
                      <CommandEmpty>No vendor found.</CommandEmpty>
                      <CommandGroup>
                        {vendors.map((vendor) => (
                          <CommandItem
                            key={vendor.id}
                            value={`${vendor.name || vendor.brex_vendor_id} ${vendor.email || ""}`}
                            onSelect={() => {
                              setSelectedVendor(
                                vendor.id === selectedVendor ? null : vendor.id
                              );
                              setVendorOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedVendor === vendor.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {vendor.name || vendor.brex_vendor_id}
                            {vendor.email && ` (${vendor.email})`}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* User Match */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Match to User</label>
              <div className="flex gap-2">
                <Popover open={userOpen} onOpenChange={setUserOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={userOpen}
                      className="flex-1 justify-between"
                    >
                      {selectedUser
                        ? clerkUsers.find((u) => u.id === selectedUser)
                            ?.full_name ||
                          clerkUsers.find((u) => u.id === selectedUser)
                            ?.email ||
                          "Select a user..."
                        : "Select a user..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search users..." />
                      <CommandList>
                        <CommandEmpty>No user found.</CommandEmpty>
                        <CommandGroup>
                          {clerkUsers.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={`${user.full_name || ""} ${user.email || ""} ${user.clerk_user_id}`}
                              onSelect={() => {
                                setSelectedUser(
                                  user.id === selectedUser ? null : user.id
                                );
                                setUserOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedUser === user.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {user.full_name ||
                                user.email ||
                                user.clerk_user_id}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
              <label className="text-sm font-medium">
                Match to Organization
              </label>
              <div className="flex gap-2">
                <Popover open={orgOpen} onOpenChange={setOrgOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={orgOpen}
                      className="flex-1 justify-between"
                    >
                      {selectedOrg
                        ? clerkOrgs.find((o) => o.id === selectedOrg)
                            ?.clerk_org_name || "Select an organization..."
                        : "Select an organization..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search organizations..." />
                      <CommandList>
                        <CommandEmpty>No organization found.</CommandEmpty>
                        <CommandGroup>
                          {clerkOrgs.map((org) => (
                            <CommandItem
                              key={org.id}
                              value={org.clerk_org_name}
                              onSelect={() => {
                                setSelectedOrg(
                                  org.id === selectedOrg ? null : org.id
                                );
                                setOrgOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedOrg === org.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {org.clerk_org_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Existing Matches */}
          <div className="space-y-2">
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
                            {match.matchType === "user"
                              ? "User"
                              : "Organization"}
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
                              deleteMatch(match.id, match.matchType === "user")
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
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
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
