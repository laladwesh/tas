"use client";

import { useState, type ReactNode } from "react";

type Faq = {
  question: string;
  answer: ReactNode | null;
  defaultOpen?: boolean;
};

const faqs: Faq[] = [
  {
    question: "What types of fencing do you offer in Perth?",
    answer: (
      <>
        We install Colorbond, timber, aluminium slat,{" "}
        <span className="underline">pool fencing</span>, gates, and retaining
        walls across Perth.
      </>
    ),
    defaultOpen: true,
  },
  {
    question: "What are the benefits of Colorbond fencing in Perth?",
    answer:
      "Colorbond fencing is durable, low maintenance, weather-resistant, and ideal for Perth conditions.",
    defaultOpen: false,
  },
  {
    question: "Is aluminium slat fencing suitable for Perth's climate?",
    answer:
      "Yes — when installed correctly and with the right materials, aluminium slat fencing performs well in Perth.",
    defaultOpen: false,
  },
  {
    question: "Does Stag Fencing install compliant fencing services in Perth?",
    answer:
      "Yes, At Stag Fencing all fencing services installations meet Western Australian safety regulations.",
    defaultOpen: false,
  }
];

export default function FaqSection() {
  const [open, setOpen] = useState<boolean[]>(() =>
    faqs.map((faq) => Boolean(faq.defaultOpen))
  );

  const toggle = (index: number) =>
    setOpen((prev) => prev.map((value, i) => (i === index ? !value : value)));

  return (
    <section className="w-full bg-[#E7E7E7] py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Frequently Asked Question
        </h2>

        <div className="mt-8 space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open[i];
            return (
              <div key={faq.question} className="bg-white">
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                >
                  <span className="text-sm font-bold text-gray-900 sm:text-base">
                    {faq.question}
                  </span>
                  <ToggleIcon open={isOpen} />
                </button>

                {isOpen && faq.answer && (
                  <div className="px-6 pb-4 text-sm leading-relaxed text-gray-500">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ToggleIcon({ open }: { open: boolean }) {
  return (
    <span className="relative ml-4 block h-4 w-4 shrink-0 text-gray-700">
      <span className="absolute left-0 top-1/2 h-0.5 w-4 -translate-y-1/2 rounded bg-current" />
      {!open && (
        <span className="absolute left-1/2 top-0 h-4 w-0.5 -translate-x-1/2 rounded bg-current" />
      )}
    </span>
  );
}
