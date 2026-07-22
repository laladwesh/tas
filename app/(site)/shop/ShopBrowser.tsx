"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ProductItem } from "@/server/services/catalog";
import { ChevronDownIcon, SearchIcon } from "@/components/icons";
import SafeImage from "@/components/SafeImage";

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

  const priceBounds = useMemo(() => {
    const values = products.map((p) => p.priceCents).filter((n) => n > 0);
    return {
      min: values.length ? Math.min(...values) : 0,
      max: values.length ? Math.max(...values) : 0,
    };
  }, [products]);

  const [search, setSearch] = useState("");
  // Single category; its subcategories (multi-select) show only once picked.
  const [cat, setCat] = useState("");
  const [subs, setSubs] = useState<Set<string>>(new Set());
  const [maxPrice, setMaxPrice] = useState(priceBounds.max);
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Sub-categories that exist within the selected category only.
  const subCategories = useMemo(() => {
    if (!cat) return [];
    return Array.from(
      new Set(
        products
          .filter((p) => p.category === cat)
          .map((p) => p.subCategory)
          .filter(Boolean) as string[],
      ),
    ).sort();
  }, [products, cat]);

  const hasFilters = Boolean(
    search || cat || subs.size || maxPrice < priceBounds.max,
  );

  const reset = () => {
    setSearch("");
    setCat("");
    setSubs(new Set());
    setMaxPrice(priceBounds.max);
    setPage(1);
  };

  // Pick a category (toggles off if re-clicked). Changing it clears subs,
  // since sub-categories belong to a specific category.
  const selectCategory = (name: string) => {
    setCat((prev) => (prev === name ? "" : name));
    setSubs(new Set());
    setPage(1);
  };

  const toggleSub = (name: string) => {
    setSubs((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = products;
    if (search) {
      const needle = search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(needle));
    }
    if (cat) list = list.filter((p) => p.category === cat);
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
  }, [products, search, cat, subs, maxPrice, sort, priceBounds.max]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PER_PAGE;
  const pageItems = filtered.slice(start, start + PER_PAGE);
  const from = filtered.length === 0 ? 0 : start + 1;
  const to = Math.min(start + PER_PAGE, filtered.length);

  const onSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  // Accessible sizing: pills at 16px (base), never below 14px.
  const pill = (active: boolean) =>
    `rounded-md px-3 py-2 text-left text-base transition ${
      active ? "bg-ink text-white" : "bg-white text-ink hover:bg-black/5"
    }`;

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      {/* ---------------- Filter sidebar (sticky on desktop) ---------------- */}
      <aside className="w-full shrink-0 lg:sticky lg:top-28 lg:w-64 lg:self-start">
        <div className="rounded-lg bg-field p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Filter Products</h2>
            <button
              type="button"
              onClick={() => (hasFilters ? reset() : setFiltersOpen((o) => !o))}
              className="text-sm text-black/50 transition hover:text-black"
            >
              {hasFilters ? "Clear" : <ChevronDownIcon className="size-5" />}
            </button>
          </div>

          {filtersOpen && (
            <div className="flex flex-col gap-6">
              {/* Price */}
              {priceBounds.max > 0 && (
                <div>
                  <p className="mb-2 text-base font-medium text-black/70">Price</p>
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    step={100}
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(Number(e.target.value));
                      setPage(1);
                    }}
                    className="w-full accent-brand"
                    aria-label="Maximum price"
                  />
                  <p className="mt-1.5 text-sm text-ink">
                    {money(priceBounds.min)} – {money(maxPrice)}
                  </p>
                </div>
              )}

              {/* Categories — one at a time */}
              {categories.length > 0 && (
                <div>
                  <p className="mb-2 text-base font-medium text-black/70">
                    Categories
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {categories.map((name) => (
                      <button
                        key={name}
                        type="button"
                        aria-pressed={cat === name}
                        onClick={() => selectCategory(name)}
                        className={pill(cat === name)}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub Categories — only for the chosen category, multi-select */}
              {cat && subCategories.length > 0 && (
                <div>
                  <p className="mb-2 text-base font-medium text-black/70">
                    Sub Categories
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {subCategories.map((name) => (
                      <button
                        key={name}
                        type="button"
                        aria-pressed={subs.has(name)}
                        onClick={() => toggleSub(name)}
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
        <div className="mb-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="whitespace-nowrap text-sm text-black/60">
            Showing <span className="font-semibold text-ink">{from}–{to}</span> of{" "}
            {filtered.length} results
          </p>

          <div className="flex flex-1 items-center gap-3 sm:max-w-md sm:justify-end">
            <div className="relative flex-1 sm:max-w-xs">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-black/40" />
              <input
                type="search"
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search"
                className="h-11 w-full rounded-full border border-black/15 bg-white pl-10 pr-4 text-base outline-none transition focus:border-brand"
              />
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="h-11 cursor-pointer appearance-none rounded-full border border-black/15 bg-white pl-4 pr-9 text-base outline-none transition focus:border-brand"
                aria-label="Sort products"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort: {option.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-black/50" />
            </div>
          </div>
        </div>

        {/* Grid */}
        {pageItems.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-base text-black/60">No products match your filters.</p>
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
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3">
            {pageItems.map((product) => (
              <div key={product.slug} className="group flex flex-col gap-2">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                  <SafeImage
                    src={product.image}
                    alt={product.title}
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20"
                  />
                  <Link
                    href={`/shop/${product.slug}`}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-6 py-2 text-base font-medium tracking-wide text-black opacity-0 shadow-md transition-all duration-300 hover:scale-105 group-hover:opacity-100"
                  >
                    View
                  </Link>
                </div>
                <Link href={`/shop/${product.slug}`} className="flex flex-col gap-0.5">
                  {product.category && (
                    <p className="text-sm text-black/50">{product.category}</p>
                  )}
                  <h3 className="line-clamp-2 text-base font-medium leading-snug text-black">
                    {product.title}
                  </h3>
                  <p className="text-base text-black/70">{product.price}</p>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={current === 1}
              aria-label="Previous page"
              className="flex size-9 items-center justify-center rounded-full border border-black/15 text-base transition hover:bg-black/5 disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i + 1)}
                aria-label={`Page ${i + 1}`}
                aria-current={current === i + 1}
                className={`flex size-9 items-center justify-center rounded-full text-base transition ${
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
              aria-label="Next page"
              className="flex size-9 items-center justify-center rounded-full border border-black/15 text-base transition hover:bg-black/5 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
