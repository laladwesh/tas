import { connectDB } from "@/server/db/mongoose";
import { Service, Product, Article, Project, Faq, Review } from "@/server/models";

import {
  servicesCatalog,
  productsCatalog,
  articlesCatalog,
  projectsCatalog,
  servicesFaqs,
  reviewsCatalog,
  type ServiceItem,
  type ServiceRange,
  type ProductItem,
  type ArticleItem,
  type ProjectItem,
  type ReviewItem,
} from "@/data/catalog";

/* ===========================================================================
   Read layer for the public site.

   Each reader tries MongoDB first and falls back to the static catalog when
   the DB is empty or unreachable. Pages only ever see the DTO, so switching
   to the real backend is a seeding job — no component changes.
   =========================================================================== */

export type { ServiceItem, ServiceRange, ProductItem, ArticleItem, ProjectItem, ReviewItem };

export type FaqItem = {
  question: string;
  answer: string;
  defaultOpen: boolean;
};

/* -------------------------------- Services ------------------------------- */

export async function getServiceCatalog(): Promise<ServiceItem[]> {
  try {
    await connectDB();
    const docs = await Service.find({ active: true, slug: { $ne: "" } })
      .sort({ order: 1 })
      .lean();
    if (!docs.length) return servicesCatalog;

    return docs.map((d) => ({
      slug: d.slug,
      title: d.title,
      priceFrom: d.priceFrom || d.price || "",
      image: d.image,
      excerpt: d.excerpt ?? "",
      ranges: (d.ranges ?? []).map((r) => ({
        name: r.name ?? "",
        priceFrom: r.priceFrom ?? "",
        image: r.image ?? "",
      })),
    }));
  } catch (error) {
    console.error("[catalog] getServiceCatalog fell back to static:", error);
    return servicesCatalog;
  }
}

export async function getServiceBySlug(slug: string): Promise<ServiceItem | null> {
  const all = await getServiceCatalog();
  return all.find((s) => s.slug === slug) ?? null;
}

/* Full record for the rich service detail page. Every rich field is optional —
   the page hides any section whose array is empty. */
export type ServiceStat = { value: string; label: string };
export type ServiceSwatch = { name: string; hex: string };
export type ServiceHeight = { label: string; priceLabel: string; popular: boolean };
export type ServiceStep = { title: string; body: string };
export type ServiceFaq = { question: string; answer: string };

export type ServiceDetail = ServiceItem & {
  body: string;
  intro: string;
  priceValue: string;
  priceUnit: string;
  badges: string[];
  stats: ServiceStat[];
  coloursNote: string;
  colours: ServiceSwatch[];
  heights: ServiceHeight[];
  includes: string[];
  addons: string[];
  complianceTitle: string;
  compliance: string[];
  process: ServiceStep[];
  projectCategory: string;
  productCategory: string;
  faqs: ServiceFaq[];
  areas: string[];
};

export async function getServiceDetail(slug: string): Promise<ServiceDetail | null> {
  try {
    await connectDB();
    const d = await Service.findOne({ slug, active: true }).lean();
    if (!d) return null;

    return {
      slug: d.slug,
      title: d.title,
      priceFrom: d.priceFrom || d.price || "",
      image: d.image,
      excerpt: d.excerpt ?? "",
      ranges: (d.ranges ?? []).map((r) => ({
        name: r.name ?? "",
        priceFrom: r.priceFrom ?? "",
        image: r.image ?? "",
      })),
      body: d.body ?? "",
      intro: d.intro ?? "",
      priceValue: d.priceValue ?? "",
      priceUnit: d.priceUnit ?? "",
      badges: d.badges ?? [],
      stats: (d.stats ?? []).map((s) => ({ value: s.value ?? "", label: s.label ?? "" })),
      coloursNote: d.coloursNote ?? "",
      colours: (d.colours ?? []).map((c) => ({ name: c.name ?? "", hex: c.hex ?? "#cccccc" })),
      heights: (d.heights ?? []).map((h) => ({
        label: h.label ?? "",
        priceLabel: h.priceLabel ?? "",
        popular: Boolean(h.popular),
      })),
      includes: d.includes ?? [],
      addons: d.addons ?? [],
      complianceTitle: d.complianceTitle ?? "",
      compliance: d.compliance ?? [],
      process: (d.process ?? []).map((p) => ({ title: p.title ?? "", body: p.body ?? "" })),
      projectCategory: d.projectCategory ?? "",
      productCategory: d.productCategory ?? "",
      faqs: (d.faqs ?? []).map((f) => ({ question: f.question ?? "", answer: f.answer ?? "" })),
      areas: d.areas ?? [],
    };
  } catch (error) {
    console.error("[catalog] getServiceDetail failed:", error);
    return null;
  }
}

/* --------------------------------- Shop ---------------------------------- */

export async function getProducts(homeRow?: string): Promise<ProductItem[]> {
  try {
    await connectDB();
    const query: Record<string, unknown> = { active: true };
    if (homeRow) query.homeRow = homeRow;

    const docs = await Product.find(query).sort({ order: 1 }).lean();
    if (!docs.length) {
      return homeRow
        ? productsCatalog.filter((p) => p.homeRow === homeRow)
        : productsCatalog;
    }

    return docs.map((d) => ({
      slug: d.slug,
      title: d.title,
      price: d.price ?? "",
      priceCents: d.priceCents ?? 0,
      image: d.image,
      category: d.category ?? "",
      subCategory: d.subCategory ?? "",
      homeRow: (d.homeRow as ProductItem["homeRow"]) ?? "",
    }));
  } catch (error) {
    console.error("[catalog] getProducts fell back to static:", error);
    return homeRow
      ? productsCatalog.filter((p) => p.homeRow === homeRow)
      : productsCatalog;
  }
}

export async function getProductBySlug(slug: string): Promise<ProductItem | null> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

/* Full record for the product detail page. */
export type ProductOption = { name: string; values: string[] };
export type ProductSpec = { label: string; value: string };

export type ProductDetail = ProductItem & {
  description: string;
  images: string[];
  sku: string;
  stock: number;
  trackStock: boolean;
  options: ProductOption[];
  included: string[];
  specs: ProductSpec[];
};

export async function getProductDetail(slug: string): Promise<ProductDetail | null> {
  try {
    await connectDB();
    const d = await Product.findOne({ slug, active: true }).lean();
    if (!d) return null;

    return {
      slug: d.slug,
      title: d.title,
      price: d.price ?? "",
      priceCents: d.priceCents ?? 0,
      image: d.image,
      category: d.category ?? "",
      subCategory: d.subCategory ?? "",
      homeRow: (d.homeRow as ProductItem["homeRow"]) ?? "",
      description: d.description ?? "",
      images: (d.images ?? []).filter(Boolean),
      sku: d.sku ?? "",
      stock: d.stock ?? 0,
      trackStock: Boolean(d.trackStock),
      options: (d.options ?? []).map((o) => ({
        name: o.name ?? "",
        values: (o.values ?? []).filter(Boolean),
      })),
      included: d.included ?? [],
      specs: (d.specs ?? []).map((s) => ({ label: s.label ?? "", value: s.value ?? "" })),
    };
  } catch (error) {
    console.error("[catalog] getProductDetail failed:", error);
    return null;
  }
}

/* -------------------------------- Articles ------------------------------- */

export async function getArticles(): Promise<ArticleItem[]> {
  try {
    await connectDB();
    const docs = await Article.find({ active: true })
      .sort({ publishedAt: -1 })
      .lean();
    if (!docs.length) return articlesCatalog;

    return docs.map((d) => ({
      slug: d.slug,
      title: d.title,
      excerpt: d.excerpt ?? "",
      body: d.body ?? "",
      image: d.image,
      category: d.category ?? "Instructions",
      readTime: d.readTime ?? "5 min read",
      publishedAt: (d.publishedAt as Date)?.toISOString().slice(0, 10) ?? "",
    }));
  } catch (error) {
    console.error("[catalog] getArticles fell back to static:", error);
    return articlesCatalog;
  }
}

export async function getArticleBySlug(slug: string): Promise<ArticleItem | null> {
  const all = await getArticles();
  return all.find((a) => a.slug === slug) ?? null;
}

/* -------------------------------- Projects ------------------------------- */

export async function getProjects(featuredOnly = false): Promise<ProjectItem[]> {
  try {
    await connectDB();
    const query: Record<string, unknown> = { active: true };
    if (featuredOnly) query.featured = true;

    const docs = await Project.find(query).sort({ order: 1 }).lean();
    if (!docs.length) {
      return featuredOnly
        ? projectsCatalog.filter((p) => p.featured)
        : projectsCatalog;
    }

    return docs.map((d) => ({
      title: d.title ?? "",
      image: d.image,
      category: d.category ?? "",
      suburb: d.suburb ?? "",
      featured: Boolean(d.featured),
    }));
  } catch (error) {
    console.error("[catalog] getProjects fell back to static:", error);
    return featuredOnly
      ? projectsCatalog.filter((p) => p.featured)
      : projectsCatalog;
  }
}

/* ---------------------------- Page-scoped FAQs --------------------------- */

export async function getFaqsForPage(page: string): Promise<FaqItem[]> {
  const fallback: FaqItem[] =
    page === "services"
      ? servicesFaqs.map((f) => ({ ...f, defaultOpen: Boolean(f.defaultOpen) }))
      : [];

  try {
    await connectDB();
    const docs = await Faq.find({ active: true, page }).sort({ order: 1 }).lean();
    if (!docs.length) return fallback;

    return docs.map((d) => ({
      question: d.question,
      answer: d.answer,
      defaultOpen: Boolean(d.defaultOpen),
    }));
  } catch (error) {
    console.error("[catalog] getFaqsForPage fell back to static:", error);
    return fallback;
  }
}

/* -------------------------------- Reviews -------------------------------- */

export async function getReviews(): Promise<ReviewItem[]> {
  try {
    await connectDB();
    const docs = await Review.find({ active: true }).sort({ order: 1 }).lean();
    if (!docs.length) return reviewsCatalog;

    return docs.map((d) => ({
      name: d.name,
      role: d.role ?? "Home Owner",
      quote: d.quote,
      rating: d.rating ?? "5.0",
      image: d.image ?? "",
      avatar: d.avatar ?? "",
    }));
  } catch (error) {
    console.error("[catalog] getReviews fell back to static:", error);
    return reviewsCatalog;
  }
}
