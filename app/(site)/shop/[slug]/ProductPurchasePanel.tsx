"use client";

import { useState } from "react";
import Link from "next/link";
import { addToCartAction } from "@/app/(site)/cart/_actions";
import { ArrowUpRightIcon } from "@/components/icons";
import type { ProductOption } from "@/server/services/catalog";

type Props = {
  slug: string;
  category: string;
  title: string;
  sku: string;
  price: string;
  options: ProductOption[];
  inStock: number | null; // null = not tracked
};

export default function ProductPurchasePanel({
  slug,
  category,
  title,
  sku,
  price,
  options,
  inStock,
}: Props) {
  // Default each option group to its first value.
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      options.filter((o) => o.values.length).map((o) => [o.name, o.values[0]]),
    ),
  );
  const [qty, setQty] = useState(1);

  const soldOut = inStock !== null && inStock <= 0;

  return (
    <div className="flex w-full flex-col items-start gap-[16px]">
      {category && (
        <p className="text-xs uppercase tracking-wide text-black/50">{category}</p>
      )}
      <h1 className="text-2xl font-semibold leading-tight text-black sm:text-3xl">
        {title}
      </h1>
      {sku && <p className="text-xs text-black/40">SKU: {sku}</p>}
      <p className="text-2xl font-semibold text-ink">{price}</p>

      {/* Option groups. Colour renders as a radio list (Figma); the rest as pills. */}
      {options
        .filter((o) => o.name && o.values.length)
        .map((option) => {
          const isColour = /colou?r/i.test(option.name);
          return (
            <div key={option.name} className="flex w-full flex-col gap-[10px]">
              <p className="text-sm text-black/70">
                {option.name} —{" "}
                <span className="font-semibold text-black">
                  {selected[option.name]}
                </span>
              </p>

              {isColour ? (
                <div className="flex flex-wrap gap-x-[18px] gap-y-[10px]">
                  {option.values.map((value) => {
                    const active = selected[option.name] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setSelected((s) => ({ ...s, [option.name]: value }))
                        }
                        className="flex items-center gap-[8px]"
                      >
                        <span
                          className={`flex size-[16px] items-center justify-center rounded-full border transition ${
                            active ? "border-ink" : "border-black/30"
                          }`}
                        >
                          {active && (
                            <span className="size-[8px] rounded-full bg-ink" />
                          )}
                        </span>
                        <span
                          className={`text-sm transition ${
                            active ? "text-black" : "text-black/70"
                          }`}
                        >
                          {value}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-[8px]">
                  {option.values.map((value) => {
                    const active = selected[option.name] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setSelected((s) => ({ ...s, [option.name]: value }))
                        }
                        className={`rounded-[6px] border px-[14px] py-[7px] text-sm transition ${
                          active
                            ? "border-ink bg-ink text-white"
                            : "border-cool-20 bg-white text-ink hover:border-ink"
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

      {/* Quantity + actions */}
      <form action={addToCartAction} className="mt-[8px] flex flex-wrap items-center gap-[12px]">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="quantity" value={qty} />

        <div className="flex h-[44px] items-center rounded-[48px] border border-cool-20">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="flex size-[44px] items-center justify-center text-lg text-ink"
          >
            −
          </button>
          <span className="w-[28px] text-center text-sm font-medium">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            aria-label="Increase quantity"
            className="flex size-[44px] items-center justify-center text-lg text-ink"
          >
            +
          </button>
        </div>

        <button
          type="submit"
          disabled={soldOut}
          className="flex h-[44px] items-center gap-[6px] rounded-[48px] bg-ink py-[4px] pl-[20px] pr-[4px] text-sm font-medium tracking-[0.5px] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {soldOut ? "Out of stock" : "Add To Cart"}
          <span className="flex size-[32px] items-center justify-center rounded-full bg-white text-ink">
            <ArrowUpRightIcon className="size-[16px]" />
          </span>
        </button>

        <Link
          href="/#quote"
          className="flex h-[44px] items-center gap-[6px] rounded-[48px] border border-ink py-[4px] pl-[16px] pr-[4px] text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-white"
        >
          Get A Free Quote
          <span className="flex size-[32px] items-center justify-center rounded-full bg-ink text-white">
            <ArrowUpRightIcon className="size-[16px]" />
          </span>
        </Link>
      </form>

      <p className="text-xs text-black/50">
        {soldOut
          ? "Currently unavailable — request a quote and we'll source it."
          : inStock !== null
            ? `${inStock} in stock · ships from Balcatta`
            : "In stock · pick up from Balcatta or delivered across Perth"}
      </p>
    </div>
  );
}
