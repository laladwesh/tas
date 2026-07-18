/* ===========================================================================
   Fence calculator pricing model.

   All rates are INTEGER CENTS per lineal metre. This whole file is the thing
   that later moves into Mongo (admin-editable rates) — the calculator UI reads
   it through one shape, so swapping the source won't touch the component.
   =========================================================================== */

export type FenceType = {
  id: string;
  name: string;
  group: string;
  groupNote: string;
  description: string;
  /** Base supply + install rate, cents per lineal metre. */
  ratePerLmCents: number;
  styles: string[];
  heights: string[];
  finishes: string[];
};

export const fenceTypes: FenceType[] = [
  {
    id: "colorbond-privacy",
    name: "Colorbond",
    group: "Privacy & Screening",
    groupNote: "Homes & Sheds",
    description: "Classic steel privacy",
    ratePerLmCents: 9500,
    styles: ["Standard (77mm rib)", "Smartascreen", "Ultra"],
    heights: ["1200 mm", "1500 mm", "1800 mm", "2100 mm"],
    finishes: ["None", "Basalt", "Monument", "Woodland Grey", "Surfmist"],
  },
  {
    id: "slat-privacy",
    name: "Aluminium Slat",
    group: "Privacy & Screening",
    groupNote: "Homes & Sheds",
    description: "Modern architectural slat",
    ratePerLmCents: 18500,
    styles: ["Horizontal 65mm", "Vertical 65mm", "Blade"],
    heights: ["1200 mm", "1500 mm", "1800 mm", "2100 mm"],
    finishes: ["None", "Black", "Woodgrain", "Monument"],
  },
  {
    id: "timber-privacy",
    name: "Timber",
    group: "Privacy & Screening",
    groupNote: "Homes & Sheds",
    description: "Traditional paling",
    ratePerLmCents: 8900,
    styles: ["Lapped", "Butted", "Capped"],
    heights: ["1500 mm", "1800 mm"],
    finishes: ["None", "Oiled", "Painted"],
  },
  {
    id: "glass-pool",
    name: "Frameless Glass",
    group: "Pool & Garden",
    groupNote: "Compliant & clear view",
    description: "Frameless pool glass",
    ratePerLmCents: 39000,
    styles: ["Frameless", "Semi-frameless"],
    heights: ["1200 mm", "1300 mm"],
    finishes: ["None", "Mirror spigots", "Black spigots"],
  },
  {
    id: "tubular-pool",
    name: "Tubular Pool",
    group: "Pool & Garden",
    groupNote: "Compliant & clear view",
    description: "Powder-coated tubular",
    ratePerLmCents: 11000,
    styles: ["Flat top", "Loop top", "Raked"],
    heights: ["1200 mm", "1300 mm"],
    finishes: ["None", "Black", "White", "Monument"],
  },
  {
    id: "security-steel",
    name: "Security Steel",
    group: "Security & Boundary",
    groupNote: "Commercial & perimeter",
    description: "Commercial grade",
    ratePerLmCents: 13500,
    styles: ["Garrison", "Palisade", "Weldmesh"],
    heights: ["1800 mm", "2100 mm", "2400 mm"],
    finishes: ["None", "Black", "Galvanised"],
  },
  {
    id: "chainwire",
    name: "Chain Wire",
    group: "Security & Boundary",
    groupNote: "Commercial & perimeter",
    description: "Sites and yards",
    ratePerLmCents: 6500,
    styles: ["Standard", "PVC coated"],
    heights: ["1800 mm", "2100 mm", "2400 mm"],
    finishes: ["None", "Galvanised", "Black PVC"],
  },
  {
    id: "picket-garden",
    name: "Picket",
    group: "Feature & Edging",
    groupNote: "Feature & Edging",
    description: "Front yards and gardens",
    ratePerLmCents: 9900,
    styles: ["Traditional", "New England"],
    heights: ["900 mm", "1200 mm"],
    finishes: ["None", "White", "Black"],
  },
];

/* ------------------------------ Modifiers -------------------------------- */

/** Taller fences cost more — multiplier applied to the base rate. */
export const heightMultipliers: Record<string, number> = {
  "900 mm": 0.75,
  "1200 mm": 0.85,
  "1300 mm": 0.9,
  "1500 mm": 0.95,
  "1800 mm": 1,
  "2100 mm": 1.15,
  "2400 mm": 1.3,
};

/** Supply-only removes the labour component. */
export const SUPPLY_ONLY_FACTOR = 0.55;

/** Site conditions. */
export const SLOPING_GROUND_UPLIFT = 0.08; // +8%
export const TIGHT_ACCESS_UPLIFT = 0.06; // +6%
export const REMOVE_EXISTING_PER_LM_CENTS = 3500; // $35 / lm

/** The estimate is a range, not a promise. */
export const RANGE_UPPER = 1.19;

export type Gate = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
};

export const gates: Gate[] = [
  { id: "single-1m", name: "Single gate (1m)", description: "Matching leaf, latch and hinges", priceCents: 45000 },
  { id: "double-3m", name: "Double gate (3m)", description: "Drop bolt and latch", priceCents: 95000 },
  { id: "sliding-4m", name: "Sliding gate (4m)", description: "Track and rollers", priceCents: 165000 },
  { id: "auto-motor", name: "Gate automation", description: "Motor, remotes and keypad", priceCents: 145000 },
];

export type Extra = {
  id: string;
  name: string;
  description: string;
  /** Either a flat price or a per-lineal-metre rate. */
  priceCents?: number;
  perLmCents?: number;
};

export const extras: Extra[] = [
  { id: "retaining", name: "Retaining sleepers", description: "Concrete sleepers under the fence line", perLmCents: 12000 },
  { id: "asbestos", name: "Asbestos removal", description: "Licensed removal and disposal", perLmCents: 13000 },
  { id: "rubbish", name: "Rubbish removal", description: "We take the old fence away", priceCents: 25000 },
  { id: "core-drill", name: "Core drilling", description: "For concrete or limestone", perLmCents: 4500 },
];
