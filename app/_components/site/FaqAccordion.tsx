"use client";

import { useState } from "react";
import Collapse from "@/components/Collapse";
import type { FaqItem } from "@/server/services/catalog";
import { ChevronDownIcon } from "@/components/icons";

type Props = {
  faqs: FaqItem[];
  title?: string;
  aside?: string;
};

export default function FaqAccordion({ faqs, title = "FAQs", aside }: Props) {
  /**
   * Single-open accordion: opening one closes the others. Keeps the page from
   * jumping around and makes the animation read clearly.
   */
  const [openIndex, setOpenIndex] = useState<number | null>(() => {
    const i = faqs.findIndex((f) => f.defaultOpen);
    return i === -1 ? null : i;
  });

  if (faqs.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-[16px]">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-[24px] font-semibold leading-normal text-black sm:text-[28px]">
          {title}
        </h2>
        {aside && (
          <p className="hidden text-[10px] text-black/50 sm:block">{aside}</p>
        )}
      </div>

      <ul className="w-full">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <li
              key={faq.question}
              className="border-b border-black/10 transition-colors duration-200 hover:border-black/25"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="group flex w-full items-center justify-between gap-4 py-[16px] text-left"
              >
                <span
                  className={`text-[14px] transition-colors duration-200 ${
                    isOpen
                      ? "font-semibold text-ink"
                      : "font-medium text-ink/80 group-hover:text-ink"
                  }`}
                >
                  {faq.question}
                </span>
                <ChevronDownIcon
                  className={`size-[18px] shrink-0 text-ink transition-transform duration-300 ease-out motion-reduce:transition-none ${
                    isOpen ? "rotate-180" : "group-hover:translate-y-0.5"
                  }`}
                />
              </button>

              <Collapse open={isOpen}>
                <p className="max-w-[900px] pb-[16px] text-[12px] leading-[1.6] text-black/60">
                  {faq.answer}
                </p>
              </Collapse>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
