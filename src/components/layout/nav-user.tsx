"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
  UserCog,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useImpersonation } from "@/contexts/impersonation-context";
import { useSupabase } from "@/hooks/use-supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/shadcn/command";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/shadcn/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui";

interface ImpersonationUser {
  id: number;
  full_name: string | null;
  email: string | null;
}

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { signOut, openUserProfile } = useClerk();
  const supabase = useSupabase();
  const {
    impersonatedUserId,
    setImpersonation,
  } = useImpersonation();
  const [impersonateOpen, setImpersonateOpen] = useState(false);
  const [impersonateUsers, setImpersonateUsers] = useState<ImpersonationUser[]>([]);

  const handleSignOut = async () => {
    try {
      await signOut({ redirectUrl: "/sign-in" });
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Sign out error:", error);
      window.location.href = "/sign-in";
    }
  };

  const handleAccountClick = () => {
    openUserProfile();
  };

  const handleOpenImpersonate = async () => {
    setImpersonateOpen(true);
    if (supabase && impersonateUsers.length === 0) {
      const { data } = await supabase
        .from("auth_clerk_users")
        .select("id, full_name, email")
        .order("full_name");
      setImpersonateUsers(data || []);
    }
  };

  const handleSelectImpersonateUser = (u: ImpersonationUser) => {
    setImpersonation(u.id, u.full_name || u.email || "Unknown");
    setImpersonateOpen(false);
    window.location.reload();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-12 rounded-lg hover:bg-sidebar-accent/60 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              data-testid="user-button"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={user.avatar || undefined} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left">
                <span className="truncate text-sm font-medium">
                  {user.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={user.avatar || undefined} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left">
                  <span className="truncate text-sm font-medium">
                    {user.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleAccountClick}>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenImpersonate}>
                <UserCog />
                View As User
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Impersonation Modal */}
        <Dialog open={impersonateOpen} onOpenChange={setImpersonateOpen}>
          <DialogContent className="sm:max-w-md p-0">
            <DialogHeader className="px-4 pt-4 pb-0">
              <DialogTitle>View As User</DialogTitle>
            </DialogHeader>
            <Command className="border-t">
              <CommandInput placeholder="Search users..." />
              <CommandList className="max-h-[300px] overflow-y-auto">
                <CommandEmpty>No users found.</CommandEmpty>
                <CommandGroup>
                  {impersonateUsers.map((u) => (
                    <CommandItem
                      key={u.id}
                      value={`${u.full_name} ${u.email}`}
                      onSelect={() => handleSelectImpersonateUser(u)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          impersonatedUserId === u.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {u.full_name || "Unnamed"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {u.email}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
