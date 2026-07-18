import { NextResponse } from "next/server";
import { getCart } from "@/server/services/cart";

// Per-user (reads the cart cookie), so never cache this.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cart = await getCart();
    return NextResponse.json({ count: cart.count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
