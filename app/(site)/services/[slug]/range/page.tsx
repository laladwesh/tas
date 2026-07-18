import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import PageHero from "@/app/_components/site/PageHero";
import { Container } from "@/app/_components/site/ui";
import { ArrowUpRightIcon } from "@/components/icons";
import { getServiceCatalog, getServiceDetail } from "@/server/services/catalog";
import { getSettings } from "@/server/services/content";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

/** Pre-render range pages only for services that actually have a range. */
export async function generateStaticParams() {
  const services = await getServiceCatalog();
  return services
    .filter((s) => s.ranges.length > 0)
    .map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceDetail(slug);
  if (!service) return {};
  return {
    title: `${service.title} range`,
    description: `Explore the ${service.title.toLowerCase()} range at Stag Fencing — options and pricing across Perth.`,
    alternates: { canonical: `/services/${service.slug}/range` },
  };
}

export default async function ServiceRangePage({ params }: Params) {
  const { slug } = await params;
  const [service, settings] = await Promise.all([
    getServiceDetail(slug),
    getSettings(),
  ]);

  if (!service) notFound();
  // No range for this service? It goes straight to the detail page.
  if (service.ranges.length === 0) redirect(`/services/${service.slug}`);

  return (
    <>
      <PageHero
        title={service.title}
        subtitle={service.excerpt}
        image={service.image}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.title },
        ]}
        phoneHref={settings.phoneHref}
      />

      <section className="w-full bg-white py-12 lg:py-16">
        <Container>
          <div className="mb-8 flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-black sm:text-3xl">
              The {service.title.toLowerCase()} range
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-black/60">
              Pick the option that suits your block and budget. Every one is
              supplied and installed by our own crews — tap any to see the detail
              and get a fixed quote.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {service.ranges.map((range) => (
              <Link
                key={range.name}
                href={`/services/${service.slug}`}
                className="group flex flex-col gap-2.5"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={range.image || service.image}
                    alt={range.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20"
                  />
                  <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-white py-1.5 pl-4 pr-1.5 text-sm font-medium text-black opacity-0 shadow-md transition-all duration-300 group-hover:opacity-100">
                    View
                    <span className="flex size-7 items-center justify-center rounded-full bg-ink text-white">
                      <ArrowUpRightIcon className="size-4" />
                    </span>
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-base font-medium leading-snug text-black">
                    {range.name}
                  </h3>
                  {range.priceFrom && (
                    <p className="text-sm text-black/60">{range.priceFrom}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-cool-20 pt-8">
            <Link
              href={`/services/${service.slug}`}
              className="flex h-11 items-center rounded-full bg-ink px-6 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              See full {service.title.toLowerCase()} details
            </Link>
            <Link
              href="/#quote"
              className="flex h-11 items-center rounded-full border border-ink px-6 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-white"
            >
              Get a free quote
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
