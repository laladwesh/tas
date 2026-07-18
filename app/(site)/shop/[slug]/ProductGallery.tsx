"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const gallery = images.length ? images : ["/figma/hero-bg.jpg"];
  const [active, setActive] = useState(0);
  const current = gallery[Math.min(active, gallery.length - 1)];

  return (
    <div className="flex w-full flex-col gap-[12px]">
      <div className="relative aspect-square w-full overflow-hidden rounded-[8px] bg-field">
        <Image
          src={current}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-contain"
        />
      </div>

      {gallery.length > 1 && (
        <div className="grid grid-cols-5 gap-[10px]">
          {gallery.slice(0, 5).map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative aspect-square overflow-hidden rounded-[6px] bg-field transition ${
                active === i ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
