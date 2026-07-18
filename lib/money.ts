/**
 * Money is ALWAYS handled as integer cents.
 *
 * Storing money as a float (19.99) accumulates rounding drift and eventually
 * produces wrong invoices — the classic e-commerce bug. Everything downstream
 * (cart totals, orders, Stripe) uses cents; we only format at the edge.
 */

export function formatCents(cents: number, currency = "AUD") {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/** "$99.50" -> 9950. Returns 0 when unparseable. */
export function parseDollarsToCents(value: string) {
  const match = value.replace(/,/g, "").match(/(\d+(?:\.\d{1,2})?)/);
  if (!match) return 0;
  return Math.round(Number(match[1]) * 100);
}

export const GST_RATE = 0.1; // Australia — 10%

/** GST component of a GST-inclusive total (AU prices include GST). */
export function gstComponent(totalCents: number) {
  return Math.round(totalCents - totalCents / (1 + GST_RATE));
}
