"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useImpersonation } from "@/contexts/impersonation-context";
import { Button } from "@/components/ui";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/shadcn/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/shadcn/popover";
import { Badge } from "@/components/ui";
import { UserCog, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: number;
  full_name: string | null;
  email: string | null;
}

export function ImpersonationSwitcher() {
  const supabase = useSupabase();
  const {
    impersonatedUserId,
    impersonatedUserName,
    setImpersonation,
    clearImpersonation,
    isImpersonating,
    canImpersonate,
    isLoaded,
  } = useImpersonation();
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!supabase || !open || !canImpersonate) return;
    const client = supabase;

    async function loadUsers(): Promise<void> {
      const { data } = await client
        .from("auth_clerk_users")
        .select("id, full_name, email")
        .order("full_name");
      setUsers(data || []);
    }

    void loadUsers();
  }, [supabase, open, canImpersonate]);

  async function runAndReload(
    action: () => Promise<void>,
    failureLabel: string,
    closePopover = false
  ): Promise<void> {
    setPending(true);
    try {
      await action();
      if (closePopover) setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error(failureLabel, error);
      setPending(false);
    }
  }

  if (!isLoaded || !canImpersonate) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {isImpersonating && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <UserCog className="h-3 w-3" />
            Viewing as: {impersonatedUserName}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              void runAndReload(
                clearImpersonation,
                "Failed to stop impersonation:"
              )
            }
            className="h-7 px-2"
            disabled={pending}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2" disabled={pending}>
            <UserCog className="h-4 w-4" />
            {isImpersonating ? "Switch User" : "View As User"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search users..." />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={`${user.full_name} ${user.email}`}
                    onSelect={() =>
                      void runAndReload(
                        () =>
                          setImpersonation(
                            user.id,
                            user.full_name || user.email || "Unknown"
                          ),
                        "Failed to start impersonation:",
                        true
                      )
                    }
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        impersonatedUserId === user.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{user.full_name || "Unnamed"}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
