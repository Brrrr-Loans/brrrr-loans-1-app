"use client";

import { useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import {
  Mail,
  UserPlus,
  Loader2,
  Clock,
  MoreHorizontal,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Badge } from "@/components/ui/shadcn/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/shadcn/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/shadcn/table";

export function InvitationsSettings() {
  const { organization, isLoaded, invitations } = useOrganization({
    invitations: {
      infinite: true,
      keepPreviousData: true,
    },
  });
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("org:member");
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  if (!isLoaded || !organization) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const invitationsList = invitations?.data || [];

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      await organization.inviteMember({
        emailAddress: inviteEmail.trim(),
        role: inviteRole as "org:admin" | "org:member",
      });
      setInviteEmail("");
      setShowInviteDialog(false);
      invitations?.revalidate?.();
    } catch (error) {
      console.error("Failed to send invitation:", error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRevoke = async (invitationId: string) => {
    try {
      const inv = invitationsList.find((i) => i.id === invitationId);
      if (inv) {
        await inv.revoke();
        invitations?.revalidate?.();
      }
    } catch (error) {
      console.error("Failed to revoke invitation:", error);
    }
  };

  const pendingInvitations = invitationsList.filter(
    (inv) => inv.status === "pending"
  );

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Invitations</h2>
          <p className="text-sm text-muted-foreground">
            Manage pending invitations to {organization.name}
          </p>
        </div>
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <UserPlus className="size-4" />
              Invite member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite member</DialogTitle>
              <DialogDescription>
                Send an invitation to join {organization.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleInvite();
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="org:admin">Admin</SelectItem>
                    <SelectItem value="org:member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowInviteDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInvite}
                  disabled={isInviting || !inviteEmail.trim()}
                >
                  {isInviting ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="size-4 mr-2" />
                  )}
                  Send invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pending Invitations</CardTitle>
          <CardDescription>
            {pendingInvitations.length === 0
              ? "No pending invitations"
              : `${pendingInvitations.length} pending ${pendingInvitations.length === 1 ? "invitation" : "invitations"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingInvitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Mail className="size-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                No pending invitations. Invite someone to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvitations.map((inv) => {
                  const roleLabel =
                    inv.role === "org:admin" ? "Admin" : "Member";
                  const sentDate = inv.createdAt
                    ? new Date(inv.createdAt).toLocaleDateString()
                    : "—";

                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">
                        {inv.emailAddress}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{roleLabel}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sentDate}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="gap-1 text-amber-600"
                        >
                          <Clock className="size-3" />
                          Pending
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRevoke(inv.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="size-4 mr-2" />
                              Revoke invitation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
