import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/app/_components/site/PageHero";
import { Container } from "@/app/_components/site/ui";
import SafeImage from "@/components/SafeImage";
import { getProjects } from "@/server/services/catalog";
import { getSettings } from "@/server/services/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Recent fencing projects across Perth — Colorbond, aluminium slat, pool fencing, gates and retaining walls.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [{ category = "" }, projects, settings] = await Promise.all([
    searchParams,
    getProjects(),
    getSettings(),
  ]);

  const shots = projects.map((p) => ({
    image: p.image,
    category: p.category,
    suburb: p.suburb,
  }));

  const categories = Array.from(
    new Set(shots.map((s) => s.category).filter(Boolean))
  ).sort();

  const visible = category
    ? shots.filter((s) => s.category === category)
    : shots;

  return (
    <>
      <PageHero
        title="Our work"
        subtitle="Real jobs across Perth homes and businesses. Chances are we've done one near you."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
        phoneHref={settings.phoneHref}
      />

      <section className="w-full bg-white py-12 lg:py-16">
        <Container>
          {/* Filters */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <Link
              href="/gallery"
              className={`rounded-[20px] px-3 py-1.5 text-[12px] transition ${
                !category
                  ? "bg-ink text-white"
                  : "bg-field text-black/70 hover:bg-black/5"
              }`}
            >
              All
            </Link>
            {categories.map((name) => (
              <Link
                key={name}
                href={`/gallery?category=${encodeURIComponent(name)}`}
                className={`rounded-[20px] px-3 py-1.5 text-[12px] transition ${
                  category === name
                    ? "bg-ink text-white"
                    : "bg-field text-black/70 hover:bg-black/5"
                }`}
              >
                {name}
              </Link>
            ))}
          </div>

          {shots.length === 0 && (
            <p className="py-16 text-center text-[14px] text-black/50">
              No project photos yet.
            </p>
          )}

          {/* Masonry-ish grid */}
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {visible.map((shot, i) => (
              <figure
                key={shot.image + i}
                className="group mb-4 break-inside-avoid overflow-hidden rounded-[8px]"
              >
                <div className="relative w-full overflow-hidden bg-field">
                  <SafeImage
                    src={shot.image}
                    alt={`${shot.category} fencing in ${shot.suburb}`}
                    width={800}
                    height={i % 3 === 0 ? 1000 : 600}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="font-semibold">{shot.category}</span>
                    <span className="text-white/70">{shot.suburb}</span>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <p className="text-[14px] text-black/60">
              Like what you see? Get a free measure and quote.
            </p>
            <Link
              href="/#quote"
              className="flex h-[44px] items-center rounded-[48px] bg-brand px-6 text-[14px] font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Get a free quote
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
