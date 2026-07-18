"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProductItem } from "@/server/services/catalog";
import { ChevronDownIcon, SearchIcon } from "@/components/icons";

const PER_PAGE = 9;

const SORTS = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

const money = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-AU", { minimumFractionDigits: 0 })}`;

export default function ShopBrowser({ products }: { products: ProductItem[] }) {
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort(),
    [products],
  );
  const subCategories = useMemo(
    () =>
      Array.from(
        new Set(products.map((p) => p.subCategory).filter(Boolean) as string[]),
      ).sort(),
    [products],
  );

  const priceBounds = useMemo(() => {
    const values = products.map((p) => p.priceCents).filter((n) => n > 0);
    return {
      min: values.length ? Math.min(...values) : 0,
      max: values.length ? Math.max(...values) : 0,
    };
  }, [products]);

  const [search, setSearch] = useState("");
  const [cats, setCats] = useState<Set<string>>(new Set());
  const [subs, setSubs] = useState<Set<string>>(new Set());
  const [maxPrice, setMaxPrice] = useState(priceBounds.max);
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const toggle = (set: Set<string>, value: string) => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    return next;
  };

  const hasFilters =
    search || cats.size || subs.size || maxPrice < priceBounds.max;

  const reset = () => {
    setSearch("");
    setCats(new Set());
    setSubs(new Set());
    setMaxPrice(priceBounds.max);
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = products;
    if (search) {
      const needle = search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(needle));
    }
    if (cats.size) list = list.filter((p) => cats.has(p.category));
    if (subs.size) list = list.filter((p) => p.subCategory && subs.has(p.subCategory));
    if (maxPrice < priceBounds.max) {
      list = list.filter((p) => p.priceCents <= maxPrice);
    }

    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return a.priceCents - b.priceCents;
      if (sort === "price-desc") return b.priceCents - a.priceCents;
      if (sort === "name") return a.title.localeCompare(b.title);
      return 0;
    });
    return list;
  }, [products, search, cats, subs, maxPrice, sort, priceBounds.max]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PER_PAGE;
  const pageItems = filtered.slice(start, start + PER_PAGE);
  const from = filtered.length === 0 ? 0 : start + 1;
  const to = Math.min(start + PER_PAGE, filtered.length);

  // Any filter change resets to page 1.
  const onFilterChange = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  const pill = (active: boolean) =>
    `rounded-[6px] px-[12px] py-[7px] text-left text-sm transition ${
      active ? "bg-ink text-white" : "bg-white text-ink hover:bg-black/5"
    }`;

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
      {/* ---------------- Filter sidebar ---------------- */}
      <aside className="w-full shrink-0 lg:w-[248px]">
        <div className="rounded-[8px] bg-field p-[20px]">
          <div className="mb-[16px] flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Filter Products</h2>
            <button
              type="button"
              onClick={() => (hasFilters ? reset() : setFiltersOpen((o) => !o))}
              aria-label={hasFilters ? "Clear filters" : "Toggle filters"}
              className="text-black/50 transition hover:text-black"
            >
              {hasFilters ? "Clear" : <ChevronDownIcon className="size-[18px]" />}
            </button>
          </div>

          {filtersOpen && (
            <div className="flex flex-col gap-[20px]">
              {/* Price */}
              {priceBounds.max > 0 && (
                <div>
                  <p className="mb-[8px] text-sm font-medium text-black/70">Price</p>
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    step={100}
                    value={maxPrice}
                    onChange={(e) =>
                      onFilterChange(setMaxPrice)(Number(e.target.value))
                    }
                    className="w-full accent-brand"
                  />
                  <p className="mt-[6px] text-sm text-ink">
                    {money(priceBounds.min)} – {money(maxPrice)}
                  </p>
                </div>
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <p className="mb-[8px] text-sm font-medium text-black/70">
                    Categories
                  </p>
                  <div className="flex flex-col gap-[6px]">
                    {categories.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() =>
                          onFilterChange(setCats)(toggle(cats, name))
                        }
                        className={pill(cats.has(name))}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub Categories */}
              {subCategories.length > 0 && (
                <div>
                  <p className="mb-[8px] text-sm font-medium text-black/70">
                    Sub Categories
                  </p>
                  <div className="flex flex-col gap-[6px]">
                    {subCategories.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() =>
                          onFilterChange(setSubs)(toggle(subs, name))
                        }
                        className={pill(subs.has(name))}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ---------------- Products ---------------- */}
      <div className="flex-1">
        {/* Toolbar */}
        <div className="mb-[24px] flex flex-col items-stretch gap-[12px] sm:flex-row sm:items-center sm:justify-between">
          <p className="whitespace-nowrap text-sm text-black/60">
            Showing <span className="font-semibold text-ink">{from}–{to}</span> of{" "}
            {filtered.length} results
          </p>

          <div className="flex flex-1 items-center gap-[12px] sm:max-w-[460px] sm:justify-end">
            <div className="relative flex-1 sm:max-w-[280px]">
              <SearchIcon className="pointer-events-none absolute left-[14px] top-1/2 size-[16px] -translate-y-1/2 text-black/40" />
              <input
                type="search"
                value={search}
                onChange={(e) => onFilterChange(setSearch)(e.target.value)}
                placeholder="Search"
                className="h-[40px] w-full rounded-[48px] border border-black/15 bg-white pl-[38px] pr-[16px] text-sm outline-none transition focus:border-brand"
              />
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => onFilterChange(setSort)(e.target.value)}
                className="h-[40px] cursor-pointer appearance-none rounded-[48px] border border-black/15 bg-white pl-[16px] pr-[36px] text-sm outline-none transition focus:border-brand"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort: {option.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-[12px] top-1/2 size-[16px] -translate-y-1/2 text-black/50" />
            </div>
          </div>
        </div>

        {/* Grid */}
        {pageItems.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-black/60">No products match your filters.</p>
            {hasFilters && (
              <button
                type="button"
                onClick={reset}
                className="mt-2 text-sm text-brand hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-[20px] gap-y-[32px] md:grid-cols-3">
            {pageItems.map((product) => (
              <div key={product.slug} className="group flex flex-col gap-[8px]">
                <div className="relative aspect-square w-full overflow-hidden rounded-[8px] bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20"
                  />
                  <Link
                    href={`/shop/${product.slug}`}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[48px] bg-white px-[22px] py-[8px] text-sm font-medium tracking-[0.5px] text-black opacity-0 shadow-md transition-all duration-300 hover:scale-105 group-hover:opacity-100"
                  >
                    View
                  </Link>
                </div>
                <Link href={`/shop/${product.slug}`} className="flex flex-col gap-[2px]">
                  {product.category && (
                    <p className="text-xs text-black/50">{product.category}</p>
                  )}
                  <h3 className="line-clamp-2 text-base font-medium leading-[1.4] text-black">
                    {product.title}
                  </h3>
                  <p className="text-sm text-black/70">{product.price}</p>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-[40px] flex items-center justify-center gap-[8px]">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={current === 1}
              className="flex size-[36px] items-center justify-center rounded-full border border-black/15 text-sm transition hover:bg-black/5 disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i + 1)}
                className={`flex size-[36px] items-center justify-center rounded-full text-sm transition ${
                  current === i + 1
                    ? "bg-ink text-white"
                    : "border border-black/15 hover:bg-black/5"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={current === totalPages}
              className="flex size-[36px] items-center justify-center rounded-full border border-black/15 text-sm transition hover:bg-black/5 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
