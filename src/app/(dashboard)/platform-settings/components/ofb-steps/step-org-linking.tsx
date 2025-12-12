"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card";
import { Button } from "@/components/ui/forms/button";
import { Badge } from "@/components/ui/feedback/badge";
import { Skeleton } from "@/components/ui/feedback/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/data/table";
import { Check, Building2, User, Link, Unlink } from "lucide-react";
import { useSupabase } from "@/hooks/use-supabase";
import { toast } from "sonner";

interface Vendor {
  id: number;
  name: string;
  email: string | null;
  linked_org_id: number | null;
  linked_org_name: string | null;
  linked_user_id: number | null;
  linked_user_name: string | null;
}

interface ClerkOrg {
  id: number;
  clerk_org_name: string;
}

interface ClerkUser {
  id: number;
  full_name: string;
  email: string;
}

interface StepOrgLinkingProps {
  onLinkComplete: (count: number) => void;
}

export function StepOrgLinking({ onLinkComplete }: StepOrgLinkingProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [orgs, setOrgs] = useState<ClerkOrg[]>([]);
  const [users, setUsers] = useState<ClerkUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [linkingVendorId, setLinkingVendorId] = useState<number | null>(null);

  const supabase = useSupabase();

  useEffect(() => {
    if (supabase) fetchData();
  }, [supabase]);

  const fetchData = async () => {
    if (!supabase) return;
    setIsLoading(true);

    // Fetch vendors with their current links
    const { data: vendorData } = await supabase
      .from("api_ofb_vendors")
      .select("id, name, email")
      .order("name");

    // Fetch existing org links
    const { data: orgLinks } = await supabase
      .from("api_ofb_vendors_clerk_orgs")
      .select("ofb_vendor_id, clerk_org_id, auth_clerk_orgs(clerk_org_name)");

    // Fetch existing user links
    const { data: userLinks } = await supabase
      .from("api_ofb_vendors_clerk_users")
      .select("ofb_vendor_id, clerk_user_id, auth_clerk_users(full_name)");

    // Merge vendor data with links
    const vendorsWithLinks = (vendorData || []).map((v) => {
      const orgLink = orgLinks?.find((l) => l.ofb_vendor_id === v.id);
      const userLink = userLinks?.find((l) => l.ofb_vendor_id === v.id);
      return {
        ...v,
        linked_org_id: orgLink?.clerk_org_id || null,
        linked_org_name: (orgLink?.auth_clerk_orgs as any)?.clerk_org_name || null,
        linked_user_id: userLink?.clerk_user_id || null,
        linked_user_name: (userLink?.auth_clerk_users as any)?.full_name || null,
      };
    });

    setVendors(vendorsWithLinks);

    // Fetch orgs
    const { data: orgData } = await supabase
      .from("auth_clerk_orgs")
      .select("id, clerk_org_name")
      .order("clerk_org_name");

    setOrgs(orgData || []);

    // Fetch users
    const { data: userData } = await supabase
      .from("auth_clerk_users")
      .select("id, full_name, email")
      .order("full_name");

    setUsers(userData || []);
    setIsLoading(false);
  };

  const handleLinkOrg = async (vendorId: number, orgId: number | null) => {
    if (!supabase) return;
    setLinkingVendorId(vendorId);

    try {
      if (orgId === null) {
        // Remove link
        await supabase
          .from("api_ofb_vendors_clerk_orgs")
          .delete()
          .eq("ofb_vendor_id", vendorId);
      } else {
        // Check if link exists
        const { data: existing } = await supabase
          .from("api_ofb_vendors_clerk_orgs")
          .select("id")
          .eq("ofb_vendor_id", vendorId)
          .single();

        if (existing) {
          // Update
          await supabase
            .from("api_ofb_vendors_clerk_orgs")
            .update({ clerk_org_id: orgId })
            .eq("ofb_vendor_id", vendorId);
        } else {
          // Insert
          await supabase.from("api_ofb_vendors_clerk_orgs").insert({
            ofb_vendor_id: vendorId,
            clerk_org_id: orgId,
            match_method: "manual",
          });
        }
      }

      toast.success("Vendor link updated");
      await fetchData();
      onLinkComplete(vendors.filter((v) => v.linked_org_id || v.linked_user_id).length);
    } catch (error) {
      console.error("Link error:", error);
      toast.error("Failed to update link");
    } finally {
      setLinkingVendorId(null);
    }
  };

  const handleLinkUser = async (vendorId: number, userId: number | null) => {
    if (!supabase) return;
    setLinkingVendorId(vendorId);

    try {
      if (userId === null) {
        // Remove link
        await supabase
          .from("api_ofb_vendors_clerk_users")
          .delete()
          .eq("ofb_vendor_id", vendorId);
      } else {
        // Check if link exists
        const { data: existing } = await supabase
          .from("api_ofb_vendors_clerk_users")
          .select("id")
          .eq("ofb_vendor_id", vendorId)
          .single();

        if (existing) {
          // Update
          await supabase
            .from("api_ofb_vendors_clerk_users")
            .update({ clerk_user_id: userId })
            .eq("ofb_vendor_id", vendorId);
        } else {
          // Insert
          await supabase.from("api_ofb_vendors_clerk_users").insert({
            ofb_vendor_id: vendorId,
            clerk_user_id: userId,
            match_method: "manual",
          });
        }
      }

      toast.success("Vendor link updated");
      await fetchData();
      onLinkComplete(vendors.filter((v) => v.linked_org_id || v.linked_user_id).length);
    } catch (error) {
      console.error("Link error:", error);
      toast.error("Failed to update link");
    } finally {
      setLinkingVendorId(null);
    }
  };

  const linkedCount = vendors.filter((v) => v.linked_org_id || v.linked_user_id).length;
  const unlinkedCount = vendors.length - linkedCount;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-muted p-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">No Vendors Found</h3>
              <p className="text-muted-foreground">
                Add vendors first before linking to organizations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Badge variant="default" className="gap-1">
          <Link className="h-3 w-3" />
          {linkedCount} linked
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Unlink className="h-3 w-3" />
          {unlinkedCount} unlinked
        </Badge>
      </div>

      <div className="text-center text-muted-foreground">
        <p>Link vendors to Clerk organizations or individual users</p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Link to Organization</TableHead>
              <TableHead>Link to User</TableHead>
              <TableHead className="w-12">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium">{vendor.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {vendor.email || "—"}
                </TableCell>
                <TableCell>
                  <Select
                    value={vendor.linked_org_id?.toString() || "__none__"}
                    onValueChange={(v) =>
                      handleLinkOrg(vendor.id, v === "__none__" ? null : parseInt(v))
                    }
                    disabled={linkingVendorId === vendor.id}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select org..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— None —</SelectItem>
                      {orgs.map((org) => (
                        <SelectItem key={org.id} value={org.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3" />
                            {org.clerk_org_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={vendor.linked_user_id?.toString() || "__none__"}
                    onValueChange={(v) =>
                      handleLinkUser(vendor.id, v === "__none__" ? null : parseInt(v))
                    }
                    disabled={linkingVendorId === vendor.id}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select user..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— None —</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            {user.full_name || user.email}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {(vendor.linked_org_id || vendor.linked_user_id) ? (
                    <div className="flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="text-muted-foreground">—</span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

