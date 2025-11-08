"use client";

import { useState } from "react";
import { ChevronsUpDown, Plus, Building2, Settings } from "lucide-react";
import {
  useOrganization,
  useOrganizationList,
  OrganizationProfile,
  CreateOrganization,
} from "@clerk/nextjs";
import type { OrganizationResource } from "@clerk/types";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
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

export function TeamSwitcherV2() {
  const { isMobile } = useSidebar();
  const { organization } = useOrganization();
  const { userMemberships, setActive } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  // State for managing modals and dropdown
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [showOrgProfile, setShowOrgProfile] = useState(false);
  const [selectedOrgForProfile, setSelectedOrgForProfile] = useState<
    string | null
  >(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Get current organization and user's role
  const currentOrg = organization;
  const currentMembership = userMemberships?.data?.find(
    (m) => m.organization.id === currentOrg?.id
  );
  const userRole = currentMembership?.role || "Member";

  // Handle create organization - open modal
  const handleCreateOrganization = () => {
    setShowCreateOrg(true);
  };

  // Handle organization switching with proper error handling
  const handleSetActive = (org: OrganizationResource) => {
    if (setActive) {
      setActive({ organization: org });
    }
  };

  // Handle opening organization profile
  const handleOpenOrgProfile = (orgId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent dropdown item click
    setSelectedOrgForProfile(orgId);
    setShowOrgProfile(true);
    setDropdownOpen(false); // Close dropdown
  };

  // Handle closing modals
  const handleCloseCreateOrg = () => {
    setShowCreateOrg(false);
  };

  const handleCloseOrgProfile = () => {
    setShowOrgProfile(false);
    setSelectedOrgForProfile(null);
  };

  // Handle backdrop clicks
  const handleBackdropClick = (
    e: React.MouseEvent,
    closeHandler: () => void
  ) => {
    if (e.target === e.currentTarget) {
      closeHandler();
    }
  };

  // If no organization, show create organization button
  if (!currentOrg) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="h-12 rounded-lg hover:bg-sidebar-accent/60 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            onClick={handleCreateOrganization}
          >
            {/* Same structure as nav-user.tsx but for "Create Organization" */}
            <div className="size-8 flex items-center justify-center rounded-lg border shrink-0 overflow-hidden">
              <Building2 className="size-5" />
            </div>
            <div className="grid flex-1 text-left">
              <span className="truncate text-sm font-medium">
                Create Organization
              </span>
              <span className="truncate text-xs text-muted-foreground">
                Get started
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="h-12 rounded-lg hover:bg-sidebar-accent/60 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {/* EXACT same structure as nav-user.tsx - just with organization data */}

                {/* Organization icon - same size as nav-user avatar */}
                <div className="h-8 w-8 flex items-center justify-center rounded-lg border shrink-0 overflow-hidden">
                  {currentOrg.imageUrl ? (
                    <Image
                      src={currentOrg.imageUrl}
                      alt={currentOrg.name}
                      width={60}
                      height={60}
                      className="h-8 w-8 rounded-lg object-cover"
                    />
                  ) : (
                    <Building2 className="size-5" />
                  )}
                </div>
                <div className="grid flex-1 text-left">
                  <span className="truncate text-sm font-medium">
                    {currentOrg.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {userRole}
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
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Organizations
              </DropdownMenuLabel>
              {userMemberships?.data?.map((membership) => (
                <DropdownMenuItem
                  key={membership.organization.id}
                  onClick={() => handleSetActive(membership.organization)}
                  className="gap-2 p-2 flex items-center"
                >
                  <div className="size-6 flex items-center justify-center rounded-md border shrink-0 overflow-hidden">
                    {membership.organization.imageUrl ? (
                      <Image
                        src={membership.organization.imageUrl}
                        alt={membership.organization.name}
                        width={24}
                        height={24}
                        className="size-6 rounded-md object-cover"
                      />
                    ) : (
                      <Building2 className="size-5" />
                    )}
                  </div>
                  <span className="flex-1 truncate">
                    {membership.organization.name}
                  </span>
                  <button
                    onClick={(e) =>
                      handleOpenOrgProfile(membership.organization.id, e)
                    }
                    className="ml-auto p-1 hover:bg-accent rounded-sm"
                    title="Organization settings"
                  >
                    <Settings className="size-3" />
                  </button>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={handleCreateOrganization}
              >
                <div className="size-6 flex items-center justify-center rounded-md border shrink-0">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Create organization
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Create Organization Modal */}
      {showCreateOrg && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => handleBackdropClick(e, handleCloseCreateOrg)}
        >
          <div className="relative bg-background rounded-lg p-0 max-w-md w-full max-h-[90vh] overflow-auto m-4">
            <button
              onClick={handleCloseCreateOrg}
              className="absolute top-4 right-4 z-10 p-2 hover:bg-accent rounded-md text-lg font-bold leading-none"
            >
              ×
            </button>
            <CreateOrganization
              afterCreateOrganizationUrl="/dashboard"
              appearance={{
                elements: {
                  modalBackdrop: "hidden",
                  card: "shadow-none border-0",
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Organization Profile Modal */}
      {showOrgProfile && selectedOrgForProfile && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => handleBackdropClick(e, handleCloseOrgProfile)}
        >
          <div className="relative bg-background rounded-lg p-0 max-w-4xl w-full max-h-[90vh] overflow-auto m-4">
            <button
              onClick={handleCloseOrgProfile}
              className="absolute top-4 right-4 z-10 p-2 hover:bg-accent rounded-md text-lg font-bold leading-none"
            >
              ×
            </button>
            <OrganizationProfile
              routing="hash"
              appearance={{
                elements: {
                  modalBackdrop: "hidden",
                  card: "shadow-none border-0 w-full h-full",
                },
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
