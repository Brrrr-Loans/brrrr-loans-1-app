"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  DollarSign,
  Download,
  FileText,
  Settings,
  User,
  FolderOpen,
  Plus,
  Home,
  Palette,
  Globe,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/shadcn/command";

interface AppCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenTeamSwitcher?: () => void;
}

export function AppCommandDialog({
  open,
  onOpenChange,
  onOpenTeamSwitcher,
}: AppCommandDialogProps) {
  const router = useRouter();

  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Suggestions">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard"))}
          >
            <Home />
            <span>Dashboard</span>
            <CommandShortcut>⌘H</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() =>
                router.push("/balance-sheet/investor-portfolio/deals"),
              )
            }
          >
            <FolderOpen />
            <span>Deals</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/balance-sheet/transactions"))
            }
          >
            <DollarSign />
            <span>Distributions</span>
            <CommandShortcut>⌘R</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/balance-sheet/transactions"))
            }
          >
            <Download />
            <span>Documents</span>
            <CommandShortcut>⌘I</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Documents">
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/balance-sheet/documents"))
            }
          >
            <FileText />
            <span>All documents</span>
            <CommandShortcut>ND</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() =>
                router.push("/balance-sheet/documents?status=draft"),
              )
            }
          >
            <FileText />
            <span>Draft documents</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() =>
                router.push("/balance-sheet/documents?status=completed"),
              )
            }
          >
            <FileText />
            <span>Completed documents</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() =>
                router.push("/balance-sheet/documents?status=pending"),
              )
            }
          >
            <FileText />
            <span>Pending documents</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() =>
                router.push("/balance-sheet/documents?status=inbox"),
              )
            }
          >
            <FileText />
            <span>Inbox documents</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() =>
              runCommand(() =>
                router.push("/balance-sheet/investor-portfolio/deals/new"),
              )
            }
          >
            <Plus />
            <span>Create New Deal</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/balance-sheet/transactions/new"))
            }
          >
            <Plus />
            <span>Create Distribution</span>
            <CommandShortcut>⌘T</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/balance-sheet/documents/upload"))
            }
          >
            <FileText />
            <span>Upload Document</span>
            <CommandShortcut>⌘U</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Settings">
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                console.log("Open user profile");
              })
            }
          >
            <User />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                if (onOpenTeamSwitcher) {
                  onOpenTeamSwitcher();
                }
              })
            }
          >
            <Building2 />
            <span>My Organizations</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                console.log("Open settings");
              })
            }
          >
            <Settings />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Preferences">
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                console.log("Change language");
              })
            }
          >
            <Globe />
            <span>Change language</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                console.log("Change theme");
              })
            }
          >
            <Palette />
            <span>Change theme</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
