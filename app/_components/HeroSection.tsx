"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { heroImages } from "@/data/heroImages";
import {
  ChevronLeft,
  ChevronRight,
  GoogleG,
  StarIcon,
} from "@/components/icons";

const AUTOPLAY_MS = 6000;

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-white">
      {/* Copy — shares the same centered container (and left edge) as the
          other sections, e.g. "Our Services". */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="py-12 lg:w-1/2 lg:py-24 lg:pr-10">
          {/* Badge */}
          <span className="inline-block rounded-full bg-badge px-4 py-1.5 text-sm font-medium text-badge-text">
            Join over 1,000 happy customers
          </span>

          {/* Heading */}
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl">
            Fencing Made for
            <br />
            Perth Sun, Sand &amp; Salt
          </h1>

          {/* Sub copy */}
          <p className="mt-5 max-w-md text-base leading-relaxed text-black sm:text-lg sm:leading-relaxed lg:max-w-lg">
            We&apos;ve been fencing Perth suburbs for years: Colorbond,
            aluminium slat, pool fencing, gates and retaining walls. We know
            what holds up in local conditions and what doesn&apos;t.
          </p>

          {/* Google rating */}
          <GoogleRatingCard />

          {/* CTA */}
          <div className="mt-7">
            <a
              href="#quote"
              className="inline-flex items-center justify-center bg-brand px-7 py-3.5 text-base font-medium text-white shadow-sm transition-colors hover:bg-brand-dark"
            >
              Get Your Free Quote Today
            </a>
          </div>
        </div>
      </div>

      {/* Image carousel — stacks under the copy on mobile; on desktop it fills
          the right half and bleeds to the right edge of the screen. */}
      <div className="relative h-[340px] w-full sm:h-[440px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-1/2">
        <HeroCarousel />
      </div>
    </section>
  );
}

function GoogleRatingCard() {
  return (
    <div className="mt-7 inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
      <GoogleG className="h-7 w-7 shrink-0 text-black" />
      <div className="leading-tight">
        <p className="text-xs text-gray-500">Google rating</p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <div className="flex text-[#fbbc04]">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} className="h-3.5 w-3.5" />
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-700">5.0</span>
        </div>
      </div>
    </div>
  );
}

function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const count = heroImages.length;

  const goTo = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  // Gentle autoplay; pauses while the tab is hidden.
  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count]);

  return (
    <div className="relative h-full w-full pt-4 lg:pt-6">
      <div className="relative h-full w-full overflow-hidden rounded-bl-[44px] lg:rounded-bl-[60px]">
        {heroImages.map((img, i) => (
          <Image
            key={i}
            src={img.src}
            alt={img.alt}
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={`object-cover transition-opacity duration-700 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Controls — only shown when there's more than one image */}
        {count > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-4">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous image"
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-white transition hover:bg-white/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2.5">
            {heroImages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to image ${i + 1}`}
                aria-current={i === index}
                className="flex h-4 w-4 items-center justify-center"
              >
                {i === index ? (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white">
                    <span className="h-1 w-1 rounded-full bg-white" />
                  </span>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={next}
            aria-label="Next image"
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-white transition hover:bg-white/10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        )}
      </div>
    </div>
  );
}
