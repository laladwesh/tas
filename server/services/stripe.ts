import "server-only";

import Stripe from "stripe";

export const STRIPE_ENABLED = Boolean(process.env.STRIPE_SECRET_KEY);

let client: Stripe | null = null;

export function stripe() {
  if (!STRIPE_ENABLED) throw new Error("Stripe is not configured");
  if (client) return client;

  client = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return client;
}

export function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}
