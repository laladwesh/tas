"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBox from "./SearchOverlay";
import AccountMenu from "./AccountMenu";
import {
  ArrowUpRightIcon,
  MailIcon,
  PhoneCallIcon,
  ShoppingCartIcon,
  StagLogo,
  StagWordmark,
} from "@/components/icons";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Shop", href: "/shop" },
  { label: "Calculator", href: "/calculator" },
  { label: "Gallery", href: "/gallery" },
  { label: "About us", href: "/about" },
  { label: "Resources", href: "/articles" },
];

type Props = {
  phoneDisplay: string;
  phoneHref: string;
  email: string;
  cartCount?: number;
};

export default function SiteHeader({
  phoneDisplay,
  phoneHref,
  email,
  cartCount = 0,
}: Props) {
  const pathname = usePathname();

  // Cart badge is per-user, so it's loaded client-side (keeps pages static).
  // Re-fetch on navigation so it updates after add-to-cart redirects here.
  const [count, setCount] = useState(cartCount);
  useEffect(() => {
    let alive = true;
    fetch("/api/cart/count")
      .then((r) => r.json())
      .then((d) => alive && setCount(d.count ?? 0))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [pathname]);

  /** Longest matching nav href wins, so /services/colorbond marks "Services". */
  const active = navLinks
    .filter((link) =>
      link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.label;

  return (
    <header className="mx-auto flex w-full flex-col gap-[10px] px-5 py-[10px] sm:px-8 lg:px-12 xl:px-20">
      {/* Utility strip — sits directly on the hero photo */}
      <div className="hidden items-center justify-between px-[32px] lg:flex">
        <p className="text-shadow-hero text-[12px] font-medium tracking-[0.5px] text-white">
          Looking for fencing experts in perth? We&rsquo;re just a call away!
        </p>

        <div className="flex items-center gap-[16px]">
          <a href={phoneHref} className="flex items-center gap-[4px]">
            <PhoneCallIcon className="size-[20px] text-white" />
            <span className="text-shadow-hero text-[12px] font-medium tracking-[0.5px] text-white">
              {phoneDisplay}
            </span>
          </a>
          <a href={`mailto:${email}`} className="flex items-center gap-[4px]">
            <MailIcon className="size-[20px] text-white" />
            <span className="text-shadow-hero text-[12px] font-medium tracking-[0.5px] text-white">
              {email}
            </span>
          </a>
        </div>
      </div>

      {/* Floating pill nav */}
      <nav className="flex h-[60px] w-full items-center justify-between overflow-hidden rounded-[60px] bg-cool-10 px-[10px]">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center text-brand">
          <StagLogo className="size-[60px] shrink-0" />
          <StagWordmark className="hidden h-[10px] w-[129.83px] sm:block" />
        </Link>

        {/* Links */}
        <ul className="hidden items-start justify-center gap-[16px] pb-[7px] pt-[12px] lg:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="flex flex-col items-center justify-center gap-[2px]"
              >
                <span className="text-[14px] leading-none text-black">
                  {link.label}
                </span>
                {active === link.label && (
                  <span className="h-[3px] w-[12px] rounded-[5px] bg-black" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex shrink-0 items-center justify-end gap-[16px]">
          <div className="hidden items-center gap-[8px] text-ink sm:flex">
            <SearchBox />
            <Link href="/cart" aria-label="Cart" className="relative">
              <ShoppingCartIcon className="size-[20px]" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex size-[16px] items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
            <AccountMenu />
          </div>

          <Link
            href="#quote"
            className="flex items-center gap-[6px] overflow-hidden rounded-[48px] bg-ink py-[4px] pl-[16px] pr-[4px]"
          >
            <span className="whitespace-nowrap text-[14px] leading-none tracking-[0.5px] text-white">
              Get My Free Quote
            </span>
            <span className="flex size-[36px] shrink-0 items-center justify-center rounded-[40px] bg-white">
              <ArrowUpRightIcon className="size-[20px] text-ink" />
            </span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
