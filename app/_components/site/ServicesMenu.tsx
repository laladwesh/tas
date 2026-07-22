"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Item = { slug: string; title: string; href: string };

/**
 * The "Services" nav item with a hover mega-menu listing every service.
 * The dropdown is position:fixed so the header's rounded-pill overflow-hidden
 * can't clip it, with a small close-delay so the mouse can travel from the
 * link to the panel without it snapping shut.
 */
export default function ServicesMenu({ active }: { active: boolean }) {
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/services-menu")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => {});
  }, []);

  const cancelClose = () => {
    if (timer.current) clearTimeout(timer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    timer.current = setTimeout(() => setOpen(false), 140);
  };
  const openNow = () => {
    cancelClose();
    const r = wrapRef.current?.getBoundingClientRect();
    if (r) {
      const width = 520;
      setCoords({
        left: Math.max(16, Math.min(r.left, window.innerWidth - width - 16)),
        top: r.bottom + 12,
      });
    }
    setOpen(true);
  };

  return (
    <div
      ref={wrapRef}
      onMouseEnter={openNow}
      onMouseLeave={scheduleClose}
      className="relative"
    >
      <Link
        href="/services"
        className="group flex flex-col items-center justify-center gap-[2px]"
      >
        <span className="text-[14px] leading-none text-black">Services</span>
        <span
          className={`h-[3px] w-[12px] rounded-[5px] bg-black transition-opacity duration-200 ${
            active || open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        />
      </Link>

      {items.length > 0 && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          style={{ left: coords.left, top: coords.top }}
          className={`fixed z-[60] w-[520px] max-w-[92vw] origin-top rounded-[14px] border border-cool-20 bg-white p-[10px] shadow-[0_12px_40px_rgba(0,0,0,0.14)] transition duration-200 ease-out ${
            open
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0"
          }`}
        >
          <div className="grid grid-cols-2 gap-[2px]">
            {items.map((it) => (
              <Link
                key={it.slug}
                href={it.href}
                onClick={() => setOpen(false)}
                className="rounded-[8px] px-[12px] py-[10px] text-[14px] text-ink transition-colors hover:bg-field"
              >
                {it.title}
              </Link>
            ))}
          </div>
          <Link
            href="/services"
            onClick={() => setOpen(false)}
            className="mt-[4px] block rounded-[8px] bg-field px-[12px] py-[9px] text-center text-[13px] font-medium text-ink transition-colors hover:bg-black/5"
          >
            View all services →
          </Link>
        </div>
      )}
    </div>
  );
}
