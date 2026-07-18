"use client";

import { useState } from "react";
import Image from "next/image";
import Collapse from "@/components/Collapse";
import { ArrowCircle, Container, SectionHeading } from "@/app/_components/site/ui";
import type { ServiceItem } from "@/server/services/catalog";


export default function ServicesList({ items }: { items: ServiceItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Nothing added in the admin yet -> don't render an empty section.
  if (items.length === 0) return null;

  return (
    <section className="w-full bg-white py-16 lg:py-[64px]">
      <Container>
        <div className="flex flex-col gap-[26px]">
          <SectionHeading
            eyebrow="Our Services"
            title="More than fences."
            copy="Whether you're after privacy, security, or a boundary that lifts the whole property, we build fences that do the job and last. New installs, repairs, and everything in between"
          />

          <div className="flex flex-col items-start gap-[24px] lg:flex-row lg:gap-[80px]">
            {/* Numbered accordion list */}
            <ul className="w-full overflow-hidden lg:flex-1">
              {items.map((item, i) => {
                const isOpen = openIndex === i;
                return (
                  <li
                    key={item.slug}
                    className="group flex w-full flex-col justify-center gap-[4px] border-b-[0.5px] border-ink py-[8px]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between text-left"
                    >
                      <span className="flex items-center gap-[26px] text-ink">
                        <span
                          className={`text-[16px] font-normal leading-normal transition-colors duration-200 ${
                            isOpen ? "text-brand" : "text-ink/50"
                          }`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[20px] font-normal leading-normal transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transform-none sm:text-[24px]">
                          {item.title}
                        </span>
                      </span>
                      <ArrowCircle active={isOpen} />
                    </button>

                    {item.excerpt && (
                      <Collapse open={isOpen}>
                        <p className="max-w-[336px] pb-1 text-[12px] leading-normal text-black/80">
                          {item.excerpt}
                        </p>
                      </Collapse>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Feature image */}
            <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-[4px] lg:w-[45%] lg:max-w-[560px]">
              <Image
                src="/figma/services.jpg"
                alt="Timber post-and-rail fence at sunset"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              <span
                aria-hidden
                className="absolute inset-0 rounded-[inherit] shadow-[inset_-4px_-4px_16px_0px_rgba(0,0,0,0.25)]"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
