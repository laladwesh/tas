/**
 * DEMO / TEST DATA ONLY — never run this against production.
 *
 * Fills every collection with realistic fake content so you can click through
 * the whole site and admin panel. Kept completely separate from `npm run seed`
 * (which only ever creates your admin user + settings).
 *
 *   npm run seed:demo     fill the DB with demo content
 *   npm run demo:clean    remove it all again
 *
 * Both commands WIPE the content collections first, so they're safe to re-run.
 * Your admin user, site settings, carts and OTP tokens are never touched.
 */
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

import { connectDB } from "../server/db/mongoose";
import {
  Service,
  Product,
  Article,
  Project,
  Review,
  Faq,
  HeroImage,
  Lead,
  Order,
} from "../server/models";

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

/* Images that already exist in /public, so this works with no S3 and no network. */
const IMG = {
  colorbond: "/color-bond.png",
  asbestos: "/asbestos.png",
  gates: "/gates-auto.png",
  retain: "/retain.png",
  hero1: "/hero1.png",
  const: "/const.png",
  services: "/figma/services.jpg",
  whyUs: "/figma/why-us.jpg",
  about: "/figma/about.jpg",
  heroBg: "/figma/hero-bg.jpg",
  project: "/figma/projects/p1.jpg",
  article: "/figma/articles/a1.jpg",
  shop: (n: number) => `/figma/shop/${n}.png`,
  review: (n: number) => `/figma/reviews/r${n}.jpg`,
  avatar: (n: number) => `/figma/reviews/a${n}.jpg`,
};

/* Deterministic — no Math.random(), so re-running gives the same data. */
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

/* ------------------------------- Content --------------------------------- */

/* Shared across services so every detail page is fully populated for the demo. */
const AREAS = ["Perth metro", "Joondalup", "Wanneroo", "Rockingham", "Mandurah", "Bunbury & the South West"];
const BADGES = ["5.0 · 300+ Google reviews", "Licensed & insured", "10 yr workmanship warranty"];
const COMPLIANCE_TITLE = "Built to WA rules — handled for you";
const COMPLIANCE = [
  "Dividing Fences Act: boundary neighbours usually share the cost — we prepare the paperwork either side can sign.",
  "Footings and post spacing rated to your wind region (N1–N3), coastal or inland.",
  "Pool-side runs certified to AS 1926.1 where the fence forms part of a pool barrier.",
];
const PROCESS = [
  { title: "Call or book online", body: "Tell us the boundary length and we'll book a time that suits you." },
  { title: "Free measure", body: "We walk the site and lock in a fixed written quote within 48 hours." },
  { title: "Install", body: "Most homes are done in 1–2 days — posts cemented, panels levelled." },
  { title: "Walkthrough", body: "You sign off, we log the warranty and leave the site clean." },
];

const DEFAULT_INCLUDES = [
  "Free on-site measure & fixed written quote",
  "Posts cemented in-ground, string-lined",
  "Quality materials rated for the WA climate",
  "Full site cleanup on completion",
  "10-yr workmanship warranty",
];
const DEFAULT_ADDONS = [
  "Old fence removal & tip fees",
  "Matching single & double gates",
  "Plinths for retained or sloping blocks",
];
const genFaqs = (label: string) => [
  { question: `How much does ${label.toLowerCase()} cost in Perth?`, answer: "Your written quote is fixed — the price depends on run length, height and site access, and we confirm it after a free on-site measure." },
  { question: "Who pays for a boundary fence in WA?", answer: "Under the Dividing Fences Act, adjoining owners usually share the cost of a sufficient dividing fence equally. We supply a quote you can hand to your neighbour." },
  { question: "How long does installation take?", answer: "Most standard residential jobs are installed in one to two days on site, usually within one to two weeks of accepting the quote." },
];

/** Build a full range-item (child) service from shared defaults + overrides. */
type ChildInput = {
  parentSlug: string;
  slug: string;
  title: string;
  priceFrom: string;
  priceValue: string;
  image: string;
  excerpt: string;
  intro: string;
  projectCategory: string;
  priceUnit?: string;
  stats?: { value: string; label: string }[];
  coloursTitle?: string;
  coloursNote?: string;
  colours?: { name: string; hex: string }[];
  heightsTitle?: string;
  heights?: { label: string; priceLabel: string; popular: boolean; visual?: string }[];
  includes?: string[];
  addons?: string[];
};
const mkChild = (o: ChildInput) => ({
  parentSlug: o.parentSlug,
  slug: o.slug,
  title: o.title,
  priceFrom: o.priceFrom,
  priceValue: o.priceValue,
  priceUnit: o.priceUnit ?? "Supplied & installed",
  image: o.image,
  excerpt: o.excerpt,
  intro: o.intro,
  badges: BADGES,
  stats: o.stats ?? [
    { value: "10 yr", label: "Workmanship warranty" },
    { value: "1–2 days", label: "Typical install" },
    { value: "5.0", label: "300+ Google reviews" },
    { value: "Fixed", label: "Written quote" },
  ],
  coloursTitle: o.coloursTitle ?? "",
  coloursNote: o.coloursNote ?? (o.colours ? "Powder-coat colours in stock at Balcatta" : ""),
  colours: o.colours ?? [],
  heightsTitle: o.heightsTitle ?? "",
  heights: o.heights ?? [],
  includes: o.includes ?? DEFAULT_INCLUDES,
  addons: o.addons ?? DEFAULT_ADDONS,
  complianceTitle: COMPLIANCE_TITLE,
  compliance: COMPLIANCE,
  process: PROCESS,
  projectCategory: o.projectCategory,
  faqs: genFaqs(o.title),
  areas: AREAS,
});

/* Range items (children). Each is a full, standalone service detail page;
   its parent shows a range grid linking to these. */
const childServices = [
  // Pool Fencing range
  mkChild({
    parentSlug: "pool-fencing", slug: "frameless-glass-pool", title: "Frameless Glass Pool Fencing",
    priceFrom: "from $350 / m", priceValue: "$350", image: IMG.whyUs,
    excerpt: "Frameless toughened glass — an uninterrupted view of the pool, certified to AS 1926.1.",
    intro: "Frameless glass pool fencing gives you the clearest possible view of the water with no top rail and minimal spigots — supplied and installed to AS 1926.1.",
    projectCategory: "Pool",
    stats: [
      { value: "AS 1926.1", label: "Certified compliant" },
      { value: "1–2 days", label: "Typical install" },
      { value: "5.0", label: "300+ Google reviews" },
      { value: "$0", label: "Measure & written quote" },
    ],
    coloursTitle: "Frame & hardware finishes",
    coloursNote: "Spigot & hardware finishes to match your look",
    colours: [
      { name: "Brushed Stainless", hex: "#c7c9c9" }, { name: "Satin Stainless", hex: "#b4b6b6" },
      { name: "Matte Black", hex: "#2b2b2b" }, { name: "Black", hex: "#1c1c1c" },
      { name: "Monument", hex: "#323233" }, { name: "Woodland Grey", hex: "#4b4f4c" },
      { name: "Surfmist", hex: "#e4e2d5" }, { name: "White", hex: "#f2f0e9" }, { name: "Dune", hex: "#cbc4b1" },
    ],
    heightsTitle: "Styles & pricing",
    heights: [
      { label: "Semi-frameless (budget)", priceLabel: "from $240 / m", popular: false, visual: "glass" },
      { label: "Channel-fixed frameless", priceLabel: "from $340 / m", popular: false, visual: "glass" },
      { label: "Spigot-fixed frameless", priceLabel: "from $390 / m", popular: true, visual: "glass" },
      { label: "Frameless glass gates", priceLabel: "from $590 / gate", popular: false, visual: "glass" },
    ],
    includes: ["Free on-site measure & fixed written quote", "Toughened glass panels to AS 1926.1", "Marine-grade spigots & hardware", "Self-closing, self-latching gate", "Compliance-ready on handover"],
    addons: ["Compliance inspection & certificate", "Mitred glass corners", "Gate soft-close upgrade"],
  }),
  mkChild({ parentSlug: "pool-fencing", slug: "tubular-aluminium-pool", title: "Tubular Aluminium Pool Fencing", priceFrom: "from $185 / m", priceValue: "$185", image: IMG.services, excerpt: "Powder-coated tubular aluminium — the budget-friendly compliant option.", intro: "Tubular aluminium pool fencing is the cost-effective way to meet WA pool safety laws, powder-coated to last in coastal conditions.", projectCategory: "Pool", colours: [ { name: "Black", hex: "#2b2b2b" }, { name: "Monument", hex: "#323233" }, { name: "White", hex: "#f2f0e9" } ] }),
  mkChild({ parentSlug: "pool-fencing", slug: "perf-pool", title: "Perf Pool Fencing", priceFrom: "from $210 / m", priceValue: "$210", image: IMG.shop(5), excerpt: "Perforated aluminium panels — privacy and airflow with a modern look.", intro: "Perforated pool panels balance privacy and airflow while staying pool-safety compliant.", projectCategory: "Pool" }),
  mkChild({ parentSlug: "pool-fencing", slug: "frameless-batten-pool", title: "Frameless Batten Pool Fencing", priceFrom: "from $340 / m", priceValue: "$340", image: IMG.about, excerpt: "Vertical batten screens with a frameless finish.", intro: "Frameless batten fencing gives a designer look around the pool with vertical battens and concealed fixings.", projectCategory: "Pool" }),
  mkChild({ parentSlug: "pool-fencing", slug: "round-batten-pool", title: "Round Batten Pool Fencing", priceFrom: "from $260 / m", priceValue: "$260", image: IMG.project, excerpt: "Rounded aluminium battens, soft on the eye and easy to maintain.", intro: "Round batten pool fencing softens the look of the barrier while staying fully compliant.", projectCategory: "Pool" }),
  mkChild({ parentSlug: "pool-fencing", slug: "barr-pool", title: "Barr Pool Fencing", priceFrom: "from $185 / m", priceValue: "$185", image: IMG.colorbond, excerpt: "Classic flat-top barrier fencing, compliant and hard-wearing.", intro: "Barr pool fencing is a straightforward, durable compliant barrier for pools and spas.", projectCategory: "Pool" }),

  // Aluminium Slat range
  mkChild({ parentSlug: "slat-fencing", slug: "horizontal-slat", title: "Horizontal Slat Fencing", priceFrom: "from $185 / m", priceValue: "$185", image: IMG.services, excerpt: "Horizontal aluminium blades — the classic modern slat look.", intro: "Horizontal slat fencing is the go-to for a clean, contemporary boundary with airflow.", projectCategory: "Slat", colours: [ { name: "Monument", hex: "#323233" }, { name: "Black", hex: "#2b2b2b" }, { name: "Woodland Grey", hex: "#4b4f4c" }, { name: "Timber-look", hex: "#8a5a33" } ] }),
  mkChild({ parentSlug: "slat-fencing", slug: "vertical-slat", title: "Vertical Slat Fencing", priceFrom: "from $195 / m", priceValue: "$195", image: IMG.about, excerpt: "Vertical blades for a tall, screening-focused finish.", intro: "Vertical slat fencing draws the eye upward and gives excellent screening for front boundaries.", projectCategory: "Slat" }),
  mkChild({ parentSlug: "slat-fencing", slug: "blade-slat", title: "Blade Slat Fencing", priceFrom: "from $220 / m", priceValue: "$220", image: IMG.whyUs, excerpt: "Wide-blade slats for a premium architectural statement.", intro: "Blade slat fencing uses wider blades for a bold, architectural boundary.", projectCategory: "Slat" }),

  // Retaining Walls range
  mkChild({
    parentSlug: "retaining-walls", slug: "fibrewall-retaining", title: "Fibrewall Retaining",
    priceFrom: "from $18.50 / lm", priceValue: "$18.50", priceUnit: "per lm supplied", image: IMG.retain,
    excerpt: "Fibre-reinforced concrete sleepers — quick to install, and they never rot or rust.",
    intro: "Fibrewall retaining uses fibre-reinforced concrete sleepers between galvanised posts — a fast, durable, rot-proof wall you can DIY or have us install.",
    projectCategory: "Retaining",
    stats: [
      { value: "Rot-proof", label: "Never rots or rusts" },
      { value: "DIY-ready", label: "Or installed by us" },
      { value: "5.0", label: "300+ Google reviews" },
      { value: "$0", label: "Measure & written quote" },
    ],
    coloursTitle: "Sleeper finishes",
    coloursNote: "Smooth & woodgrain Fibrewall sleepers — colours to match your fence",
    colours: [
      { name: "Smooth Grey", hex: "#9a9a95" }, { name: "Charcoal", hex: "#3a3a3a" },
      { name: "Limestone", hex: "#d8d2c2" }, { name: "Woodgrain", hex: "#8a5a33" },
      { name: "Sandstone", hex: "#cfc3a6" }, { name: "Monument", hex: "#323233" },
      { name: "Basalt", hex: "#6d6c6e" }, { name: "Dune", hex: "#cbc4b1" }, { name: "Black", hex: "#1c1c1c" },
    ],
    heightsTitle: "Sleeper sizes & pricing",
    heights: [
      { label: "Sleeper 2380mm", priceLabel: "from $18.50 / lm", popular: false, visual: "sleeper" },
      { label: "Sleeper 3050mm", priceLabel: "from $22 / lm", popular: true, visual: "sleeper" },
      { label: "Under-fence plinth", priceLabel: "from $22 / lm", popular: false, visual: "sleeper" },
      { label: "Supply + install", priceLabel: "priced at on-site quote", popular: false, visual: "sleeper" },
    ],
    includes: ["Free on-site measure & fixed written quote", "Galvanised H-posts set in concrete", "Fibre-reinforced sleepers, rot & rust proof", "Ag-drain and backfill where needed", "Full site cleanup on completion"],
    addons: ["Structural engineering & council submission", "Extra drainage for wet blocks", "Fence installed on top"],
  }),
  mkChild({ parentSlug: "retaining-walls", slug: "alumawall-retaining", title: "Alumawall Retaining", priceFrom: "from $290 / m²", priceValue: "$290", priceUnit: "per m² installed", image: IMG.services, excerpt: "Powder-coated aluminium retaining — lightweight and corrosion-proof.", intro: "Alumawall retaining is a lightweight, corrosion-proof aluminium system ideal for coastal blocks.", projectCategory: "Retaining" }),

  // Gates & Automation range
  mkChild({ parentSlug: "gates-automation", slug: "swing-gates", title: "Swing Gates", priceFrom: "from $850", priceValue: "$850", image: IMG.gates, excerpt: "Custom swing gates matched to your fence, single or double leaf.", intro: "Swing gates suit shorter driveways with clearance — fabricated to match your fence and hung to last.", projectCategory: "Gates", colours: [ { name: "Monument", hex: "#323233" }, { name: "Black", hex: "#2b2b2b" }, { name: "Woodland Grey", hex: "#4b4f4c" } ] }),
  mkChild({ parentSlug: "gates-automation", slug: "sliding-gates", title: "Sliding Gates", priceFrom: "from $1,450", priceValue: "$1,450", image: IMG.gates, excerpt: "Track or cantilever sliding gates for wide, flat driveways.", intro: "Sliding gates are ideal for flat, wide driveways where a swing gate won't clear — with motor sizing to match.", projectCategory: "Gates" }),
  mkChild({ parentSlug: "gates-automation", slug: "gate-automation", title: "Gate Automation", priceFrom: "from $1,450", priceValue: "$1,450", image: IMG.const, excerpt: "Motors, keypads, remotes and solar — fitted and commissioned.", intro: "Gate automation adds a motor, keypad and remotes to a new or existing gate, wired and commissioned properly.", projectCategory: "Gates" }),

  // Security Fencing range
  mkChild({ parentSlug: "security-fencing", slug: "garrison-fencing", title: "Garrison Fencing", priceFrom: "from $135 / m", priceValue: "$135", image: IMG.about, excerpt: "Steel spear-top garrison fencing — commercial-grade security.", intro: "Garrison fencing is a tough steel spear-top barrier for yards, sites and public infrastructure.", projectCategory: "Security", colours: [ { name: "Black", hex: "#2b2b2b" }, { name: "Monument", hex: "#323233" }, { name: "Galvanised", hex: "#9a9a95" } ] }),
  mkChild({ parentSlug: "security-fencing", slug: "chainmesh-fencing", title: "Chainmesh Fencing", priceFrom: "from $65 / m", priceValue: "$65", image: IMG.services, excerpt: "Galvanised or PVC-coated chainmesh for sites and yards.", intro: "Chainmesh is the economical perimeter option for sites, yards and infrastructure.", projectCategory: "Security" }),
  mkChild({ parentSlug: "security-fencing", slug: "enclosures", title: "Enclosures", priceFrom: "from $180 / m", priceValue: "$180", image: IMG.whyUs, excerpt: "Secure enclosures for plant, pumps and equipment.", intro: "Custom enclosures keep plant, pumps and equipment secure and to spec.", projectCategory: "Security" }),

  // Blade Fencing range (new parent below)
  mkChild({ parentSlug: "blade-fencing", slug: "radiator-blade", title: "Radiator Blade Fencing", priceFrom: "from $340 / m", priceValue: "$340", image: IMG.services, excerpt: "Fine radiator-profile blades for a premium screen.", intro: "Radiator blade fencing uses fine, closely-spaced blades for a premium, contemporary screen.", projectCategory: "Slat", colours: [ { name: "Monument", hex: "#323233" }, { name: "Black", hex: "#2b2b2b" }, { name: "Surfmist", hex: "#e4e2d5" } ] }),
  mkChild({ parentSlug: "blade-fencing", slug: "frameless-blade", title: "Frameless Blade Fencing", priceFrom: "from $380 / m", priceValue: "$380", image: IMG.about, excerpt: "Frameless blade panels with concealed fixings.", intro: "Frameless blade fencing hides all fixings for the cleanest possible blade screen.", projectCategory: "Slat" }),
];

const services = [
  {
    slug: "colorbond-fencing", title: "Colorbond Fencing", priceFrom: "from $95 / lm", image: IMG.colorbond,
    excerpt: "Steel fencing built for the WA climate. Low maintenance, and it holds its colour.",
    intro: "Solid COLORBOND steel fencing, supplied and installed by our own crews across Perth and the South West. Genuine BlueScope panels in nine colours, posts cemented in, offcuts gone — most standard boundary fences are measured, quoted and installed inside two weeks.",
    priceValue: "$95", priceUnit: "Supplied & installed", badges: BADGES,
    stats: [
      { value: "10 yr", label: "BlueScope warranty" },
      { value: "2–4 days", label: "Typical install" },
      { value: "5.0", label: "300+ Google reviews" },
      { value: "$0", label: "Standard within quote" },
    ],
    coloursNote: "All 9 standard colours in stock at Balcatta",
    colours: [
      { name: "Basalt", hex: "#6d6c6e" }, { name: "Black", hex: "#2b2b2b" }, { name: "Dune", hex: "#cbc4b1" },
      { name: "Monument", hex: "#323233" }, { name: "Paperbark", hex: "#d6cdb7" }, { name: "Primrose", hex: "#e8e2c9" },
      { name: "Surfmist", hex: "#e4e2d5" }, { name: "White", hex: "#f2f0e9" }, { name: "Woodland Grey", hex: "#4b4f4c" },
    ],
    heights: [
      { label: "1200mm", priceLabel: "from $88 / lm", popular: false },
      { label: "1500mm", priceLabel: "from $96 / lm", popular: false },
      { label: "1800mm", priceLabel: "from $104 / lm", popular: true },
      { label: "2100mm", priceLabel: "from $118 / lm", popular: false },
    ],
    includes: [
      "Free on-site measure & fixed written quote", "Posts cemented in-ground, string-lined",
      "Genuine BlueScope panels, rails & capping", "Full site cleanup — offcuts and packaging gone",
      "10-yr product + workmanship warranty",
    ],
    addons: [
      "Old fence removal & tip fees", "Asbestos fence removal (licensed)",
      "Matching single & double gates", "Plinths for retained or sloping blocks",
    ],
    projectCategory: "Colorbond",
    faqs: [
      { question: "How much does Colorbond fencing cost in Perth?", answer: "Most Colorbond fences run between $95 and $150 per lineal metre supplied and installed, depending on height, access and site prep. Your written quote is fixed — no day-rate creep." },
      { question: "Who pays for a boundary fence in WA?", answer: "Under the Dividing Fences Act, adjoining owners usually share the cost of a sufficient dividing fence equally. We supply a written quote you can hand straight to your neighbour." },
      { question: "How long does installation take?", answer: "Most standard residential runs are installed in one to two days on site, usually within one to two weeks of accepting the quote." },
      { question: "Can you build over a retaining wall or sloping block?", answer: "Yes — we use plinths or raked panels for slopes, and we're licensed to build the retaining wall first if the boundary needs one." },
      { question: "Is Colorbond okay near the coast?", answer: "Yes. We spec the right coating grade and stainless fixings for coastal blocks so it stands up to the salt air." },
    ],
  },
  {
    slug: "slat-fencing", title: "Aluminium Slat Fencing", priceFrom: "from $185 / lm", image: IMG.services,
    excerpt: "Modern architectural slats — privacy without blocking the breeze.",
    intro: "Powder-coated aluminium slat fencing and screens, cut and installed to suit your block. Architectural looks, no rust, and airflow that a solid fence can't give you — ideal for front boundaries and courtyards.",
    priceValue: "$185", priceUnit: "Supplied & installed", badges: BADGES,
    stats: [
      { value: "15 yr", label: "Powder-coat warranty" }, { value: "2–3 days", label: "Typical install" },
      { value: "5.0", label: "300+ Google reviews" }, { value: "40+", label: "Colour options" },
    ],
    coloursNote: "Any Dulux or Interpon powder-coat colour",
    colours: [
      { name: "Monument", hex: "#323233" }, { name: "Black", hex: "#2b2b2b" }, { name: "Woodland Grey", hex: "#4b4f4c" },
      { name: "Surfmist", hex: "#e4e2d5" }, { name: "Basalt", hex: "#6d6c6e" }, { name: "Timber-look", hex: "#8a5a33" },
    ],
    heights: [
      { label: "1200mm", priceLabel: "from $175 / lm", popular: false },
      { label: "1500mm", priceLabel: "from $185 / lm", popular: false },
      { label: "1800mm", priceLabel: "from $205 / lm", popular: true },
    ],
    includes: [
      "Free on-site measure & fixed written quote", "65mm or 100mm blades, gap set to your privacy",
      "Powder-coated posts and fixings", "Full site cleanup on completion", "15-yr powder-coat warranty",
    ],
    addons: ["Matching pedestrian & driveway gates", "Timber-look powder-coat finish", "Integrated LED strip lighting"],
    projectCategory: "Slat",
    faqs: [
      { question: "How much does slat fencing cost?", answer: "Aluminium slat starts around $185 per lineal metre supplied and installed, moving with height and blade spacing." },
      { question: "Does the slat gap give privacy?", answer: "Yes — we set the blade gap to your needs. A 15–20mm gap keeps privacy while still letting the breeze through." },
      { question: "Will it rust?", answer: "No. Aluminium doesn't rust, which is why it's the pick for coastal Perth blocks." },
    ],
  },
  {
    slug: "pool-fencing", title: "Pool Fencing", priceFrom: "from $110 / lm", image: IMG.whyUs,
    excerpt: "Frameless glass or tubular aluminium, built to meet WA pool safety laws.",
    intro: "Pool fencing that passes inspection first time. Frameless glass or tubular aluminium, installed to AS 1926.1 with self-closing, self-latching gates — so your barrier is compliant the day we leave.",
    priceValue: "$110", priceUnit: "Supplied & installed", badges: BADGES,
    stats: [
      { value: "AS 1926.1", label: "Certified compliant" }, { value: "1–2 days", label: "Typical install" },
      { value: "5.0", label: "300+ Google reviews" }, { value: "100%", label: "First-time pass rate" },
    ],
    heights: [
      { label: "Tubular 1200mm", priceLabel: "from $110 / lm", popular: true },
      { label: "Frameless glass", priceLabel: "from $340 / lm", popular: false },
      { label: "Semi-frameless", priceLabel: "from $260 / lm", popular: false },
    ],
    includes: [
      "Free on-site measure & compliance check", "Self-closing, self-latching gates",
      "Non-climbable zone set out correctly", "Spigots and fixings rated for pool use", "Compliance-ready on handover",
    ],
    addons: ["Compliance inspection & certificate", "Frameless glass upgrade", "Self-closing gate hardware upgrade"],
    projectCategory: "Pool",
    faqs: [
      { question: "Does my pool fence need to be compliant?", answer: "Yes — WA law requires pool barriers to meet AS 1926.1. We build to the standard so you pass council inspection first time." },
      { question: "Glass or tubular?", answer: "Tubular aluminium is the budget-friendly compliant option; frameless glass gives an uninterrupted view of the pool. Both meet the safety standard." },
      { question: "How high does it have to be?", answer: "The barrier must be at least 1200mm high with gaps under 100mm, and no climbable features in the non-climbable zone." },
    ],
  },
  {
    slug: "retaining-walls", title: "Retaining Walls", priceFrom: "from $260 / m²", image: IMG.retain,
    excerpt: "Limestone and concrete sleeper walls, engineered and installed in the right order.",
    intro: "Limestone block and concrete sleeper retaining walls, engineered for your soil and installed before the fence goes on top — the right order, by one licensed crew.",
    priceValue: "$260", priceUnit: "per m² installed", badges: BADGES,
    stats: [
      { value: "Engineered", label: "To your soil report" }, { value: "3–5 days", label: "Typical build" },
      { value: "5.0", label: "300+ Google reviews" }, { value: "1", label: "Crew, right order" },
    ],
    includes: [
      "Free on-site measure & levels check", "Engineering certification where required",
      "Ag-drain and backfill for drainage", "Concrete sleeper or limestone options", "Fence installed on top in the same job",
    ],
    addons: ["Structural engineering & council submission", "Extra drainage for wet blocks", "Rendered or capped finish"],
    projectCategory: "Retaining",
    faqs: [
      { question: "Do I need engineering for a retaining wall?", answer: "Walls over 500mm, or any wall carrying a load above, usually need engineering and council approval. We arrange it." },
      { question: "Sleeper or limestone?", answer: "Concrete sleepers are quick and cost-effective; limestone blocks suit heritage streetscapes. We'll advise based on your levels." },
      { question: "Why does the wall go in before the fence?", answer: "Posts set into ground about to be excavated will move. Wall first, then fence, means you don't pay twice." },
    ],
  },
  {
    slug: "gates-automation", title: "Gates & Automation", priceFrom: "from $1,450", image: IMG.gates,
    excerpt: "Custom gates with motors, keypads and remotes — fitted and set up properly.",
    intro: "Custom driveway and pedestrian gates, with motors, keypads and remotes fitted and commissioned. Matched to your fence, wired properly, and set up so it just works.",
    priceValue: "$1,450", priceUnit: "Supplied & installed", badges: BADGES,
    stats: [
      { value: "2 yr", label: "Motor warranty" }, { value: "1–2 days", label: "Typical install" },
      { value: "5.0", label: "300+ Google reviews" }, { value: "Sliding / swing", label: "Both supported" },
    ],
    includes: [
      "Free on-site measure & motor sizing", "Gate fabricated to match your fence",
      "Motor, keypad and two remotes", "Wiring and safety edges commissioned", "Handover and app setup",
    ],
    addons: ["Solar power kit for off-grid gates", "Intercom & camera integration", "Extra remotes and keypads"],
    projectCategory: "Gates",
    faqs: [
      { question: "Sliding or swing gate?", answer: "Sliding suits flat, wide driveways; swing suits shorter runs with clearance. We size the motor to the gate weight either way." },
      { question: "Can it run on solar?", answer: "Yes — we fit solar kits where mains power to the gate isn't practical." },
      { question: "Do you service existing gates?", answer: "Yes, we repair and re-commission most common motor brands." },
    ],
  },
  {
    slug: "security-fencing", title: "Security Fencing", priceFrom: "from $135 / lm", image: IMG.about,
    excerpt: "Commercial-grade fencing for sites, yards and public infrastructure.",
    intro: "Commercial and industrial security fencing — tubular steel, welded mesh and palisade — for yards, sites and public infrastructure. Built tough, installed to spec, and certified where the job needs it.",
    priceValue: "$135", priceUnit: "Supplied & installed", badges: BADGES,
    stats: [
      { value: "Commercial", label: "Grade materials" }, { value: "To program", label: "We hit dates" },
      { value: "5.0", label: "300+ Google reviews" }, { value: "Certified", label: "Where required" },
    ],
    heights: [
      { label: "1800mm", priceLabel: "from $135 / lm", popular: false },
      { label: "2100mm", priceLabel: "from $155 / lm", popular: true },
      { label: "2400mm", priceLabel: "from $180 / lm", popular: false },
    ],
    includes: [
      "Free on-site measure & spec review", "Hot-dip galvanised or powder-coated",
      "Concrete-set posts to engineering", "Gates and access panels to plan", "Certification pack on request",
    ],
    addons: ["Anti-climb / palisade tops", "Barbed or razor extensions", "Access control & automated gates"],
    projectCategory: "Security",
    faqs: [
      { question: "Do you handle commercial contracts?", answer: "Yes — we work to program on site fencing, yards and infrastructure, and can provide certification and compliance docs." },
      { question: "What materials do you use?", answer: "Tubular steel, welded mesh and palisade, hot-dip galvanised or powder-coated to suit the environment." },
    ],
  },
  {
    slug: "asbestos-fence-removal", title: "Asbestos Fence Removal", priceFrom: "from $130 / lm", image: IMG.asbestos,
    excerpt: "Licensed removal and disposal, done to WA regulations before the new fence goes up.",
    intro: "Licensed asbestos fence removal and disposal, done to WA regulations — sealed, wrapped and taken to an approved facility, with paperwork. Then we put your new fence up in the same visit.",
    priceValue: "$130", priceUnit: "per lm removed", badges: BADGES,
    stats: [
      { value: "Licensed", label: "Asbestos removalist" }, { value: "Same visit", label: "New fence up" },
      { value: "5.0", label: "300+ Google reviews" }, { value: "Documented", label: "Disposal paperwork" },
    ],
    includes: [
      "Licensed removal by trained crew", "Sealed wrapping and safe handling",
      "Disposal at an approved facility", "Air-quality safe work method", "Removal certificate & paperwork",
    ],
    addons: ["New Colorbond fence in the same job", "Soil clearance testing", "Neighbour notification handled"],
    projectCategory: "Asbestos",
    faqs: [
      { question: "Is my old fence asbestos?", answer: "If it's pre-1990 fibro, assume it contains asbestos until tested. Don't cut or drill it — call us." },
      { question: "Can I remove it myself?", answer: "It's not a DIY job and it can't go in your bin. Licensed removal protects you and your neighbours, and it's the law for larger quantities." },
      { question: "Do you replace it too?", answer: "Yes — most jobs are remove-and-replace in a single visit, so your boundary is never left open." },
    ],
  },
  {
    slug: "timber-fencing", title: "Timber Fencing", priceFrom: "from $89 / lm", image: IMG.project,
    excerpt: "Traditional paling fences, treated for Perth conditions.",
    intro: "Traditional treated-pine paling fences, built the way they last — proper posts, rails and palings, treated for Perth's sun and termites. Classic looks without the maintenance headaches of untreated timber.",
    priceValue: "$89", priceUnit: "Supplied & installed", badges: BADGES,
    stats: [
      { value: "H4 treated", label: "Termite resistant" }, { value: "1–2 days", label: "Typical install" },
      { value: "5.0", label: "300+ Google reviews" }, { value: "Lapped / capped", label: "Styles" },
    ],
    heights: [
      { label: "1500mm", priceLabel: "from $85 / lm", popular: false },
      { label: "1800mm", priceLabel: "from $89 / lm", popular: true },
      { label: "2100mm", priceLabel: "from $99 / lm", popular: false },
    ],
    includes: [
      "Free on-site measure & fixed quote", "Treated-pine posts concreted in",
      "Lapped or capped paling options", "Galvanised rails and fixings", "Full site cleanup",
    ],
    addons: ["Capping rail & exposed post caps", "Lattice extension on top", "Timber-look Colorbond alternative"],
    projectCategory: "Timber",
    faqs: [
      { question: "How long does a timber fence last?", answer: "With H4-treated pine and concreted posts, expect 15+ years in Perth conditions." },
      { question: "Will termites be a problem?", answer: "We use treated timber rated for in-ground contact, which resists termites and rot." },
    ],
  },
  {
    slug: "blade-fencing", title: "Blade Fencing Range", priceFrom: "from $340 / m", image: IMG.services,
    excerpt: "Architectural blade screens — fine radiator profiles to bold frameless blades.",
    intro: "Our blade fencing range covers everything from fine radiator-profile screens to bold frameless blades, powder-coated for the WA climate.",
    priceValue: "$340", priceUnit: "Supplied & installed", badges: BADGES,
    stats: [
      { value: "15 yr", label: "Powder-coat warranty" }, { value: "2–3 days", label: "Typical install" },
      { value: "5.0", label: "300+ Google reviews" }, { value: "40+", label: "Colour options" },
    ],
    includes: DEFAULT_INCLUDES,
    addons: DEFAULT_ADDONS,
    projectCategory: "Slat",
    faqs: [
      { question: "What's the difference between the blade options?", answer: "Radiator blades are fine and closely spaced; frameless blades hide all fixings. Both are powder-coated aluminium." },
    ],
  },
].map((s) => ({
  ...s,
  areas: AREAS,
  complianceTitle: COMPLIANCE_TITLE,
  compliance: COMPLIANCE,
  process: PROCESS,
  parentSlug: "",
  // Which Shop category the service's product-range grid pulls from.
  productCategory: ({
    "colorbond-fencing": "Color Bond Fencing",
    "slat-fencing": "Slat Fencing",
    "pool-fencing": "Pool Fencing",
    "retaining-walls": "Retaining Walls",
    "gates-automation": "Gates & Hardware",
  } as Record<string, string>)[s.slug] ?? "",
}));

const products = [
  { slug: "aluminium-slat-65", title: "Aluminium Slat – 65 x 16.5 x 6100mm", price: "$54.00", priceCents: 5400, image: IMG.shop(1), category: "Slat Fencing", homeRow: "popular", stock: 240, trackStock: true },
  { slug: "colorbond-panel-24m", title: "Colorbond Fencing Panel – 2.4m (3 sheets, 2 posts, 2 rails)", price: "$99.50 – $146.80", priceCents: 9950, image: IMG.shop(2), category: "Color Bond Fencing", homeRow: "popular", stock: 80, trackStock: true },
  { slug: "colorbond-steel-posts", title: "Colorbond® Steel Posts – various sizes", price: "$9.10 – $18.80", priceCents: 910, image: IMG.shop(3), category: "Color Bond Fencing", homeRow: "popular", stock: 500, trackStock: true },
  { slug: "pvc-new-england-panel", title: "PVC – New England Panel 2350 x 1150mm", price: "$140.00", priceCents: 14000, image: IMG.shop(4), category: "PVC Fencing", homeRow: "popular", stock: 35, trackStock: true },
  { slug: "tubular-raked-white", title: "Tubular – Raked Flat Top 1800→1200mm – WHITE", price: "$230.00", priceCents: 23000, image: IMG.shop(5), category: "Pool Fencing", homeRow: "affordable", stock: 20, trackStock: true },
  { slug: "tubular-raked-grey", title: "Tubular – Raked Flat Top 1800→1200mm – GREY", price: "$240.00", priceCents: 24000, image: IMG.shop(5), category: "Pool Fencing", homeRow: "affordable", stock: 18, trackStock: true },
  { slug: "tubular-raked-black", title: "Tubular – Raked Flat Top 1800→1200mm – BLACK", price: "$250.00", priceCents: 25000, image: IMG.shop(5), category: "Pool Fencing", homeRow: "affordable", stock: 2, trackStock: true },
  { slug: "tubular-raked-monument", title: "Tubular – Raked Flat Top 1800→1200mm – MONUMENT", price: "$260.00", priceCents: 26000, image: IMG.shop(5), category: "Pool Fencing", homeRow: "affordable", stock: 0, trackStock: true },
  { slug: "gate-latch-kit", title: "Gate Latch & Hinge Kit – lockable", price: "$68.00", priceCents: 6800, image: IMG.gates, category: "Gates & Hardware", homeRow: "", stock: 0, trackStock: false },
  { slug: "gate-motor-sliding", title: "Sliding Gate Motor – remote + keypad", price: "$1,450.00", priceCents: 145000, image: IMG.gates, category: "Gates & Hardware", homeRow: "", stock: 6, trackStock: true },
  { slug: "concrete-sleeper", title: "Concrete Sleeper – 2.0m plain grey", price: "$42.00", priceCents: 4200, image: IMG.retain, category: "Retaining Walls", homeRow: "", stock: 0, trackStock: false },
  { slug: "post-mix-concrete", title: "Rapid Set Post Mix – 20kg bag", price: "$11.50", priceCents: 1150, image: IMG.const, category: "Accessories", homeRow: "", stock: 0, trackStock: false },
  // Colorbond accessories — power the "You might also need" row on the panel page.
  { slug: "colorbond-fence-post", title: "Colorbond Fence Post – 2400mm (In-Ground)", price: "$38.50 – $52.00", priceCents: 3850, image: IMG.colorbond, category: "Color Bond Fencing", homeRow: "", stock: 300, trackStock: true },
  { slug: "colorbond-post-cap", title: "Colorbond Post Cap – 50 x 50mm", price: "$8.90", priceCents: 890, image: IMG.shop(3), category: "Color Bond Fencing", homeRow: "", stock: 500, trackStock: true },
  { slug: "touch-up-paint-spray", title: "Touch Up Paint – 300g Spray Can", price: "$17.90", priceCents: 1790, image: IMG.const, category: "Color Bond Fencing", homeRow: "", stock: 120, trackStock: true },
  // More stock so the shop has 3 pages and every category/sub-category filters.
  { slug: "aluminium-slat-100", title: "Aluminium Slat – 100 x 16.5 x 6100mm", price: "$72.00", priceCents: 7200, image: IMG.shop(1), category: "Slat Fencing", homeRow: "popular", stock: 160, trackStock: true },
  { slug: "slat-post-aluminium", title: "Aluminium Slat Post – 65 x 65 x 2400mm", price: "$44.00", priceCents: 4400, image: IMG.shop(1), category: "Slat Fencing", homeRow: "", stock: 210, trackStock: true },
  { slug: "privacy-slat-screen", title: "Privacy Slat Screen – 1800 x 1800mm", price: "$320.00", priceCents: 32000, image: IMG.services, category: "Slat Fencing", homeRow: "affordable", stock: 24, trackStock: true },
  { slug: "colorbond-panel-18m", title: "Colorbond Fencing Panel – 1.8m", price: "$79.00 – $112.00", priceCents: 7900, image: IMG.shop(2), category: "Color Bond Fencing", homeRow: "", stock: 95, trackStock: true },
  { slug: "colorbond-rail", title: "Colorbond® Rail – 2.4m", price: "$14.50", priceCents: 1450, image: IMG.shop(3), category: "Color Bond Fencing", homeRow: "", stock: 400, trackStock: true },
  { slug: "pvc-picket-panel", title: "PVC – Picket Panel 2400 x 1200mm", price: "$118.00", priceCents: 11800, image: IMG.shop(4), category: "PVC Fencing", homeRow: "affordable", stock: 40, trackStock: true },
  { slug: "pvc-post-cap", title: "PVC Post Cap – New England", price: "$6.50", priceCents: 650, image: IMG.shop(4), category: "PVC Fencing", homeRow: "", stock: 600, trackStock: true },
  { slug: "pool-glass-panel", title: "Frameless Glass Panel – 12mm 1200 x 1000mm", price: "$165.00", priceCents: 16500, image: IMG.whyUs, category: "Pool Fencing", homeRow: "popular", stock: 30, trackStock: true },
  { slug: "pool-spigot", title: "Stainless Glass Spigot – core-mount", price: "$28.00", priceCents: 2800, image: IMG.shop(5), category: "Pool Fencing", homeRow: "", stock: 220, trackStock: true },
  { slug: "gate-hinges-heavy", title: "Heavy-Duty Gate Hinges – pair", price: "$34.00", priceCents: 3400, image: IMG.gates, category: "Gates & Hardware", homeRow: "", stock: 90, trackStock: true },
  { slug: "gate-motor-swing", title: "Swing Gate Motor – dual arm + remotes", price: "$1,690.00", priceCents: 169000, image: IMG.gates, category: "Gates & Hardware", homeRow: "", stock: 4, trackStock: true },
  { slug: "limestone-block", title: "Limestone Block – 500 x 350 x 200mm", price: "$28.50", priceCents: 2850, image: IMG.retain, category: "Retaining Walls", homeRow: "affordable", stock: 260, trackStock: true },
  { slug: "galv-h-post", title: "Galvanised H-Post – 2.0m", price: "$32.00", priceCents: 3200, image: IMG.retain, category: "Retaining Walls", homeRow: "", stock: 140, trackStock: true },
  { slug: "tek-screws", title: "Tek Screws – 10g x 16mm (250 pack)", price: "$24.00", priceCents: 2400, image: IMG.const, category: "Accessories", homeRow: "", stock: 300, trackStock: true },
  { slug: "concrete-20kg", title: "Concrete Mix – 20kg bag", price: "$9.90", priceCents: 990, image: IMG.const, category: "Accessories", homeRow: "", stock: 500, trackStock: true },
];

const articles = [
  {
    slug: "colorbond-fencing-cost-perth",
    title: "What Colorbond Fencing Really Costs In Perth",
    excerpt: "A straight breakdown of materials, labour and the extras that catch people out.",
    body: `Three things move the number more than anything else: the length of the run, the height of the fence, and what's already on the boundary.

## What you're actually paying for
A clear, flat run of Colorbond is quick. A sloping site with an old asbestos fence to pull out is a different job entirely — and it should be priced like one, up front.

## Getting a price you can trust
Ask for an itemised quote. If a fencer won't break it down, that usually means the number can move later.`,
    image: IMG.article, category: "Costs", readTime: "7 min read", publishedAt: daysAgo(3),
  },
  {
    slug: "pool-fencing-laws-wa",
    title: "Pool Fencing Laws In WA: What You Need To Know",
    excerpt: "Heights, gaps, gates and inspections — the rules your pool fence has to meet.",
    body: `Pool fencing in WA is regulated, and the rules aren't optional.

## The basics
The barrier must be at least 1200mm high, gaps under it no more than 100mm, and no climbable features in the non-climbable zone.

## Gates
Gates must be self-closing and self-latching, and must open away from the pool.

## Inspections
Your local council inspects pool barriers periodically. We build to the standard so you pass first time.`,
    image: IMG.whyUs, category: "Regulations", readTime: "6 min read", publishedAt: daysAgo(12),
  },
  {
    slug: "popular-fence-styles",
    title: "5 Popular Fence Styles To Transform Your Yard",
    excerpt: "From Colorbond to frameless glass — the styles Perth homeowners actually choose.",
    body: `Perth yards get a hard time. The sun bakes the coating, the sand shifts under the posts, and the salt air eats anything not rated for it.

## Colorbond
The default for a reason: low maintenance, holds its colour, goes up fast.

## Aluminium slat
Modern and architectural. Lets the breeze through while still giving privacy.

## Frameless glass
For pools, where you want safety without walling off the water.`,
    image: IMG.services, category: "Instructions", readTime: "5 min read", publishedAt: daysAgo(21),
  },
  {
    slug: "who-pays-dividing-fence-wa",
    title: "Who Pays For A Dividing Fence In WA?",
    excerpt: "The Dividing Fences Act, in plain English — and how to talk to your neighbour.",
    body: `Under the Dividing Fences Act, neighbours generally share the cost of a sufficient dividing fence equally.

## Start with a quote
We'll give you a written quote you can hand straight to your neighbour. Most disagreements are really just about not having a real number to look at.

## If they won't agree
You can serve a formal notice. In practice it rarely gets that far.`,
    image: IMG.colorbond, category: "Regulations", readTime: "4 min read", publishedAt: daysAgo(34),
  },
  {
    slug: "asbestos-fence-removal-guide",
    title: "Removing An Old Asbestos Fence: What To Expect",
    excerpt: "Why you can't just knock it down, and what a licensed removal actually involves.",
    body: `If your fence is pre-1990 fibro, assume it contains asbestos until proven otherwise.

## Don't touch it
Breaking it releases fibres. It's not a DIY job, and it's not legal to dispose of in your bin.

## What we do
Licensed removal, sealed wrapping, and disposal at an approved facility — with paperwork.`,
    image: IMG.asbestos, category: "Safety", readTime: "6 min read", publishedAt: daysAgo(48),
  },
  {
    slug: "retaining-wall-before-fence",
    title: "Why The Retaining Wall Has To Go In First",
    excerpt: "Order of works matters. Doing it backwards costs you twice.",
    body: `If your boundary needs a retaining wall, that goes in before the fence — not after.

## Why
Fence posts set into ground that's about to be excavated will move. You'll be paying to pull the fence out and do it again.

## One crew, right order
We're licensed for both, so it happens in the right sequence without you managing two trades.`,
    image: IMG.retain, category: "Instructions", readTime: "5 min read", publishedAt: daysAgo(60),
  },
];

const projects = [
  { title: "Colorbond fence and gate", image: IMG.project, category: "Colorbond", suburb: "Balcatta", featured: true },
  { title: "Slat privacy screen", image: IMG.services, category: "Slat", suburb: "Scarborough", featured: true },
  { title: "Frameless pool fence", image: IMG.whyUs, category: "Pool", suburb: "Hillarys", featured: true },
  { title: "Colorbond boundary run", image: IMG.colorbond, category: "Colorbond", suburb: "Morley", featured: false },
  { title: "Automated sliding gate", image: IMG.gates, category: "Gates", suburb: "Osborne Park", featured: false },
  { title: "Sleeper retaining wall", image: IMG.retain, category: "Retaining", suburb: "Duncraig", featured: false },
  { title: "Asbestos fence replacement", image: IMG.asbestos, category: "Asbestos", suburb: "Balga", featured: false },
  { title: "Commercial site fencing", image: IMG.about, category: "Security", suburb: "Malaga", featured: false },
  { title: "Front yard picket", image: IMG.hero1, category: "Timber", suburb: "Mount Lawley", featured: false },
  { title: "Colorbond with sleeper plinth", image: IMG.retain, category: "Colorbond", suburb: "Kingsley", featured: false },
  { title: "Aluminium slat gate & fence", image: IMG.services, category: "Slat", suburb: "Wembley", featured: true },
  { title: "Glass pool fence & gate", image: IMG.whyUs, category: "Pool", suburb: "Sorrento", featured: false },
  { title: "Fibrewall retaining, two courses", image: IMG.retain, category: "Retaining", suburb: "Kalamunda", featured: false },
  { title: "Garrison security run", image: IMG.about, category: "Security", suburb: "Welshpool", featured: false },
  { title: "Automated swing gates", image: IMG.gates, category: "Gates", suburb: "Applecross", featured: true },
  { title: "Colorbond side & rear boundary", image: IMG.colorbond, category: "Colorbond", suburb: "Canning Vale", featured: false },
];

const reviews = [
  { name: "Blake West", role: "Home Owner", rating: "5.0", quote: "Couldn't recommend Adi and the team enough. Fantastic job removing our old asbestos fence and the new one looks sharp.", image: IMG.review(1), avatar: IMG.avatar(1) },
  { name: "Michael W", role: "Home Owner", rating: "4.9", quote: "Excellent service. Quoted the same day and completed the work the very next week. No mess left behind.", image: IMG.review(2), avatar: IMG.avatar(2) },
  { name: "Manpreet Singh", role: "Home Owner", rating: "5.0", quote: "Professional, reliable and efficient. High-quality materials and skilled craftsmanship. Highly recommended.", image: IMG.review(3), avatar: IMG.avatar(3) },
  { name: "Sandra Schmid", role: "Home Owner", rating: "5.0", quote: "The quote was clear, the crew turned up when they said they would, and the site was spotless when they left.", image: IMG.review(4), avatar: IMG.avatar(4) },
  { name: "Tom Petrides", role: "Builder", rating: "5.0", quote: "We use Stag on all our new builds now. They hit the dates, which is the whole game for us.", image: IMG.project, avatar: IMG.avatar(1) },
  { name: "Rachel Nguyen", role: "Home Owner", rating: "4.8", quote: "Retaining wall and fence done together, in the right order. Saved us a headache and probably money.", image: IMG.retain, avatar: IMG.avatar(2) },
  { name: "Daniel R.", role: "Home Owner", rating: "5.0", quote: "Old asbestos fence gone and new Monument Colorbond up in two days. One fixed price, no surprises on the invoice.", image: IMG.colorbond, avatar: IMG.avatar(3) },
  { name: "Meg & Tony", role: "Home Owners", rating: "4.0", quote: "Matched the neighbour's colour perfectly and shared the cost paperwork for us. Rain pushed the start back a day, hence four stars.", image: IMG.whyUs, avatar: IMG.avatar(4) },
  { name: "Sarah M.", role: "Home Owner", rating: "5.0", quote: "Quoted Tuesday, fence up the following Friday. Crew cemented every post and left the yard cleaner than they found it.", image: IMG.services, avatar: IMG.avatar(1) },
  { name: "Priya N.", role: "Home Owner", rating: "5.0", quote: "Frameless glass around the pool looks incredible and passed the compliance inspection first go.", image: IMG.whyUs, avatar: IMG.avatar(2) },
];

const faqs = [
  { page: "home", question: "How much does a new fence cost in Perth?", answer: "Colorbond starts around $95 per lineal metre supplied and installed, aluminium slat from $185, and pool fencing from $110. Height, access and site prep move the number — but your written quote is fixed.", defaultOpen: true },
  { page: "home", question: "How long does the whole process take?", answer: "Most quotes go out the same day. Standard residential jobs are usually installed within one to two weeks, and take a day or two on site." },
  { page: "home", question: "Do you remove the old fence?", answer: "Yes. The old panels, offcuts and rubbish leave when we do — including licensed asbestos removal if needed." },
  { page: "home", question: "What warranty comes with the work?", answer: "All installations carry a 10 year workmanship warranty, plus the manufacturer's warranty on materials." },
  { page: "services", question: "Who pays for a dividing fence in WA?", answer: "Under the Dividing Fences Act, neighbours generally share the cost of a sufficient dividing fence equally. We can supply a written quote you can hand to your neighbour.", defaultOpen: true },
  { page: "services", question: "Do I need council approval for my fence?", answer: "Standard dividing fences usually don't. Pool fences, tall front fences and retaining walls often do — we'll tell you before you commit." },
  { page: "services", question: "Can you remove asbestos fencing?", answer: "Yes — we're licensed for asbestos removal and disposal, and we handle it before the new fence goes up." },
  { page: "services", question: "Which areas do you service?", answer: "Perth metro, Joondalup, Wanneroo, Rockingham, Mandurah, and down to Bunbury and the South West." },
  { page: "services", question: "Can I get a price without a site visit?", answer: "Yes — use the fence calculator for an instant estimate. For a fixed price we'll still do a free on-site measure." },
  { page: "shop", question: "Do you deliver?", answer: "Yes, across Perth metro. Delivery is free on orders over $500, or you can pick up from Balcatta." },
];

const heroImages = [
  { src: IMG.heroBg, alt: "Timber fence at dusk in Western Australia" },
  { src: IMG.colorbond, alt: "Colorbond fence on a Perth property" },
  { src: IMG.whyUs, alt: "Stag Fencing crew installing a fence" },
];

const leads = [
  { name: "Jenny Fowler", email: "jenny.fowler@example.com", phone: "0412 334 556", address: "14 Peel Rd, Balcatta WA", fenceType: "Colorbond Fencing", message: "Back fence blew over in the storm. Need it replaced ASAP — about 18m.", status: "new", emailed: true },
  { name: "Dev Sharma", email: "dev.sharma@example.com", phone: "0433 221 908", address: "8 Karri St, Duncraig WA", fenceType: "Pool Fencing", message: "Putting in a pool, need compliant glass fencing before the inspection.", status: "contacted", emailed: true },
  { name: "Kate Lombardo", email: "kate.l@example.com", phone: "0401 887 233", address: "22 Marine Tce, Hillarys WA", fenceType: "Aluminium Slat Fencing", message: "Front boundary, about 12m. Want the modern slat look.", status: "quoted", emailed: true },
  { name: "Owen Brady", email: "owen.brady@example.com", phone: "0455 010 774", address: "3 Hale Rd, Morley WA", fenceType: "Asbestos Fence Removal", message: "Old fibro fence, definitely asbestos. Need it gone and replaced.", status: "won", emailed: true },
  { name: "Priya Nair", email: "priya.nair@example.com", phone: "0466 552 118", address: "91 Wanneroo Rd, Balga WA", fenceType: "Retaining Walls", message: "Sloped block, need retaining before fencing.", status: "lost", emailed: false, emailError: "SMTP timeout" },
];

/* ---------------------------------- Run ---------------------------------- */

/* The union of model types confuses TS on deleteMany, so widen it here. */
const CONTENT_MODELS: [string, mongoose.Model<never>][] = [
  ["services", Service],
  ["products", Product],
  ["articles", Article],
  ["projects", Project],
  ["reviews", Review],
  ["faqs", Faq],
  ["heroimages", HeroImage],
  ["leads", Lead],
  ["orders", Order],
] as unknown as [string, mongoose.Model<never>][];

async function clean() {
  for (const [name, Model] of CONTENT_MODELS) {
    const r = await Model.deleteMany({});
    if (r.deletedCount) console.log(`  cleared ${name.padEnd(12)} ${r.deletedCount}`);
  }
}

async function main() {
  loadEnv();
  await connectDB();

  const wipeOnly = process.argv.includes("--clean");

  console.log(wipeOnly ? "Removing demo data...\n" : "Seeding DEMO data...\n");
  await clean();

  if (wipeOnly) {
    console.log("\nDemo data removed. Your admin user and site settings are untouched.");
    await mongoose.disconnect();
    return;
  }

  console.log();

  const allServices = [...services, ...childServices];
  await Service.insertMany(
    allServices.map((s, i) => ({ ...s, price: s.priceFrom, order: i, active: true })),
  );
  console.log(`  ${services.length} services + ${childServices.length} range items`);

  const SUBCAT: Record<string, string> = {
    "aluminium-slat-65": "Slat panels",
    "colorbond-panel-24m": "Panels",
    "colorbond-steel-posts": "Posts & rails",
    "pvc-new-england-panel": "Panels",
    "tubular-raked-white": "Tubular",
    "tubular-raked-grey": "Tubular",
    "tubular-raked-black": "Tubular",
    "tubular-raked-monument": "Tubular",
    "gate-latch-kit": "Hardware",
    "gate-motor-sliding": "Automation",
    "concrete-sleeper": "Sleepers",
    "post-mix-concrete": "Accessories",
    "colorbond-fence-post": "Posts & rails",
    "colorbond-post-cap": "Posts & rails",
    "touch-up-paint-spray": "Accessories",
    "aluminium-slat-100": "Slat panels",
    "slat-post-aluminium": "Posts & rails",
    "privacy-slat-screen": "Screens",
    "colorbond-panel-18m": "Panels",
    "colorbond-rail": "Posts & rails",
    "pvc-picket-panel": "Panels",
    "pvc-post-cap": "Caps & fittings",
    "pool-glass-panel": "Glass",
    "pool-spigot": "Hardware",
    "gate-hinges-heavy": "Hardware",
    "gate-motor-swing": "Automation",
    "limestone-block": "Blocks",
    "galv-h-post": "Posts & rails",
    "tek-screws": "Fixings",
    "concrete-20kg": "Accessories",
  };

  // Rich product-detail-page content. Colorbond panel fully matches the Figma;
  // others get sensible extras so their detail pages don't look empty.
  type Detail = {
    sku?: string;
    images?: string[];
    options?: { name: string; values: string[] }[];
    included?: string[];
    specs?: { label: string; value: string }[];
  };
  const PRODUCT_DETAILS: Record<string, Detail> = {
    "colorbond-panel-24m": {
      sku: "116321",
      images: [IMG.colorbond, IMG.shop(1), IMG.shop(3), IMG.services],
      options: [
        { name: "Colour", values: ["Basalt", "Black", "Dune", "Monument", "Paperbark", "Primrose", "Surfmist", "White", "Woodland Grey"] },
        { name: "Finish", values: ["Powder Coat", "Matte Wood Look", "Metal Base"] },
        { name: "Material", values: ["BlueScope Steel", "Aluminium", "PVC"] },
        { name: "Size / Length", values: ["1800mm", "2100mm", "2400mm", "3000mm"] },
        { name: "Height", values: ["1200mm", "1500mm", "1650mm", "1800mm"] },
        { name: "Brand", values: ["BlueScope", "COLORBOND", "Stag Select"] },
      ],
      included: [
        "3 × Colorbond sheets (2.4m long)",
        "2 × steel posts",
        "2 × rails",
        "Tek screws & post caps",
      ],
      specs: [
        { label: "Sheets", value: "3 × 2.4m" },
        { label: "Height range", value: "1200 – 1800mm" },
        { label: "Material", value: "BlueScope COLORBOND steel" },
        { label: "Colours", value: "9 standard Colorbond colours" },
        { label: "Wind rating", value: "Region 4 & 6 compliant" },
        { label: "Warranty", value: "10-year manufacturer warranty" },
      ],
    },
    "aluminium-slat-65": {
      sku: "SLT-65",
      images: [IMG.services, IMG.shop(1)],
      options: [
        { name: "Colour", values: ["Monument", "Black", "Woodland Grey", "Surfmist", "Timber-look"] },
        { name: "Length", values: ["6100mm"] },
      ],
      included: ["1 × 65 × 16.5mm aluminium blade (6.1m)"],
      specs: [
        { label: "Profile", value: "65 × 16.5mm" },
        { label: "Length", value: "6100mm" },
        { label: "Material", value: "Powder-coated aluminium" },
        { label: "Warranty", value: "15-year powder-coat" },
      ],
    },
    "colorbond-steel-posts": {
      sku: "CB-POST",
      options: [
        { name: "Size", values: ["50 × 50mm", "65 × 65mm", "100 × 100mm"] },
        { name: "Colour", values: ["Monument", "Woodland Grey", "Basalt", "Surfmist"] },
      ],
      specs: [
        { label: "Material", value: "Galvanised COLORBOND steel" },
        { label: "Sizes", value: "50–100mm" },
      ],
    },
    "gate-motor-sliding": {
      sku: "GM-SLIDE",
      included: ["Sliding gate motor", "2 × remotes", "Keypad", "Safety edge"],
      specs: [
        { label: "Type", value: "Sliding" },
        { label: "Max gate weight", value: "600kg" },
        { label: "Power", value: "240V or solar" },
        { label: "Warranty", value: "2-year motor" },
      ],
    },
  };

  await Product.insertMany(
    products.map((p, i) => ({
      ...p,
      subCategory: SUBCAT[p.slug] ?? "",
      ...(PRODUCT_DETAILS[p.slug] ?? {}),
      order: i,
      active: true,
    })),
  );
  console.log(`  ${products.length} products`);

  await Article.insertMany(articles.map((a) => ({ ...a, active: true })));
  console.log(`  ${articles.length} articles`);

  await Project.insertMany(projects.map((p, i) => ({ ...p, order: i, active: true })));
  console.log(`  ${projects.length} projects (gallery)`);

  await Review.insertMany(reviews.map((r, i) => ({ ...r, order: i, active: true })));
  console.log(`  ${reviews.length} reviews`);

  await Faq.insertMany(faqs.map((f, i) => ({ ...f, order: i, active: true })));
  console.log(`  ${faqs.length} faqs`);

  await HeroImage.insertMany(heroImages.map((h, i) => ({ ...h, order: i, active: true })));
  console.log(`  ${heroImages.length} hero slides`);

  await Lead.insertMany(leads.map((l, i) => ({ ...l, createdAt: daysAgo(i * 2) })));
  console.log(`  ${leads.length} leads`);

  /* Orders — built from real products so the admin totals add up. */
  const p = (slug: string) => products.find((x) => x.slug === slug)!;

  const orderSpecs = [
    { num: "SF-A1B2C3", name: "Jenny Fowler", email: "jenny.fowler@example.com", phone: "0412 334 556", fulfilment: "delivery", status: "paid", paymentStatus: "paid", ship: 8900, lines: [[p("colorbond-panel-24m"), 6], [p("colorbond-steel-posts"), 12]] },
    { num: "SF-D4E5F6", name: "Dev Sharma", email: "dev.sharma@example.com", phone: "0433 221 908", fulfilment: "pickup", status: "pending", paymentStatus: "unpaid", ship: 0, lines: [[p("tubular-raked-black"), 4]] },
    { num: "SF-G7H8I9", name: "Kate Lombardo", email: "kate.l@example.com", phone: "0401 887 233", fulfilment: "delivery", status: "fulfilled", paymentStatus: "paid", ship: 0, lines: [[p("aluminium-slat-65"), 24], [p("gate-latch-kit"), 1]] },
    { num: "SF-J1K2L3", name: "Owen Brady", email: "owen.brady@example.com", phone: "0455 010 774", fulfilment: "delivery", status: "processing", paymentStatus: "paid", ship: 8900, lines: [[p("gate-motor-sliding"), 1]] },
  ] as const;

  const orders = orderSpecs.map((o, i) => {
    const items = o.lines.map(([prod, qty]) => ({
      productSlug: prod.slug,
      title: prod.title,
      image: prod.image,
      unitPriceCents: prod.priceCents,
      quantity: qty,
    }));
    const subtotalCents = items.reduce((n, it) => n + it.unitPriceCents * it.quantity, 0);
    const totalCents = subtotalCents + o.ship;
    return {
      orderNumber: o.num,
      name: o.name,
      email: o.email,
      phone: o.phone,
      address: "14 Example St",
      suburb: "Balcatta",
      postcode: "6021",
      fulfilment: o.fulfilment,
      items,
      subtotalCents,
      shippingCents: o.ship,
      gstCents: Math.round(totalCents - totalCents / 1.1),
      totalCents,
      status: o.status,
      paymentStatus: o.paymentStatus,
      createdAt: daysAgo(i + 1),
    };
  });

  await Order.insertMany(orders);
  console.log(`  ${orders.length} orders`);

  await mongoose.disconnect();

  console.log("\nDEMO DATA LOADED.");
  console.log("Browse the site, then remove it with:  npm run demo:clean");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
