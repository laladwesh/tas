import { NextResponse } from "next/server";
import { getProducts, getServiceCatalog } from "@/server/services/catalog";

export const revalidate = 60;

/**
 * Lightweight catalogue for the instant search overlay. Small payload (no
 * descriptions/specs) so the overlay can fetch once and filter client-side.
 */
export async function GET() {
  const [products, services] = await Promise.all([
    getProducts(),
    getServiceCatalog(),
  ]);

  return NextResponse.json({
    products: products.map((p) => ({
      slug: p.slug,
      title: p.title,
      price: p.price,
      image: p.image,
      category: p.category,
    })),
    services: services.map((s) => ({
      slug: s.slug,
      title: s.title,
      priceFrom: s.priceFrom,
      image: s.image,
    })),
  });
}
