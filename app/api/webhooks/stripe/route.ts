import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripe, STRIPE_ENABLED } from "@/server/services/stripe";
import { markOrderPaid } from "@/server/services/orders";

/**
 * Stripe webhook.
 *
 * MUST be a Route Handler, not a Server Action: signature verification needs
 * the RAW request body, and Server Actions only ever see parsed form data.
 *
 * Node runtime (not edge) — the Stripe SDK and mongoose both need it.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!STRIPE_ENABLED || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { ok: false, message: "Stripe is not configured" },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Raw text, NOT request.json() — any reserialisation breaks the signature.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    // A bad signature means it isn't really from Stripe — reject it.
    console.error("[stripe] signature verification failed:", error);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderNumber = session.metadata?.orderNumber;

        // Only treat it as paid if Stripe says it is.
        if (orderNumber && session.payment_status === "paid") {
          await markOrderPaid(orderNumber, session.id);
        }
        break;
      }

      case "checkout.session.expired":
        // Shopper abandoned checkout. The order stays pending/unpaid — their
        // cart is intact, so they can simply try again.
        break;

      default:
        break;
    }
  } catch (error) {
    // Return 500 so Stripe retries — better than silently losing a paid order.
    console.error("[stripe] handler failed:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
