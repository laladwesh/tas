import { z } from "zod";

/* Zod v4 syntax. Shared by client forms and server actions. */

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const otpRequestSchema = z.object({
  email: z.email("Enter a valid email"),
});

export const otpVerifySchema = z.object({
  email: z.email("Enter a valid email"),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const serviceSchema = z.object({
  slug: z.string().trim().toLowerCase().default(""),
  title: z.string().trim().min(1, "Title is required"),
  price: z.string().trim().default(""),
  priceFrom: z.string().trim().default(""),
  excerpt: z.string().trim().default(""),
  image: z.string().trim().min(1, "Image path or URL is required"),
  order: z.coerce.number().int().default(0),
  active: z.coerce.boolean().default(true),

  /* Rich service detail page — all optional. The admin action parses the
     textareas into these shapes before validating. */
  intro: z.string().trim().default(""),
  priceValue: z.string().trim().default(""),
  priceUnit: z.string().trim().default(""),
  badges: z.array(z.string()).default([]),
  stats: z
    .array(z.object({ value: z.string().default(""), label: z.string().default("") }))
    .default([]),
  coloursTitle: z.string().trim().default(""),
  coloursNote: z.string().trim().default(""),
  colours: z
    .array(z.object({ name: z.string().default(""), hex: z.string().default("#cccccc") }))
    .default([]),
  heightsTitle: z.string().trim().default(""),
  heights: z
    .array(
      z.object({
        label: z.string().default(""),
        priceLabel: z.string().default(""),
        popular: z.boolean().default(false),
        visual: z.string().default("solid"),
        customSvg: z.string().default(""),
      }),
    )
    .default([]),
  includesTitle: z.string().trim().default(""),
  includes: z.array(z.string()).default([]),
  addonsTitle: z.string().trim().default(""),
  addons: z.array(z.string()).default([]),
  complianceTitle: z.string().trim().default(""),
  compliance: z.array(z.string()).default([]),
  processTitle: z.string().trim().default(""),
  process: z
    .array(z.object({ title: z.string().default(""), body: z.string().default("") }))
    .default([]),
  reviewsTitle: z.string().trim().default(""),
  projectCategory: z.string().trim().default(""),
  productCategory: z.string().trim().default(""),
  parentSlug: z.string().trim().toLowerCase().default(""),
  rangeHeading: z.string().trim().default(""),
  rangeIntro: z.string().trim().default(""),
  faqs: z
    .array(z.object({ question: z.string().default(""), answer: z.string().default("") }))
    .default([]),
  areas: z.array(z.string()).default([]),
});

export const faqSchema = z.object({
  question: z.string().trim().min(1, "Question is required"),
  answer: z.string().trim().min(1, "Answer is required"),
  /** Which page shows this FAQ. */
  page: z.enum(["home", "services", "shop"]).default("home"),
  defaultOpen: z.coerce.boolean().default(false),
  order: z.coerce.number().int().default(0),
  active: z.coerce.boolean().default(true),
});

export const heroImageSchema = z.object({
  src: z.string().trim().min(1, "Image path or URL is required"),
  alt: z.string().trim().default(""),
  order: z.coerce.number().int().default(0),
  active: z.coerce.boolean().default(true),
});

export const leadSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name"),
  email: z.email("Please enter a valid email"),
  phone: z.string().trim().default(""),
  address: z.string().trim().default(""),
  fenceType: z.string().trim().default(""),
  message: z.string().trim().default(""),
});

export const leadStatusSchema = z.enum([
  "new",
  "contacted",
  "quoted",
  "won",
  "lost",
]);

/** URL-safe slug. */
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Slug is required")
  .regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers and dashes only");

export const productSchema = z.object({
  slug,
  title: z.string().trim().min(1, "Title is required"),
  price: z.string().trim().default(""),
  priceCents: z.coerce.number().int().min(0).default(0),
  image: z.string().trim().min(1, "Image is required"),
  description: z.string().trim().default(""),
  category: z.string().trim().default(""),
  subCategory: z.string().trim().default(""),
  homeRow: z.string().trim().default(""),
  trackStock: z.coerce.boolean().default(false),
  stock: z.coerce.number().int().min(0).default(0),
  order: z.coerce.number().int().default(0),
  active: z.coerce.boolean().default(true),

  /* Product detail page — all optional. */
  sku: z.string().trim().default(""),
  images: z.array(z.string()).default([]),
  options: z
    .array(z.object({ name: z.string().default(""), values: z.array(z.string()).default([]) }))
    .default([]),
  included: z.array(z.string()).default([]),
  specs: z
    .array(z.object({ label: z.string().default(""), value: z.string().default("") }))
    .default([]),
});

export const articleSchema = z.object({
  slug,
  title: z.string().trim().min(1, "Title is required"),
  excerpt: z.string().trim().default(""),
  body: z.string().trim().default(""),
  image: z.string().trim().min(1, "Image is required"),
  category: z.string().trim().default("Instructions"),
  readTime: z.string().trim().default("5 min read"),
  active: z.coerce.boolean().default(true),
});

export const projectSchema = z.object({
  title: z.string().trim().default(""),
  image: z.string().trim().min(1, "Image is required"),
  category: z.string().trim().default(""),
  suburb: z.string().trim().default(""),
  featured: z.coerce.boolean().default(false),
  order: z.coerce.number().int().default(0),
  active: z.coerce.boolean().default(true),
});

export const reviewSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  role: z.string().trim().default("Home Owner"),
  quote: z.string().trim().min(1, "Review text is required"),
  rating: z.string().trim().default("5.0"),
  image: z.string().trim().default(""),
  avatar: z.string().trim().default(""),
  order: z.coerce.number().int().default(0),
  active: z.coerce.boolean().default(true),
});

export const orderStatusSchema = z.enum([
  "pending",
  "paid",
  "processing",
  "fulfilled",
  "cancelled",
]);

export const checkoutSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name"),
  email: z.email("Please enter a valid email"),
  phone: z.string().trim().min(6, "Please enter a contact number"),
  fulfilment: z.enum(["delivery", "pickup"]).default("delivery"),
  address: z.string().trim().default(""),
  suburb: z.string().trim().default(""),
  postcode: z.string().trim().default(""),
  notes: z.string().trim().default(""),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const siteSettingSchema = z.object({
  phoneDisplay: z.string().trim().min(1),
  phoneHref: z.string().trim().min(1),
  email: z.email(),

  heroBadge: z.string().trim().default(""),
  heroHeadingLine1: z.string().trim().default(""),
  heroHeadingLine2: z.string().trim().default(""),
  heroSubcopy: z.string().trim().default(""),
  heroCtaLabel: z.string().trim().default(""),
  googleRating: z.string().trim().default(""),

  footerText: z.string().trim().default(""),

  seoTitle: z.string().trim().default(""),
  seoDescription: z.string().trim().default(""),

  addressStreet: z.string().trim().default(""),
  addressLocality: z.string().trim().default(""),
  addressRegion: z.string().trim().default(""),
  addressPostalCode: z.string().trim().default(""),
  addressCountry: z.string().trim().default(""),

  geoLat: z.coerce.number(),
  geoLng: z.coerce.number(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
export type FaqInput = z.infer<typeof faqSchema>;
export type HeroImageInput = z.infer<typeof heroImageSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type SiteSettingInput = z.infer<typeof siteSettingSchema>;
