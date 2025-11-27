"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ImpersonationContextType {
  impersonatedUserId: number | null;
  impersonatedUserName: string | null;
  setImpersonation: (userId: number | null, userName: string | null) => void;
  clearImpersonation: () => void;
  isImpersonating: boolean;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

export function ImpersonationProvider({ children }: { children: ReactNode }) {
  const [impersonatedUserId, setImpersonatedUserId] = useState<number | null>(null);
  const [impersonatedUserName, setImpersonatedUserName] = useState<string | null>(null);

  const setImpersonation = (userId: number | null, userName: string | null) => {
    setImpersonatedUserId(userId);
    setImpersonatedUserName(userName);
    
    // Store in sessionStorage for persistence across page reloads
    if (userId) {
      sessionStorage.setItem("impersonated_user_id", userId.toString());
      sessionStorage.setItem("impersonated_user_name", userName || "");
    } else {
      sessionStorage.removeItem("impersonated_user_id");
      sessionStorage.removeItem("impersonated_user_name");
    }
  };

  const clearImpersonation = () => {
    setImpersonation(null, null);
  };

  // Restore from sessionStorage on mount
  useState(() => {
    if (typeof window !== "undefined") {
      const storedId = sessionStorage.getItem("impersonated_user_id");
      const storedName = sessionStorage.getItem("impersonated_user_name");
      if (storedId) {
        setImpersonatedUserId(parseInt(storedId));
        setImpersonatedUserName(storedName);
      }
    }
  });

  return (
    <ImpersonationContext.Provider
      value={{
        impersonatedUserId,
        impersonatedUserName,
        setImpersonation,
        clearImpersonation,
        isImpersonating: impersonatedUserId !== null,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation() {
  const context = useContext(ImpersonationContext);
  if (context === undefined) {
    throw new Error("useImpersonation must be used within ImpersonationProvider");
  }
  return context;
}

