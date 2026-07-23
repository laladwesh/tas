import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import PageHero from "@/app/_components/site/PageHero";
import FaqAccordion from "@/app/_components/site/FaqAccordion";
import { ArrowPillLink, Container, Eyebrow } from "@/app/_components/site/ui";
import JsonLd from "@/components/JsonLd";
import SafeImage from "@/components/SafeImage";
import {
  ArrowUpRightIcon,
  CheckIcon,
  PlusIcon,
  ShieldCheckIcon,
  StarIcon,
} from "@/components/icons";
import {
  getServiceCatalog,
  getServiceDetail,
  getProducts,
  getProjects,
  getReviews,
} from "@/server/services/catalog";
import { getSettings } from "@/server/services/content";
import { siteConfig } from "@/lib/seo";

export const revalidate = 60;

/**
 * Pricing-tile illustration (TileVisual). Draws the right motif per product:
 * solid bars (Colorbond), gapped bars (batten/tubular), glass panels,
 * radiator blades (fine bars), or horizontal sleeper courses.
 */
const TILE_FILL = "#4C4E4A";

/**
 * Pricing-tile illustration (TileVisual), rendered as SVG so it stays crisp
 * and fills any tile width. These are the DEFAULTS per visual type; custom
 * per-tile artwork can be added later.
 */
function TileBars({ visual }: { visual: string }) {
  const cls = "h-[44px] w-full";

  // Vertical posts + top/bottom rails (Colorbond panel).
  if (visual === "solid") {
    return (
      <svg viewBox="0 0 138 52" preserveAspectRatio="none" className={cls}>
        <rect width="138" height="5" rx="2" fill={TILE_FILL} fillOpacity="0.9" />
        <rect y="47" width="138" height="5" rx="2" fill={TILE_FILL} fillOpacity="0.9" />
        {[8, 28, 48, 68, 88, 108, 128].map((x) => (
          <rect key={x} x={x} y="6" width="5" height="40" rx="2" fill={TILE_FILL} fillOpacity="0.9" />
        ))}
      </svg>
    );
  }

  // Diagonal cross-hatch (chainmesh / lattice).
  if (visual === "mesh") {
    return (
      <svg viewBox="0 0 126 48" preserveAspectRatio="none" className={cls}>
        {Array.from({ length: 18 }).map((_, i) => {
          const x = i * 14 - 56;
          return (
            <g key={i} stroke={TILE_FILL} strokeOpacity="0.8" strokeWidth="1.6">
              <line x1={x} y1="48" x2={x + 48} y2="0" />
              <line x1={x + 48} y1="48" x2={x} y2="0" />
            </g>
          );
        })}
      </svg>
    );
  }

  // Horizontal courses (retaining sleepers).
  if (visual === "sleeper") {
    return (
      <svg viewBox="0 0 138 52" preserveAspectRatio="none" className={cls}>
        {[0, 16, 32, 47].map((y) => (
          <rect key={y} y={y} width="138" height="5" rx="2" fill={TILE_FILL} fillOpacity="0.9" />
        ))}
      </svg>
    );
  }

  // Glass panels with spigots.
  if (visual === "glass") {
    return (
      <svg viewBox="0 0 138 48" preserveAspectRatio="none" className={cls}>
        {[3, 49, 95].map((x) => (
          <rect key={x} x={x} y="2" width="40" height="40" rx="2" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1.5" />
        ))}
        {[23, 69, 115].map((x) => (
          <rect key={`s${x}`} x={x} y="43" width="4" height="5" rx="1" fill={TILE_FILL} fillOpacity="0.9" />
        ))}
      </svg>
    );
  }

  // Thin vertical slots (slotted perforated panel).
  if (visual === "perf-slot") {
    return (
      <svg viewBox="0 0 138 48" preserveAspectRatio="none" className={cls}>
        {Array.from({ length: 11 }).map((_, i) => (
          <rect key={i} x={i * 12.5 + 3} y="0" width="4" height="48" rx="1.5" fill={TILE_FILL} fillOpacity="0.85" />
        ))}
      </svg>
    );
  }

  // Two solid panels split by a contrasting centre divider (custom-pattern perf).
  if (visual === "perf-custom") {
    return (
      <svg viewBox="0 0 138 48" preserveAspectRatio="none" className={cls}>
        <rect x="0" y="0" width="65" height="48" rx="2" fill="#dbeafe" />
        <rect x="73" y="0" width="65" height="48" rx="2" fill="#dbeafe" />
        <rect x="65" y="0" width="8" height="48" fill={TILE_FILL} />
      </svg>
    );
  }

  // Two panels dotted with round perforations (round-hole perf).
  if (visual === "perf-round") {
    return (
      <svg viewBox="0 0 138 48" preserveAspectRatio="none" className={cls}>
        <rect x="0" y="0" width="65" height="48" rx="2" fill="#dbeafe" />
        <rect x="73" y="0" width="65" height="48" rx="2" fill="#dbeafe" />
        {[0, 73].map((panelX) =>
          [12, 32, 52].flatMap((cx) =>
            [12, 24, 36].map((cy) => (
              <circle
                key={`${panelX}-${cx}-${cy}`}
                cx={panelX + cx}
                cy={cy}
                r="2.2"
                fill="#93c5fd"
              />
            )),
          ),
        )}
      </svg>
    );
  }

  // Bars with visible gaps (batten/tubular) vs many fine bars (radiator).
  const count = visual === "radiator" ? 18 : 6;
  const w = visual === "radiator" ? 3 : 10;
  const step = 138 / count;
  return (
    <svg viewBox="0 0 138 48" preserveAspectRatio="none" className={cls}>
      {Array.from({ length: count }).map((_, i) => (
        <rect
          key={i}
          x={i * step + (step - w) / 2}
          y="0"
          width={w}
          height="48"
          rx="2"
          fill={TILE_FILL}
          fillOpacity="0.8"
        />
      ))}
    </svg>
  );
}

type Params = { params: Promise<{ slug: string }> };

/** Pre-render every service page at build time (great for SEO + speed). */
export async function generateStaticParams() {
  const services = await getServiceCatalog();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceDetail(slug);
  if (!service) return {};

  return {
    title: `${service.title} Perth`,
    description: service.excerpt,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: `${service.title} Perth | Stag Fencing`,
      description: service.excerpt,
      images: [{ url: service.image }],
    },
  };
}

export default async function ServiceDetailPage({ params }: Params) {
  const { slug } = await params;

  const [service, all, allProjects, reviews, allProducts, settings] =
    await Promise.all([
      getServiceDetail(slug),
      getServiceCatalog(),
      getProjects(),
      getReviews(),
      getProducts(),
      getSettings(),
    ]);

  if (!service) notFound();

  const related = all.filter((s) => s.slug !== service.slug).slice(0, 5);
  const reviewsBadge = service.badges.find((b) => /review/i.test(b));

  // Product-range grid ("Service Page" in Figma): products in this service's
  // Shop category. Empty category or no matches → the section hides itself.
  const rangeProducts = service.productCategory
    ? allProducts
        .filter(
          (p) =>
            p.category.toLowerCase() === service.productCategory.toLowerCase(),
        )
        .slice(0, 8)
    : [];

  // Section 08: prefer projects tagged for this service, fall back to any.
  const projects = (
    service.projectCategory
      ? allProjects.filter(
          (p) =>
            p.category.toLowerCase() === service.projectCategory.toLowerCase(),
        )
      : allProjects
  ).slice(0, 3);

  /** Service schema — helps this page rank for "<service> Perth". */
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.excerpt,
    serviceType: service.title,
    areaServed: { "@type": "City", name: "Perth" },
    provider: { "@id": `${siteConfig.url}/#business` },
    url: `${siteConfig.url}/services/${service.slug}`,
    image: `${siteConfig.url}${service.image}`,
  };

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

      {/* ===================== 01 · Header + Price ===================== */}
      <section className="w-full bg-white pt-16 lg:pt-[64px]">
        <Container>
          <div className="flex flex-col gap-[32px] lg:flex-row lg:items-start lg:justify-between lg:gap-[64px]">
            <div className="flex w-full flex-col items-start gap-[16px] lg:max-w-[560px]">
              <Eyebrow>Overview</Eyebrow>
              <h2 className="text-3xl font-medium leading-tight text-black sm:text-4xl">
                {service.title} in Perth
              </h2>
              <p className="text-base leading-[1.7] text-black/80">
                {service.intro || service.excerpt}
              </p>

              {service.badges.length > 0 && (
                <div className="mt-1 flex flex-wrap items-center gap-[10px]">
                  {service.badges.map((badge) => {
                    const isRating = /review/i.test(badge);
                    return (
                      <span
                        key={badge}
                        className="inline-flex items-center gap-[6px] rounded-full border border-black/15 px-[14px] py-[6px] text-sm font-medium text-black/70"
                      >
                        {isRating ? (
                          <StarIcon className="size-[14px] text-brand" />
                        ) : (
                          <ShieldCheckIcon className="size-[14px] text-brand" />
                        )}
                        {badge}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price card */}
            <div className="flex w-full flex-col gap-[16px] rounded-[8px] bg-field p-[24px] lg:w-[360px] lg:shrink-0">
              <span className="text-xs font-medium uppercase tracking-[1px] text-black/50">
                From
              </span>
              <div className="flex items-end gap-[8px]">
                <span className="text-5xl font-semibold leading-none text-ink">
                  {service.priceValue || service.priceFrom}
                </span>
                {service.priceUnit && (
                  <span className="pb-1 text-sm text-black/60">
                    {service.priceUnit}
                  </span>
                )}
              </div>
              <Link
                href="/#quote"
                className="flex h-[44px] items-center justify-center gap-[6px] rounded-[48px] bg-ink px-[16px] text-base font-medium tracking-[0.5px] text-white transition-opacity hover:opacity-90"
              >
                Get A Free Quote
                <span className="flex size-[24px] items-center justify-center rounded-full bg-white/15">
                  <ArrowUpRightIcon className="size-[14px]" />
                </span>
              </Link>
              <a
                href={settings.phoneHref}
                className="text-center text-sm text-black/60 transition-colors hover:text-black"
              >
                or call {settings.phoneDisplay} for a site visit
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ===================== 02 · Stats ===================== */}
      {service.stats.length > 0 && (
        <section className="w-full bg-white pt-[40px]">
          <Container>
            <div className="grid grid-cols-2 gap-[12px] md:grid-cols-4">
              {service.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col gap-[4px] rounded-[6px] bg-field px-[20px] py-[18px]"
                >
                  <span className="text-2xl font-semibold leading-none text-ink">
                    {stat.value}
                  </span>
                  <span className="text-sm text-black/60">{stat.label}</span>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ===================== 03 · Colours ===================== */}
      {service.colours.length > 0 && (
        <section className="w-full bg-white pt-[48px]">
          <Container>
            <div className="mb-[16px] flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-xl font-medium text-black sm:text-2xl">
                {service.coloursTitle || "Pick your colour"}
              </h2>
              {service.coloursNote && (
                <p className="text-xs text-black/50">{service.coloursNote}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-[14px]">
              {service.colours.map((colour) => (
                <div
                  key={colour.name}
                  className="flex w-[72px] flex-col items-center gap-[8px]"
                >
                  <span
                    className="aspect-square w-full rounded-[6px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
                    style={{ backgroundColor: colour.hex }}
                  />
                  <span className="text-center text-xs text-black/70">
                    {colour.name}
                  </span>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ===================== 04 · Heights & pricing ===================== */}
      {service.heights.length > 0 && (
        <section className="w-full bg-white pt-[48px]">
          <Container>
            <h2 className="mb-[16px] text-xl font-medium text-black sm:text-2xl">
              {service.heightsTitle || "Heights & pricing"}
            </h2>
            <div className="grid grid-cols-2 gap-[12px] md:grid-cols-4">
              {service.heights.map((height) => {
                const popular = height.popular;
                return (
                  <div
                    key={height.label}
                    className={`relative flex flex-col gap-[12px] rounded-[8px] bg-white p-[16px] text-ink ${
                      popular
                        ? "border-2 border-ink"
                        : "border border-cool-20"
                    }`}
                  >
                    {popular && (
                      <span className="absolute right-[12px] top-[12px] rounded-full bg-ink px-[8px] py-[2px] text-[10px] font-medium text-white">
                        Most popular
                      </span>
                    )}
                    {height.customSvg ? (
                      // Staff-pasted SVG (requireStaff()-gated write path) overrides
                      // the built-in visual. Scaled to fill the tile via CSS so it
                      // matches the built-in illustrations regardless of the
                      // pasted markup's own width/height attributes.
                      <div
                        className="h-[44px] w-full [&>svg]:h-full [&>svg]:w-full"
                        dangerouslySetInnerHTML={{ __html: height.customSvg }}
                      />
                    ) : (
                      <TileBars visual={height.visual} />
                    )}
                    <span className="text-lg font-semibold">{height.label}</span>
                    <span className="text-sm text-black/60">{height.priceLabel}</span>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* ============ Product range grid (Figma "Service Page") ============ */}
      {rangeProducts.length > 0 && (
        <section className="w-full bg-white pt-[48px]">
          <Container>
            <div className="mb-[16px] flex items-end justify-between gap-4">
              <h2 className="text-xl font-medium text-black sm:text-2xl">
                Shop the {service.title.toLowerCase()} range
              </h2>
              <Link
                href="/shop"
                className="whitespace-nowrap text-sm font-medium text-ink underline-offset-4 hover:underline"
              >
                View all products →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-[20px] gap-y-[32px] md:grid-cols-3 lg:grid-cols-4">
              {rangeProducts.map((product) => (
                <div key={product.slug} className="group flex flex-col gap-[10px]">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[6px] bg-gray-100">
                    <SafeImage
                      src={product.image}
                      alt={product.title}
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/25"
                    />
                    {/* Two CTAs fade in on hover, matching the Figma card. */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-[8px] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <Link
                        href={`/shop/${product.slug}`}
                        className="rounded-[48px] bg-white px-[18px] py-[7px] text-sm font-medium tracking-[0.5px] text-black shadow-md transition-transform hover:scale-105"
                      >
                        Learn More
                      </Link>
                      <Link
                        href="/#quote"
                        className="rounded-[48px] bg-ink px-[18px] py-[7px] text-sm font-medium tracking-[0.5px] text-white shadow-md transition-transform hover:scale-105"
                      >
                        Get A Free Quote
                      </Link>
                    </div>
                  </div>
                  <Link href={`/shop/${product.slug}`} className="flex flex-col gap-[2px]">
                    <h3 className="line-clamp-1 text-base font-medium leading-[1.4] text-black">
                      {product.title}
                    </h3>
                    <p className="text-sm leading-[1.4] text-black/60">{product.price}</p>
                  </Link>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ===================== 05 · Included & add-ons ===================== */}
      {(service.includes.length > 0 || service.addons.length > 0) && (
        <section className="w-full bg-white pt-[48px]">
          <Container>
            <div className="grid gap-[16px] md:grid-cols-2">
              {service.includes.length > 0 && (
                <div className="rounded-[8px] bg-field p-[24px]">
                  <h3 className="mb-[16px] text-lg font-medium text-black">
                    {service.includesTitle || "Every install includes"}
                  </h3>
                  <ul className="flex flex-col gap-[12px]">
                    {service.includes.map((item) => (
                      <li key={item} className="flex items-start gap-[10px]">
                        <CheckIcon className="mt-[2px] size-[16px] shrink-0 text-brand" />
                        <span className="text-sm leading-[1.5] text-black/80">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {service.addons.length > 0 && (
                <div className="rounded-[8px] border border-cool-20 p-[24px]">
                  <h3 className="mb-[16px] text-lg font-medium text-black">
                    {service.addonsTitle || "Popular add-ons"}
                  </h3>
                  <ul className="flex flex-col gap-[12px]">
                    {service.addons.map((item) => (
                      <li key={item} className="flex items-start gap-[10px]">
                        <PlusIcon className="mt-[2px] size-[16px] shrink-0 text-black/50" />
                        <span className="text-sm leading-[1.5] text-black/80">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* ===================== 06 · WA compliance ===================== */}
      {service.compliance.length > 0 && (
        <section className="w-full bg-white pt-[48px]">
          <Container>
            <div className="rounded-[8px] border-l-[3px] border-brand bg-field p-[24px]">
              <h3 className="mb-[12px] text-lg font-medium text-black">
                {service.complianceTitle || "Built to WA rules — handled for you"}
              </h3>
              <ul className="flex flex-col gap-[10px]">
                {service.compliance.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-[8px] text-sm leading-[1.6] text-black/75"
                  >
                    <span aria-hidden className="mt-[7px] size-[4px] shrink-0 rounded-full bg-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>
      )}

      {/* ===================== 07 · Process ===================== */}
      {service.process.length > 0 && (
        <section className="w-full bg-white pt-[48px]">
          <Container>
            <h2 className="mb-[20px] text-xl font-medium text-black sm:text-2xl">
              {service.processTitle || "From first call to last panel"}
            </h2>
            <div className="grid gap-[24px] sm:grid-cols-2 lg:grid-cols-4">
              {service.process.map((step, i) => (
                <div key={step.title} className="flex flex-col gap-[8px]">
                  <span className="flex size-[32px] items-center justify-center rounded-full bg-ink text-sm font-medium text-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-[4px] text-base font-medium text-black">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-[1.6] text-black/60">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ===================== 08 · Recent projects ===================== */}
      {projects.length > 0 && (
        <section className="w-full bg-white pt-[48px]">
          <Container>
            <div className="mb-[16px] flex items-end justify-between gap-4">
              <h2 className="text-xl font-medium text-black sm:text-2xl">
                Recent {service.title.toLowerCase()} jobs around Perth
              </h2>
              <Link
                href="/gallery"
                className="whitespace-nowrap text-sm font-medium text-ink underline-offset-4 hover:underline"
              >
                View full gallery →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-3">
              {projects.map((project, i) => (
                <div
                  key={`${project.title}-${i}`}
                  className="group relative aspect-[4/3] overflow-hidden rounded-[6px] bg-gray-100"
                >
                  <SafeImage
                    src={project.image}
                    alt={project.title}
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {(project.suburb || project.title) && (
                    <span className="absolute bottom-[8px] left-[8px] rounded-[4px] bg-black/60 px-[8px] py-[3px] text-xs text-white">
                      {project.suburb || project.title}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ===================== 09 · Reviews ===================== */}
      {reviews.length > 0 && (
        <section className="w-full bg-white pt-[48px]">
          <Container>
            <div className="mb-[16px] flex flex-wrap items-center justify-between gap-[12px]">
              <h2 className="text-xl font-medium text-black sm:text-2xl">
                {service.reviewsTitle || "What Perth homeowners say"}
              </h2>
              {reviewsBadge && (
                <span className="inline-flex items-center gap-[6px] rounded-full border border-black/15 px-[14px] py-[6px] text-sm font-medium text-black/70">
                  <StarIcon className="size-[14px] text-brand" />
                  {reviewsBadge}
                </span>
              )}
            </div>
            <div className="grid gap-[16px] sm:grid-cols-3">
              {reviews.slice(0, 3).map((review) => {
                const filled = Math.round(parseFloat(review.rating) || 5);
                return (
                  <div
                    key={review.name}
                    className="flex flex-col gap-[12px] rounded-[8px] border border-cool-20 p-[20px]"
                  >
                    <div className="flex items-center gap-[2px]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`size-[14px] ${i < filled ? "text-brand" : "text-black/15"}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm leading-[1.6] text-black/75">
                      “{review.quote}”
                    </p>
                    <div className="mt-auto flex items-center gap-[10px]">
                      {review.avatar && (
                        <span className="relative size-[32px] overflow-hidden rounded-full bg-gray-100">
                          <SafeImage
                            src={review.avatar}
                            alt={review.name}
                            sizes="32px"
                            className="object-cover"
                          />
                        </span>
                      )}
                      <span className="text-sm font-medium text-black">
                        {review.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* ===================== 10 · FAQ ===================== */}
      {service.faqs.length > 0 && (
        <section className="w-full bg-white pt-[48px]">
          <Container>
            <FaqAccordion
              title={`${service.title} FAQs`}
              faqs={service.faqs.map((f, i) => ({ ...f, defaultOpen: i === 0 }))}
            />
          </Container>
        </section>
      )}

      {/* ===================== 11 · Related & areas ===================== */}
      <section className="w-full bg-white py-[48px] lg:pb-20 lg:pt-[48px]">
        <Container>
          <div className="flex flex-col gap-[32px]">
            {related.length > 0 && (
              <div className="flex flex-col gap-[12px]">
                <h2 className="text-lg font-medium text-black">
                  Related services
                </h2>
                <div className="flex flex-wrap gap-[10px]">
                  {related.map((other) => (
                    <Link
                      key={other.slug}
                      href={`/services/${other.slug}`}
                      className="rounded-[20px] border border-cool-20 px-[16px] py-[8px] text-sm text-black/75 transition-colors hover:border-ink hover:text-ink"
                    >
                      {other.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {service.areas.length > 0 && (
              <div className="flex flex-col gap-[12px]">
                <h2 className="text-lg font-medium text-black">
                  Areas we service
                </h2>
                <div className="flex flex-wrap gap-[10px]">
                  {service.areas.map((area) => (
                    <span
                      key={area}
                      className="rounded-[20px] bg-field px-[16px] py-[8px] text-sm text-black/70"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-[16px] border-t border-cool-20 pt-[32px]">
              <Link
                href="/#quote"
                className="flex h-[44px] items-center rounded-[48px] bg-brand px-[20px] text-base font-medium tracking-[0.5px] text-white transition-colors hover:bg-brand-dark"
              >
                Get a free quote
              </Link>
              <ArrowPillLink href={`/calculator?service=${service.slug}`}>
                Calculate your fence cost
              </ArrowPillLink>
            </div>
          </div>
        </Container>
      </section>

      <JsonLd data={serviceJsonLd} />
    </>
  );
}
