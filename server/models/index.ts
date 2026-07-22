import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/* -------------------------------------------------------------------------
   Helper: in dev, Next hot-reload re-evaluates modules. Re-registering a model
   throws OverwriteModelError, so reuse the existing compiled model.
---------------------------------------------------------------------------*/
function model<TSchema extends Schema>(name: string, schema: TSchema) {
  return (mongoose.models[name] ?? mongoose.model(name, schema)) as Model<
    InferSchemaType<TSchema>
  >;
}

/* --------------------------------- User --------------------------------- */
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Only set for password logins (admins). OAuth/OTP users have none.
    passwordHash: { type: String, default: null },
    name: { type: String, default: "" },
    image: { type: String, default: "" },
    role: {
      type: String,
      enum: ["admin", "editor", "customer"],
      default: "customer",
    },
    emailVerified: { type: Date, default: null },
    // Which sign-in methods this account has used: credentials|google|apple|otp
    providers: { type: [String], default: [] },
  },
  { timestamps: true },
);
export const User = model("User", userSchema);

/* ------------------------------ OTP tokens ------------------------------ */
const otpTokenSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true },
);
// Mongo TTL monitor deletes expired codes automatically.
otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const OtpToken = model("OtpToken", otpTokenSchema);

/* ------------------------------- Service -------------------------------- */

/* Small embedded shapes for the rich service detail page. Each section on the
   page maps to one of these arrays; a section renders only when its array has
   items, so a half-filled service still looks intentional. _id:false keeps the
   documents lean (these are content, not entities we look up by id). */
const svcStatSchema = new Schema(
  { value: { type: String, default: "" }, label: { type: String, default: "" } },
  { _id: false },
);
const svcSwatchSchema = new Schema(
  { name: { type: String, default: "" }, hex: { type: String, default: "#cccccc" } },
  { _id: false },
);
const svcHeightSchema = new Schema(
  {
    label: { type: String, default: "" }, // e.g. "1800mm"
    priceLabel: { type: String, default: "" }, // e.g. "from $104 / lm"
    popular: { type: Boolean, default: false }, // shows the "Most popular" tag
    /** Which illustration to draw in the tile (TileVisual):
     *  solid | gapped | glass | radiator | sleeper. Defaults to solid.
     *  Ignored when customSvg is set. */
    visual: { type: String, default: "solid" },
    /** Raw <svg>...</svg> markup pasted by staff — overrides `visual` when
     *  non-empty. Staff-only (requireStaff() gates the write action), same
     *  trust boundary as any other admin-entered content/URL. */
    customSvg: { type: String, default: "" },
  },
  { _id: false },
);
const svcStepSchema = new Schema(
  { title: { type: String, default: "" }, body: { type: String, default: "" } },
  { _id: false },
);
const svcFaqSchema = new Schema(
  { question: { type: String, default: "" }, answer: { type: String, default: "" } },
  { _id: false },
);

const serviceSchema = new Schema(
  {
    slug: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    price: { type: String, default: "" },
    /** e.g. "from $95 / lm" shown on the services grid. */
    priceFrom: { type: String, default: "" },
    image: { type: String, required: true, trim: true },
    /** Short line used on the home accordion + service cards. */
    excerpt: { type: String, default: "" },
    /** Long copy for the service detail page. */
    body: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },

    /* ---- Rich service detail page (all optional) ---- */
    /** 01 Header: intro paragraph + price card. */
    intro: { type: String, default: "" },
    priceValue: { type: String, default: "" }, // big number, e.g. "$95"
    priceUnit: { type: String, default: "" }, // e.g. "Supplied & installed"
    badges: { type: [String], default: [] }, // "Licensed & insured", ...
    /** 02 Stats row. */
    stats: { type: [svcStatSchema], default: [] },
    /** 03 Colours — title varies per service ("Pick your colour",
     *  "Sleeper finishes", "Frame & hardware finishes"…). */
    coloursTitle: { type: String, default: "" },
    coloursNote: { type: String, default: "" },
    colours: { type: [svcSwatchSchema], default: [] },
    /** 04 Sizes & pricing — title varies ("Heights & pricing",
     *  "Sleeper sizes & pricing", "Styles & pricing"…). */
    heightsTitle: { type: String, default: "" },
    heights: { type: [svcHeightSchema], default: [] },
    /** 05 Included & add-ons — editable section titles. */
    includesTitle: { type: String, default: "" },
    includes: { type: [String], default: [] },
    addonsTitle: { type: String, default: "" },
    addons: { type: [String], default: [] },
    /** 06 WA compliance. */
    complianceTitle: { type: String, default: "" },
    compliance: { type: [String], default: [] },
    /** 07 Process. */
    processTitle: { type: String, default: "" },
    process: { type: [svcStepSchema], default: [] },
    /** 09 Reviews heading. */
    reviewsTitle: { type: String, default: "" },
    /** 08 Recent projects — which Project.category to pull in. */
    projectCategory: { type: String, default: "" },
    /** Product range grid — which Product.category to show for this service. */
    productCategory: { type: String, default: "" },
    /** 10 FAQ (per-service). */
    faqs: { type: [svcFaqSchema], default: [] },
    /** 11 Areas we service. */
    areas: { type: [String], default: [] },
    /** If set, this service is a RANGE ITEM of the parent service (by slug).
     *  A parent with children shows a range grid; each child is its own full
     *  detail page. Empty = a top-level service. */
    parentSlug: { type: String, default: "", index: true },
    /** Only used on a PARENT with children: heading + intro paragraph shown
     *  above the range grid (/services/<slug>/range). Falls back to a
     *  generic "The {title} range" line when blank. */
    rangeHeading: { type: String, default: "" },
    rangeIntro: { type: String, default: "" },
  },
  { timestamps: true },
);
serviceSchema.index({ order: 1 });
export const Service = model("Service", serviceSchema);

/* ------------------------------- Product -------------------------------- */

/** A selectable variant group on the product page, e.g. Colour / Size. */
const productOptionSchema = new Schema(
  { name: { type: String, default: "" }, values: { type: [String], default: [] } },
  { _id: false },
);
/** One row in the Specifications table. */
const productSpecSchema = new Schema(
  { label: { type: String, default: "" }, value: { type: String, default: "" } },
  { _id: false },
);

const productSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: { type: String, required: true, trim: true },
    /** Display string, e.g. "$99.50 – $146.80". Real money lives in priceCents. */
    price: { type: String, default: "" },
    /** Integer cents — NEVER store money as a float. */
    priceCents: { type: Number, default: 0 },
    image: { type: String, required: true, trim: true },
    /** Gallery thumbnails on the product page (main `image` is shown first). */
    images: { type: [String], default: [] },
    description: { type: String, default: "" },
    /** Product page extras (all optional). */
    sku: { type: String, default: "" },
    options: { type: [productOptionSchema], default: [] }, // Colour, Size, ...
    included: { type: [String], default: [] }, // "What's included" list
    specs: { type: [productSpecSchema], default: [] }, // Specifications table
    category: { type: String, default: "", index: true },
    /** Optional finer grouping under a category, used by the Shop filters. */
    subCategory: { type: String, default: "", index: true },
    /** Which homepage row this product appears in: "popular" | "affordable" | ""
     *  (NOT named `collection` — that's a reserved Mongoose schema path.) */
    homeRow: { type: String, default: "", index: true },
    /**
     * Stock is only enforced when trackStock is on. Off by default so a new
     * product (stock 0) isn't instantly unbuyable — an easy footgun otherwise.
     */
    trackStock: { type: Boolean, default: false },
    stock: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
productSchema.index({ order: 1 });
export const Product = model("Product", productSchema);

/* ------------------------------- Article -------------------------------- */
const articleSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, default: "" },
    body: { type: String, default: "" },
    image: { type: String, required: true, trim: true },
    category: { type: String, default: "Instructions" },
    readTime: { type: String, default: "5 min read" },
    publishedAt: { type: Date, default: () => new Date() },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
articleSchema.index({ publishedAt: -1 });
export const Article = model("Article", articleSchema);

/* ------------------------- Project (gallery item) ------------------------ */
const projectSchema = new Schema(
  {
    title: { type: String, default: "", trim: true },
    image: { type: String, required: true, trim: true },
    /** e.g. "Colorbond", "Pool", "Slat" — used by the gallery filters. */
    category: { type: String, default: "", index: true },
    suburb: { type: String, default: "" },
    /** Show in the homepage "Recent Projects" carousel. */
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
projectSchema.index({ order: 1 });
export const Project = model("Project", projectSchema);

/* -------------------------------- Review --------------------------------- */
const reviewSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: "Home Owner" },
    quote: { type: String, required: true, trim: true },
    rating: { type: String, default: "5.0" },
    /** Job photo shown on the card. */
    image: { type: String, default: "" },
    /** Reviewer avatar. */
    avatar: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
reviewSchema.index({ order: 1 });
export const Review = model("Review", reviewSchema);

/* --------------------------------- FAQ ---------------------------------- */
const faqSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    /** Which page this FAQ belongs to: "home" | "services" | "shop" ... */
    page: { type: String, default: "home", index: true },
    defaultOpen: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
faqSchema.index({ order: 1 });
export const Faq = model("Faq", faqSchema);

/* ------------------------------ Hero image ------------------------------ */
const heroImageSchema = new Schema(
  {
    src: { type: String, required: true, trim: true },
    alt: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
heroImageSchema.index({ order: 1 });
export const HeroImage = model("HeroImage", heroImageSchema);

/* ------------------------------ Cart / Order ----------------------------- */

/**
 * Line items are SNAPSHOTS: title/price/image are copied in at add-to-cart and
 * order time. If an admin later edits or deletes a product, historical orders
 * must not silently change — that breaks accounting.
 */
const lineItemSchema = new Schema(
  {
    productSlug: { type: String, required: true },
    title: { type: String, required: true },
    image: { type: String, default: "" },
    unitPriceCents: { type: Number, required: true }, // integer cents
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const cartSchema = new Schema(
  {
    /** Anonymous cart id stored in an HttpOnly cookie. */
    cartId: { type: String, required: true, unique: true, index: true },
    /** Set once the shopper signs in, so the cart follows the account. */
    userId: { type: String, default: null, index: true },
    items: { type: [lineItemSchema], default: [] },
  },
  { timestamps: true },
);
export const Cart = model("Cart", cartSchema);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: null, index: true },

    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    suburb: { type: String, default: "" },
    postcode: { type: String, default: "" },
    notes: { type: String, default: "" },

    items: { type: [lineItemSchema], default: [] },

    subtotalCents: { type: Number, required: true },
    shippingCents: { type: Number, default: 0 },
    gstCents: { type: Number, default: 0 },
    totalCents: { type: Number, required: true },

    fulfilment: {
      type: String,
      enum: ["pickup", "delivery"],
      default: "delivery",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "fulfilled", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded", "failed"],
      default: "unpaid",
    },
    /** Set when Stripe is wired up. */
    stripeSessionId: { type: String, default: "" },

    /** True when we couldn't fully reserve stock for a PAID order (oversold).
     *  We never refuse money already taken — we flag it for a human instead. */
    stockIssue: { type: Boolean, default: false },
    stockNote: { type: String, default: "" },
  },
  { timestamps: true },
);
orderSchema.index({ createdAt: -1 });
export const Order = model("Order", orderSchema);

/* --------------------------------- Lead --------------------------------- */
const leadSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    fenceType: { type: String, default: "" },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "contacted", "quoted", "won", "lost"],
      default: "new",
    },
    // Did the notification email actually go out? Lets you spot SMTP failures.
    emailed: { type: Boolean, default: false },
    emailError: { type: String, default: "" },
  },
  { timestamps: true },
);
leadSchema.index({ createdAt: -1 });
export const Lead = model("Lead", leadSchema);

/* ----------------------------- Site settings ---------------------------- */
const siteSettingSchema = new Schema(
  {
    // Singleton document, always key: "site"
    key: { type: String, required: true, unique: true, default: "site" },

    phoneDisplay: { type: String, default: "0431703770" },
    phoneHref: { type: String, default: "tel:0431703770" },
    email: { type: String, default: "quote@stagfencing.com.au" },

    heroBadge: { type: String, default: "Join over 1,000 happy customers" },
    heroHeadingLine1: { type: String, default: "Fencing Made for" },
    heroHeadingLine2: { type: String, default: "Perth Sun, Sand & Salt" },
    heroSubcopy: {
      type: String,
      default:
        "We've been fencing Perth suburbs for years: Colorbond, aluminium slat, pool fencing, gates and retaining walls. We know what holds up in local conditions and what doesn't.",
    },
    heroCtaLabel: { type: String, default: "Get Your Free Quote Today" },
    googleRating: { type: String, default: "5.0" },

    footerText: {
      type: String,
      default:
        "At Stag Fencing, one of the trusted fencing contractor in perth, we specialize in providing high-quality fencing solutions for homes. With a commitment to excellence and customer satisfaction, our experienced team ensures every project is completed with precision and care.",
    },

    seoTitle: {
      type: String,
      default: "Stag Fencing Perth | Colorbond, Pool & Slat Fencing Experts",
    },
    seoDescription: {
      type: String,
      default:
        "Perth's trusted fencing contractor — Colorbond, aluminium slat, pool fencing, gates, automation, retaining walls and asbestos fence removal. Get a free quote.",
    },

    addressStreet: { type: String, default: "" },
    addressLocality: { type: String, default: "Perth" },
    addressRegion: { type: String, default: "WA" },
    addressPostalCode: { type: String, default: "6000" },
    addressCountry: { type: String, default: "AU" },

    geoLat: { type: Number, default: -31.9523 },
    geoLng: { type: Number, default: 115.8613 },
  },
  { timestamps: true },
);
export const SiteSetting = model("SiteSetting", siteSettingSchema);
