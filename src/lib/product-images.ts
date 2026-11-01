import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ErrorMessages } from "@/lib/i18n";

const BUCKET = "product-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// The uploaded file from a form, or null when none was chosen.
export function getImageFile(formData: FormData) {
  const file = formData.get("image");
  return file instanceof File && file.size > 0 ? file : null;
}

export function validateImage(file: File, errors: ErrorMessages) {
  if (!EXTENSIONS[file.type]) {
    return errors.imageType;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return errors.imageSize;
  }
  return null;
}

// Uploads a product photo into its shop's folder as the signed-in account
// and returns its public URL.
export async function uploadProductImage(
  supabase: SupabaseClient,
  shopId: string,
  file: File
) {
  const path = `shops/${shopId}/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) {
    console.error("Failed to upload product image:", error);
    return null;
  }

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// Deletes a photo previously stored by uploadProductImage. URLs that point
// anywhere else are left alone.
export async function removeProductImage(
  supabase: SupabaseClient,
  url: string | null
) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url?.indexOf(marker) ?? -1;
  if (!url || index === -1) return;

  const path = decodeURIComponent(url.slice(index + marker.length));
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.error("Failed to delete product image:", error);
  }
}
