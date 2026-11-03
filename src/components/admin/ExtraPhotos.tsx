"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";

const MAX_EXTRA_IMAGES = 8;

const buttonClass =
  "cursor-pointer rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium hover:bg-slate-200";

// "More photos" on the product form. Existing extra photos can be ticked for
// removal; new ones (from the camera or files, added a few at a time) are
// kept in `files` by the form and sent when it is saved.
export default function ExtraPhotos({
  existing,
  files,
  onFilesChange,
}: {
  existing: string[];
  files: File[];
  onFilesChange: (files: File[]) => void;
}) {
  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files]
  );
  useEffect(
    () => () => previews.forEach((url) => URL.revokeObjectURL(url)),
    [previews]
  );

  const room = MAX_EXTRA_IMAGES - existing.length - files.length;

  function add(input: HTMLInputElement) {
    const picked = Array.from(input.files ?? []).slice(0, Math.max(room, 0));
    onFilesChange([...files, ...picked]);
    // Clear the input so the same photo can be picked again if needed.
    input.value = "";
  }

  return (
    <div className="sm:col-span-2">
      <span className="text-sm font-medium text-gray-700">More photos</span>
      <p className="text-xs text-gray-500">
        Up to {MAX_EXTRA_IMAGES} extra photos, shown on the product page.
      </p>

      {(existing.length > 0 || files.length > 0) && (
        <div className="mt-2 flex flex-wrap gap-3">
          {existing.map((url) => (
            <label key={url} className="w-28 text-xs text-gray-700">
              <span className="relative block h-24 w-28 overflow-hidden rounded-lg border border-gray-200">
                <Image src={url} alt="" fill sizes="112px" className="object-cover" />
              </span>
              <span className="mt-1 flex items-center gap-1">
                <input
                  type="checkbox"
                  name="remove_extra"
                  value={url}
                  className="h-4 w-4 accent-red-600"
                />
                Remove
              </span>
            </label>
          ))}
          {previews.map((url, index) => (
            <div key={url} className="w-28 text-xs text-gray-700">
              {/* A local preview of a new file, so next/image isn't needed. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-24 w-28 rounded-lg border border-orange-300 object-cover"
              />
              <button
                type="button"
                onClick={() => onFilesChange(files.filter((_, i) => i !== index))}
                className="mt-1 text-red-700 hover:underline"
              >
                Remove (new)
              </button>
            </div>
          ))}
        </div>
      )}

      {room > 0 ? (
        <div className="mt-2 flex flex-wrap gap-3">
          <label className={buttonClass}>
            Take photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(event) => add(event.currentTarget)}
            />
          </label>
          <label className={buttonClass}>
            Choose photos
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(event) => add(event.currentTarget)}
            />
          </label>
        </div>
      ) : (
        <p className="mt-2 text-xs text-gray-500">
          The limit of {MAX_EXTRA_IMAGES} extra photos is reached.
        </p>
      )}
    </div>
  );
}
