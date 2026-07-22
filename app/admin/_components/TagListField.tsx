"use client";

import { useState } from "react";
import { inputClass, labelClass } from "@/app/admin/_components/ui";

type Props = {
  name: string;
  label: string;
  defaultValue?: string; // newline-separated, matching what the server action already parses
  placeholder?: string;
};

/**
 * Chip-list editor for simple one-line-per-item fields (badges, includes,
 * add-ons, compliance points, areas served). Replaces "type each item on its
 * own line in a textarea" with type-and-press-Enter chips.
 *
 * Submits through a hidden input holding the exact same newline-joined
 * string the server action already expects — no server-side changes needed.
 */
export default function TagListField({ name, label, defaultValue = "", placeholder }: Props) {
  const [items, setItems] = useState<string[]>(() =>
    defaultValue.split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
  );
  const [draft, setDraft] = useState("");

  const commit = () => {
    const value = draft.trim();
    if (!value) return;
    setItems((prev) => [...prev, value]);
    setDraft("");
  };

  const removeAt = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div>
      <span className={labelClass}>{label}</span>
      <input type="hidden" name={name} value={items.join("\n")} readOnly />

      {items.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className="flex items-center gap-1.5 rounded-full bg-gray-100 py-1 pl-3 pr-1.5 text-xs text-gray-700"
            >
              {item}
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove ${item}`}
                className="flex size-4 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          placeholder={placeholder ?? "Type and press Enter…"}
          className={inputClass}
        />
        <button
          type="button"
          onClick={commit}
          className="shrink-0 rounded-sm border border-gray-300 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}
