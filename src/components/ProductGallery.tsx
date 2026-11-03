"use client";

import Image from "next/image";
import { useState } from "react";

// The product page photos: one large photo with small thumbnails to switch
// between them.
export default function ProductGallery({
  images,
  alt,
  noImageText,
}: {
  images: string[];
  alt: string;
  noImageText: string;
}) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-100 text-gray-400">
        {noImageText}
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={images[selected]}
          alt={alt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-contain"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`${alt} ${index + 1}`}
              aria-pressed={index === selected}
              className={`relative h-16 w-16 overflow-hidden rounded-md border-2 ${
                index === selected ? "border-orange-500" : "border-transparent"
              }`}
            >
              <Image src={url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
