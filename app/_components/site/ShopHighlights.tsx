"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  ArrowPillLink,
  Container,
  Eyebrow,
} from "@/app/_components/site/ui";
import SafeImage from "@/components/SafeImage";
import { ChevronLeft, ChevronRight } from "@/components/icons";
import type { ProductItem } from "@/server/services/catalog";



export default function ShopHighlights({
  popular,
  affordable,
}: {
  popular: ProductItem[];
  affordable: ProductItem[];
}) {
  if (popular.length === 0 && affordable.length === 0) return null;

  return (
    <section className="w-full bg-white py-16 lg:py-[64px]">
      <Container>
        <div className="flex flex-col gap-[32px]">
          {/* Heading + CTA */}
          <div className="flex flex-col items-start gap-[24px] lg:flex-row lg:items-center lg:gap-[115px]">
            <div className="flex w-full flex-col items-start gap-[17px] lg:w-[359px]">
              <Eyebrow>Our DIY Range</Eyebrow>
              <h2 className="text-[28px] font-semibold leading-normal text-black sm:text-[36px]">
                Popular right now
              </h2>
            </div>
            <div className="flex w-full max-w-[336px] flex-col items-start gap-[20px]">
              <p className="text-[14px] leading-[1.4] text-black">
                The same trade-quality materials we install, ready for you to pick
                up or have delivered across Perth.
              </p>
              <ArrowPillLink href="/shop">See the full range</ArrowPillLink>
            </div>
          </div>

          <ProductRow products={popular} label="popular products" />

          <h2 className="text-[28px] font-semibold leading-normal text-black sm:text-[36px]">
            Affordable picks
          </h2>

          <ProductRow products={affordable} label="affordable products" />
        </div>
      </Container>
    </section>
  );
}

function ProductRow({
  products,
  label,
}: {
  products: ProductItem[];
  label: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 1 | -1) =>
    trackRef.current?.scrollBy({ left: direction * 237, behavior: "smooth" });

  return (
    <div className="flex flex-col items-end gap-[9px]">
      <div className="flex items-center justify-end gap-[8px]">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label={`Previous ${label}`}
          className="flex size-[24px] items-center justify-center rounded-full border border-ink/60 text-ink transition hover:bg-ink hover:text-white"
        >
          <ChevronLeft className="size-[12px]" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label={`Next ${label}`}
          className="flex size-[24px] items-center justify-center rounded-full border border-ink/60 text-ink transition hover:bg-ink hover:text-white"
        >
          <ChevronRight className="size-[12px]" />
        </button>
      </div>

      <div
        ref={trackRef}
        className="flex w-full snap-x snap-mandatory gap-[20px] overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product, i) => (
          <Link
            key={product.slug + i}
            href={`/shop/${product.slug}`}
            className="flex w-[217px] shrink-0 snap-start flex-col gap-[4px] rounded-[12px] pb-[12px] drop-shadow-[4px_4px_16px_rgba(0,0,0,0.1)]"
          >
            <div className="relative size-[217px] overflow-hidden rounded-[4px] bg-white">
              <SafeImage
                src={product.image}
                alt={product.title}
                sizes="217px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col items-start leading-[1.4] text-black">
              <p className="text-[14px] font-semibold">{product.title}</p>
              <p className="whitespace-nowrap text-[12px] font-normal">
                {product.price}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
