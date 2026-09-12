"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ImpersonationApiView = {
  canImpersonate?: boolean;
  impersonatedUserId?: number | null;
  impersonatedUserName?: string | null;
};

interface ImpersonationContextType {
  impersonatedUserId: number | null;
  impersonatedUserName: string | null;
  canImpersonate: boolean;
  isLoaded: boolean;
  setImpersonation: (userId: number | null, userName: string | null) => Promise<void>;
  clearImpersonation: () => Promise<void>;
  isImpersonating: boolean;
}

type ImpersonationProviderProps = {
  children: ReactNode;
};

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(
  undefined
);

function clearLegacyClientStorage(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("impersonated_user_id");
  sessionStorage.removeItem("impersonated_user_name");
}

function requestImpersonationApi(init?: RequestInit): Promise<Response> {
  return fetch("/api/impersonation", {
    credentials: "same-origin",
    ...init,
  });
}

export function ImpersonationProvider({ children }: ImpersonationProviderProps) {
  const [impersonatedUserId, setImpersonatedUserId] = useState<number | null>(
    null
  );
  const [impersonatedUserName, setImpersonatedUserName] = useState<string | null>(
    null
  );
  const [canImpersonate, setCanImpersonate] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    clearLegacyClientStorage();

    let cancelled = false;

    function applyIdleView(): void {
      setCanImpersonate(false);
      setImpersonatedUserId(null);
      setImpersonatedUserName(null);
    }

    async function load(): Promise<void> {
      try {
        const response = await requestImpersonationApi();
        if (!response.ok) {
          if (!cancelled) applyIdleView();
          return;
        }
        const data = (await response.json()) as ImpersonationApiView;
        if (!cancelled) {
          setCanImpersonate(Boolean(data.canImpersonate));
          setImpersonatedUserId(data.impersonatedUserId ?? null);
          setImpersonatedUserName(data.impersonatedUserName ?? null);
        }
      } catch {
        if (!cancelled) applyIdleView();
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const setImpersonation = useCallback(async function setImpersonation(
    userId: number | null,
    userName: string | null
  ): Promise<void> {
    if (!userId) {
      const response = await requestImpersonationApi({ method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to stop impersonation");
      }
      setImpersonatedUserId(null);
      setImpersonatedUserName(null);
      return;
    }

    const response = await requestImpersonationApi({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, userName }),
    });
    if (!response.ok) {
      throw new Error("Failed to start impersonation");
    }
    const data = (await response.json()) as ImpersonationApiView;
    setImpersonatedUserId(data.impersonatedUserId ?? userId);
    setImpersonatedUserName(data.impersonatedUserName ?? userName);
  }, []);

  const clearImpersonation = useCallback(async function clearImpersonation(): Promise<void> {
    await setImpersonation(null, null);
  }, [setImpersonation]);

  return (
    <ImpersonationContext.Provider
      value={{
        impersonatedUserId,
        impersonatedUserName,
        canImpersonate,
        isLoaded,
        setImpersonation,
        clearImpersonation,
        isImpersonating: impersonatedUserId !== null,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation(): ImpersonationContextType {
  const context = useContext(ImpersonationContext);
  if (context === undefined) {
    throw new Error("useImpersonation must be used within ImpersonationProvider");
  }
  return context;
}
