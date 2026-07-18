import "server-only";

import crypto from "crypto";

import { connectDB } from "@/server/db/mongoose";
import { withTransaction } from "@/server/db/transaction";
import { Order } from "@/server/models";
import { getCart, clearCart } from "@/server/services/cart";
import { sendMail } from "@/server/services/mailer";
import { stripe, STRIPE_ENABLED, siteUrl } from "@/server/services/stripe";
import {
  reserveStock,
  releaseStock,
  checkAvailability,
} from "@/server/services/stock";
import { formatCents, gstComponent } from "@/lib/money";
import type { CheckoutInput } from "@/lib/validation";

const DELIVERY_FEE_CENTS = 8900; // flat Perth metro delivery
const FREE_DELIVERY_OVER_CENTS = 50000;

export function deliveryFeeCents(subtotalCents: number, fulfilment: string) {
  if (fulfilment === "pickup") return 0;
  return subtotalCents >= FREE_DELIVERY_OVER_CENTS ? 0 : DELIVERY_FEE_CENTS;
}

function orderNumber() {
  return `SF-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; checkoutUrl?: string }
  | { ok: false; message: string };

/**
 * Creates the order from the SERVER-side cart. Prices, totals and GST are all
 * recomputed here — nothing about money is taken from the submitted form.
 *
 * With Stripe configured we return a Checkout URL and leave the order
 * `pending/unpaid`. The cart is NOT cleared and no confirmation is sent until
 * the webhook confirms payment — otherwise an abandoned checkout would wipe
 * the shopper's cart and email them about an order they never paid for.
 */
export async function placeOrder(input: CheckoutInput): Promise<PlaceOrderResult> {
  const cart = await getCart();
  if (cart.items.length === 0) {
    return { ok: false, message: "Your cart is empty." };
  }

  // Friendly pre-check BEFORE we take any money.
  const problems = await checkAvailability(
    cart.items.map((l) => ({
      productSlug: l.productSlug,
      title: l.title,
      quantity: l.quantity,
    }))
  );
  if (problems.length > 0) {
    return {
      ok: false,
      message: `Not enough stock: ${problems.join("; ")}. Please adjust your cart.`,
    };
  }

  const subtotalCents = cart.subtotalCents;
  const shippingCents = deliveryFeeCents(subtotalCents, input.fulfilment);
  const totalCents = subtotalCents + shippingCents;
  const number = orderNumber();

  try {
    await connectDB();

    await Order.create({
      orderNumber: number,
      email: input.email,
      name: input.name,
      phone: input.phone,
      address: input.address,
      suburb: input.suburb,
      postcode: input.postcode,
      notes: input.notes,
      fulfilment: input.fulfilment,
      // Snapshot the lines so later product edits can't rewrite history.
      items: cart.items.map((line) => ({
        productSlug: line.productSlug,
        title: line.title,
        image: line.image,
        unitPriceCents: line.unitPriceCents,
        quantity: line.quantity,
      })),
      subtotalCents,
      shippingCents,
      gstCents: gstComponent(totalCents),
      totalCents,
      status: "pending",
      paymentStatus: "unpaid",
    });
  } catch (error) {
    console.error("[orders] failed to save order:", error);
    return {
      ok: false,
      message: "We couldn't save your order. Please try again or call us.",
    };
  }

  /* ------------------------------ Stripe path ---------------------------- */
  if (STRIPE_ENABLED) {
    try {
      const session = await stripe().checkout.sessions.create({
        mode: "payment",
        customer_email: input.email,
        // The webhook uses this to find the order. Never trust anything else.
        metadata: { orderNumber: number },
        line_items: [
          ...cart.items.map((line) => ({
            quantity: line.quantity,
            price_data: {
              currency: "aud",
              unit_amount: line.unitPriceCents, // integer cents
              product_data: { name: line.title },
            },
          })),
          ...(shippingCents > 0
            ? [
                {
                  quantity: 1,
                  price_data: {
                    currency: "aud",
                    unit_amount: shippingCents,
                    product_data: { name: "Delivery (Perth metro)" },
                  },
                },
              ]
            : []),
        ],
        success_url: `${siteUrl()}/checkout/success?order=${number}`,
        cancel_url: `${siteUrl()}/cart`,
      });

      await Order.findOneAndUpdate(
        { orderNumber: number },
        { stripeSessionId: session.id }
      );

      if (session.url) {
        return { ok: true, orderNumber: number, checkoutUrl: session.url };
      }
    } catch (error) {
      console.error("[orders] stripe session failed:", error);
      return {
        ok: false,
        message: "We couldn't start the payment. Please try again or call us.",
      };
    }
  }

  /* --------------------- No Stripe: confirm immediately -------------------- */
  // No money is taken here, so we can safely refuse if stock ran out in the
  // moments since the pre-check. Order + stock move together.
  try {
    const shortfalls = await withTransaction(async (session) => {
      const lines = cart.items.map((l) => ({
        productSlug: l.productSlug,
        title: l.title,
        quantity: l.quantity,
      }));

      const missing = await reserveStock(lines, session);
      if (missing.length > 0) {
        // Roll the whole thing back — nothing was paid.
        throw new OutOfStockError(missing);
      }
      return missing;
    });
    void shortfalls;
  } catch (error) {
    if (error instanceof OutOfStockError) {
      await Order.deleteOne({ orderNumber: number }).catch(() => {});
      return {
        ok: false,
        message: `Sorry — someone just took the last of: ${error.items.join("; ")}.`,
      };
    }
    console.error("[orders] stock reservation failed:", error);
  }

  await clearCart();
  await sendOrderEmails(number);

  return { ok: true, orderNumber: number };
}

class OutOfStockError extends Error {
  constructor(public items: string[]) {
    super("Out of stock");
  }
}

/**
 * Marks an order paid. Called from the Stripe webhook. Idempotent.
 *
 * Payment + stock decrement happen in ONE transaction, so a crash can't leave
 * a paid order with stock never decremented.
 *
 * If stock ran out while the shopper was on Stripe's page, we still mark it
 * paid — the money is already taken, and refusing it here would leave a
 * charged customer with no order. We flag the order for a human instead.
 */
export async function markOrderPaid(orderNumberValue: string, sessionId: string) {
  await connectDB();

  await withTransaction(async (session) => {
    const order = await Order.findOne({ orderNumber: orderNumberValue }).session(
      session ?? null
    );

    if (!order) {
      console.error("[orders] webhook for unknown order:", orderNumberValue);
      return;
    }

    // Stripe retries webhooks — don't double-process, double-decrement or double-email.
    if (order.paymentStatus === "paid") return;

    const shortfalls = await reserveStock(
      order.items.map((i) => ({
        productSlug: i.productSlug,
        title: i.title,
        quantity: i.quantity,
      })),
      session
    );

    order.paymentStatus = "paid";
    order.status = "paid";
    order.stripeSessionId = sessionId;

    if (shortfalls.length > 0) {
      order.stockIssue = true;
      order.stockNote = shortfalls.join("; ");
      console.error(
        `[orders] OVERSOLD on paid order ${orderNumberValue}:`,
        order.stockNote
      );
    }

    await order.save({ session });
  });

  await sendOrderEmails(orderNumberValue);
}

/** Cancelling a paid order puts the stock back. */
export async function cancelOrder(orderId: string) {
  await connectDB();

  await withTransaction(async (session) => {
    const order = await Order.findById(orderId).session(session ?? null);
    if (!order || order.status === "cancelled") return;

    // Only give stock back if we actually took it.
    if (order.paymentStatus === "paid") {
      await releaseStock(
        order.items.map((i) => ({
          productSlug: i.productSlug,
          title: i.title,
          quantity: i.quantity,
        })),
        session
      );
    }

    order.status = "cancelled";
    await order.save({ session });
  });
}

/** Notifies the business + customer. Never throws — email must not break an order. */
export async function sendOrderEmails(orderNumberValue: string) {
  try {
    await connectDB();
    const order = await Order.findOne({ orderNumber: orderNumberValue }).lean();
    if (!order) return;

    const lines = (order.items ?? [])
      .map(
        (l) =>
          `${l.quantity} x ${l.title} — ${formatCents(
            l.unitPriceCents * l.quantity
          )}`
      )
      .join("\n");

    const summary = [
      `Order ${order.orderNumber}`,
      "",
      lines,
      "",
      `Subtotal: ${formatCents(order.subtotalCents)}`,
      `Delivery: ${
        order.shippingCents === 0 ? "Free / pickup" : formatCents(order.shippingCents)
      }`,
      `Total: ${formatCents(order.totalCents)} (incl. GST)`,
      `Payment: ${order.paymentStatus}`,
      "",
      `Name: ${order.name}`,
      `Email: ${order.email}`,
      `Phone: ${order.phone}`,
      `Fulfilment: ${order.fulfilment}`,
      `Address: ${order.address} ${order.suburb} ${order.postcode}`,
      order.notes ? `Notes: ${order.notes}` : "",
    ].join("\n");

    await sendMail({
      to: process.env.QUOTE_TO || "STAGGMANAGEMENT@gmail.com",
      replyTo: order.email,
      subject: `New order ${order.orderNumber} — ${formatCents(order.totalCents)}`,
      text: summary,
    });

    await sendMail({
      to: order.email,
      subject: `Your Stag Fencing order ${order.orderNumber}`,
      text: `Thanks ${order.name}! We've received your order.\n\n${summary}\n\nWe'll be in touch to arrange ${
        order.fulfilment === "pickup" ? "pickup" : "delivery"
      }.`,
    });
  } catch (error) {
    console.error("[orders] confirmation email failed:", error);
  }
}

/* --------------------------------- Admin --------------------------------- */

export async function listOrders() {
  await connectDB();
  const docs = await Order.find().sort({ createdAt: -1 }).limit(200).lean();

  return docs.map((d) => ({
    id: String(d._id),
    orderNumber: d.orderNumber,
    name: d.name ?? "",
    email: d.email,
    phone: d.phone ?? "",
    address: [d.address, d.suburb, d.postcode].filter(Boolean).join(", "),
    notes: d.notes ?? "",
    fulfilment: d.fulfilment ?? "delivery",
    items: (d.items ?? []).map((i) => ({
      title: i.title,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents,
    })),
    subtotalCents: d.subtotalCents,
    shippingCents: d.shippingCents ?? 0,
    totalCents: d.totalCents,
    status: d.status ?? "pending",
    paymentStatus: d.paymentStatus ?? "unpaid",
    stockIssue: Boolean(d.stockIssue),
    stockNote: d.stockNote ?? "",
    createdAt: (d.createdAt as Date)?.toISOString() ?? "",
  }));
}

export async function countOrders() {
  await connectDB();
  const [total, unpaid, revenue] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ paymentStatus: "unpaid" }),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalCents" } } },
    ]),
  ]);

  return {
    total,
    unpaid,
    revenueCents: revenue[0]?.total ?? 0,
  };
}
