import type { Metadata } from "next";

import PageHero from "@/app/_components/site/PageHero";
import { Container } from "@/app/_components/site/ui";
import ShopBrowser from "./ShopBrowser";
import { getProducts } from "@/server/services/catalog";
import { getSettings } from "@/server/services/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop Fencing Supplies",
  description:
    "Trade-quality fencing supplies for DIY — Colorbond panels and posts, aluminium slats, PVC and tubular fencing. Pick up or delivered across Perth.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);

  return (
    <>
      <PageHero
        title="Fencing supplies"
        subtitle="The same trade-quality materials we install — pick up or have them delivered across Perth."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
        phoneHref={settings.phoneHref}
      />

      <section className="w-full bg-white py-12 lg:py-16">
        <Container>
          <ShopBrowser products={products} />
        </Container>
      </section>
    </>
  );
}
