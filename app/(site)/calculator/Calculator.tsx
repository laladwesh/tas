"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  fenceTypes,
  gates,
  extras,
  heightMultipliers,
  SUPPLY_ONLY_FACTOR,
  SLOPING_GROUND_UPLIFT,
  TIGHT_ACCESS_UPLIFT,
  REMOVE_EXISTING_PER_LM_CENTS,
  RANGE_UPPER,
} from "@/data/calculator";
import { formatCents } from "@/lib/money";

type Tab = "fencing" | "gates" | "extras";

type EstimateLine = {
  key: string;
  label: string;
  detail: string;
  lowCents: number;
  highCents: number;
};

const selectClass =
  "h-[42px] w-full rounded-[4px] bg-field px-3 text-[13px] text-black outline-none focus:ring-1 focus:ring-brand";
const labelClass = "mb-1 block text-[11px] font-medium text-black/60";

/** Sleeper plinth run under the fence — each level adds a per-lm cost. */
const PLINTH_OPTIONS = [
  { label: "None", perLmCents: 0 },
  { label: "1 sleeper (200mm)", perLmCents: 4500 },
  { label: "2 sleepers (400mm)", perLmCents: 8500 },
  { label: "3 sleepers (600mm)", perLmCents: 12000 },
];

export default function Calculator({
  initialFenceId,
}: {
  initialFenceId?: string;
}) {
  const [supplyOnly, setSupplyOnly] = useState(false);
  const [tab, setTab] = useState<Tab>("fencing");

  // If we arrived from a service page (?service=…), start on that fence.
  const startFence =
    fenceTypes.find((f) => f.id === initialFenceId) ?? fenceTypes[0];

  const [fenceId, setFenceId] = useState(startFence.id);
  const fence = fenceTypes.find((f) => f.id === fenceId)!;

  const [style, setStyle] = useState(startFence.styles[0]);
  const [height, setHeight] = useState(
    startFence.heights.includes("1800 mm") ? "1800 mm" : startFence.heights[0],
  );
  const [plinth, setPlinth] = useState(PLINTH_OPTIONS[0].label);
  const [length, setLength] = useState(20);

  const [sloping, setSloping] = useState(false);
  const [tightAccess, setTightAccess] = useState(false);
  const [removeExisting, setRemoveExisting] = useState(false);

  const [lines, setLines] = useState<EstimateLine[]>([]);

  /** Changing fence type resets its dependent options. */
  const pickFence = (id: string) => {
    const next = fenceTypes.find((f) => f.id === id)!;
    setFenceId(id);
    setStyle(next.styles[0]);
    if (!next.heights.includes(height)) setHeight(next.heights[0]);
  };

  /** The current run's price, before it's added to the estimate. */
  const run = useMemo(() => {
    const heightMult = heightMultipliers[height] ?? 1;
    let rate = fence.ratePerLmCents * heightMult;
    if (supplyOnly) rate *= SUPPLY_ONLY_FACTOR;

    let uplift = 1;
    if (sloping) uplift += SLOPING_GROUND_UPLIFT;
    if (tightAccess) uplift += TIGHT_ACCESS_UPLIFT;

    let low = rate * uplift * length;
    if (removeExisting) low += REMOVE_EXISTING_PER_LM_CENTS * length;

    const plinthPerLm =
      PLINTH_OPTIONS.find((p) => p.label === plinth)?.perLmCents ?? 0;
    low += plinthPerLm * length;

    return {
      lowCents: Math.round(low),
      highCents: Math.round(low * RANGE_UPPER),
    };
  }, [fence, height, supplyOnly, sloping, tightAccess, length, removeExisting, plinth]);

  const total = useMemo(
    () =>
      lines.reduce(
        (acc, line) => ({
          low: acc.low + line.lowCents,
          high: acc.high + line.highCents,
        }),
        { low: 0, high: 0 }
      ),
    [lines]
  );

  const addRun = () => {
    setLines((prev) => [
      ...prev,
      {
        key: `${fence.id}-${Date.now()}`,
        label: `${fence.name} fence`,
        detail: `${length} m · ${height}${supplyOnly ? " · supply only" : ""}`,
        lowCents: run.lowCents,
        highCents: run.highCents,
      },
    ]);
  };

  const addGate = (id: string) => {
    const gate = gates.find((g) => g.id === id)!;
    setLines((prev) => [
      ...prev,
      {
        key: `${gate.id}-${Date.now()}`,
        label: gate.name,
        detail: gate.description,
        lowCents: gate.priceCents,
        highCents: Math.round(gate.priceCents * RANGE_UPPER),
      },
    ]);
  };

  const addExtra = (id: string) => {
    const extra = extras.find((e) => e.id === id)!;
    const base = extra.priceCents ?? (extra.perLmCents ?? 0) * length;
    setLines((prev) => [
      ...prev,
      {
        key: `${extra.id}-${Date.now()}`,
        label: extra.name,
        detail: extra.perLmCents ? `${length} m` : extra.description,
        lowCents: base,
        highCents: Math.round(base * RANGE_UPPER),
      },
    ]);
  };

  const removeLine = (key: string) =>
    setLines((prev) => prev.filter((l) => l.key !== key));

  /** Group fence cards by their Figma grouping. */
  const groups = useMemo(() => {
    const map = new Map<string, typeof fenceTypes>();
    for (const type of fenceTypes) {
      const list = map.get(type.group) ?? [];
      list.push(type);
      map.set(type.group, list);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
      {/* ------------------------------ Builder ------------------------------ */}
      <div className="flex-1">
        <div className="rounded-[12px] border border-black/10 p-5 sm:p-6">
          {/* Supply toggle */}
          <div className="mb-5 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-black/50">
              Pricing
            </p>
            <div className="flex rounded-[20px] bg-field p-[3px]">
              {[
                { value: false, label: "Supply & Install" },
                { value: true, label: "Supply only" },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setSupplyOnly(option.value)}
                  className={`rounded-[20px] px-3 py-1.5 text-[11px] font-medium transition ${
                    supplyOnly === option.value
                      ? "bg-ink text-white"
                      : "text-black/60 hover:text-ink"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 grid grid-cols-3 gap-2">
            {(["fencing", "gates", "extras"] as Tab[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`rounded-[4px] py-2 text-[13px] font-medium capitalize transition ${
                  tab === value
                    ? "bg-ink text-white"
                    : "bg-field text-black/70 hover:bg-black/5"
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          {tab === "fencing" && (
            <>
              {/* 1. Choose */}
              <Step number="1" title="Choose your fence" />
              <div className="mb-6 flex flex-col gap-5">
                {groups.map(([group, items]) => (
                  <div key={group}>
                    <p className="mb-2 text-[11px] text-black/50">
                      <span className="font-semibold text-black/70">{group}</span>{" "}
                      · {items[0].groupNote}
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {items.map((item) => {
                        const isActive = item.id === fenceId;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => pickFence(item.id)}
                            className={`flex flex-col items-start gap-1 rounded-[6px] border p-3 text-left transition ${
                              isActive
                                ? "border-ink bg-ink text-white"
                                : "border-black/10 hover:border-ink/40"
                            }`}
                          >
                            <span className="text-[13px] font-semibold">
                              {item.name}
                            </span>
                            <span
                              className={`text-[10px] ${
                                isActive ? "text-white/70" : "text-black/50"
                              }`}
                            >
                              {item.description}
                            </span>
                            <span
                              className={`text-[11px] font-medium ${
                                isActive ? "text-white" : "text-brand"
                              }`}
                            >
                              from {formatCents(item.ratePerLmCents)}/lm
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. Configure */}
              <Step number="2" title="Configure" />
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="style">
                    Style / Profile
                  </label>
                  <select
                    id="style"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className={selectClass}
                  >
                    {fence.styles.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass} htmlFor="height">
                    Height
                  </label>
                  <select
                    id="height"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className={selectClass}
                  >
                    {fence.heights.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="plinth">
                    Plinth / retaining underneath
                  </label>
                  <select
                    id="plinth"
                    value={plinth}
                    onChange={(e) => setPlinth(e.target.value)}
                    className={selectClass}
                  >
                    {PLINTH_OPTIONS.map((option) => (
                      <option key={option.label}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="length">
                    Length of fence run
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      id="length"
                      type="range"
                      min={1}
                      max={200}
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))}
                      className="h-1 flex-1 cursor-pointer appearance-none rounded bg-black/15 accent-[#b83a31]"
                    />
                    <div className="flex h-[42px] w-[92px] items-center justify-center gap-1 rounded-[4px] bg-field text-[13px]">
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={length}
                        onChange={(e) =>
                          setLength(
                            Math.max(1, Math.min(200, Number(e.target.value) || 1))
                          )
                        }
                        aria-label="Length in metres"
                        className="w-[44px] bg-transparent text-right outline-none"
                      />
                      <span className="text-black/50">m</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Site details */}
              <Step number="3" title="Site details" />
              <div className="flex flex-col gap-3">
                <Choice
                  question="Sloping, uneven or hard ground?"
                  hint="Stepped panels and extra digging add cost"
                  options={["No", "Yes"]}
                  value={sloping ? "Yes" : "No"}
                  onChange={(v) => setSloping(v === "Yes")}
                />
                <Choice
                  question="Fence line clear, or tight & overgrown?"
                  hint="Tight access slows install and clearing"
                  options={["Clear", "Tight"]}
                  value={tightAccess ? "Tight" : "Clear"}
                  onChange={(v) => setTightAccess(v === "Tight")}
                />
                <Choice
                  question="Remove an existing fence?"
                  hint="We take away and dispose of the old fence"
                  options={["No", "Yes"]}
                  value={removeExisting ? "Yes" : "No"}
                  onChange={(v) => setRemoveExisting(v === "Yes")}
                />
              </div>
            </>
          )}

          {tab === "gates" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {gates.map((gate) => (
                <AddCard
                  key={gate.id}
                  title={gate.name}
                  description={gate.description}
                  price={formatCents(gate.priceCents)}
                  onAdd={() => addGate(gate.id)}
                />
              ))}
            </div>
          )}

          {tab === "extras" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {extras.map((extra) => (
                <AddCard
                  key={extra.id}
                  title={extra.name}
                  description={extra.description}
                  price={
                    extra.perLmCents
                      ? `${formatCents(extra.perLmCents)}/lm`
                      : formatCents(extra.priceCents ?? 0)
                  }
                  onAdd={() => addExtra(extra.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* This run */}
        {tab === "fencing" && (
          <div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-[12px] border border-black/10 p-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-black/50">
                This run, estimated
              </p>
              <p className="text-[24px] font-semibold text-ink">
                {formatCents(run.lowCents)} – {formatCents(run.highCents)}
              </p>
              <p className="text-[10px] text-black/50">
                {fence.name} · {length} m · {height}
              </p>
            </div>

            <button
              type="button"
              onClick={addRun}
              className="flex h-[44px] items-center rounded-[48px] bg-ink px-6 text-[14px] font-medium text-white transition hover:opacity-90"
            >
              Add to estimate
            </button>
          </div>
        )}
      </div>

      {/* ----------------------------- Estimate ------------------------------ */}
      <aside className="w-full shrink-0 lg:w-[320px]">
        <div className="sticky top-6 flex flex-col gap-3 rounded-[12px] border border-black/10 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-ink">Your estimate</h2>
            {lines.length > 0 && (
              <button
                type="button"
                onClick={() => setLines([])}
                className="text-[11px] text-black/50 hover:text-brand"
              >
                Clear all
              </button>
            )}
          </div>

          {lines.length === 0 ? (
            <p className="py-6 text-[12px] leading-[1.6] text-black/50">
              Nothing added yet. Build a fence run on the left and hit{" "}
              <span className="font-medium text-ink">Add to estimate</span>.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {lines.map((line) => (
                <li
                  key={line.key}
                  className="flex items-start gap-2 rounded-[4px] bg-field p-2.5"
                >
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-ink">
                      {line.label}
                    </p>
                    <p className="text-[10px] text-black/50">{line.detail}</p>
                  </div>
                  <p className="whitespace-nowrap text-[11px] font-medium text-ink">
                    {formatCents(line.lowCents)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeLine(line.key)}
                    aria-label={`Remove ${line.label}`}
                    className="text-black/40 transition hover:text-brand"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-2 rounded-[4px] bg-field p-3">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-black/50">
                Estimated investment
              </p>
              <span className="rounded-[10px] bg-white px-2 py-0.5 text-[9px] font-semibold text-black/60">
                incl. Tax
              </span>
            </div>
            <p className="text-[20px] font-semibold text-ink">
              {formatCents(total.low)} – {formatCents(total.high)}
            </p>
          </div>

          <Link
            href="/#quote"
            className="flex h-[42px] items-center justify-center rounded-[48px] bg-ink text-[13px] font-medium text-white transition hover:opacity-90"
          >
            Request my estimate
          </Link>

          <p className="text-[9px] leading-[1.5] text-black/40">
            Estimates only — based on typical Perth-metro installation. Your final
            price depends on a site inspection, ground conditions and access. Prices
            include GST. This is not a formal offer.
          </p>
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------ Small pieces ------------------------------ */

function Step({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="text-[11px] font-semibold text-black/40">{number}.</span>
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-black/60">
        {title}
      </h3>
    </div>
  );
}

function Choice({
  question,
  hint,
  options,
  value,
  onChange,
}: {
  question: string;
  hint: string;
  options: [string, string] | string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[6px] bg-field px-4 py-3">
      <div>
        <p className="text-[12px] font-medium text-ink">{question}</p>
        <p className="text-[10px] text-black/50">{hint}</p>
      </div>
      <div className="flex shrink-0 gap-1 rounded-[20px] bg-white p-[3px]">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-[20px] px-3 py-1 text-[11px] font-medium transition ${
              value === option
                ? "bg-ink text-white"
                : "text-black/50 hover:text-ink"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function AddCard({
  title,
  description,
  price,
  onAdd,
}: {
  title: string;
  description: string;
  price: string;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-[6px] border border-black/10 p-4">
      <p className="text-[13px] font-semibold text-ink">{title}</p>
      <p className="text-[11px] text-black/50">{description}</p>
      <p className="text-[13px] font-medium text-brand">{price}</p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-1 h-[34px] rounded-[20px] border border-ink text-[12px] font-medium text-ink transition hover:bg-ink hover:text-white"
      >
        Add
      </button>
    </div>
  );
}
