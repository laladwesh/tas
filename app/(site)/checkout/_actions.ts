"use server";

import { redirect } from "next/navigation";
import { checkoutSchema } from "@/lib/validation";
import { placeOrder } from "@/server/services/orders";

export type CheckoutState = { error: string } | null;

export async function placeOrderAction(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const parsed = checkoutSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    fulfilment: formData.get("fulfilment") ?? "delivery",
    address: formData.get("address") ?? "",
    suburb: formData.get("suburb") ?? "",
    postcode: formData.get("postcode") ?? "",
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Delivery needs an address; pickup doesn't.
  if (parsed.data.fulfilment === "delivery" && !parsed.data.address) {
    return { error: "Please enter a delivery address, or choose pickup." };
  }

  const result = await placeOrder(parsed.data);
  if (!result.ok) return { error: result.message };

  // Stripe configured -> hand off to Stripe Checkout.
  // Otherwise the order is already confirmed, so go straight to the receipt.
  redirect(result.checkoutUrl ?? `/checkout/success?order=${result.orderNumber}`);
}
