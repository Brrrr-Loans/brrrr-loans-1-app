import { useEffect, useState, useRef } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth, useUser } from "@clerk/nextjs";
import { isClerkOrgAdminRole } from "@/lib/deal-access";
import { isPlatformAdminIdentity } from "@/lib/internal-admin";

interface InvestorPermissions {
  canViewDeal: (dealId: string) => Promise<boolean>;
  canViewDocument: (documentId: string) => Promise<boolean>;
  canViewContribution: (contributionId: string) => Promise<boolean>;
  canViewDistribution: (distributionId: string) => Promise<boolean>;
  isLoading: boolean;
}

function platformAdminFromClerkUser(user: {
  id: string;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
  emailAddresses?: Array<{ emailAddress?: string | null }>;
  publicMetadata?: Record<string, unknown> | null;
} | null | undefined): boolean {
  if (!user) return false;
  return isPlatformAdminIdentity({
    clerkUserId: user.id,
    email:
      user.primaryEmailAddress?.emailAddress ||
      user.emailAddresses?.[0]?.emailAddress,
    publicMetadata: user.publicMetadata as { role?: string | null },
  });
}

export function useInvestorPermissions(): InvestorPermissions {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const { orgRole } = useAuth();
  const supabase = useSupabase();

  const permissionCacheRef = useRef(new Map<string, boolean>());
  const permissionCache = permissionCacheRef.current;

  const canViewDeal = async (dealId: string): Promise<boolean> => {
    const cacheKey = `deal:${dealId}`;
    if (permissionCache.has(cacheKey)) {
      return permissionCache.get(cacheKey)!;
    }

    if (!user) {
      permissionCache.set(cacheKey, false);
      return false;
    }

    if (platformAdminFromClerkUser(user)) {
      permissionCache.set(cacheKey, true);
      return true;
    }

    if (!supabase) {
      permissionCache.set(cacheKey, false);
      return false;
    }

    try {
      const { data: userProfile } = await supabase
        .from("auth_clerk_users")
        .select("id, personal_role, is_internal_yn")
        .eq("clerk_user_id", user.id)
        .maybeSingle();

      if (
        isPlatformAdminIdentity({
          clerkUserId: user.id,
          email:
            user.primaryEmailAddress?.emailAddress ||
            user.emailAddresses?.[0]?.emailAddress,
          personalRole: userProfile?.personal_role,
          isInternalYn: userProfile?.is_internal_yn,
        })
      ) {
        permissionCache.set(cacheKey, true);
        return true;
      }

      if (userProfile?.id) {
        const { data: userLink, error: userLinkError } = await supabase
          .from("bsi_deals_clerk_users")
          .select("deal_id")
          .eq("deal_id", Number(dealId))
          .eq("clerk_user_id", userProfile.id)
          .maybeSingle();

        if (!userLinkError && userLink) {
          permissionCache.set(cacheKey, true);
          return true;
        }

        const { data: memberships } = await supabase
          .from("auth_clerk_orgs_members")
          .select("clerk_org_id")
          .eq("auth_clerk_users_id", userProfile.id)
          .in("clerk_org_role", ["admin", "member"]);

        const orgIds = (memberships || [])
          .map((row) => row.clerk_org_id)
          .filter((id): id is number => id !== null);

        if (orgIds.length > 0) {
          const { data: orgLink, error: orgLinkError } = await supabase
            .from("bsi_deals_clerk_orgs")
            .select("deal_id")
            .eq("deal_id", Number(dealId))
            .in("clerk_org_id", orgIds)
            .limit(1)
            .maybeSingle();

          const hasOrgAccess = !orgLinkError && !!orgLink;
          permissionCache.set(cacheKey, hasOrgAccess);
          return hasOrgAccess;
        }
      }

      permissionCache.set(cacheKey, false);
      return false;
    } catch (error) {
      console.error("Error checking deal permissions:", error);
      permissionCache.set(cacheKey, false);
      return false;
    }
  };

  const canViewDocument = async (documentId: string): Promise<boolean> => {
    const cacheKey = `document:${documentId}`;
    if (permissionCache.has(cacheKey)) {
      return permissionCache.get(cacheKey)!;
    }

    if (!user) {
      permissionCache.set(cacheKey, false);
      return false;
    }

    if (platformAdminFromClerkUser(user) || isClerkOrgAdminRole(orgRole)) {
      permissionCache.set(cacheKey, true);
      return true;
    }

    if (!supabase) {
      permissionCache.set(cacheKey, false);
      return false;
    }

    const idNum = Number(documentId);
    if (Number.isNaN(idNum)) {
      permissionCache.set(cacheKey, false);
      return false;
    }

    try {
      const { data: userProfile } = await supabase
        .from("auth_clerk_users")
        .select("personal_role, is_internal_yn")
        .eq("clerk_user_id", user.id)
        .maybeSingle();

      if (
        isPlatformAdminIdentity({
          clerkUserId: user.id,
          email:
            user.primaryEmailAddress?.emailAddress ||
            user.emailAddresses?.[0]?.emailAddress,
          personalRole: userProfile?.personal_role,
          isInternalYn: userProfile?.is_internal_yn,
        })
      ) {
        permissionCache.set(cacheKey, true);
        return true;
      }

      const { data, error } = await supabase
        .from("document_files")
        .select("id")
        .eq("id", idNum)
        .maybeSingle();

      const hasAccess = !error && !!data;
      permissionCache.set(cacheKey, hasAccess);
      return hasAccess;
    } catch (error) {
      console.error("Error checking document permissions:", error);
      permissionCache.set(cacheKey, false);
      return false;
    }
  };

  const canViewContribution = async (
    contributionId: string
  ): Promise<boolean> => {
    const cacheKey = `contribution:${contributionId}`;
    if (permissionCache.has(cacheKey)) {
      return permissionCache.get(cacheKey)!;
    }

    if (platformAdminFromClerkUser(user)) {
      permissionCache.set(cacheKey, true);
      return true;
    }

    if (!supabase) {
      permissionCache.set(cacheKey, false);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("bsi_transactions")
        .select("id, ledger_entry_type")
        .eq("id", Number(contributionId))
        .eq("ledger_entry_type", "contribution")
        .maybeSingle();

      const hasAccess = !error && data?.ledger_entry_type === "contribution";
      permissionCache.set(cacheKey, hasAccess);
      return hasAccess;
    } catch (error) {
      console.error("Error checking contribution permissions:", error);
      permissionCache.set(cacheKey, false);
      return false;
    }
  };

  const canViewDistribution = async (
    distributionId: string
  ): Promise<boolean> => {
    const cacheKey = `distribution:${distributionId}`;
    if (permissionCache.has(cacheKey)) {
      return permissionCache.get(cacheKey)!;
    }

    if (platformAdminFromClerkUser(user)) {
      permissionCache.set(cacheKey, true);
      return true;
    }

    if (!supabase) {
      permissionCache.set(cacheKey, false);
      return false;
    }

    if (distributionId === "all") {
      if (!user) {
        permissionCache.set(cacheKey, false);
        return false;
      }

      try {
        const { data: userProfile } = await supabase
          .from("auth_clerk_users")
          .select("personal_role")
          .eq("clerk_user_id", user.id)
          .maybeSingle();

        const hasAccess =
          userProfile?.personal_role === "admin" ||
          userProfile?.personal_role === "balance_sheet_investor";
        permissionCache.set(cacheKey, hasAccess);
        return hasAccess;
      } catch (error) {
        console.error("Error checking distribution permissions:", error);
        permissionCache.set(cacheKey, false);
        return false;
      }
    }

    try {
      const { data, error } = await supabase
        .from("bsi_transactions")
        .select("id, ledger_entry_type")
        .eq("id", Number(distributionId))
        .eq("ledger_entry_type", "distribution")
        .maybeSingle();

      const hasAccess = !error && data?.ledger_entry_type === "distribution";
      permissionCache.set(cacheKey, hasAccess);
      return hasAccess;
    } catch (error) {
      console.error("Error checking distribution permissions:", error);
      permissionCache.set(cacheKey, false);
      return false;
    }
  };

  useEffect(() => {
    setIsLoading(false);
    const currentCache = permissionCacheRef.current;
    return () => {
      currentCache.clear();
    };
  }, []);

  return {
    canViewDeal,
    canViewDocument,
    canViewContribution,
    canViewDistribution,
    isLoading,
  };
}
