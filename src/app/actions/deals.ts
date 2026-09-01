"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase-server";
import {
  getCurrentUserData,
  isCurrentUserPlatformAdmin,
} from "@/lib/auth-helpers";
import { DEAL_LIST_PATH, DEAL_PIPELINE_PATH } from "@/config/deal-routes";
import type { Database } from "@/types/database.types";

type DealDisposition = Database["public"]["Enums"]["deal_disposition_1"];
type ProjectType = Database["public"]["Enums"]["project_type"];

function revalidateDealPaths() {
  revalidatePath(DEAL_LIST_PATH);
  revalidatePath(DEAL_PIPELINE_PATH);
}

function parseAmount(amount: string): number {
  const cleanAmount = amount.replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleanAmount)) {
    throw new Error("Invalid amount format");
  }
  return parseFloat(cleanAmount);
}

function mapDisposition(status: unknown): DealDisposition {
  const normalized = String(status || "Active").trim().toLowerCase();
  if (normalized === "pending" || normalized === "on_hold") return "on_hold";
  if (normalized === "dead") return "dead";
  return "active";
}

function mapProjectType(type: unknown): ProjectType | null {
  const normalized = String(type || "").trim().toLowerCase();
  if (normalized.includes("land") || normalized.includes("ground")) {
    return "ground_up";
  }
  if (normalized.includes("flip")) return "fix_and_flip";
  if (normalized.includes("bridge") || normalized.includes("commercial")) {
    return "stabilized_bridge";
  }
  if (
    normalized.includes("rental") ||
    normalized.includes("residential") ||
    normalized.includes("multi")
  ) {
    return "rental";
  }
  return null;
}

async function requireDealAdmin() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  if (!(await isCurrentUserPlatformAdmin())) {
    throw new Error("Forbidden: Admin access required");
  }

  return {
    userId,
    caller: await getCurrentUserData(),
    supabase: createServiceRoleClient(),
  };
}

async function attachCreatorToDeal(
  supabase: ReturnType<typeof createServiceRoleClient>,
  dealId: number,
  callerId: number | null | undefined
) {
  if (!callerId) return;

  const { error: userLinkError } = await supabase
    .from("bsi_deals_clerk_users")
    .insert({ deal_id: dealId, clerk_user_id: callerId });
  if (userLinkError) {
    console.error("Error linking user to deal:", userLinkError);
  }

  const { data: roleType } = await supabase
    .from("deal_role_types")
    .select("id")
    .eq("code", "point_of_contact")
    .maybeSingle();

  if (!roleType) return;

  const { error: roleError } = await supabase.from("deal_roles").insert({
    deal_id: dealId,
    auth_clerk_users_id: callerId,
    deal_role_types_id: roleType.id,
  });
  if (roleError) {
    console.error("Error adding deal role:", roleError);
  }
}

export async function createDeal(formData: FormData) {
  const name = formData.get("name");
  const type = formData.get("type");
  const amount = formData.get("amount");
  const location = formData.get("location");
  const roi = formData.get("roi");
  const startDate = formData.get("startDate");
  const status = formData.get("status") ?? "Active";

  if (
    typeof name !== "string" ||
    typeof type !== "string" ||
    typeof amount !== "string" ||
    typeof location !== "string" ||
    typeof roi !== "string" ||
    typeof startDate !== "string"
  ) {
    throw new Error("Missing required fields");
  }

  if (!name.trim() || name.length > 255) {
    throw new Error("Deal name must be between 1 and 255 characters");
  }

  const parsedAmount = parseAmount(amount);

  if (!/^\d+(\.\d{1,2})?%?$/.test(roi.replace(/\s/g, ""))) {
    throw new Error("Invalid ROI format");
  }

  if (isNaN(Date.parse(startDate))) {
    throw new Error("Invalid start date");
  }

  try {
    const { caller, supabase } = await requireDealAdmin();
    const projectType = mapProjectType(type);

    const { data: dealData, error: dealError } = await supabase
      .from("deal")
      .insert({
        deal_name: name.trim(),
        loan_amount_initial: parsedAmount,
        loan_amount_total: parsedAmount,
        loan_number: `PORTAL-${Date.now()}`,
        deal_disposition_1: mapDisposition(status),
        deal_stage_2: "loan_setup",
        target_closing_date: startDate,
        ...(projectType ? { project_type: projectType } : {}),
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (dealError || !dealData) {
      throw new Error(
        `Failed to create deal: ${dealError?.message || "unknown error"}`
      );
    }

    await attachCreatorToDeal(supabase, dealData.id, caller?.id);

    revalidateDealPaths();
    return { success: true, dealId: dealData.id };
  } catch (error) {
    console.error("Error creating deal:", error);
    throw error;
  }
}

export async function updateDeal(formData: FormData) {
  const id = formData.get("id");
  const name = formData.get("name");
  const type = formData.get("type");
  const amount = formData.get("amount");
  const startDate = formData.get("startDate");
  const status = formData.get("status");

  if (typeof id !== "string" || typeof name !== "string") {
    throw new Error("Missing required fields");
  }

  if (!name.trim() || name.length > 255) {
    throw new Error("Deal name must be between 1 and 255 characters");
  }

  const dealId = parseInt(id, 10);
  if (isNaN(dealId)) {
    throw new Error("Invalid deal ID");
  }

  try {
    const { supabase } = await requireDealAdmin();
    const projectType =
      typeof type === "string" ? mapProjectType(type) : null;
    const parsedAmount =
      typeof amount === "string" && amount.trim()
        ? parseAmount(amount)
        : null;

    const { error: updateError } = await supabase
      .from("deal")
      .update({
        deal_name: name.trim(),
        ...(parsedAmount != null
          ? {
              loan_amount_initial: parsedAmount,
              loan_amount_total: parsedAmount,
            }
          : {}),
        ...(typeof status === "string"
          ? { deal_disposition_1: mapDisposition(status) }
          : {}),
        ...(typeof startDate === "string" && !isNaN(Date.parse(startDate))
          ? { target_closing_date: startDate }
          : {}),
        ...(projectType ? { project_type: projectType } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", dealId);

    if (updateError) {
      throw new Error(`Failed to update deal: ${updateError.message}`);
    }

    revalidateDealPaths();
    return { success: true };
  } catch (error) {
    console.error("Error updating deal:", error);
    throw error;
  }
}

export async function deleteDeal(id: string) {
  const dealId = parseInt(id, 10);
  if (isNaN(dealId)) {
    throw new Error("Invalid deal ID");
  }

  try {
    const { supabase } = await requireDealAdmin();

    const { error: deleteError } = await supabase
      .from("deal")
      .delete()
      .eq("id", dealId);

    if (deleteError) {
      throw new Error(`Failed to delete deal: ${deleteError.message}`);
    }

    revalidateDealPaths();
    return { success: true };
  } catch (error) {
    console.error("Error deleting deal:", error);
    throw error;
  }
}
