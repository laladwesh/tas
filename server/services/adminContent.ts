import { connectDB } from "@/server/db/mongoose";
import {
  Service,
  Faq,
  HeroImage,
  SiteSetting,
  Product,
  Article,
  Project,
  Review,
} from "@/server/models";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/server/services/content";

/* ---------------------- Catalog (products / articles / projects) --------- */

export async function listAllReviews() {
  await connectDB();
  const docs = await Review.find().sort({ order: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    name: d.name,
    role: d.role ?? "",
    quote: d.quote,
    rating: d.rating ?? "5.0",
    image: d.image ?? "",
    avatar: d.avatar ?? "",
    order: d.order ?? 0,
    active: Boolean(d.active),
  }));
}

export async function listAllProducts() {
  await connectDB();
  const docs = await Product.find().sort({ order: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    slug: d.slug,
    title: d.title,
    price: d.price ?? "",
    priceCents: d.priceCents ?? 0,
    image: d.image,
    description: d.description ?? "",
    category: d.category ?? "",
    subCategory: d.subCategory ?? "",
    homeRow: d.homeRow ?? "",
    trackStock: Boolean(d.trackStock),
    stock: d.stock ?? 0,
    order: d.order ?? 0,
    active: Boolean(d.active),
    // Detail-page extras, flattened to the textarea line format.
    sku: d.sku ?? "",
    images: joinLines(d.images),
    included: joinLines(d.included),
    specs: joinRows(d.specs, ["label", "value"]),
    options: (d.options ?? [])
      .map((o) => {
        const opt = o as { name?: string; values?: string[] };
        return `${opt.name ?? ""} | ${(opt.values ?? []).join(", ")}`;
      })
      .join("\n"),
  }));
}

export async function listAllArticles() {
  await connectDB();
  const docs = await Article.find().sort({ publishedAt: -1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt ?? "",
    body: d.body ?? "",
    image: d.image,
    category: d.category ?? "Instructions",
    readTime: d.readTime ?? "",
    active: Boolean(d.active),
  }));
}

export async function listAllProjects() {
  await connectDB();
  const docs = await Project.find().sort({ order: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    title: d.title ?? "",
    image: d.image,
    category: d.category ?? "",
    suburb: d.suburb ?? "",
    featured: Boolean(d.featured),
    order: d.order ?? 0,
    active: Boolean(d.active),
  }));
}

/* Admin readers: unlike the public ones these include INACTIVE rows and ids. */

export type AdminService = {
  id: string;
  slug: string;
  title: string;
  price: string;
  priceFrom: string;
  excerpt: string;
  image: string;
  order: number;
  active: boolean;
  // Rich detail-page fields (already flattened to the textarea line format).
  intro: string;
  priceValue: string;
  priceUnit: string;
  badges: string;
  stats: string;
  coloursNote: string;
  colours: string;
  heights: string;
  includes: string;
  addons: string;
  complianceTitle: string;
  compliance: string;
  process: string;
  projectCategory: string;
  productCategory: string;
  faqs: string;
  areas: string;
  ranges: string;
};

/** Serialise the stored arrays back into the "one item / pipe-separated" text
 *  format the admin textareas use, so editing round-trips cleanly. */
const joinLines = (arr?: readonly unknown[]) =>
  (arr ?? []).map((v) => String(v)).join("\n");
const joinRows = (arr: readonly unknown[] | undefined, keys: string[]) =>
  (arr ?? [])
    .map((o) => {
      const row = o as Record<string, unknown>;
      return keys.map((k) => String(row[k] ?? "")).join(" | ");
    })
    .join("\n");

export type AdminFaq = {
  id: string;
  question: string;
  answer: string;
  page: string;
  defaultOpen: boolean;
  order: number;
  active: boolean;
};

export type AdminHeroImage = {
  id: string;
  src: string;
  alt: string;
  order: number;
  active: boolean;
};

export async function listAllServices(): Promise<AdminService[]> {
  await connectDB();
  const docs = await Service.find().sort({ order: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    slug: d.slug ?? "",
    title: d.title,
    price: d.price ?? "",
    priceFrom: d.priceFrom ?? "",
    excerpt: d.excerpt ?? "",
    image: d.image,
    order: d.order ?? 0,
    active: Boolean(d.active),

    intro: d.intro ?? "",
    priceValue: d.priceValue ?? "",
    priceUnit: d.priceUnit ?? "",
    badges: joinLines(d.badges),
    stats: joinRows(d.stats, ["value", "label"]),
    coloursNote: d.coloursNote ?? "",
    colours: joinRows(d.colours, ["name", "hex"]),
    heights: joinRows(d.heights, ["label", "priceLabel", "popular"]),
    includes: joinLines(d.includes),
    addons: joinLines(d.addons),
    complianceTitle: d.complianceTitle ?? "",
    compliance: joinLines(d.compliance),
    process: joinRows(d.process, ["title", "body"]),
    projectCategory: d.projectCategory ?? "",
    productCategory: d.productCategory ?? "",
    faqs: joinRows(d.faqs, ["question", "answer"]),
    areas: joinLines(d.areas),
    ranges: joinRows(d.ranges, ["name", "priceFrom", "image"]),
  }));
}

export async function listAllFaqs(): Promise<AdminFaq[]> {
  await connectDB();
  const docs = await Faq.find().sort({ order: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    question: d.question,
    answer: d.answer,
    page: d.page ?? "home",
    defaultOpen: Boolean(d.defaultOpen),
    order: d.order ?? 0,
    active: Boolean(d.active),
  }));
}

export async function listAllHeroImages(): Promise<AdminHeroImage[]> {
  await connectDB();
  const docs = await HeroImage.find().sort({ order: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    src: d.src,
    alt: d.alt ?? "",
    order: d.order ?? 0,
    active: Boolean(d.active),
  }));
}

export async function getSettingsForAdmin(): Promise<SiteSettings> {
  await connectDB();
  const doc = await SiteSetting.findOne({ key: "site" }).lean();
  if (!doc) return DEFAULT_SETTINGS;
  const { _id, key, createdAt, updatedAt, ...rest } = doc as Record<string, unknown>;
  void _id;
  void key;
  void createdAt;
  void updatedAt;
  return { ...DEFAULT_SETTINGS, ...(rest as Partial<SiteSettings>) };
}
