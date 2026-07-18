import type { Metadata } from "next";

import PageHero from "@/app/_components/site/PageHero";
import { Container } from "@/app/_components/site/ui";
import { getSettings } from "@/server/services/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Stag Fencing collects, uses and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    heading: "What we collect",
    body: "When you request a quote, use the calculator or place an order, we collect the details you give us — your name, email, phone number, address and any notes about the job. We also collect basic analytics about how the site is used.",
  },
  {
    heading: "Why we collect it",
    body: "We use your details to prepare your quote, carry out the work, process orders, and contact you about your job. We don't sell your information, and we don't share it with anyone except the suppliers and contractors needed to complete your work.",
  },
  {
    heading: "How we store it",
    body: "Your information is stored on secure servers. Payment details are handled by our payment provider and are never stored on our systems.",
  },
  {
    heading: "Marketing",
    body: "If you subscribe to our newsletter we'll send occasional seasonal offers and fencing tips. You can unsubscribe at any time using the link in any email.",
  },
  {
    heading: "Cookies",
    body: "We use cookies to keep you signed in, remember what's in your cart, and understand how the site is used. You can disable cookies in your browser, though some parts of the site may not work properly.",
  },
  {
    heading: "Access and correction",
    body: "You can ask us for a copy of the personal information we hold about you, or ask us to correct or delete it. Contact us and we'll action it.",
  },
];

export default async function PrivacyPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHero
        title="Privacy policy"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy" }]}
        showActions={false}
        phoneHref={settings.phoneHref}
      />

      <section className="w-full bg-white py-12 lg:py-16">
        <Container>
          <div className="mx-auto flex max-w-[760px] flex-col gap-8">
            <p className="text-[13px] text-black/50">
              Last updated: 1 January 2025
            </p>

            {sections.map((section) => (
              <div key={section.heading} className="flex flex-col gap-2">
                <h2 className="text-[20px] font-semibold text-ink">
                  {section.heading}
                </h2>
                <p className="text-[14px] leading-[1.75] text-black/75">
                  {section.body}
                </p>
              </div>
            ))}

            <div className="flex flex-col gap-2 rounded-[8px] bg-field p-6">
              <h2 className="text-[16px] font-semibold text-ink">Contact us</h2>
              <p className="text-[14px] leading-[1.7] text-black/75">
                Questions about your privacy? Email{" "}
                <a
                  href={`mailto:${settings.email}`}
                  className="text-brand hover:underline"
                >
                  {settings.email}
                </a>{" "}
                or call{" "}
                <a
                  href={settings.phoneHref}
                  className="text-brand hover:underline"
                >
                  {settings.phoneDisplay}
                </a>
                .
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
