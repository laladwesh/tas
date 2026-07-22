import { NextResponse } from "next/server";
import { getServiceCatalog } from "@/server/services/catalog";

export const revalidate = 60;

/** Top-level services for the header hover menu, with the right link target
 *  (range grid if the service has children, otherwise its detail page). */
export async function GET() {
  const all = await getServiceCatalog();
  const parents = new Set(all.map((s) => s.parentSlug).filter(Boolean));
  const items = all
    .filter((s) => !s.parentSlug)
    .map((s) => ({
      slug: s.slug,
      title: s.title,
      href: parents.has(s.slug)
        ? `/services/${s.slug}/range`
        : `/services/${s.slug}`,
    }));
  return NextResponse.json({ items });
}
