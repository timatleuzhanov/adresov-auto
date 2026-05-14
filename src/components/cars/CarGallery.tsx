"use client";

import Image from "next/image";
import { useState } from "react";

export function CarGallery({
  images,
  alt,
}: {
  images: { id: string; path: string }[];
  alt: string;
}) {
  const [idx, setIdx] = useState(0);
  const main = images[idx]?.path;
  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-card bg-muted shadow-card">
        {main ? (
          <Image src={main} alt={alt} fill className="object-cover" sizes="(max-width:768px) 100vw,66vw" priority />
        ) : null}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((im, i) => (
            <button
              key={im.id}
              type="button"
              onClick={() => setIdx(i)}
              className={`relative h-16 w-28 shrink-0 overflow-hidden rounded-btn border ${
                i === idx ? "border-white ring-2 ring-white" : "border-black/10"
              }`}
              aria-label={`Фото ${i + 1}`}
            >
              <Image src={im.path} alt="" fill className="object-cover" sizes="112px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
