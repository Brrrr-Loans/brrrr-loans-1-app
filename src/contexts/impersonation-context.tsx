"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  ReactNode,
} from "react";

interface ImpersonationContextType {
  impersonatedUserId: number | null;
  impersonatedUserName: string | null;
  setImpersonation: (userId: number | null, userName: string | null) => void;
  clearImpersonation: () => void;
  isImpersonating: boolean;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

function readStoredImpersonation(): {
  userId: number | null;
  userName: string | null;
} {
  if (typeof window === "undefined") {
    return { userId: null, userName: null };
  }
  const storedId = sessionStorage.getItem("impersonated_user_id");
  const storedName = sessionStorage.getItem("impersonated_user_name");
  if (!storedId) {
    return { userId: null, userName: null };
  }
  const parsed = parseInt(storedId, 10);
  if (Number.isNaN(parsed)) {
    return { userId: null, userName: null };
  }
  return { userId: parsed, userName: storedName };
}

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

  // Restore before paint so child useEffect fetches see the stored target
  // (useEffect restore let the first commit run as the admin).
  useLayoutEffect(() => {
    const stored = readStoredImpersonation();
    setImpersonatedUserId(stored.userId);
    setImpersonatedUserName(stored.userName);
  }, []);

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
