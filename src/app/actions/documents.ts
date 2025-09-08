"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase-server";
import type { Enums } from "@/types/supabase";

const validCategories = [
  "application",
  "appraisal",
  "assets",
  "closing",
  "credit_and_background",
  "construction",
  "environmental",
  "experience",
  "id",
  "insurance",
  "pricing",
  "property",
  "seasoning",
  "servicing",
  "title",
  "entity",
] as const;

export async function uploadDocument(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const documentName = formData.get("name");
  const documentDealId = formData.get("deal_id");
  const documentBorrowerId = formData.get("borrower_id");
  const documentGuarantorId = formData.get("guarantor_id");
  const documentEntityId = formData.get("entity_id");
  const documentPropertyId = formData.get("property_id");
  const documentCategory = formData.get("category");
  const documentIsRequired = formData.get("is_required") === "true";
  const documentStatus = formData.get("status");
  const documentFileUrl = formData.get("file_url");
  const documentFileSizeRaw = formData.get("file_size");
  const documentFileType = formData.get("file_type");
  const documentFilePath = formData.get("file_path");

  // Validate required string fields
  if (
    typeof documentName !== "string" ||
    typeof documentCategory !== "string" ||
    typeof documentFileUrl !== "string" ||
    typeof documentFileSizeRaw !== "string" ||
    typeof documentFileType !== "string"
  ) {
    throw new Error("Missing required fields");
  }

  // Validate inputs
  if (!documentName.trim() || documentName.length > 255) {
    throw new Error("Document name must be between 1 and 255 characters");
  }

  if (!documentFileUrl.trim()) {
    throw new Error("File URL is required");
  }

  // Parse and validate file size
  const documentFileSize = parseInt(documentFileSizeRaw, 10);
  if (isNaN(documentFileSize) || documentFileSize <= 0) {
    throw new Error("Invalid file size");
  }

  // Validate file size limit (50MB)
  if (documentFileSize > 52428800) {
    throw new Error("File size must be less than 50MB");
  }

  // Validate category
  if (!validCategories.includes(documentCategory as any)) {
    throw new Error("Invalid document category");
  }

  // Validate file type
  if (!documentFileType.trim()) {
    throw new Error("File type is required");
  }

  try {
    const supabase = await getSupabaseClient();

    // Parse optional numeric fields
    const dealId =
      documentDealId &&
      typeof documentDealId === "string" &&
      documentDealId !== "multiple"
        ? parseInt(documentDealId, 10)
        : null;

    if (
      documentDealId &&
      documentDealId !== "multiple" &&
      (isNaN(dealId!) || dealId! <= 0)
    ) {
      throw new Error("Invalid deal ID");
    }

    const borrowerId =
      documentBorrowerId &&
      typeof documentBorrowerId === "string" &&
      documentBorrowerId !== ""
        ? parseInt(documentBorrowerId, 10)
        : null;

    if (
      documentBorrowerId &&
      documentBorrowerId !== "" &&
      (isNaN(borrowerId!) || borrowerId! <= 0)
    ) {
      throw new Error("Invalid borrower ID");
    }

    const guarantorId =
      documentGuarantorId &&
      typeof documentGuarantorId === "string" &&
      documentGuarantorId !== ""
        ? parseInt(documentGuarantorId, 10)
        : null;

    if (
      documentGuarantorId &&
      documentGuarantorId !== "" &&
      (isNaN(guarantorId!) || guarantorId! <= 0)
    ) {
      throw new Error("Invalid guarantor ID");
    }

    const entityId =
      documentEntityId &&
      typeof documentEntityId === "string" &&
      documentEntityId !== ""
        ? parseInt(documentEntityId, 10)
        : null;

    if (
      documentEntityId &&
      documentEntityId !== "" &&
      (isNaN(entityId!) || entityId! <= 0)
    ) {
      throw new Error("Invalid entity ID");
    }

    const propertyId =
      documentPropertyId &&
      typeof documentPropertyId === "string" &&
      documentPropertyId !== ""
        ? parseInt(documentPropertyId, 10)
        : null;

    if (
      documentPropertyId &&
      documentPropertyId !== "" &&
      (isNaN(propertyId!) || propertyId! <= 0)
    ) {
      throw new Error("Invalid property ID");
    }

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
      .eq("email_address", userProfile.email)
      .single();

    // Insert document record
    const { data, error } = await supabase
      .from("document_files")
      .insert({
        name: documentName.trim(),
        deal_id: dealId,
        borrower_id: borrowerId,
        guarantor_id: guarantorId,
        entity_id: entityId,
        property_id: propertyId,
        category: documentCategory as Enums<"document_category">,
        is_required: documentIsRequired,
        status:
          typeof documentStatus === "string"
            ? (documentStatus as Enums<"document_status">)
            : null,
        file_type: documentFileType.trim(),
        file_size: documentFileSize,
        file_url: documentFileUrl.trim(),
        file_path:
          typeof documentFilePath === "string" ? documentFilePath.trim() : null,
        uploaded_by: userId,
        uploaded_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Failed to upload document: ${error.message}`);
    }

    revalidatePath("/dashboard/documents");
    return { success: true, documentId: data.id };
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
}

export async function deleteDocument(id: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Validate document ID
  const documentId = parseInt(id, 10);
  if (isNaN(documentId) || documentId <= 0) {
    throw new Error("Invalid document ID");
  }

  try {
    const supabase = await getSupabaseClient();

    // First get the document to check ownership and get file path
    const { data: document, error: fetchError } = await supabase
      .from("document_files")
      .select("*")
      .eq("id", documentId)
      .eq("uploaded_by", userId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        throw new Error(
          "Document not found or you don't have permission to delete it"
        );
      }
      throw new Error(`Failed to fetch document: ${fetchError.message}`);
    }

    if (!document) {
      throw new Error(
        "Document not found or you don't have permission to delete it"
      );
    }

    // Delete the file from storage if we have a path
    if (document.file_path) {
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([document.file_path]);

      if (storageError) {
        console.error("Error deleting file from storage:", storageError);
        // Continue anyway to delete the database record
      }
    }

    // Delete the document record
    const { error: deleteError } = await supabase
      .from("document_files")
      .delete()
      .eq("id", documentId)
      .eq("uploaded_by", userId); // Double-check ownership

    if (deleteError) {
      throw new Error(`Failed to delete document: ${deleteError.message}`);
    }

    revalidatePath("/dashboard/documents");
    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
}
