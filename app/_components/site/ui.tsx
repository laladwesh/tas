import type { ReactNode } from "react";
import { ArrowUpRightIcon } from "@/components/icons";

/**
 * Site content column — the shared width THEME for every page.
 *
 * Centred and capped so content doesn't stretch edge-to-edge on wide screens,
 * growing with the viewport at the larger breakpoints. Full-bleed backgrounds
 * still work: put the colour on the parent <section className="w-full …"> and
 * the Container inside it. Pass `className` only to tweak, not to re-cap width.
 */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12 xl:max-w-[1360px] xl:px-20 2xl:max-w-[1480px] ${className}`}
    >
      {children}
    </div>
  );
}

/** Pill label with a red dot, e.g. "• OUR SERVICES". */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center gap-[8px] overflow-hidden rounded-[20px] border border-black/20 px-[20px] py-[4px]">
      <span aria-hidden className="size-[5px] shrink-0 rounded-full bg-brand" />
      <span className="whitespace-nowrap text-[12px] font-bold uppercase leading-normal text-ink">
        {children}
      </span>
    </span>
  );
}

/** 30px outlined circle with an arrow; rotates to a right-arrow when active. */
export function ArrowCircle({
  active = false,
  className = "",
}: {
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`flex size-[30px] shrink-0 items-center justify-center overflow-hidden rounded-[40px] border border-ink ${
        active ? "bg-white" : ""
      } ${className}`}
    >
      <ArrowUpRightIcon
        className={`size-[12px] text-ink transition-transform duration-200 ${
          active ? "rotate-45" : ""
        }`}
      />
    </span>
  );
}

/** Dark pill CTA with a white circular arrow, e.g. "See the full range". */
export function ArrowPillLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex h-[44px] items-center gap-[6px] rounded-[48px] border border-ink py-[4px] pl-[16px] pr-[4px] transition-colors hover:bg-ink hover:text-white"
    >
      <span className="whitespace-nowrap text-[12px] font-medium tracking-[0.5px]">
        {children}
      </span>
      <span className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-ink text-white">
        <ArrowUpRightIcon className="size-[20px]" />
      </span>
    </a>
  );
}

/** Shared section heading block: eyebrow + 36px title, with optional right copy. */
export function SectionHeading({
  eyebrow,
  title,
  copy,
  center = false,
}: {
  eyebrow: string;
  title: ReactNode;
  copy?: ReactNode;
  center?: boolean;
}) {
  if (center) {
    return (
      <div className="flex flex-col items-center gap-[17px] text-center">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="max-w-[520px] text-[28px] font-semibold leading-normal text-black sm:text-[36px]">
          {title}
        </h2>
        {copy && (
          <p className="max-w-[560px] text-[16px] leading-[1.5] text-black">
            {copy}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-[24px] lg:flex-row lg:items-center lg:justify-between lg:gap-[80px]">
      <div className="flex w-full flex-col items-start gap-[17px] lg:max-w-[520px]">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="text-[28px] font-semibold leading-normal text-black sm:text-[36px]">
          {title}
        </h2>
      </div>
      {copy && (
        <p className="w-full text-[16px] leading-[1.5] text-black lg:max-w-[480px]">
          {copy}
        </p>
      )}
    </div>
  );
}
