"use client";

import { createContext, useContext, ReactNode } from "react";
import { useOrganization } from "@clerk/nextjs";

interface OrganizationContextType {
  clerkOrgId: string | null; // Clerk's org ID (e.g., "org_xxx")
  orgName: string | null;
  isLoaded: boolean;
}

const OrganizationContext = createContext<OrganizationContextType>({
  clerkOrgId: null,
  orgName: null,
  isLoaded: false,
});

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { organization, isLoaded } = useOrganization();

  return (
    <OrganizationContext.Provider
      value={{
        clerkOrgId: organization?.id || null,
        orgName: organization?.name || null,
        isLoaded,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export const useCurrentOrganization = () => useContext(OrganizationContext);

