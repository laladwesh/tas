import { connectDB } from "@/server/db/mongoose";
import { Service, Faq, HeroImage, SiteSetting } from "@/server/models";

import { services as staticServices } from "@/data/services";
import { faqs as staticFaqs } from "@/data/faqs";
import { heroImages as staticHeroImages } from "@/data/heroImages";

/* ===========================================================================
   Content readers used by the PUBLIC site.

   Every reader falls back to the static files in /data if Mongo is unreachable
   or the collection is empty. This means the live site keeps rendering even if
   the database is down or hasn't been seeded yet.
   =========================================================================== */

export type ServiceDTO = { title: string; price: string; image: string };
export type FaqDTO = { question: string; answer: string; defaultOpen: boolean };
export type HeroImageDTO = { src: string; alt: string };

export type SiteSettings = {
  phoneDisplay: string;
  phoneHref: string;
  email: string;
  heroBadge: string;
  heroHeadingLine1: string;
  heroHeadingLine2: string;
  heroSubcopy: string;
  heroCtaLabel: string;
  googleRating: string;
  footerText: string;
  seoTitle: string;
  seoDescription: string;
  addressStreet: string;
  addressLocality: string;
  addressRegion: string;
  addressPostalCode: string;
  addressCountry: string;
  geoLat: number;
  geoLng: number;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  phoneDisplay: "0431703770",
  phoneHref: "tel:0431703770",
  email: "quote@stagfencing.com.au",
  heroBadge: "Join over 1,000 happy customers",
  heroHeadingLine1: "Fencing Made for",
  heroHeadingLine2: "Perth Sun, Sand & Salt",
  heroSubcopy:
    "We've been fencing Perth suburbs for years: Colorbond, aluminium slat, pool fencing, gates and retaining walls. We know what holds up in local conditions and what doesn't.",
  heroCtaLabel: "Get Your Free Quote Today",
  googleRating: "5.0",
  footerText:
    "At Stag Fencing, one of the trusted fencing contractor in perth, we specialize in providing high-quality fencing solutions for homes. With a commitment to excellence and customer satisfaction, our experienced team ensures every project is completed with precision and care.",
  seoTitle: "Stag Fencing Perth | Colorbond, Pool & Slat Fencing Experts",
  seoDescription:
    "Perth's trusted fencing contractor — Colorbond, aluminium slat, pool fencing, gates, automation, retaining walls and asbestos fence removal. Get a free quote.",
  addressStreet: "",
  addressLocality: "Perth",
  addressRegion: "WA",
  addressPostalCode: "6000",
  addressCountry: "AU",
  geoLat: -31.9523,
  geoLng: 115.8613,
};

export async function getServices(): Promise<ServiceDTO[]> {
  try {
    await connectDB();
    const docs = await Service.find({ active: true }).sort({ order: 1 }).lean();
    if (!docs.length) return staticServices;
    return docs.map((d) => ({
      title: d.title,
      price: d.price ?? "",
      image: d.image,
    }));
  } catch (error) {
    console.error("[content] getServices fell back to static data:", error);
    return staticServices;
  }
}

export async function getFaqs(): Promise<FaqDTO[]> {
  try {
    await connectDB();
    const docs = await Faq.find({ active: true }).sort({ order: 1 }).lean();
    if (!docs.length) {
      return staticFaqs.map((f) => ({ ...f, defaultOpen: Boolean(f.defaultOpen) }));
    }
    return docs.map((d) => ({
      question: d.question,
      answer: d.answer,
      defaultOpen: Boolean(d.defaultOpen),
    }));
  } catch (error) {
    console.error("[content] getFaqs fell back to static data:", error);
    return staticFaqs.map((f) => ({ ...f, defaultOpen: Boolean(f.defaultOpen) }));
  }
}

export async function getHeroImages(): Promise<HeroImageDTO[]> {
  try {
    await connectDB();
    const docs = await HeroImage.find({ active: true }).sort({ order: 1 }).lean();
    if (!docs.length) return staticHeroImages;
    return docs.map((d) => ({ src: d.src, alt: d.alt ?? "" }));
  } catch (error) {
    console.error("[content] getHeroImages fell back to static data:", error);
    return staticHeroImages;
  }
}

export async function getSettings(): Promise<SiteSettings> {
  try {
    await connectDB();
    const doc = await SiteSetting.findOne({ key: "site" }).lean();
    if (!doc) return DEFAULT_SETTINGS;
    // Merge so any newly-added field falls back to its default.
    const { _id, key, createdAt, updatedAt, ...rest } = doc as Record<string, unknown>;
    void _id;
    void key;
    void createdAt;
    void updatedAt;
    return { ...DEFAULT_SETTINGS, ...(rest as Partial<SiteSettings>) };
  } catch (error) {
    console.error("[content] getSettings fell back to defaults:", error);
    return DEFAULT_SETTINGS;
  }
}
