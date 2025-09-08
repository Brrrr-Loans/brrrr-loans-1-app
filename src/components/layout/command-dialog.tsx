"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChartPie,
  DollarSign,
  Download,
  FileText,
  Settings,
  User,
  BarChart,
  FolderOpen,
  Plus,
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
} from "@/components/ui/command";

interface AppCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenTeamSwitcher?: () => void;
}

export function AppCommandDialog({ 
  open, 
  onOpenChange, 
  onOpenTeamSwitcher 
}: AppCommandDialogProps) {
  const router = useRouter();

  const runCommand = React.useCallback((command: () => void) => {
    onOpenChange(false);
    command();
  }, [onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <ChartPie />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/deals"))}>
            <FolderOpen />
            <span>Deal Records</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/distributions"))}>
            <DollarSign />
            <span>Distributions</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/documents"))}>
            <FileText />
            <span>Documents</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/investor-statements"))}>
            <Download />
            <span>Investor Statements</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/reports"))}>
            <BarChart />
            <span>Reports</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/deals/new"))}>
            <Plus />
            <span>Create New Deal</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/distributions/new"))}>
            <Plus />
            <span>Create Distribution</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => runCommand(() => {
            // This would open user profile - you can implement based on your auth system
            console.log("Open user profile");
          })}>
            <User />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => {
            if (onOpenTeamSwitcher) {
              onOpenTeamSwitcher();
            }
          })}>
            <Building2 />
            <span>My Organizations</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => {
            // This would open settings - implement as needed
            console.log("Open settings");
          })}>
            <Settings />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
