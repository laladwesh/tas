"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  addToCart,
  updateQuantity,
  removeFromCart,
} from "@/server/services/cart";

const slugSchema = z.string().trim().min(1).max(120);
const qtySchema = z.coerce.number().int().min(0).max(99);

/** Refresh anything that shows cart state (badge, cart page, checkout). */
function refresh() {
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/shop");
}

export async function addToCartAction(formData: FormData) {
  const slug = slugSchema.safeParse(formData.get("slug"));
  const qty = qtySchema.safeParse(formData.get("quantity") ?? 1);
  if (!slug.success) return;

  await addToCart(slug.data, Math.max(1, qty.success ? qty.data : 1));
  refresh();
}

export async function updateQuantityAction(formData: FormData) {
  const slug = slugSchema.safeParse(formData.get("slug"));
  const qty = qtySchema.safeParse(formData.get("quantity"));
  if (!slug.success || !qty.success) return;

  await updateQuantity(slug.data, qty.data);
  refresh();
}

export async function removeFromCartAction(formData: FormData) {
  const slug = slugSchema.safeParse(formData.get("slug"));
  if (!slug.success) return;

  await removeFromCart(slug.data);
  refresh();
}
