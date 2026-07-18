import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import PageHero from "@/app/_components/site/PageHero";
import { Container } from "@/app/_components/site/ui";
import { getProducts, getServiceCatalog } from "@/server/services/catalog";
import { getSettings } from "@/server/services/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false }, // search result pages shouldn't be indexed
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const needle = q.trim().toLowerCase();

  const [products, services, settings] = await Promise.all([
    getProducts(),
    getServiceCatalog(),
    getSettings(),
  ]);

  const productHits = needle
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(needle) ||
          p.category.toLowerCase().includes(needle),
      )
    : [];
  const serviceHits = needle
    ? services.filter((s) => s.title.toLowerCase().includes(needle))
    : [];

  const total = productHits.length + serviceHits.length;

  return (
    <>
      <PageHero
        title={q ? `Results for “${q}”` : "Search"}
        subtitle={
          q
            ? `${total} ${total === 1 ? "match" : "matches"} across the shop and services.`
            : "Find fencing products and services."
        }
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
        showActions={false}
        phoneHref={settings.phoneHref}
      />

      <section className="w-full bg-white py-12 lg:py-16">
        <Container>
          {total === 0 ? (
            <p className="py-16 text-center text-sm text-black/60">
              {q ? (
                <>Nothing matched “{q}”. Try a broader term, or browse the{" "}
                  <Link href="/shop" className="text-brand hover:underline">shop</Link>.
                </>
              ) : (
                "Type in the search box to find products and services."
              )}
            </p>
          ) : (
            <div className="flex flex-col gap-12">
              {serviceHits.length > 0 && (
                <div>
                  <h2 className="mb-4 text-xl font-semibold text-black">Services</h2>
                  <div className="grid grid-cols-2 gap-x-[20px] gap-y-[32px] md:grid-cols-4">
                    {serviceHits.map((s) => (
                      <Link key={s.slug} href={`/services/${s.slug}`} className="group flex flex-col gap-[8px]">
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[6px] bg-gray-100">
                          <Image src={s.image} alt={s.title} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                        <h3 className="text-base font-medium leading-[1.4] text-black">{s.title}</h3>
                        <p className="text-sm text-black/60">{s.priceFrom}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {productHits.length > 0 && (
                <div>
                  <h2 className="mb-4 text-xl font-semibold text-black">Products</h2>
                  <div className="grid grid-cols-2 gap-x-[20px] gap-y-[32px] md:grid-cols-4">
                    {productHits.map((p) => (
                      <Link key={p.slug} href={`/shop/${p.slug}`} className="group flex flex-col gap-[8px]">
                        <div className="relative aspect-square w-full overflow-hidden rounded-[6px] bg-field">
                          <Image src={p.image} alt={p.title} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                        {p.category && <p className="text-xs text-black/50">{p.category}</p>}
                        <h3 className="line-clamp-2 text-base font-medium leading-[1.4] text-black">{p.title}</h3>
                        <p className="text-sm text-black/70">{p.price}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
