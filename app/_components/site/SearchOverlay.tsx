"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/icons";
import SafeImage from "@/components/SafeImage";

type ProductHit = {
  slug: string;
  title: string;
  price: string;
  image: string;
  category: string;
};
type ServiceHit = { slug: string; title: string; priceFrom: string; image: string };
type Catalog = { products: ProductHit[]; services: ServiceHit[] };

/**
 * Lightweight inline search. Clicking the icon drops a panel under the header
 * (no full-screen modal, no backdrop blur — that was the lag). Results filter
 * instantly from a catalogue fetched once.
 */
export default function SearchBox() {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Catalog | null>(null);
  // Panel is position:fixed so the header's overflow-hidden can't clip it.
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const r = wrapRef.current?.getBoundingClientRect();
    if (r) {
      setCoords({
        top: r.bottom + 12,
        right: Math.max(8, window.innerWidth - r.right),
      });
    }
    setOpen(true);
  };

  // Fetch the catalogue once, the first time search is opened.
  useEffect(() => {
    if (open && !data) {
      fetch("/api/catalog")
        .then((r) => r.json())
        .then(setData)
        .catch(() => setData({ products: [], services: [] }));
    }
  }, [open, data]);

  // Focus on open; close on Esc or a click outside the whole widget.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

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
    return list.slice(0, 6);
  }, [data, q]);

  const services = useMemo(() => {
    if (!data) return [];
    const list = q
      ? data.services.filter((s) => s.title.toLowerCase().includes(q))
      : data.services;
    return list.slice(0, 3);
  }, [data, q]);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q) go(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const hasResults = products.length > 0 || services.length > 0;

  return (
    <div ref={wrapRef} className="relative flex items-center">
      <button
        type="button"
        aria-label="Search"
        aria-expanded={open}
        onClick={toggle}
        className="text-ink"
      >
        <SearchIcon className="size-[20px]" />
      </button>

      {open && (
        <div
          style={{ top: coords.top, right: coords.right }}
          className="fixed z-[60] w-[min(420px,92vw)] overflow-hidden rounded-[14px] border border-cool-20 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.14)]"
        >
          <form
            onSubmit={submit}
            className="flex items-center gap-[10px] border-b border-cool-20 px-[16px] py-[12px]"
          >
            <SearchIcon className="size-[18px] shrink-0 text-black/40" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products & services…"
              className="flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/40"
            />
          </form>

          <div className="max-h-[60vh] overflow-y-auto p-[8px]">
            {!data ? (
              <p className="p-4 text-center text-sm text-black/40">Loading…</p>
            ) : !hasResults ? (
              <p className="p-4 text-center text-sm text-black/50">
                No matches. Try “colorbond”, “pool” or “gate”.
              </p>
            ) : (
              <>
                {products.map((p) => (
                  <button
                    key={p.slug}
                    onClick={() => go(`/shop/${p.slug}`)}
                    className="flex w-full items-center gap-[12px] rounded-[8px] px-[8px] py-[8px] text-left transition-colors hover:bg-field"
                  >
                    <span className="relative size-[40px] shrink-0 overflow-hidden rounded-[6px] bg-field">
                      <SafeImage src={p.image} alt="" sizes="40px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-sm text-black">{p.title}</span>
                      <span className="text-xs text-black/50">{p.category}</span>
                    </span>
                    <span className="whitespace-nowrap text-xs text-black/70">{p.price}</span>
                  </button>
                ))}

                {services.map((s) => (
                  <button
                    key={s.slug}
                    onClick={() => go(`/services/${s.slug}`)}
                    className="flex w-full items-center gap-[12px] rounded-[8px] px-[8px] py-[8px] text-left transition-colors hover:bg-field"
                  >
                    <span className="relative size-[40px] shrink-0 overflow-hidden rounded-[6px] bg-field">
                      <SafeImage src={s.image} alt="" sizes="40px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-sm text-black">{s.title}</span>
                      <span className="text-xs text-black/50">Service</span>
                    </span>
                    <span className="whitespace-nowrap text-xs text-black/70">{s.priceFrom}</span>
                  </button>
                ))}

                {q && (
                  <button
                    onClick={() => go(`/search?q=${encodeURIComponent(query.trim())}`)}
                    className="mt-[4px] w-full rounded-[8px] bg-field px-[8px] py-[9px] text-center text-sm font-medium text-ink hover:bg-black/5"
                  >
                    See all results
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
