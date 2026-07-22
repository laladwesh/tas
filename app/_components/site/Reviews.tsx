"use client";

import { useRef } from "react";
import { Container, Eyebrow } from "@/app/_components/site/ui";
import { GoogleG, StarIcon, ChevronLeft, ChevronRight } from "@/components/icons";
import SafeImage from "@/components/SafeImage";
import type { ReviewItem } from "@/server/services/catalog";



export default function Reviews({ reviews }: { reviews: ReviewItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  // No reviews added yet -> hide the section entirely.
  if (reviews.length === 0) return null;

  const scrollBy = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * 237, behavior: "smooth" });
  };

  return (
    <section className="w-full bg-ink py-16 lg:py-[64px]">
      <Container>
        <div className="flex flex-col gap-[26px]">
          {/* Heading (dark variant) */}
          <div className="flex flex-col items-start gap-[24px] lg:flex-row lg:items-center lg:gap-[115px]">
            <div className="flex w-full flex-col items-start gap-[17px] lg:w-[359px]">
              <span className="inline-flex items-center justify-center gap-[8px] overflow-hidden rounded-[20px] border border-[#f2efea]/20 px-[20px] py-[2px]">
                <span aria-hidden className="size-[5px] shrink-0 rounded-full bg-brand" />
                <span className="text-[10px] font-bold leading-normal text-[#f2efea]">
                  REVIEWS
                </span>
              </span>
              <h2 className="text-[28px] font-semibold leading-normal text-[#f2efea] sm:text-[36px]">
                What our customers actually say
              </h2>
            </div>
            <p className="max-w-[336px] text-[14px] leading-[1.4] text-[#f2efea]">
              Perth homeowners and businesses, in their own words. Most mention the
              same things: quick quotes, a tidy job, and no fuss.
            </p>
          </div>

          <div className="flex flex-col items-end gap-[9px]">
            {/* Carousel arrows */}
            <div className="flex items-center justify-end gap-[8px]">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                aria-label="Previous reviews"
                className="flex size-[24px] items-center justify-center rounded-full border border-[#f2efea]/60 text-[#f2efea] transition hover:bg-white/10"
              >
                <ChevronLeft className="size-[12px]" />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                aria-label="Next reviews"
                className="flex size-[24px] items-center justify-center rounded-full border border-[#f2efea]/60 text-[#f2efea] transition hover:bg-white/10"
              >
                <ChevronRight className="size-[12px]" />
              </button>
            </div>

            {/* Cards */}
            <div
              ref={trackRef}
              className="flex w-full snap-x snap-mandatory gap-[20px] overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {reviews.map((review) => (
                <article
                  key={review.name}
                  className="flex w-[217px] shrink-0 snap-start flex-col gap-[8px] overflow-hidden rounded-[4px] bg-white"
                >
                  {/* Photo + badges */}
                  <div className="relative h-[139px] w-full shrink-0 overflow-hidden rounded-[4px]">
                    <SafeImage
                      src={review.image}
                      alt=""
                      sizes="217px"
                      className="object-cover"
                    />
                    <span className="absolute left-[4px] top-[107px] flex size-[24px] items-center justify-center overflow-hidden rounded-full bg-white">
                      <GoogleG className="size-[16px]" />
                    </span>
                    <span className="absolute right-[4px] top-[114px] flex items-center gap-[4px] rounded-[8px] bg-black/60 px-[4px]">
                      <StarIcon className="size-[12px] text-[#f1a93b]" />
                      <span className="font-roboto text-[12px] leading-[1.4] text-cool-20">
                        {review.rating}
                      </span>
                    </span>
                  </div>

                  {/* Quote */}
                  <div className="flex flex-col gap-[4px] px-[12px] text-[10px] leading-[1.4] text-black">
                    <p className="line-clamp-4 h-[56px] overflow-hidden">
                      {review.quote}
                    </p>
                    <button
                      type="button"
                      className="w-full text-right font-semibold hover:underline"
                    >
                      read more
                    </button>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-[8px] px-[12px] pb-[16px]">
                    <span className="relative size-[32px] shrink-0 overflow-hidden rounded-full">
                      <SafeImage
                        src={review.avatar}
                        alt=""
                        sizes="32px"
                        className="object-cover"
                      />
                    </span>
                    <div className="flex flex-col items-start text-[10px] leading-[1.4] text-black">
                      <p className="whitespace-nowrap font-semibold">{review.name}</p>
                      <p className="font-normal">{review.role}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
