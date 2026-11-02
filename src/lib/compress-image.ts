// Runs in the browser: shrinks large photos (e.g. straight from a phone
// camera) before they are uploaded, so they stay well under the 5 MB limit
// and load quickly in the shop.

const MAX_SIDE = 1600;
const SHRINK_ABOVE_BYTES = 1.5 * 1024 * 1024;
const KEEP_AS_IS = ["image/jpeg", "image/png", "image/webp"];

export async function shrinkPhoto(file: File): Promise<File> {
  if (KEEP_AS_IS.includes(file.type) && file.size <= SHRINK_ABOVE_BYTES) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    );
    if (!blob) return file;

    const name = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
  } catch {
    // The browser can't read this image; send it as is and let the server
    // explain what's wrong.
    return file;
  }
}

// Shrinks any photo in the given form fields, in place.
export async function shrinkPhotosInForm(formData: FormData, fields: string[]) {
  for (const field of fields) {
    const value = formData.get(field);
    if (value instanceof File && value.size > 0) {
      formData.set(field, await shrinkPhoto(value));
    }
  }
}
