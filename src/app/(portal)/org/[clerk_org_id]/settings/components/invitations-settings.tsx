"use client";

import { useState, useEffect, useTransition } from "react";
import { useOrganization } from "@clerk/nextjs";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  type ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import {
  Mail,
  UserPlus,
  Loader2,
  Clock,
  MoreHorizontal,
  Trash2,
  Copy,
  Check,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
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
import {
  getOrgInvitations,
  revokeInvitation,
  sendInvitation,
  type InvitationRow,
} from "../actions/invitations";

const statusConfig: Record<
  string,
  { label: string; icon: typeof Clock; className: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "text-amber-600 border-amber-300",
  },
  accepted: {
    label: "Accepted",
    icon: CheckCircle2,
    className: "text-emerald-600 border-emerald-300",
  },
  revoked: {
    label: "Revoked",
    icon: XCircle,
    className: "text-red-600 border-red-300",
  },
};

function CopyUrlButton({ url }: { url: string | null }) {
  const [copied, setCopied] = useState(false);

  if (!url) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? (
        <Check className="size-4 text-emerald-500" />
      ) : (
        <Copy className="size-4" />
      )}
      <span className="sr-only">Copy invitation link</span>
    </Button>
  );
}

const columns: ColumnDef<InvitationRow>[] = [
  {
    accessorKey: "emailAddress",
    header: "Email",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.emailAddress}</span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const label = row.original.role === "org:admin" ? "Admin" : "Member";
      return <Badge variant="secondary">{label}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Sent",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const config = statusConfig[row.original.status] ?? statusConfig.pending;
      const Icon = config.icon;
      return (
        <Badge variant="outline" className={`gap-1 ${config.className}`}>
          <Icon className="size-3" />
          {config.label}
        </Badge>
      );
    },
  },
  {
    id: "copyUrl",
    header: "Link",
    cell: ({ row }) => <CopyUrlButton url={row.original.url} />,
  },
  {
    id: "actions",
    header: "",
    cell: function ActionsCell({ row, table }) {
      const meta = table.options.meta as {
        onRevoke: (id: string) => void;
      } | undefined;
      if (row.original.status !== "pending") return null;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => meta?.onRevoke(row.original.id)}
              className="text-destructive"
            >
              <Trash2 className="size-4 mr-2" />
              Revoke invitation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function InvitationsSettings() {
  const { organization, isLoaded } = useOrganization();
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("org:member");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const data = await getOrgInvitations();
      setInvitations(data);
    } catch (error) {
      console.error("Failed to load invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && organization) {
      loadInvitations();
    }
  }, [isLoaded, organization]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      await sendInvitation({
        emailAddress: inviteEmail.trim(),
        role: inviteRole,
      });
      setInviteEmail("");
      setShowInviteDialog(false);
      startTransition(() => {
        loadInvitations();
      });
    } catch (error) {
      console.error("Failed to send invitation:", error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRevoke = async (invitationId: string) => {
    try {
      await revokeInvitation(invitationId);
      startTransition(() => {
        loadInvitations();
      });
    } catch (error) {
      console.error("Failed to revoke invitation:", error);
    }
  };

  const table = useReactTable({
    data: invitations,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
    meta: {
      onRevoke: handleRevoke,
    },
  });

  if (!isLoaded || !organization) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

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

      {/* Invitations table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Invitations</CardTitle>
          <CardDescription>
            {invitations.length === 0
              ? "No invitations sent yet"
              : `${invitations.length} total ${invitations.length === 1 ? "invitation" : "invitations"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : invitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Mail className="size-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                No invitations sent. Invite someone to get started.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination footer - shown when >= 10 invitations */}
              {invitations.length >= 10 && (
                <div className="flex items-center justify-between py-4">
                  <div className="text-sm text-muted-foreground">
                    {invitations.length} total{" "}
                    {invitations.length === 1 ? "invitation" : "invitations"}
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        Rows per page
                      </p>
                      <Select
                        value={table
                          .getState()
                          .pagination.pageSize.toString()}
                        onValueChange={(value) => {
                          table.setPageSize(Number(value));
                        }}
                      >
                        <SelectTrigger className="w-[80px] h-9">
                          <SelectValue placeholder="10" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="30">30</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <p className="text-sm font-medium text-foreground">
                      Page{" "}
                      {table.getState().pagination.pageIndex + 1} of{" "}
                      {table.getPageCount()}
                    </p>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                        <span className="sr-only">First page</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous page</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next page</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          table.setPageIndex(table.getPageCount() - 1)
                        }
                        disabled={!table.getCanNextPage()}
                      >
                        <ChevronsRight className="h-4 w-4" />
                        <span className="sr-only">Last page</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
