"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/icons";

type ProductHit = {
  slug: string;
  title: string;
  price: string;
  image: string;
  category: string;
};
type ServiceHit = { slug: string; title: string; priceFrom: string; image: string };
type Catalog = { products: ProductHit[]; services: ServiceHit[] };

export default function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Catalog | null>(null);

  // Fetch the catalogue once, the first time the overlay opens.
  useEffect(() => {
    if (open && !data) {
      fetch("/api/catalog")
        .then((r) => r.json())
        .then(setData)
        .catch(() => setData({ products: [], services: [] }));
    }
  }, [open, data]);

  // Focus the field and lock body scroll while open; Esc closes.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const q = query.trim().toLowerCase();

  const products = useMemo(() => {
    if (!data) return [];
    const list = q
      ? data.products.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q),
        )
      : data.products;
    return list.slice(0, 8);
  }, [data, q]);

  const services = useMemo(() => {
    if (!data) return [];
    const list = q
      ? data.services.filter((s) => s.title.toLowerCase().includes(q))
      : data.services;
    return list.slice(0, 4);
  }, [data, q]);

  if (!open) return null;

  const go = (href: string) => {
    onClose();
    setQuery("");
    router.push(href);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q) go(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const hasResults = products.length > 0 || services.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex justify-center">
      {/* Backdrop */}
      <button
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="relative z-10 mt-[80px] flex max-h-[80vh] w-full max-w-[680px] flex-col overflow-hidden rounded-[16px] bg-white shadow-2xl">
        <form onSubmit={submit} className="flex items-center gap-[12px] border-b border-cool-20 px-[20px] py-[16px]">
          <SearchIcon className="size-[20px] shrink-0 text-black/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fencing products & services…"
            className="flex-1 bg-transparent text-base text-black outline-none placeholder:text-black/40"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-[10px] py-[4px] text-xs text-black/50 hover:bg-black/5"
          >
            Esc
          </button>
        </form>

        <div className="flex-1 overflow-y-auto p-[12px]">
          {!data ? (
            <p className="p-6 text-center text-sm text-black/40">Loading…</p>
          ) : !hasResults ? (
            <p className="p-6 text-center text-sm text-black/50">
              No matches for “{query}”. Try “colorbond”, “pool” or “gate”.
            </p>
          ) : (
            <>
              {!q && (
                <p className="px-[10px] pb-[6px] pt-[4px] text-xs uppercase tracking-wide text-black/40">
                  Popular right now
                </p>
              )}

              {products.length > 0 && (
                <div className="mb-[8px]">
                  {q && (
                    <p className="px-[10px] py-[6px] text-xs uppercase tracking-wide text-black/40">
                      Products
                    </p>
                  )}
                  {products.map((p) => (
                    <button
                      key={p.slug}
                      onClick={() => go(`/shop/${p.slug}`)}
                      className="flex w-full items-center gap-[12px] rounded-[8px] px-[10px] py-[8px] text-left transition hover:bg-field"
                    >
                      <span className="relative size-[44px] shrink-0 overflow-hidden rounded-[6px] bg-field">
                        <Image src={p.image} alt="" fill sizes="44px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 text-sm font-medium text-black">
                          {p.title}
                        </span>
                        <span className="text-xs text-black/50">{p.category}</span>
                      </span>
                      <span className="whitespace-nowrap text-sm text-black/70">
                        {p.price}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {services.length > 0 && (
                <div>
                  <p className="px-[10px] py-[6px] text-xs uppercase tracking-wide text-black/40">
                    Services
                  </p>
                  {services.map((s) => (
                    <button
                      key={s.slug}
                      onClick={() => go(`/services/${s.slug}`)}
                      className="flex w-full items-center gap-[12px] rounded-[8px] px-[10px] py-[8px] text-left transition hover:bg-field"
                    >
                      <span className="relative size-[44px] shrink-0 overflow-hidden rounded-[6px] bg-field">
                        <Image src={s.image} alt="" fill sizes="44px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 text-sm font-medium text-black">
                          {s.title}
                        </span>
                        <span className="text-xs text-black/50">Service</span>
                      </span>
                      <span className="whitespace-nowrap text-sm text-black/70">
                        {s.priceFrom}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {q && (
                <button
                  onClick={() => go(`/search?q=${encodeURIComponent(query.trim())}`)}
                  className="mt-[8px] w-full rounded-[8px] bg-field px-[10px] py-[10px] text-center text-sm font-medium text-ink hover:bg-black/5"
                >
                  See all results for “{query.trim()}”
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
