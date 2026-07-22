import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import PageHero from "@/app/_components/site/PageHero";
import { Container } from "@/app/_components/site/ui";
import { ArrowUpRightIcon } from "@/components/icons";
import SafeImage from "@/components/SafeImage";
import {
  getServiceCatalog,
  getServiceChildren,
  getServiceDetail,
} from "@/server/services/catalog";
import { getSettings } from "@/server/services/content";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

/** Pre-render range pages only for parent services that have children. */
export async function generateStaticParams() {
  const all = await getServiceCatalog();
  const parents = new Set(all.map((s) => s.parentSlug).filter(Boolean));
  return Array.from(parents).map((slug) => ({ slug }));
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
  const [service, children, settings] = await Promise.all([
    getServiceDetail(slug),
    getServiceChildren(slug),
    getSettings(),
  ]);

  if (!service) notFound();
  // No range items? This service goes straight to its own detail page.
  if (children.length === 0) redirect(`/services/${service.slug}`);

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
              {service.rangeHeading || `The ${service.title.toLowerCase()} range`}
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-black/60">
              {service.rangeIntro ||
                "Pick the option that suits your block and budget — tap any to see its full detail, colours and pricing."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {children.map((child) => (
              <Link
                key={child.slug}
                href={`/services/${child.slug}`}
                className="group flex flex-col gap-2.5"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
                  <SafeImage
                    src={child.image}
                    alt={child.title}
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20"
                  />
                  <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-white py-1.5 pl-4 pr-1.5 text-base font-medium text-black opacity-0 shadow-md transition-all duration-300 group-hover:opacity-100">
                    View
                    <span className="flex size-7 items-center justify-center rounded-full bg-ink text-white">
                      <ArrowUpRightIcon className="size-4" />
                    </span>
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-base font-medium leading-snug text-black">
                    {child.title}
                  </h3>
                  {child.priceFrom && (
                    <p className="text-sm text-black/60">{child.priceFrom}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
