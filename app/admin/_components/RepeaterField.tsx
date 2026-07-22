"use client";

import { useState } from "react";
import { inputClass, labelClass } from "@/app/admin/_components/ui";

type Column =
  | { key: string; label: string; type: "text"; placeholder?: string; width?: string }
  | { key: string; label: string; type: "textarea"; placeholder?: string }
  | { key: string; label: string; type: "checkbox" }
  | { key: string; label: string; type: "select"; options: string[] }
  | { key: string; label: string; type: "color"; placeholder?: string };

type Row = Record<string, string>;

type Props = {
  name: string;
  label: string;
  columns: Column[];
  /** Pipe-separated rows, one per line — the exact format the server action's
   *  `rows(fd, name, [...])` already parses. Column order MUST match the
   *  server's field list for this name. */
  defaultValue?: string;
  addLabel?: string;
  hint?: string;
};

const CELL_INPUT =
  "w-full rounded-sm border border-gray-300 px-2 py-1.5 text-sm text-gray-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand";

/** "a | b" -> ["a","b"]. A literal "|" inside a value would break the format,
 *  same limitation the old raw-textarea version had — swap it for a similar
 *  character rather than let it silently corrupt the next column. */
const clean = (v: string) => v.replace(/\|/g, "/");

function parseRows(raw: string, columns: Column[]): Row[] {
  if (!raw.trim()) return [];
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      const row: Row = {};
      columns.forEach((c, i) => (row[c.key] = parts[i] ?? ""));
      return row;
    });
}

/**
 * Multi-column repeatable-row editor (stats, colours, size/pricing tiles,
 * process steps, FAQs...). Replaces "remember the column order and type
 * `label | price | yes | solid` by hand" with real add/remove rows.
 *
 * Submits through a hidden input holding the same pipe-delimited text the
 * server action already parses — no server-side changes needed.
 */
export default function RepeaterField({
  name,
  label,
  columns,
  defaultValue = "",
  addLabel = "Add row",
  hint,
}: Props) {
  const [rows, setRows] = useState<Row[]>(() => parseRows(defaultValue, columns));

  const serialized = rows
    .filter((r) => columns.some((c) => (r[c.key] || "").trim()))
    .map((r) =>
      columns
        .map((c) => (c.type === "checkbox" ? (r[c.key] === "yes" ? "yes" : "") : clean(r[c.key] || "")))
        .join(" | "),
    )
    .join("\n");

  const update = (i: number, key: string, value: string) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));

  const addRow = () =>
    setRows((prev) => [...prev, Object.fromEntries(columns.map((c) => [c.key, ""]))]);

  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));
  const moveRow = (i: number, dir: -1 | 1) =>
    setRows((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className={labelClass}>{label}</span>
        {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
      </div>
      <input type="hidden" name={name} value={serialized} readOnly />

      {rows.length === 0 && (
        <p className="mb-2 text-xs text-gray-400">Nothing yet.</p>
      )}

      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex flex-wrap items-end gap-2 rounded-sm border border-gray-200 bg-gray-50/60 p-2.5"
          >
            {columns.map((col) => (
              <div key={col.key} className={col.type === "textarea" ? "min-w-[220px] flex-1" : "flex-1 min-w-[110px]"}>
                <span className="mb-0.5 block text-[10px] text-gray-500">{col.label}</span>

                {col.type === "checkbox" ? (
                  <label className="flex h-[34px] items-center gap-1.5 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={row[col.key] === "yes"}
                      onChange={(e) => update(i, col.key, e.target.checked ? "yes" : "")}
                      className="h-4 w-4 accent-[#bc3e37]"
                    />
                    Yes
                  </label>
                ) : col.type === "select" ? (
                  <select
                    value={row[col.key] || col.options[0]}
                    onChange={(e) => update(i, col.key, e.target.value)}
                    className={CELL_INPUT}
                  >
                    {col.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : col.type === "textarea" ? (
                  <textarea
                    value={row[col.key] || ""}
                    onChange={(e) => update(i, col.key, e.target.value)}
                    placeholder={col.placeholder}
                    rows={2}
                    className={`${CELL_INPUT} resize-y`}
                  />
                ) : col.type === "color" ? (
                  <div className="flex gap-1">
                    <input
                      type="color"
                      value={/^#[0-9a-f]{6}$/i.test(row[col.key]) ? row[col.key] : "#cccccc"}
                      onChange={(e) => update(i, col.key, e.target.value)}
                      className="h-[34px] w-9 shrink-0 cursor-pointer rounded-sm border border-gray-300 p-0.5"
                    />
                    <input
                      type="text"
                      value={row[col.key] || ""}
                      onChange={(e) => update(i, col.key, e.target.value)}
                      placeholder={col.placeholder ?? "#cccccc"}
                      className={CELL_INPUT}
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={row[col.key] || ""}
                    onChange={(e) => update(i, col.key, e.target.value)}
                    placeholder={col.placeholder}
                    className={CELL_INPUT}
                  />
                )}
              </div>
            ))}

            <div className="flex shrink-0 items-center gap-1 pb-0.5">
              <button
                type="button"
                onClick={() => moveRow(i, -1)}
                disabled={i === 0}
                aria-label="Move up"
                className="flex size-[26px] items-center justify-center rounded-sm text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveRow(i, 1)}
                disabled={i === rows.length - 1}
                aria-label="Move down"
                className="flex size-[26px] items-center justify-center rounded-sm text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeRow(i)}
                aria-label="Remove row"
                className="flex size-[26px] items-center justify-center rounded-sm text-brand hover:bg-brand/10"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-2 rounded-sm border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-brand hover:text-brand"
      >
        + {addLabel}
      </button>
    </div>
  );
}
