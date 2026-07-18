import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";

import { connectDB } from "@/server/db/mongoose";
import { Cart } from "@/server/models";
import { getProductBySlug } from "@/server/services/catalog";
import { gstComponent } from "@/lib/money";

const CART_COOKIE = "stag_cart";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type CartLine = {
  productSlug: string;
  title: string;
  image: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
};

export type CartView = {
  items: CartLine[];
  count: number;
  subtotalCents: number;
  gstCents: number;
  totalCents: number;
};

export const EMPTY_CART: CartView = {
  items: [],
  count: 0,
  subtotalCents: 0,
  gstCents: 0,
  totalCents: 0,
};

/** Read-only: never creates a cart (safe to call while rendering). */
async function getCartId() {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

/** Write path: creates the cookie if missing. Only call from actions/routes. */
async function ensureCartId() {
  const store = await cookies();
  const existing = store.get(CART_COOKIE)?.value;
  if (existing) return existing;

  const id = crypto.randomUUID();
  store.set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return id;
}

function toView(
  items: { productSlug: string; title: string; image: string; unitPriceCents: number; quantity: number }[]
): CartView {
  const lines: CartLine[] = items.map((item) => ({
    ...item,
    lineTotalCents: item.unitPriceCents * item.quantity,
  }));

  const subtotalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);

  return {
    items: lines,
    count: lines.reduce((sum, l) => sum + l.quantity, 0),
    subtotalCents,
    // AU prices are GST-inclusive, so GST is a component of the total.
    gstCents: gstComponent(subtotalCents),
    totalCents: subtotalCents,
  };
}

export async function getCart(): Promise<CartView> {
  const cartId = await getCartId();
  if (!cartId) return EMPTY_CART;

  try {
    await connectDB();
    const cart = await Cart.findOne({ cartId }).lean();
    if (!cart) return EMPTY_CART;
    return toView(cart.items ?? []);
  } catch (error) {
    console.error("[cart] getCart failed:", error);
    return EMPTY_CART;
  }
}

/**
 * Adds an item. The unit price is looked up from the catalog on the SERVER —
 * never taken from the client, or a shopper could post their own price.
 */
export async function addToCart(productSlug: string, quantity = 1) {
  const qty = Math.max(1, Math.min(99, Math.floor(quantity)));

  const product = await getProductBySlug(productSlug);
  if (!product) throw new Error("Product not found");

  const cartId = await ensureCartId();
  await connectDB();

  const cart = await Cart.findOne({ cartId });

  if (!cart) {
    await Cart.create({
      cartId,
      items: [
        {
          productSlug: product.slug,
          title: product.title,
          image: product.image,
          unitPriceCents: product.priceCents,
          quantity: qty,
        },
      ],
    });
    return;
  }

  const line = cart.items.find((i) => i.productSlug === product.slug);
  if (line) {
    line.quantity = Math.min(99, line.quantity + qty);
  } else {
    cart.items.push({
      productSlug: product.slug,
      title: product.title,
      image: product.image,
      unitPriceCents: product.priceCents,
      quantity: qty,
    });
  }

  await cart.save();
}

/** Atomic — avoids a read-modify-write race if two tabs update at once. */
export async function updateQuantity(productSlug: string, quantity: number) {
  const cartId = await getCartId();
  if (!cartId) return;

  await connectDB();
  const qty = Math.floor(quantity);

  if (qty <= 0) {
    await Cart.updateOne({ cartId }, { $pull: { items: { productSlug } } });
    return;
  }

  await Cart.updateOne(
    { cartId, "items.productSlug": productSlug },
    { $set: { "items.$.quantity": Math.min(99, qty) } }
  );
}

export async function removeFromCart(productSlug: string) {
  await updateQuantity(productSlug, 0);
}

export async function clearCart() {
  const cartId = await getCartId();
  if (!cartId) return;

  await connectDB();
  await Cart.findOneAndUpdate({ cartId }, { items: [] });
}
