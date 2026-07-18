"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { connectDB } from "@/server/db/mongoose";
import { Service, Faq, HeroImage, SiteSetting, Lead } from "@/server/models";
import {
  serviceSchema,
  faqSchema,
  heroImageSchema,
  siteSettingSchema,
  leadStatusSchema,
} from "@/lib/validation";

/** Defence in depth: middleware already gates /admin, but actions are
 *  independently callable, so re-check the role here. */
async function requireStaff() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || (role !== "admin" && role !== "editor")) {
    throw new Error("Unauthorized");
  }
}

function str(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}
function num(fd: FormData, key: string) {
  return Number(fd.get(key) ?? 0);
}
/** Unchecked checkboxes are absent from FormData — never rely on zod defaults. */
function bool(fd: FormData, key: string) {
  return fd.get(key) === "on";
}

/** Refresh the public site + the admin list after a write. */
function refresh(adminPath: string) {
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath(adminPath);
}

/** Returns `never` — redirect() throws, which lets TS narrow safeParse results. */
function back(path: string, params: Record<string, string>): never {
  const qs = new URLSearchParams(params).toString();
  redirect(`${path}?${qs}`);
}

/* ================================ Services ================================ */

const SERVICES = "/admin/services";

/** One item per line; blank lines dropped. */
function lines(fd: FormData, key: string): string[] {
  return String(fd.get(key) ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** "a | b | c" per line -> array of {..fields} in the given order. */
function rows(fd: FormData, key: string, fields: string[]) {
  return lines(fd, key).map((line) => {
    const parts = line.split("|").map((p) => p.trim());
    const obj: Record<string, string> = {};
    fields.forEach((f, i) => (obj[f] = parts[i] ?? ""));
    return obj;
  });
}

/** Every field the service form submits, parsed into the schema shape. */
function serviceFields(fd: FormData) {
  return {
    slug: str(fd, "slug"),
    title: str(fd, "title"),
    price: str(fd, "price"),
    priceFrom: str(fd, "priceFrom"),
    excerpt: str(fd, "excerpt"),
    image: str(fd, "image"),
    order: num(fd, "order"),
    active: bool(fd, "active"),

    intro: str(fd, "intro"),
    priceValue: str(fd, "priceValue"),
    priceUnit: str(fd, "priceUnit"),
    badges: lines(fd, "badges"),
    stats: rows(fd, "stats", ["value", "label"]),
    coloursNote: str(fd, "coloursNote"),
    colours: rows(fd, "colours", ["name", "hex"]).map((c) => ({
      name: c.name,
      hex: c.hex || "#cccccc",
    })),
    heights: rows(fd, "heights", ["label", "priceLabel", "popular"]).map((h) => ({
      label: h.label,
      priceLabel: h.priceLabel,
      popular: /^(y|yes|true|1|popular)$/i.test(h.popular),
    })),
    includes: lines(fd, "includes"),
    addons: lines(fd, "addons"),
    complianceTitle: str(fd, "complianceTitle"),
    compliance: lines(fd, "compliance"),
    process: rows(fd, "process", ["title", "body"]),
    projectCategory: str(fd, "projectCategory"),
    productCategory: str(fd, "productCategory"),
    faqs: rows(fd, "faqs", ["question", "answer"]),
    areas: lines(fd, "areas"),
    ranges: rows(fd, "ranges", ["name", "priceFrom", "image"]),
  };
}

export async function createService(formData: FormData) {
  await requireStaff();
  const parsed = serviceSchema.safeParse(serviceFields(formData));
  if (!parsed.success) {
    back(SERVICES, { error: parsed.error.issues[0].message });
  }

  await connectDB();
  await Service.create(parsed.data);
  refresh(SERVICES);
  back(SERVICES, { ok: "Service added" });
}

export async function updateService(formData: FormData) {
  await requireStaff();
  const id = str(formData, "id");
  const parsed = serviceSchema.safeParse(serviceFields(formData));
  if (!parsed.success) {
    back(SERVICES, { error: parsed.error.issues[0].message });
  }

  await connectDB();
  await Service.findByIdAndUpdate(id, parsed.data);
  refresh(SERVICES);
  back(SERVICES, { ok: "Service updated" });
}

export async function deleteService(formData: FormData) {
  await requireStaff();
  await connectDB();
  await Service.findByIdAndDelete(str(formData, "id"));
  refresh(SERVICES);
  back(SERVICES, { ok: "Service deleted" });
}

/* ================================== FAQs ================================== */

const FAQS = "/admin/faqs";

export async function createFaq(formData: FormData) {
  await requireStaff();
  const parsed = faqSchema.safeParse({
    question: str(formData, "question"),
    answer: str(formData, "answer"),
    page: str(formData, "page") || "home",
    defaultOpen: bool(formData, "defaultOpen"),
    order: num(formData, "order"),
    active: bool(formData, "active"),
  });
  if (!parsed.success) back(FAQS, { error: parsed.error.issues[0].message });

  await connectDB();
  await Faq.create(parsed.data);
  refresh(FAQS);
  back(FAQS, { ok: "FAQ added" });
}

export async function updateFaq(formData: FormData) {
  await requireStaff();
  const id = str(formData, "id");
  const parsed = faqSchema.safeParse({
    question: str(formData, "question"),
    answer: str(formData, "answer"),
    page: str(formData, "page") || "home",
    defaultOpen: bool(formData, "defaultOpen"),
    order: num(formData, "order"),
    active: bool(formData, "active"),
  });
  if (!parsed.success) back(FAQS, { error: parsed.error.issues[0].message });

  await connectDB();
  await Faq.findByIdAndUpdate(id, parsed.data);
  refresh(FAQS);
  back(FAQS, { ok: "FAQ updated" });
}

export async function deleteFaq(formData: FormData) {
  await requireStaff();
  await connectDB();
  await Faq.findByIdAndDelete(str(formData, "id"));
  refresh(FAQS);
  back(FAQS, { ok: "FAQ deleted" });
}

/* =============================== Hero images ============================== */

const HERO = "/admin/hero";

export async function createHeroImage(formData: FormData) {
  await requireStaff();
  const parsed = heroImageSchema.safeParse({
    src: str(formData, "src"),
    alt: str(formData, "alt"),
    order: num(formData, "order"),
    active: bool(formData, "active"),
  });
  if (!parsed.success) back(HERO, { error: parsed.error.issues[0].message });

  await connectDB();
  await HeroImage.create(parsed.data);
  refresh(HERO);
  back(HERO, { ok: "Slide added" });
}

export async function updateHeroImage(formData: FormData) {
  await requireStaff();
  const id = str(formData, "id");
  const parsed = heroImageSchema.safeParse({
    src: str(formData, "src"),
    alt: str(formData, "alt"),
    order: num(formData, "order"),
    active: bool(formData, "active"),
  });
  if (!parsed.success) back(HERO, { error: parsed.error.issues[0].message });

  await connectDB();
  await HeroImage.findByIdAndUpdate(id, parsed.data);
  refresh(HERO);
  back(HERO, { ok: "Slide updated" });
}

export async function deleteHeroImage(formData: FormData) {
  await requireStaff();
  await connectDB();
  await HeroImage.findByIdAndDelete(str(formData, "id"));
  refresh(HERO);
  back(HERO, { ok: "Slide deleted" });
}

/* =============================== Site settings =========================== */

const SETTINGS = "/admin/settings";

export async function updateSettings(formData: FormData) {
  await requireStaff();
  const parsed = siteSettingSchema.safeParse({
    phoneDisplay: str(formData, "phoneDisplay"),
    phoneHref: str(formData, "phoneHref"),
    email: str(formData, "email"),
    heroBadge: str(formData, "heroBadge"),
    heroHeadingLine1: str(formData, "heroHeadingLine1"),
    heroHeadingLine2: str(formData, "heroHeadingLine2"),
    heroSubcopy: str(formData, "heroSubcopy"),
    heroCtaLabel: str(formData, "heroCtaLabel"),
    googleRating: str(formData, "googleRating"),
    footerText: str(formData, "footerText"),
    seoTitle: str(formData, "seoTitle"),
    seoDescription: str(formData, "seoDescription"),
    addressStreet: str(formData, "addressStreet"),
    addressLocality: str(formData, "addressLocality"),
    addressRegion: str(formData, "addressRegion"),
    addressPostalCode: str(formData, "addressPostalCode"),
    addressCountry: str(formData, "addressCountry"),
    geoLat: num(formData, "geoLat"),
    geoLng: num(formData, "geoLng"),
  });
  if (!parsed.success) back(SETTINGS, { error: parsed.error.issues[0].message });

  await connectDB();
  await SiteSetting.findOneAndUpdate({ key: "site" }, parsed.data, {
    upsert: true,
  });
  refresh(SETTINGS);
  back(SETTINGS, { ok: "Settings saved" });
}

/* =================================== Leads =============================== */

const LEADS = "/admin/leads";

export async function updateLeadStatus(formData: FormData) {
  await requireStaff();
  const id = str(formData, "id");
  const parsed = leadStatusSchema.safeParse(str(formData, "status"));
  if (!parsed.success) back(LEADS, { error: "Invalid status" });

  await connectDB();
  await Lead.findByIdAndUpdate(id, { status: parsed.data });
  revalidatePath(LEADS);
  back(LEADS, { ok: "Lead updated" });
}

export async function deleteLead(formData: FormData) {
  await requireStaff();
  await connectDB();
  await Lead.findByIdAndDelete(str(formData, "id"));
  revalidatePath(LEADS);
  back(LEADS, { ok: "Lead deleted" });
}
