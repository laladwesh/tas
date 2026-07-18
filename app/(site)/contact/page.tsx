import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/app/_components/site/PageHero";
import HeroQuoteForm from "@/app/_components/site/HeroQuoteForm";
import { Container } from "@/app/_components/site/ui";
import {
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneCallIcon,
} from "@/components/icons";
import { getServices, getSettings } from "@/server/services/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Stag Fencing — free measure and quote across Perth. Call, email, or send us your job details.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);

  const details = [
    {
      Icon: PhoneCallIcon,
      label: "Phone",
      value: settings.phoneDisplay,
      href: settings.phoneHref,
    },
    {
      Icon: MailIcon,
      label: "Email",
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
    {
      Icon: MapPinIcon,
      label: "Workshop",
      value: "8 Mumford Place, Balcatta WA 6021",
    },
    {
      Icon: ClockIcon,
      label: "Hours",
      value: "Mon–Fri 7:30am – 3:00pm",
    },
  ];

  return (
    <>
      <PageHero
        title="Get in touch"
        subtitle="Free on-site measure and a clear written quote, usually within a couple of days."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        showActions={false}
        phoneHref={settings.phoneHref}
      />

      <section className="w-full bg-white py-12 lg:py-16">
        <Container>
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
            {/* Details */}
            <div className="w-full lg:w-[320px]">
              <h2 className="mb-6 text-[20px] font-semibold text-ink">
                Contact details
              </h2>

              <ul className="flex flex-col gap-5">
                {details.map(({ Icon, label, value, href }) => (
                  <li key={label} className="flex items-start gap-3">
                    <span className="flex size-[36px] shrink-0 items-center justify-center rounded-[6px] bg-brand/10">
                      <Icon className="size-[18px] text-brand" />
                    </span>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-black/50">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          className="text-[14px] font-medium text-ink hover:text-brand"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-[14px] font-medium text-ink">{value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-[8px] bg-field p-5">
                <p className="text-[13px] font-semibold text-ink">
                  Want a number right now?
                </p>
                <p className="mt-1 text-[12px] leading-[1.6] text-black/60">
                  The calculator gives you an instant Perth-metro estimate.
                </p>
                <Link
                  href="/calculator"
                  className="mt-3 inline-flex h-[38px] items-center rounded-[48px] bg-ink px-4 text-[12px] font-medium text-white transition hover:opacity-90"
                >
                  Open the calculator
                </Link>
              </div>
            </div>

            {/* Quote form — reuses the same component as the home hero */}
            <div className="flex-1">
              <h2 className="mb-6 text-[20px] font-semibold text-ink">
                Request a free quote
              </h2>
              <HeroQuoteForm services={services.map((s) => s.title)} />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
