import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Get a URL for a document stored in Supabase Storage.
 *
 * For public buckets, returns a permanent public URL.
 * For private buckets, returns a signed URL that expires after the specified duration.
 *
 * @param supabase - Supabase client instance
 * @param bucket - Storage bucket name (e.g., "investors", "transaction-documents")
 * @param path - Full path within the bucket
 * @param options - URL generation options
 * @returns Public URL string or signed URL promise
 */
export function getDocumentUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  options: { isPublic?: boolean; expiresIn?: number } = {}
) {
  const { isPublic = false, expiresIn = 3600 } = options;

  if (isPublic) {
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  // For private files, generate signed URL
  return supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
}

/**
 * Get a public URL for a document (synchronous).
 * Only use this for public buckets.
 */
export function getPublicDocumentUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string
): string {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/**
 * Get a signed URL for a private document (async).
 * The URL expires after the specified duration.
 *
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 */
export async function getSignedDocumentUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<{ url: string | null; error: Error | null }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  return {
    url: data?.signedUrl ?? null,
    error: error as Error | null,
  };
}
