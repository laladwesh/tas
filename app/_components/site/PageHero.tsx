import Link from "next/link";
import { ArrowUpRightIcon, PhoneCallIcon } from "@/components/icons";
import SafeImage from "@/components/SafeImage";

type Crumb = { label: string; href?: string };

type Props = {
  title: string;
  subtitle?: string;
  image?: string;
  breadcrumbs?: Crumb[];
  /** Hide the CTA row (e.g. on Cart / Checkout). */
  showActions?: boolean;
  phoneHref?: string;
};

/**
 * The banner every inner page opens with: photo + dark scrim, breadcrumb
 * pill, centred title, and the two CTAs. The site header floats over this.
 */
export default function PageHero({
  title,
  subtitle,
  image = "/figma/hero-bg.jpg",
  breadcrumbs = [],
  showActions = true,
  phoneHref = "tel:0431703770",
}: Props) {
  return (
    <section className="relative w-full overflow-hidden bg-hero">
      <SafeImage src={image} alt="" priority sizes="100vw" className="object-cover" />
      <span aria-hidden className="absolute inset-0 bg-black/45" />

      <div className="relative mx-auto flex min-h-[340px] flex-col items-center justify-center gap-[16px] px-5 pb-[48px] pt-[170px] text-center sm:px-8 lg:px-12 xl:px-20">
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-[6px] rounded-[20px] bg-black/40 px-[12px] py-[4px] text-[10px] font-medium text-white/80">
              {breadcrumbs.map((crumb, i) => (
                <li key={crumb.label} className="flex items-center gap-[6px]">
                  {crumb.href ? (
                    <Link href={crumb.href} className="transition hover:text-white">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-white">{crumb.label}</span>
                  )}
                  {i < breadcrumbs.length - 1 && (
                    <span aria-hidden className="text-white/40">
                      /
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <h1 className="text-shadow-hero max-w-[900px] text-[32px] font-semibold leading-tight text-cool-10 sm:text-[44px]">
          {title}
        </h1>

        {subtitle && (
          <p className="text-shadow-hero max-w-[620px] text-[13px] font-normal text-cool-10">
            {subtitle}
          </p>
        )}

        {showActions && (
          <div className="mt-[8px] flex flex-wrap items-center justify-center gap-[16px]">
            <Link
              href="/#quote"
              className="flex items-center gap-[6px] overflow-hidden rounded-[48px] bg-white py-[4px] pl-[16px] pr-[4px]"
            >
              <span className="whitespace-nowrap text-[14px] leading-none tracking-[0.5px] text-black">
                Get A Free Quote
              </span>
              <span className="flex size-[32px] shrink-0 items-center justify-center rounded-full bg-ink text-white">
                <ArrowUpRightIcon className="size-[18px]" />
              </span>
            </Link>

            <a
              href={phoneHref}
              className="flex items-center gap-[6px] overflow-hidden rounded-[48px] bg-white/15 py-[4px] pl-[16px] pr-[4px] backdrop-blur-sm transition hover:bg-white/25"
            >
              <span className="whitespace-nowrap text-[14px] leading-none tracking-[0.5px] text-white">
                Call Now
              </span>
              <span className="flex size-[32px] shrink-0 items-center justify-center rounded-full bg-white text-ink">
                <PhoneCallIcon className="size-[16px]" />
              </span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
