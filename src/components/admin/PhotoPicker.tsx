"use client";

import { useEffect, useRef, useState } from "react";

const buttonClass =
  "cursor-pointer rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium hover:bg-slate-200";

// Two ways to add a product photo: take one with the device camera (phones
// and tablets open the camera straight away) or choose an existing file.
// Shows a preview of the chosen photo before the form is saved.
export default function PhotoPicker() {
  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Clear the preview when the form resets (React resets it after saving).
  useEffect(() => {
    const form = fileInput.current?.form;
    const clear = () => setPreview(null);
    form?.addEventListener("reset", clear);
    return () => form?.removeEventListener("reset", clear);
  }, []);

  // Free the previous preview image when it changes.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function choose(
    chosen: HTMLInputElement | null,
    other: HTMLInputElement | null
  ) {
    const file = chosen?.files?.[0];
    // Only one photo is sent: picking one way clears the other.
    if (other) other.value = "";
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-3">
        <label className={buttonClass}>
          Take photo
          <input
            ref={cameraInput}
            type="file"
            name="image_camera"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={() => choose(cameraInput.current, fileInput.current)}
          />
        </label>
        <label className={buttonClass}>
          Choose photo
          <input
            ref={fileInput}
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={() => choose(fileInput.current, cameraInput.current)}
          />
        </label>
        {preview && (
          <button
            type="button"
            onClick={() => {
              if (cameraInput.current) cameraInput.current.value = "";
              if (fileInput.current) fileInput.current.value = "";
              setPreview(null);
            }}
            className="text-sm text-gray-600 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {preview && (
        // A local preview of the chosen file, so next/image isn't needed.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="New photo preview"
          className="mt-3 h-32 w-44 rounded-lg border border-gray-200 object-cover"
        />
      )}
    </div>
  );
}
