import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "product-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// The uploaded photo from a form (taken with the camera or chosen from
// files), or null when none was given.
export function getImageFile(formData: FormData) {
  for (const field of ["image_camera", "image"]) {
    const file = formData.get(field);
    if (file instanceof File && file.size > 0) {
      return file;
    }
  }
  return null;
}

export function validateImage(file: File) {
  if (!EXTENSIONS[file.type]) {
    return "Image must be a JPEG, PNG or WebP file.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image must be 5 MB or smaller.";
  }
  return null;
}

// Uploads a product photo as the signed-in admin and returns its public URL.
export async function uploadProductImage(supabase: SupabaseClient, file: File) {
  const path = `products/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
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

export const MAX_EXTRA_IMAGES = 8;

// The extra photos added in a form (camera or files), skipping empty inputs.
export function getExtraImageFiles(formData: FormData) {
  return ["extra_images_camera", "extra_images"]
    .flatMap((field) => formData.getAll(field))
    .filter((file): file is File => file instanceof File && file.size > 0);
}

// Uploads several photos. Returns their URLs, or null (with any that did
// upload removed again) if one of them fails.
export async function uploadProductImages(
  supabase: SupabaseClient,
  files: File[]
) {
  const urls: string[] = [];
  for (const file of files) {
    const url = await uploadProductImage(supabase, file);
    if (!url) {
      await removeProductImages(supabase, urls);
      return null;
    }
    urls.push(url);
  }
  return urls;
}

export async function removeProductImages(
  supabase: SupabaseClient,
  urls: (string | null)[]
) {
  for (const url of urls) {
    await removeProductImage(supabase, url);
  }
}
