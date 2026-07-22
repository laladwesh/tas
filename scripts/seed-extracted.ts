/**
 * ADDITIVE seed for AI-extracted service content (from real site screenshots).
 *
 * Unlike seed-demo.ts, this NEVER wipes anything — it only inserts services
 * that don't already exist by slug, and makes one safe, non-destructive
 * update (adds a missing rangeHeading to an existing parent). Re-running is
 * safe: existing slugs are skipped, not duplicated.
 *
 * Most text fields from the extraction were blank (tile labels, includes,
 * FAQs, colours...) — those stay blank here. Sections with empty arrays hide
 * themselves on the page. Fill them in via /admin/services when ready.
 *
 *   npx tsx scripts/seed-extracted.ts
 */
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

import { connectDB } from "../server/db/mongoose";
import { Service } from "../server/models";

function loadEnv() {
  const file = path.join(process.cwd(), ".env");
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    if (!process.env[key]) process.env[key] = line.slice(eq + 1).trim();
  }
}

const IMG = {
  colorbond: "/color-bond.png",
  asbestos: "/asbestos.png",
  gates: "/gates-auto.png",
  retain: "/retain.png",
  const: "/const.png",
  services: "/figma/services.jpg",
  whyUs: "/figma/why-us.jpg",
  about: "/figma/about.jpg",
  project: "/figma/projects/p1.jpg",
};

type Tile = { label: string; priceLabel: string; popular: boolean; visual: string };
type Stat = { value: string; label: string };

type NewService = {
  slug: string;
  parentSlug: string;
  title: string;
  image: string;
  priceValue: string;
  stats: Stat[];
  coloursTitle: string;
  heightsTitle: string;
  heights: Tile[];
  includesTitle: string;
  addonsTitle: string;
  complianceTitle: string;
  processTitle: string;
  reviewsTitle: string;
};

/** "from $85" mechanical default — not invented copy, just the same number
 *  the extraction gave, formatted into the label field it belongs in. */
const priceFromLabel = (v: string) => (v ? `from $${v}` : "");

const newServices: NewService[] = [
  // --- Standalone (parentSlug "") ---
  {
    slug: "frameless-batten-fencing-perth", parentSlug: "", title: "Frameless Batten Fencing Perth",
    image: IMG.about, priceValue: "340",
    stats: [{ value: "AS 1926.1", label: "" }, { value: "1-2 days", label: "" }, { value: "5.0", label: "" }, { value: "$0", label: "" }],
    coloursTitle: "Batten colours & timber looks",
    heightsTitle: "Styles & pricing",
    heights: [
      { label: "", priceLabel: "", popular: false, visual: "gapped" },
      { label: "", priceLabel: "", popular: false, visual: "gapped" },
      { label: "", priceLabel: "", popular: true, visual: "gapped" },
      { label: "", priceLabel: "", popular: false, visual: "gapped" },
    ],
    includesTitle: "Every install includes", addonsTitle: "Popular add-ons",
    complianceTitle: "Built to WA rules – handled for you", processTitle: "From first call to final inspection",
    reviewsTitle: "What Perth homeowners say",
  },
  {
    slug: "round-batten-fencing-perth", parentSlug: "", title: "Round Batten Fencing Perth",
    image: IMG.project, priceValue: "360",
    stats: [{ value: "AS 1926.1", label: "" }, { value: "1-2 days", label: "" }, { value: "5.0", label: "" }, { value: "$0", label: "" }],
    coloursTitle: "Batten colours & timber looks",
    heightsTitle: "Styles & pricing",
    heights: [
      { label: "", priceLabel: "", popular: false, visual: "gapped" },
      { label: "", priceLabel: "", popular: false, visual: "gapped" },
      { label: "", priceLabel: "", popular: true, visual: "gapped" },
      { label: "", priceLabel: "", popular: false, visual: "gapped" },
    ],
    includesTitle: "Every install includes", addonsTitle: "Popular add-ons",
    complianceTitle: "Built to WA rules – handled for you", processTitle: "From first call to final inspection",
    reviewsTitle: "What Perth homeowners say",
  },
  {
    slug: "barr-fencing-perth", parentSlug: "", title: "Barr Fencing Perth",
    image: IMG.colorbond, priceValue: "185",
    stats: [{ value: "AS 1926.1", label: "" }, { value: "1-2 days", label: "" }, { value: "5.0", label: "" }, { value: "$0", label: "" }],
    coloursTitle: "Powder-coat colours",
    heightsTitle: "Styles & pricing",
    heights: [
      { label: "", priceLabel: "", popular: false, visual: "gapped" },
      { label: "", priceLabel: "", popular: false, visual: "gapped" },
      { label: "", priceLabel: "", popular: true, visual: "gapped" },
      { label: "", priceLabel: "", popular: false, visual: "gapped" },
    ],
    includesTitle: "Every install includes", addonsTitle: "Popular add-ons",
    complianceTitle: "Built to WA rules – handled for you", processTitle: "From first call to final inspection",
    reviewsTitle: "What Perth homeowners say",
  },

  // --- Children of the existing "pool-fencing" parent ---
  {
    slug: "frameless-glass-pool-fencing", parentSlug: "pool-fencing", title: "Frameless Glass Pool Fencing",
    image: IMG.whyUs, priceValue: "290",
    stats: [{ value: "AS 1926.1", label: "" }, { value: "1-2 days", label: "" }, { value: "5.0", label: "" }, { value: "$0", label: "" }],
    coloursTitle: "Frame & hardware finishes",
    heightsTitle: "Styles & pricing",
    heights: [
      { label: "", priceLabel: "", popular: false, visual: "glass" },
      { label: "", priceLabel: "", popular: false, visual: "glass" },
      { label: "", priceLabel: "", popular: false, visual: "glass" },
      { label: "", priceLabel: "", popular: false, visual: "glass" },
    ],
    includesTitle: "Every install includes", addonsTitle: "Popular add-ons",
    complianceTitle: "Built to WA rules – handled for you", processTitle: "From first call to final inspection",
    reviewsTitle: "What Perth homeowners say",
  },
  {
    slug: "tubular-aluminium-pool-fencing", parentSlug: "pool-fencing", title: "Tubular Aluminium Pool Fencing",
    image: IMG.services, priceValue: "110",
    stats: [{ value: "AS 1926.1", label: "" }, { value: "1-2 days", label: "" }, { value: "5.0", label: "" }, { value: "$0", label: "" }],
    coloursTitle: "Powder-coat colours",
    heightsTitle: "Styles & pricing",
    heights: [
      { label: "", priceLabel: "", popular: false, visual: "gapped" },
      { label: "", priceLabel: "", popular: false, visual: "gapped" },
      { label: "", priceLabel: "", popular: false, visual: "gapped" },
      { label: "", priceLabel: "", popular: false, visual: "gapped" },
    ],
    includesTitle: "Every install includes", addonsTitle: "Popular add-ons",
    complianceTitle: "Built to WA rules – handled for you", processTitle: "From first call to final inspection",
    reviewsTitle: "What Perth homeowners say",
  },
  {
    slug: "perf-pool-fencing-perth", parentSlug: "pool-fencing", title: "Perf Pool Fencing Perth",
    image: IMG.gates, priceValue: "185",
    stats: [{ value: "AS 1926.1", label: "" }, { value: "1-2 days", label: "" }, { value: "5.0", label: "" }, { value: "$0", label: "" }],
    coloursTitle: "Panel colours & patterns",
    heightsTitle: "Styles & pricing",
    heights: [
      { label: "", priceLabel: "", popular: false, visual: "perf-slot" },
      { label: "", priceLabel: "", popular: false, visual: "perf-custom" },
      { label: "", priceLabel: "", popular: false, visual: "perf-round" },
      { label: "", priceLabel: "", popular: false, visual: "perf-slot" },
    ],
    includesTitle: "Every install includes", addonsTitle: "Popular add-ons",
    complianceTitle: "Built to WA rules – handled for you", processTitle: "From first call to final inspection",
    reviewsTitle: "What Perth homeowners say",
  },

  // --- Children of the existing "blade-fencing" parent ---
  {
    slug: "radiator-blade-fencing-perth", parentSlug: "blade-fencing", title: "Radiator Blade Fencing Perth",
    image: IMG.services, priceValue: "380",
    stats: [{ value: "10 Yr", label: "" }, { value: "1-2 days", label: "" }, { value: "5.0", label: "" }, { value: "$0", label: "" }],
    coloursTitle: "Pick your colour or wood-look",
    heightsTitle: "Styles & pricing",
    heights: [
      { label: "", priceLabel: "", popular: false, visual: "radiator" },
      { label: "", priceLabel: "", popular: true, visual: "radiator" },
      { label: "", priceLabel: "", popular: false, visual: "radiator" },
      { label: "", priceLabel: "", popular: false, visual: "radiator" },
    ],
    includesTitle: "Every install includes", addonsTitle: "Popular add-ons",
    complianceTitle: "Built to WA rules – handled for you", processTitle: "From first call to last blade",
    reviewsTitle: "What Perth homeowners say",
  },
  {
    slug: "frameless-blade-fencing-perth", parentSlug: "blade-fencing", title: "Frameless Blade Fencing Perth",
    image: IMG.about, priceValue: "310",
    stats: [{ value: "10 Yr", label: "" }, { value: "1-2 days", label: "" }, { value: "5.0", label: "" }, { value: "$0", label: "" }],
    coloursTitle: "Pick your colour or wood-look",
    heightsTitle: "Styles & pricing",
    heights: [
      { label: "", priceLabel: "", popular: false, visual: "radiator" },
      { label: "", priceLabel: "", popular: true, visual: "radiator" },
      { label: "", priceLabel: "", popular: false, visual: "radiator" },
      { label: "", priceLabel: "", popular: false, visual: "radiator" },
    ],
    includesTitle: "Every install includes", addonsTitle: "Popular add-ons",
    complianceTitle: "Built to WA rules – handled for you", processTitle: "From first call to last blade",
    reviewsTitle: "What Perth homeowners say",
  },
];

async function main() {
  loadEnv();
  await connectDB();

  console.log("Seeding AI-extracted service content (additive, non-destructive)...\n");

  let inserted = 0;
  let skipped = 0;

  for (const s of newServices) {
    const exists = await Service.findOne({ slug: s.slug }).lean();
    if (exists) {
      console.log(`  skip  ${s.slug} (already exists)`);
      skipped++;
      continue;
    }

    await Service.create({
      slug: s.slug,
      title: s.title,
      image: s.image,
      priceValue: s.priceValue,
      priceFrom: priceFromLabel(s.priceValue),
      price: priceFromLabel(s.priceValue),
      parentSlug: s.parentSlug,
      stats: s.stats,
      coloursTitle: s.coloursTitle,
      heightsTitle: s.heightsTitle,
      heights: s.heights,
      includesTitle: s.includesTitle,
      addonsTitle: s.addonsTitle,
      complianceTitle: s.complianceTitle,
      processTitle: s.processTitle,
      reviewsTitle: s.reviewsTitle,
      order: 999,
      active: true,
    });
    console.log(`  +     ${s.slug} (parent: ${s.parentSlug || "—"})`);
    inserted++;
  }

  // Non-destructive: only fills rangeHeading if it's currently blank.
  const blade = await Service.findOne({ slug: "blade-fencing" });
  if (blade && !blade.get("rangeHeading")) {
    blade.set("rangeHeading", "Designer vertical blade fencing");
    await blade.save();
    console.log("  ~     blade-fencing.rangeHeading set (was blank)");
  }

  console.log(`\nDone. Inserted ${inserted}, skipped ${skipped} (already existed).`);
  console.log("\nReminders:");
  console.log('  - Skipped the "Fencing" range-grid (Inspira/Tasline/Buff/... cards) — looked like colour swatches, not fencing types. Re-check that screenshot.');
  console.log("  - colorbond-fencing already exists at $95/lm; extraction says $85 — update manually in /admin if $85 is correct.");
  console.log('  - slat-fencing already exists as "Aluminium Slat Fencing"; extraction titles it "...Perth" — cosmetic, update if you want.');
  console.log("  - Most new services have BLANK tile labels/prices, includes, add-ons, compliance points, process steps, FAQs — fill these in /admin/services.");
  console.log("  - Pool & Blade range grids will now show both my earlier placeholder cards AND these new ones — delete the old placeholders in /admin/services once you're happy with the new content.");

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
