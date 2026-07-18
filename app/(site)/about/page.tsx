import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import PageHero from "@/app/_components/site/PageHero";
import { ArrowPillLink, Container, Eyebrow } from "@/app/_components/site/ui";
import { GoogleG, StarIcon } from "@/components/icons";
import { getSettings } from "@/server/services/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Stag Fencing is a WA-owned fencing contractor serving Perth and the South West — licensed, insured, and backed by a 10 year workmanship warranty.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHero
        title="About us"
        subtitle="Licensed, insured and WA-owned — from a back fence to a full commercial run."
        image="/figma/about.jpg"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About us" }]}
        phoneHref={settings.phoneHref}
      />

      {/* 01 · About Stag Fencing (image right) */}
      <section className="w-full bg-white py-16 lg:py-[80px]">
        <Container>
          <div className="flex flex-col items-start gap-[32px] lg:flex-row lg:items-center lg:gap-[80px]">
            <div className="flex w-full flex-col items-start gap-[18px] lg:max-w-[520px]">
              <Eyebrow>About Stag Fencing</Eyebrow>
              <h2 className="text-3xl font-semibold leading-tight text-black sm:text-4xl">
                Fences built to outlast the weather — and the trends.
              </h2>
              <p className="text-sm leading-[1.7] text-black/70">
                We&rsquo;re a Western Australian fencing team that supplies and
                installs fences the right way: quality materials, straight pricing,
                and crews who turn up and finish the job. Perth to Bunbury, home or
                commercial.
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-4">
                <Link
                  href="/#quote"
                  className="flex h-[44px] items-center rounded-[48px] bg-ink px-6 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Get a free quote
                </Link>
                <ArrowPillLink href="/gallery">See our work</ArrowPillLink>
              </div>

              <div className="mt-2 flex items-center gap-[8px]">
                <GoogleG className="size-[18px]" />
                <span className="flex items-center gap-[3px] text-brand">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} className="size-[13px]" />
                  ))}
                </span>
                <span className="text-sm font-semibold text-black">
                  {settings.googleRating}
                </span>
                <span className="text-xs text-black/50">· 300+ Google reviews</span>
              </div>
            </div>

            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[8px] lg:w-[48%] lg:max-w-[600px]">
              <Image
                src="/figma/about.jpg"
                alt="Stag Fencing work in Perth"
                fill
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* 02 · Who we are (image left) */}
      <section className="w-full bg-white pb-20 lg:pb-[96px]">
        <Container>
          <div className="flex flex-col-reverse items-start gap-[32px] lg:flex-row lg:items-center lg:gap-[80px]">
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[8px] lg:w-[48%] lg:max-w-[600px]">
              <Image
                src="/figma/why-us.jpg"
                alt="Stag Fencing crew on site"
                fill
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover"
              />
            </div>

            <div className="flex w-full flex-col items-start gap-[18px] lg:max-w-[520px]">
              <Eyebrow>Who we are</Eyebrow>
              <h2 className="text-3xl font-semibold leading-tight text-black sm:text-4xl">
                A local crew that treats your boundary like our own.
              </h2>
              <p className="text-sm leading-[1.7] text-black/70">
                Stag Fencing started with a simple frustration: too many fencing jobs
                done cheap and done twice. We built a business around the opposite —
                measure it properly, use materials rated for the WA sun and coastal
                wind, and stand behind the work.
              </p>
              <p className="text-sm leading-[1.7] text-black/70">
                Today we run our own installation crews (not a rotating cast of
                subbies) across the Perth metro and the South West out of Bunbury.
                From a single Colorbond backyard run to full commercial security
                fencing, the standard doesn&rsquo;t change.
              </p>

              <div className="mt-2 flex items-center gap-[12px]">
                <span className="relative size-[44px] shrink-0 overflow-hidden rounded-full bg-field">
                  <Image
                    src="/const.png"
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-black">
                    The Stag Fencing team
                  </span>
                  <span className="text-xs text-black/50">
                    {settings.addressLocality}, {settings.addressRegion}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
