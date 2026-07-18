"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { connectDB } from "@/server/db/mongoose";
import { Product, Article, Project, Order, Review } from "@/server/models";
import { cancelOrder } from "@/server/services/orders";
import {
  productSchema,
  articleSchema,
  projectSchema,
  reviewSchema,
  orderStatusSchema,
} from "@/lib/validation";

async function requireStaff() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || (role !== "admin" && role !== "editor")) {
    throw new Error("Unauthorized");
  }
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string) => Number(fd.get(k) ?? 0);
/** Unchecked checkboxes are absent from FormData — never rely on zod defaults. */
const bool = (fd: FormData, k: string) => fd.get(k) === "on";

function back(path: string, params: Record<string, string>): never {
  redirect(`${path}?${new URLSearchParams(params)}`);
}

/** Money arrives as dollars in the admin, but is stored as integer cents. */
function dollarsToCents(value: string) {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

/** One item per line; blank lines dropped. */
const lines = (fd: FormData, k: string) =>
  String(fd.get(k) ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

/* ================================ Products ================================ */

const PRODUCTS = "/admin/products";

function productFields(fd: FormData) {
  return {
    slug: str(fd, "slug"),
    title: str(fd, "title"),
    price: str(fd, "price"),
    priceCents: dollarsToCents(str(fd, "priceDollars")),
    image: str(fd, "image"),
    description: str(fd, "description"),
    category: str(fd, "category"),
    subCategory: str(fd, "subCategory"),
    homeRow: str(fd, "homeRow"),
    trackStock: bool(fd, "trackStock"),
    stock: num(fd, "stock"),
    order: num(fd, "order"),
    active: bool(fd, "active"),

    // Detail-page extras (textarea line formats).
    sku: str(fd, "sku"),
    images: lines(fd, "images"),
    included: lines(fd, "included"),
    // "label | value" per line
    specs: lines(fd, "specs").map((line) => {
      const [label = "", value = ""] = line.split("|").map((p) => p.trim());
      return { label, value };
    }),
    // "GroupName | value1, value2, value3" per line
    options: lines(fd, "options").map((line) => {
      const [name = "", values = ""] = line.split("|").map((p) => p.trim());
      return {
        name,
        values: values.split(",").map((v) => v.trim()).filter(Boolean),
      };
    }),
  };
}

export async function createProduct(formData: FormData) {
  await requireStaff();
  const parsed = productSchema.safeParse(productFields(formData));
  if (!parsed.success) back(PRODUCTS, { error: parsed.error.issues[0].message });

  await connectDB();
  try {
    await Product.create(parsed.data);
  } catch {
    back(PRODUCTS, { error: "That slug is already taken." });
  }

  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath(PRODUCTS);
  back(PRODUCTS, { ok: "Product added" });
}

export async function updateProduct(formData: FormData) {
  await requireStaff();
  const id = str(formData, "id");
  const parsed = productSchema.safeParse(productFields(formData));
  if (!parsed.success) back(PRODUCTS, { error: parsed.error.issues[0].message });

  await connectDB();
  await Product.findByIdAndUpdate(id, parsed.data);

  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath(PRODUCTS);
  back(PRODUCTS, { ok: "Product updated" });
}

export async function deleteProduct(formData: FormData) {
  await requireStaff();
  await connectDB();
  await Product.findByIdAndDelete(str(formData, "id"));

  revalidatePath("/shop");
  revalidatePath(PRODUCTS);
  back(PRODUCTS, { ok: "Product deleted" });
}

/* ================================ Articles ================================ */

const ARTICLES = "/admin/articles";

function articleFields(fd: FormData) {
  return {
    slug: str(fd, "slug"),
    title: str(fd, "title"),
    excerpt: str(fd, "excerpt"),
    body: str(fd, "body"),
    image: str(fd, "image"),
    category: str(fd, "category") || "Instructions",
    readTime: str(fd, "readTime") || "5 min read",
    active: bool(fd, "active"),
  };
}

export async function createArticle(formData: FormData) {
  await requireStaff();
  const parsed = articleSchema.safeParse(articleFields(formData));
  if (!parsed.success) back(ARTICLES, { error: parsed.error.issues[0].message });

  await connectDB();
  try {
    await Article.create(parsed.data);
  } catch {
    back(ARTICLES, { error: "That slug is already taken." });
  }

  revalidatePath("/articles");
  revalidatePath("/");
  revalidatePath(ARTICLES);
  back(ARTICLES, { ok: "Article published" });
}

export async function updateArticle(formData: FormData) {
  await requireStaff();
  const id = str(formData, "id");
  const parsed = articleSchema.safeParse(articleFields(formData));
  if (!parsed.success) back(ARTICLES, { error: parsed.error.issues[0].message });

  await connectDB();
  await Article.findByIdAndUpdate(id, parsed.data);

  revalidatePath("/articles");
  revalidatePath("/");
  revalidatePath(ARTICLES);
  back(ARTICLES, { ok: "Article updated" });
}

export async function deleteArticle(formData: FormData) {
  await requireStaff();
  await connectDB();
  await Article.findByIdAndDelete(str(formData, "id"));

  revalidatePath("/articles");
  revalidatePath(ARTICLES);
  back(ARTICLES, { ok: "Article deleted" });
}

/* ================================ Projects ================================ */

const PROJECTS = "/admin/projects";

function projectFields(fd: FormData) {
  return {
    title: str(fd, "title"),
    image: str(fd, "image"),
    category: str(fd, "category"),
    suburb: str(fd, "suburb"),
    featured: bool(fd, "featured"),
    order: num(fd, "order"),
    active: bool(fd, "active"),
  };
}

export async function createProject(formData: FormData) {
  await requireStaff();
  const parsed = projectSchema.safeParse(projectFields(formData));
  if (!parsed.success) back(PROJECTS, { error: parsed.error.issues[0].message });

  await connectDB();
  await Project.create(parsed.data);

  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath(PROJECTS);
  back(PROJECTS, { ok: "Project added" });
}

export async function updateProject(formData: FormData) {
  await requireStaff();
  const id = str(formData, "id");
  const parsed = projectSchema.safeParse(projectFields(formData));
  if (!parsed.success) back(PROJECTS, { error: parsed.error.issues[0].message });

  await connectDB();
  await Project.findByIdAndUpdate(id, parsed.data);

  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath(PROJECTS);
  back(PROJECTS, { ok: "Project updated" });
}

export async function deleteProject(formData: FormData) {
  await requireStaff();
  await connectDB();
  await Project.findByIdAndDelete(str(formData, "id"));

  revalidatePath("/gallery");
  revalidatePath(PROJECTS);
  back(PROJECTS, { ok: "Project deleted" });
}

/* ================================= Reviews ================================ */

const REVIEWS = "/admin/reviews";

function reviewFields(fd: FormData) {
  return {
    name: str(fd, "name"),
    role: str(fd, "role") || "Home Owner",
    quote: str(fd, "quote"),
    rating: str(fd, "rating") || "5.0",
    image: str(fd, "image"),
    avatar: str(fd, "avatar"),
    order: num(fd, "order"),
    active: bool(fd, "active"),
  };
}

export async function createReview(formData: FormData) {
  await requireStaff();
  const parsed = reviewSchema.safeParse(reviewFields(formData));
  if (!parsed.success) back(REVIEWS, { error: parsed.error.issues[0].message });

  await connectDB();
  await Review.create(parsed.data);
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath(REVIEWS);
  back(REVIEWS, { ok: "Review added" });
}

export async function updateReview(formData: FormData) {
  await requireStaff();
  const id = str(formData, "id");
  const parsed = reviewSchema.safeParse(reviewFields(formData));
  if (!parsed.success) back(REVIEWS, { error: parsed.error.issues[0].message });

  await connectDB();
  await Review.findByIdAndUpdate(id, parsed.data);
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath(REVIEWS);
  back(REVIEWS, { ok: "Review updated" });
}

export async function deleteReview(formData: FormData) {
  await requireStaff();
  await connectDB();
  await Review.findByIdAndDelete(str(formData, "id"));
  revalidatePath("/");
  revalidatePath(REVIEWS);
  back(REVIEWS, { ok: "Review deleted" });
}

/* ================================= Orders ================================= */

const ORDERS = "/admin/orders";

export async function updateOrderStatus(formData: FormData) {
  await requireStaff();
  const id = str(formData, "id");
  const parsed = orderStatusSchema.safeParse(str(formData, "status"));
  if (!parsed.success) back(ORDERS, { error: "Invalid status" });

  // Cancelling puts the stock back — handled in a transaction.
  if (parsed.data === "cancelled") {
    await cancelOrder(id);
    revalidatePath(ORDERS);
    back(ORDERS, { ok: "Order cancelled, stock restored" });
  }

  await connectDB();
  await Order.findByIdAndUpdate(id, { status: parsed.data });

  revalidatePath(ORDERS);
  back(ORDERS, { ok: "Order updated" });
}

/** Manual payment (bank transfer / cash) — Stripe payments flip via webhook. */
export async function markOrderPaidManually(formData: FormData) {
  await requireStaff();
  await connectDB();
  await Order.findByIdAndUpdate(str(formData, "id"), {
    paymentStatus: "paid",
    status: "paid",
  });

  revalidatePath(ORDERS);
  back(ORDERS, { ok: "Marked as paid" });
}
