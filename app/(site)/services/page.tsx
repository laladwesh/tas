import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/app/_components/site/PageHero";
import FaqAccordion from "@/app/_components/site/FaqAccordion";
import { Container } from "@/app/_components/site/ui";
import { ArrowUpRightIcon } from "@/components/icons";
import SafeImage from "@/components/SafeImage";
import { getServiceCatalog, getFaqsForPage } from "@/server/services/catalog";
import { getSettings } from "@/server/services/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Installation Services",
  description:
    "Colorbond, slat, pool, security and black fencing, retaining walls, gates & automation, and licensed asbestos fence removal across Perth.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const [all, faqs, settings] = await Promise.all([
    getServiceCatalog(),
    getFaqsForPage("services"),
    getSettings(),
  ]);

  // Show only top-level services; a service that is a parent of others opens
  // its range grid, everything else goes straight to its detail page.
  const parentSlugs = new Set(all.map((s) => s.parentSlug).filter(Boolean));
  const services = all.filter((s) => !s.parentSlug);

  return (
    <>
      <PageHero
        title="Installation services"
        subtitle="Your local experts in durable fencing and construction solutions."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        phoneHref={settings.phoneHref}
      />

      {/* Services grid */}
      <section className="w-full bg-white py-16 lg:py-[64px]">
        <Container>
          <div className="grid grid-cols-2 gap-x-[20px] gap-y-[32px] md:grid-cols-3 lg:grid-cols-4">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={
                  parentSlugs.has(service.slug)
                    ? `/services/${service.slug}/range`
                    : `/services/${service.slug}`
                }
                className="group flex flex-col gap-[10px] transition-transform duration-300 ease-out hover:-translate-y-1 motion-reduce:transform-none"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[6px] bg-gray-100">
                  <SafeImage
                    src={service.image}
                    alt={service.title}
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle scrim + centred CTA that fades in on hover. */}
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20"
                  />
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-[6px] rounded-[48px] bg-white py-[6px] pl-[16px] pr-[6px] opacity-0 shadow-md transition-all duration-300 group-hover:opacity-100"
                  >
                    <span className="whitespace-nowrap text-sm font-medium tracking-[0.5px] text-black">
                      See our range
                    </span>
                    <span className="flex size-[28px] items-center justify-center rounded-full bg-ink text-white">
                      <ArrowUpRightIcon className="size-[16px]" />
                    </span>
                  </span>
                </div>
                <div className="flex flex-col gap-[2px]">
                  <h2 className="text-base font-medium leading-[1.4] text-black">
                    {service.title}
                  </h2>
                  <p className="text-sm leading-[1.4] text-black/60">
                    {service.priceFrom}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQs */}
      <section className="w-full bg-white pb-20">
        <Container>
          <FaqAccordion
            faqs={faqs}
            title="Services FAQs"
            aside={`Can't find it? Call us ${settings.phoneDisplay}`}
          />
        </Container>
      </section>
    </>
  );
}
