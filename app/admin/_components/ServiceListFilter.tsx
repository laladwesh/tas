"use client";

import { Children, isValidElement, useMemo, useState } from "react";
import { inputClass } from "@/app/admin/_components/ui";

/**
 * Wraps the "existing services" <li> list with a search box that filters by
 * title/slug. Each child must carry a `data-search="..."` attribute (already
 * lowercase) — this stays purely client-side, no server round-trip, so it
 * works instantly even with dozens of services.
 */
export default function ServiceListFilter({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");

  const items = Children.toArray(children);
  const total = items.length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((child) => {
      if (!isValidElement(child)) return true;
      const haystack = (child.props as { "data-search"?: string })["data-search"] ?? "";
      return haystack.includes(q);
    });
  }, [items, query]);

  return (
    <div>
      {total > 5 && (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${total} services by title or slug…`}
          className={`${inputClass} mb-4`}
        />
      )}

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          No services match “{query}”.
        </p>
      ) : (
        <ul className="space-y-4">{filtered}</ul>
      )}
    </div>
  );
}
