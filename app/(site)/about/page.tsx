import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import PageHero from "@/app/_components/site/PageHero";
import Process from "@/app/_components/site/Process";
import Reviews from "@/app/_components/site/Reviews";
import { ArrowPillLink, Container, Eyebrow } from "@/app/_components/site/ui";
import { getSettings } from "@/server/services/content";
import { getReviews } from "@/server/services/catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Stag Fencing is a WA-owned fencing contractor serving Perth and the South West — licensed, insured, and backed by a 10 year workmanship warranty.",
  alternates: { canonical: "/about" },
};

const stats = [
  { value: "500+", label: "Fences built" },
  { value: "2,000+", label: "Fences quoted" },
  { value: "10 yr", label: "Workmanship warranty" },
  { value: "5.0", label: "Google rating" },
];

export default async function AboutPage() {
  const [settings, reviews] = await Promise.all([getSettings(), getReviews()]);

  return (
    <>
      <PageHero
        title="The Perth fencing team that does the hard jobs too"
        subtitle="Licensed, insured and WA-owned — from a back fence to a full commercial run."
        image="/figma/about.jpg"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About us" }]}
        phoneHref={settings.phoneHref}
      />

      {/* Story */}
      <section className="w-full bg-white py-16 lg:py-[64px]">
        <Container>
          <div className="flex flex-col items-start gap-[32px] lg:flex-row lg:gap-[80px]">
            <div className="flex w-full flex-col items-start gap-[17px] lg:max-w-[520px]">
              <Eyebrow>About us</Eyebrow>
              <h2 className="text-[28px] font-semibold leading-normal text-black sm:text-[36px]">
                Fencing done properly, without the run-around
              </h2>
              <p className="text-[14px] leading-[1.7] text-black/80">
                We quote most jobs the same day you call, use materials made for the
                WA climate, and clean up before we leave. You get one crew, one clear
                price, and a fence built to last.
              </p>
              <p className="text-[14px] leading-[1.7] text-black/80">
                We also take the jobs other fencers pass on — old asbestos to pull
                out, a retaining wall the fence can&rsquo;t go up without. We&rsquo;re
                licensed for both, and we do them in the right order so you&rsquo;re
                not managing three trades yourself.
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/#quote"
                  className="flex h-[40px] items-center rounded-[48px] bg-brand px-5 text-[14px] font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  Get a free quote
                </Link>
                <ArrowPillLink href="/gallery">See our work</ArrowPillLink>
              </div>
            </div>

            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[4px] lg:w-[45%] lg:max-w-[560px]">
              <Image
                src="/figma/why-us.jpg"
                alt="Stag Fencing crew on site in Perth"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              <span
                aria-hidden
                className="absolute inset-0 rounded-[inherit] shadow-[inset_-4px_-4px_16px_0px_rgba(0,0,0,0.25)]"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-2 gap-6 border-t border-black/10 pt-10 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-start gap-1">
                <p className="text-[28px] font-extrabold text-ink">{stat.value}</p>
                <p className="text-[12px] text-black/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Reuse the home sections — same components, no duplication */}
      <Reviews reviews={reviews} />
      <Process />
    </>
  );
}
