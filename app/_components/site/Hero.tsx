import Image from "next/image";
import Link from "next/link";
import { GoogleG, StarIcon } from "@/components/icons";
import type { SiteSettings } from "@/server/services/content";

const stats = [
  { value: "500+", label: "Fences Built" },
  { value: "2,000+", label: "Fences quoted" },
  { value: "10 yr", label: "Workmanship Warranty" },
];

/** Exact gradients from the Figma hero frame. */
const heroGradients =
  "linear-gradient(0deg, rgba(0,0,0,0) 17.788%, rgba(0,0,0,0) 70.192%, rgba(0,0,0,0.16) 83.173%), linear-gradient(270deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 70.192%, rgba(0,0,0,0.08) 100%)";

export default function Hero({ settings }: { settings: SiteSettings }) {
  return (
    <div className="relative min-h-[630px] w-full overflow-hidden bg-hero">
      {/* Background photo */}
      <Image
        src="/figma/hero-bg.jpg"
        alt="Timber fence at dusk in Western Australia"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundImage: heroGradients }}
      />

      {/* Content */}
      {/* pb on lg reserves room for the quote card, which is pulled up 100px
          over the hero — without it the card covers the rating/stats row. */}
      <div className="relative mx-auto flex min-h-[630px] items-center justify-between px-5 pb-24 pt-[180px] sm:px-8 md:pt-[140px] lg:px-12 lg:pb-[150px] xl:px-20">
        <div className="flex max-w-[534px] flex-col gap-[24px] lg:max-w-[620px]">
          <div className="flex flex-col items-start gap-[10px]">
            {/* Badge */}
            <span className="flex items-center justify-center overflow-hidden rounded-[20px] bg-amber-soft px-[20px] py-[2px]">
              <span className="whitespace-nowrap text-[12px] font-bold leading-[1.4] text-white">
                Trusted by 1,000+ WA homes and businesses
              </span>
            </span>

            {/* Headline */}
            <h1 className="text-shadow-hero max-w-[517px] text-[34px] font-semibold leading-none text-cool-10 sm:text-[48px]">
              Fencing for homes and businesses. Built to last, priced to suit
            </h1>

            {/* Sub copy */}
            <p className="text-shadow-hero max-w-[479px] text-[12px] font-normal text-cool-10">
              Quality fencing for WA homes and businesses, with expert advice,
              materials suited to the local climate, and professional
              installation. Get a clear price before you commit.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-[16px]">
            <Link
              href="/calculator"
              className="flex h-[40px] items-center rounded-[48px] bg-brand px-[16px] py-[3px] text-[14px] font-semibold tracking-[0.5px] text-white transition-colors hover:bg-brand-dark"
            >
              Calculate your fence cost
            </Link>
            <Link
              href="/shop"
              className="flex h-[40px] items-center rounded-[48px] bg-white px-[16px] py-[3px] text-[14px] font-medium tracking-[0.5px] text-black transition-colors hover:bg-cool-20"
            >
              Shop supplies (DIY)
            </Link>
          </div>

          {/* Rating + stats */}
          <div className="flex flex-wrap items-center gap-[16px]">
            <div className="flex items-center justify-center gap-[8px] rounded-[10px] py-[4px]">
              <GoogleG className="size-[24px] shrink-0" />
              <div className="flex flex-col items-start justify-center">
                <span className="font-roboto text-[12px] leading-[1.4] text-cool-20">
                  Google rating
                </span>
                <div className="flex items-center gap-[4px]">
                  <div className="flex items-center text-[#f1a93b]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} className="size-[12px]" />
                    ))}
                  </div>
                  <span className="font-roboto text-[12px] leading-[1.4] text-cool-20">
                    {settings.googleRating}
                  </span>
                </div>
              </div>
            </div>

            <span aria-hidden className="h-[36px] w-px bg-white/40" />

            {stats.map((stat, i) => (
              <div key={stat.value} className="flex items-center gap-[16px]">
                <div className="flex flex-col items-start gap-[4px] text-[14px] text-cool-10">
                  <span className="font-extrabold leading-none">{stat.value}</span>
                  <span className="whitespace-nowrap font-normal leading-none">
                    {stat.label}
                  </span>
                </div>
                {i < stats.length - 1 && (
                  <span aria-hidden className="h-[12px] w-px bg-white/40" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator bars */}
        <div className="hidden w-[5px] flex-col gap-[3px] lg:flex">
          <span className="h-[8px] w-full rounded-[5px] bg-white/60" />
          <span className="h-[8px] w-full rounded-[5px] bg-white/60" />
          <span className="h-[40px] w-full rounded-[5px] bg-white/80" />
        </div>
      </div>

      {/* Founder quote card */}
      <div className="absolute right-12 top-[320px] hidden items-center gap-[12px] overflow-hidden rounded-[4px] border border-white/20 bg-cool-20/20 p-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-md xl:right-40 xl:flex">
        <div className="relative h-[100px] w-[104px] shrink-0 overflow-hidden rounded-[4px]">
          <Image
            src="/figma/founder.png"
            alt="Aditya, founder of Stag Fencing"
            fill
            sizes="104px"
            className="object-cover"
          />
        </div>
        <div className="flex h-[100px] flex-col justify-between py-[2px] text-white">
          <p className="w-[154px] text-[10px] font-normal leading-normal">
            &ldquo;A fence should look sharp the day it goes up and still hold its
            line years later. We build for both.&rdquo;
          </p>
          <div className="flex flex-col items-start justify-center">
            <p className="text-[14px] font-semibold leading-normal">Aditya</p>
            <p className="text-[12px] font-normal leading-normal">
              Founder of Stag Fencing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
