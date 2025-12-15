"use server";

import { getSupabaseClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createDeal(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name");
  const type = formData.get("type");
  const amount = formData.get("amount");
  const location = formData.get("location");
  const description = formData.get("description");
  const roi = formData.get("roi");
  const startDate = formData.get("startDate");
  const status = formData.get("status") ?? "Active";

  // Input validation
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

  // Validate inputs
  if (!name.trim() || name.length > 255) {
    throw new Error("Deal name must be between 1 and 255 characters");
  }

  // Validate amount format
  const cleanAmount = amount.replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleanAmount)) {
    throw new Error("Invalid amount format");
  }

  // Validate ROI format
  if (!/^\d+(\.\d{1,2})?$/.test(roi)) {
    throw new Error("Invalid ROI format");
  }

  // Validate date format
  if (isNaN(Date.parse(startDate))) {
    throw new Error("Invalid start date");
  }

  try {
    const supabase = await getSupabaseClient();

    // 1. Find the user's contact_id via auth_user_profile
    const { data: userProfile, error: userProfileError } = await supabase
      .from("auth_clerk_users")
      .select("email")
      .eq("clerk_user_id", userId)
      .single();

    if (userProfileError || !userProfile) {
      throw new Error("User profile not found");
    }

    // 2. Find the contact_id using the email
    const { data: contact, error: contactError } = await supabase
      .from("contact")
      .select("id")
      .eq("email_address", userProfile.email || "")
      .single();

    if (contactError || !contact) {
      throw new Error("Contact not found for user");
    }

    // Insert deal record (let database auto-generate ID)
    const { data: dealData, error: dealError } = await supabase
      .from("deal")
      .insert({
        deal_name: name.trim(),
        loan_amount_initial: parseFloat(cleanAmount),
        loan_number: `LOAN-${Date.now()}`, // Generate a unique loan number
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (dealError) {
      throw new Error(`Failed to create deal: ${dealError.message}`);
    }

    // Add the current user as an owner for this deal using the correct contact_id
    const { error: contactError2 } = await supabase.from("deal_roles").insert({
      deal_id: dealData.id,
      contact_id: contact.id,
      role: "Owner",
      created_at: new Date().toISOString(),
    });

    if (contactError2) {
      console.error("Error adding contact to deal:", contactError2);
      // Continue anyway as the deal was created
    }

    revalidatePath("/balance-sheet/investor-portfolio/deals");
    return { success: true, dealId: dealData.id };
  } catch (error) {
    console.error("Error creating deal:", error);
    throw error;
  }
}

export async function updateDeal(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id");
  const name = formData.get("name");
  const type = formData.get("type");
  const amount = formData.get("amount");
  const location = formData.get("location");
  const description = formData.get("description");
  const roi = formData.get("roi");
  const startDate = formData.get("startDate");
  const status = formData.get("status");

  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof type !== "string" ||
    typeof amount !== "string" ||
    typeof location !== "string" ||
    typeof roi !== "string" ||
    typeof startDate !== "string" ||
    typeof status !== "string"
  ) {
    throw new Error("Missing required fields");
  }

  // Validate inputs
  if (!name.trim() || name.length > 255) {
    throw new Error("Deal name must be between 1 and 255 characters");
  }

  // Validate amount format
  const cleanAmount = amount.replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleanAmount)) {
    throw new Error("Invalid amount format");
  }

  // Validate ROI format
  if (!/^\d+(\.\d{1,2})?$/.test(roi)) {
    throw new Error("Invalid ROI format");
  }

  // Validate date format
  if (isNaN(Date.parse(startDate))) {
    throw new Error("Invalid start date");
  }

  const dealId = parseInt(id, 10);
  if (isNaN(dealId)) {
    throw new Error("Invalid deal ID");
  }

  try {
    const supabase = await getSupabaseClient();

    // 1. Find the user's contact_id via auth_user_profile
    const { data: userProfile, error: userProfileError } = await supabase
      .from("auth_clerk_users")
      .select("email")
      .eq("clerk_user_id", userId)
      .single();

    if (userProfileError || !userProfile) {
      throw new Error("User profile not found");
    }

    // 2. Find the contact_id using the email
    const { data: contact, error: contactError } = await supabase
      .from("contact")
      .select("id")
      .eq("email_address", userProfile.email || "")
      .single();

    if (contactError || !contact) {
      throw new Error("Contact not found for user");
    }

    // 3. Check if the user has permission to update this deal
    const { data: dealRole, error: checkError } = await supabase
      .from("deal_roles")
      .select("*")
      .eq("deal_id", dealId)
      .eq("contact_id", contact.id)
      .eq("role", "Owner")
      .single();

    if (checkError || !dealRole) {
      throw new Error("You don't have permission to update this deal");
    }

    // Update deal record
    const { error: updateError } = await supabase
      .from("deal")
      .update({
        deal_name: name.trim(),
        type,
        amount: parseFloat(cleanAmount),
        location: location.trim(),
        description:
          typeof description === "string" ? description.trim() : null,
        roi: parseFloat(roi),
        start_date: startDate,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", dealId);

    if (updateError) {
      throw new Error(`Failed to update deal: ${updateError.message}`);
    }

    revalidatePath("/balance-sheet/investor-portfolio/deals");
    return { success: true };
  } catch (error) {
    console.error("Error updating deal:", error);
    throw error;
  }
}

export async function deleteDeal(id: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const dealId = parseInt(id, 10);
  if (isNaN(dealId)) {
    throw new Error("Invalid deal ID");
  }

  try {
    const supabase = await getSupabaseClient();

    // 1. Find the user's contact_id via auth_user_profile
    const { data: userProfile, error: userProfileError } = await supabase
      .from("auth_clerk_users")
      .select("email")
      .eq("clerk_user_id", userId)
      .single();

    if (userProfileError || !userProfile) {
      throw new Error("User profile not found");
    }

    // 2. Find the contact_id using the email
    const { data: contact, error: contactError } = await supabase
      .from("contact")
      .select("id")
      .eq("email_address", userProfile.email || "")
      .single();

    if (contactError || !contact) {
      throw new Error("Contact not found for user");
    }

    // 3. Check if the user has permission to delete this deal
    const { data: dealRole, error: checkError } = await supabase
      .from("deal_roles")
      .select("*")
      .eq("deal_id", dealId)
      .eq("contact_id", contact.id)
      .eq("role", "Owner")
      .single();

    if (checkError || !dealRole) {
      throw new Error("You don't have permission to delete this deal");
    }

    // Delete the deal
    const { error: deleteError } = await supabase
      .from("deal")
      .delete()
      .eq("id", dealId);

    if (deleteError) {
      throw new Error(`Failed to delete deal: ${deleteError.message}`);
    }

    revalidatePath("/balance-sheet/investor-portfolio/deals");
    return { success: true };
  } catch (error) {
    console.error("Error deleting deal:", error);
    throw error;
  }
}
