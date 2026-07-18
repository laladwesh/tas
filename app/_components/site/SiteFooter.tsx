import Link from "next/link";
import {
  ArrowUpRightIcon,
  ClockIcon,
  CopyrightIcon,
  FacebookIcon,
  InstagramIcon,
  MapPinIcon,
  PhoneCallIcon,
  PhoneIconSmall,
  ShieldCheckIcon,
  StagLogo,
  StarIcon,
} from "@/components/icons";

type Props = {
  phoneDisplay: string;
  phoneHref: string;
};

const columns = [
  {
    heading: "Fencing",
    links: [
      { label: "Colorbond", href: "/services/colorbond-fencing" },
      { label: "Pool & glass", href: "/services/pool-fencing" },
      { label: "Aluminium slat", href: "/services/slat-fencing" },
      { label: "Security fencing", href: "/services/security-fencing" },
      { label: "Retaining walls", href: "/services/retaining-walls" },
      { label: "Gates & automation", href: "/services/gates-automation" },
    ],
  },
  {
    heading: "Shop",
    links: [
      { label: "Shop all products", href: "/shop" },
      { label: "Panels & posts", href: "/shop/panels-posts" },
      { label: "Gates & hardware", href: "/shop/gates-hardware" },
      { label: "Fencing accessories", href: "/shop/accessories" },
      { label: "Gate motors", href: "/shop/gate-motors" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Gallery", href: "/gallery" },
      { label: "Aluminium slat", href: "/services/slat-fencing" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Fencing calculator", href: "/calculator" },
      { label: "Warranty", href: "/warranty" },
      { label: "Delivery", href: "/delivery" },
      { label: "Returns", href: "/returns" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
];

const locations = [
  {
    name: "Perth · Balcatta",
    address: "8 Mumford Place, Balcatta WA 6021",
    hours: "Mon–Fri 7:30am – 3:00pm",
    phone: "0431703770",
  },
  {
    name: "Perth · Balcatta",
    address: "8 Mumford Place, Balcatta WA 6021",
    hours: "Mon–Fri 7:30am – 3:00pm",
    phone: "0431703770",
  },
];

export default function SiteFooter({ phoneDisplay, phoneHref }: Props) {
  return (
    <footer className="w-full bg-black">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-[32px] px-5 py-[32px] sm:px-8 lg:px-12 xl:max-w-[1360px] xl:px-20 2xl:max-w-[1480px]">
        {/* Top CTA bar */}
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex max-w-[495px] flex-col items-start text-white">
            <p className="text-[24px] font-semibold leading-normal">
              Fencing sorted — start to finish.
            </p>
            <p className="text-[12px] font-light leading-normal">
              Free on-site measure and a clear written quote, usually within a
              couple of days.
            </p>
          </div>

          <div className="flex items-center gap-[20px]">
            <Link
              href="#quote"
              className="flex items-center gap-[6px] overflow-hidden rounded-[48px] bg-white py-[4px] pl-[16px] pr-[4px]"
            >
              <span className="whitespace-nowrap text-[14px] leading-none tracking-[0.5px] text-black">
                Get A Free Quote
              </span>
              <span className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-black text-white">
                <ArrowUpRightIcon className="size-[20px]" />
              </span>
            </Link>

            <a href={phoneHref} className="flex items-center gap-[4px] text-white">
              <PhoneCallIcon className="size-[20px]" />
              <span className="whitespace-nowrap text-[12px] font-medium tracking-[0.5px]">
                {phoneDisplay}
              </span>
            </a>
          </div>
        </div>

        <hr className="w-full border-white/20" />

        {/* Brand + link columns */}
        <div className="flex flex-col gap-[32px] lg:flex-row lg:gap-[108px]">
          {/* Brand block */}
          <div className="flex w-full max-w-[287px] flex-col items-start gap-[12px]">
            <div className="flex items-center gap-[8px]">
              <StagLogo className="size-[35px] shrink-0 text-brand" />
              <div className="flex flex-col gap-px text-white">
                <p className="text-[16px] font-semibold leading-normal">
                  Stag Fencing
                </p>
                <p className="text-[10px] font-light leading-normal tracking-[1.5px]">
                  PERTH · WA
                </p>
              </div>
            </div>

            <p className="text-[12px] font-light leading-normal text-white">
              One of Western Australia&rsquo;s trusted fencing contractors — supply
              and install done properly, from Perth to the South West.
            </p>

            {/* Rating pill */}
            <div className="flex items-center justify-center gap-[10px] overflow-hidden rounded-[20px] border-[0.5px] border-white/20 bg-white/[0.06] px-[8px] py-[4px]">
              <span className="flex items-center gap-[4px]">
                <span className="flex items-center text-[#f1a93b]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} className="size-[12px]" />
                  ))}
                </span>
                <span className="font-roboto text-[12px] leading-[1.4] text-white">
                  5.0
                </span>
              </span>
              <span className="whitespace-nowrap text-[10px] font-semibold leading-[1.4] text-white/60">
                300+ Google reviews
              </span>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-[8px]">
              {[
                { Icon: FacebookIcon, label: "Facebook", href: "#" },
                { Icon: InstagramIcon, label: "Instagram", href: "#" },
                { Icon: FacebookIcon, label: "Google", href: "#" },
              ].map(({ Icon, label, href }, i) => (
                <a
                  key={label + i}
                  href={href}
                  aria-label={label}
                  className="flex size-[24px] items-center justify-center overflow-hidden rounded-[20px] border border-white/60 text-white transition hover:bg-white/10"
                >
                  <Icon className="size-[16px]" />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-[8px]">
              <ShieldCheckIcon className="size-[16px] shrink-0 text-brand" />
              <p className="text-[10px] font-light leading-[1.4] text-white/60">
                Licensed &amp; insured · WA-owned · Workmanship warranty
              </p>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid w-full grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((column) => (
              <div key={column.heading} className="flex flex-col items-start">
                <div className="flex w-full items-center gap-[8px] px-[2px] py-[4px]">
                  <span aria-hidden className="size-[5px] shrink-0 rounded-full bg-brand" />
                  <p className="whitespace-nowrap text-[12px] font-bold uppercase leading-normal text-white/80">
                    {column.heading}
                  </p>
                </div>
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex w-full items-center px-[2px] py-[4px] text-[12px] font-light leading-normal text-white/80 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Locations + newsletter */}
        <div className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[20px] lg:flex-row">
            {locations.map((location, i) => (
              <div
                key={location.name + i}
                className="flex w-full flex-col gap-[10px] overflow-hidden rounded-[4px] border-[0.5px] border-white/20 bg-white/[0.06] px-[20px] py-[16px] lg:h-[134px] lg:w-[237px]"
              >
                <div className="flex items-center gap-[8px]">
                  <span className="flex items-center rounded-[4px] bg-brand/10 p-[4px]">
                    <MapPinIcon className="size-[20px] text-brand" />
                  </span>
                  <p className="whitespace-nowrap text-[14px] font-semibold leading-normal text-white">
                    {location.name}
                  </p>
                </div>

                <div className="flex flex-col gap-[4px]">
                  {[
                    { Icon: MapPinIcon, text: location.address },
                    { Icon: ClockIcon, text: location.hours },
                    { Icon: PhoneIconSmall, text: location.phone },
                  ].map(({ Icon, text }, j) => (
                    <div key={j} className="flex items-center gap-[8px]">
                      <Icon className="size-[10px] shrink-0 text-white/60" />
                      <p className="text-[10px] font-semibold leading-normal text-white/60">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Newsletter */}
            <div className="flex w-full flex-1 flex-col justify-between gap-4 overflow-hidden rounded-[4px] border-[0.5px] border-white/20 bg-white/[0.06] px-[20px] py-[16px] lg:h-[134px]">
              <div className="flex w-full flex-col gap-[10px]">
                <div className="flex flex-col justify-center">
                  <p className="whitespace-nowrap text-[14px] font-semibold leading-normal text-white">
                    Stay in the loop
                  </p>
                  <p className="max-w-[280px] text-[10px] font-semibold leading-normal text-white/60">
                    Seasonal fencing deals and the odd DIY tip. No spam.
                  </p>
                </div>

                <form className="flex w-full items-stretch gap-[16px]">
                  <input
                    type="email"
                    name="email"
                    placeholder="you@gmail.com"
                    className="h-[32px] flex-1 rounded-[4px] border-[0.5px] border-white/20 bg-black/20 px-[12px] text-[12px] font-light tracking-[0.5px] text-white outline-none placeholder:text-white/40 focus:border-brand"
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center rounded-[4px] bg-brand px-[16px] py-[4px] text-[14px] font-medium leading-[1.4] text-white transition-colors hover:bg-brand-dark"
                  >
                    Join
                  </button>
                </form>
              </div>

              <p className="text-[10px] font-semibold leading-normal text-white/40">
                Unsubscribe any time.
              </p>
            </div>
          </div>

          <p className="w-full text-center text-[10px] font-light leading-[1.4] text-white/60">
            <span className="font-semibold">Proudly servicing</span>{" "}
            Perth metro · Joondalup · Wanneroo · Rockingham · Mandurah · Bunbury
            &amp; the South West
          </p>
        </div>

        <hr className="w-full border-white/20" />

        {/* Legal bar */}
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center justify-center gap-[4px]">
            <CopyrightIcon className="size-[16px] text-white/60" />
            <p className="whitespace-nowrap text-[10px] font-light leading-[1.4] text-white/60">
              2025 Stag Fencing · ABN 00 000 000 000
            </p>
          </div>
          <div className="flex items-center justify-center gap-[20px] text-[10px] font-light leading-[1.4] text-white/60">
            <Link href="/terms" className="transition hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
