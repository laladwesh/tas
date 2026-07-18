import type { Metadata } from "next";

import PageHero from "@/app/_components/site/PageHero";
import { Container } from "@/app/_components/site/ui";
import { getSettings } from "@/server/services/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that apply to quotes, work and orders with Stag Fencing.",
  alternates: { canonical: "/terms" },
};

const sections = [
  {
    heading: "Quotes",
    body: "Quotes are valid for 30 days and are based on the information and site conditions known at the time. If conditions change materially once work begins — rock, services, or an unexpected structure — we'll stop, tell you, and agree any variation in writing before continuing.",
  },
  {
    heading: "Deposits and payment",
    body: "A deposit may be required to lock in materials and a start date. The balance is due on completion unless agreed otherwise in writing.",
  },
  {
    heading: "Dividing fences",
    body: "Where the fence is a dividing fence, cost sharing between neighbours is a matter between the property owners under the Dividing Fences Act. We invoice the person who engaged us.",
  },
  {
    heading: "Workmanship warranty",
    body: "Our installations carry a 10 year workmanship warranty. Materials are covered by the manufacturer's warranty. The warranty doesn't cover damage from storms, impact, ground movement, or third-party alterations.",
  },
  {
    heading: "Shop orders",
    body: "Product prices include GST. Stock is subject to availability. Pickup is from Balcatta; delivery is available across Perth metro and charged at checkout.",
  },
  {
    heading: "Returns",
    body: "Unused stock in original condition can be returned within 14 days. Custom-cut or made-to-order items can't be returned unless faulty.",
  },
  {
    heading: "Calculator estimates",
    body: "The fence calculator gives an indicative estimate only. It is not a formal offer and does not create a contract. Your final price is confirmed after a site measure.",
  },
];

export default async function TermsPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHero
        title="Terms & conditions"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Terms" }]}
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
          </div>
        </Container>
      </section>
    </>
  );
}
