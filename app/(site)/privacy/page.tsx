import type { Metadata } from "next";
import type { ReactNode } from "react";

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

/* Small typographic helpers so the long policy stays readable + consistent. */
function P({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-[1.75] text-black/75">{children}</p>;
}
function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-2 text-base font-semibold text-black">{children}</h3>;
}
function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-[8px] pl-[18px]">
      {items.map((item, i) => (
        <li key={i} className="list-disc text-sm leading-[1.7] text-black/75">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Top-level sections — drive both the sticky nav and the content order. */
const NAV = [
  { id: "interpretation", title: "Interpretation and Definitions" },
  { id: "collecting", title: "Collecting and Using Your Personal Data" },
  { id: "use", title: "Use of Your Personal Data" },
  { id: "retention", title: "Retention, Transfer & Deletion" },
  { id: "disclosure", title: "Disclosure of Your Personal Data" },
  { id: "security", title: "Security & Children’s Privacy" },
  { id: "changes", title: "Changes & Contact" },
];

export default async function PrivacyPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHero
        title="Privacy Policy"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy" }]}
        showActions={false}
        phoneHref={settings.phoneHref}
      />

      <section className="w-full bg-white py-12 lg:py-16">
        <Container>
          <p className="mb-8 text-sm text-black/50">
            Last updated: September 12, 2024
          </p>

          <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
            {/* On this page (sticky) */}
            <aside className="lg:w-[240px] lg:shrink-0">
              <div className="lg:sticky lg:top-[120px]">
                <p className="mb-[12px] text-xs font-semibold uppercase tracking-wide text-black/40">
                  On this page
                </p>
                <ul className="flex flex-col gap-[8px]">
                  {NAV.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="text-sm text-black/60 transition-colors hover:text-brand"
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Content */}
            <div className="flex max-w-[760px] flex-1 flex-col gap-[14px]">
              <P>
                This Privacy Policy describes Our policies and procedures on the
                collection, use and disclosure of Your information when You use the
                Service and tells You about Your privacy rights and how the law
                protects You.
              </P>
              <P>
                We use Your Personal data to provide and improve the Service. By
                using the Service, You agree to the collection and use of information
                in accordance with this Privacy Policy.
              </P>

              <section id="interpretation" className="mt-6 flex scroll-mt-[120px] flex-col gap-[12px]">
                <h2 className="text-2xl font-semibold text-black">
                  Interpretation and Definitions
                </h2>
                <H3>Interpretation</H3>
                <P>
                  The words of which the initial letter is capitalized have meanings
                  defined under the following conditions. The following definitions
                  shall have the same meaning regardless of whether they appear in
                  singular or in plural.
                </P>
                <H3>Definitions</H3>
                <P>For the purposes of this Privacy Policy:</P>
                <List
                  items={[
                    <><strong>Account</strong> means a unique account created for You to access our Service or parts of our Service.</>,
                    <><strong>Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party, where “control” means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</>,
                    <><strong>Company</strong> (referred to as either “the Company”, “We”, “Us” or “Our” in this Agreement) refers to Stag Fencing.</>,
                    <><strong>Cookies</strong> are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.</>,
                    <><strong>Country</strong> refers to: Western Australia, Australia.</>,
                    <><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</>,
                    <><strong>Personal Data</strong> is any information that relates to an identified or identifiable individual.</>,
                    <><strong>Service</strong> refers to the Website.</>,
                    <><strong>Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company.</>,
                    <><strong>Usage Data</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself.</>,
                    <><strong>Website</strong> refers to Stag Fencing, accessible from <a href="https://stagfencing.com.au/" className="text-brand hover:underline">https://stagfencing.com.au/</a></>,
                    <><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service.</>,
                  ]}
                />
              </section>

              <section id="collecting" className="mt-6 flex scroll-mt-[120px] flex-col gap-[12px]">
                <h2 className="text-2xl font-semibold text-black">
                  Collecting and Using Your Personal Data
                </h2>
                <H3>Types of Data Collected — Personal Data</H3>
                <P>
                  While using Our Service, We may ask You to provide Us with certain
                  personally identifiable information that can be used to contact or
                  identify You. Personally identifiable information may include, but
                  is not limited to:
                </P>
                <List
                  items={[
                    "Email address",
                    "First name and last name",
                    "Phone number",
                    "Usage Data",
                  ]}
                />
                <H3>Usage Data</H3>
                <P>
                  Usage Data is collected automatically when using the Service. It may
                  include information such as Your Device’s Internet Protocol address
                  (e.g. IP address), browser type, browser version, the pages of our
                  Service that You visit, the time and date of Your visit, the time
                  spent on those pages, unique device identifiers and other diagnostic
                  data.
                </P>
                <H3>Tracking Technologies and Cookies</H3>
                <P>
                  We use Cookies and similar tracking technologies to track the
                  activity on Our Service and store certain information. Technologies
                  used include beacons, tags, and scripts. Cookies can be “Persistent”
                  or “Session” cookies — Persistent Cookies remain on Your device when
                  You go offline, while Session Cookies are deleted as soon as You
                  close Your web browser. We use both Session and Persistent Cookies
                  for essential, notice-acceptance and functionality purposes.
                </P>
              </section>

              <section id="use" className="mt-6 flex scroll-mt-[120px] flex-col gap-[12px]">
                <h2 className="text-2xl font-semibold text-black">
                  Use of Your Personal Data
                </h2>
                <P>The Company may use Personal Data for the following purposes:</P>
                <List
                  items={[
                    "To provide and maintain our Service, including to monitor its usage.",
                    "To manage Your Account and your registration as a user of the Service.",
                    "For the performance of a contract for the products or services You have purchased.",
                    "To contact You by email, phone, SMS or push notifications regarding updates or informative communications.",
                    "To provide You with news, special offers and general information about goods and services similar to those you’ve purchased or enquired about (unless you opt out).",
                    "To manage Your requests to Us.",
                    "For business transfers, data analysis, identifying usage trends, and improving our Service.",
                  ]}
                />
                <P>
                  We may share Your personal information with Service Providers, for
                  business transfers, with Affiliates, with business partners, with
                  other users (where You interact in public areas), or with Your
                  consent.
                </P>
              </section>

              <section id="retention" className="mt-6 flex scroll-mt-[120px] flex-col gap-[12px]">
                <h2 className="text-2xl font-semibold text-black">
                  Retention, Transfer &amp; Deletion
                </h2>
                <P>
                  The Company will retain Your Personal Data only for as long as is
                  necessary for the purposes set out in this Privacy Policy, and to
                  comply with our legal obligations, resolve disputes, and enforce our
                  agreements. Usage Data is generally retained for a shorter period.
                </P>
                <P>
                  Your information may be transferred to — and maintained on —
                  computers located outside of Your jurisdiction where data protection
                  laws may differ. The Company takes all steps reasonably necessary to
                  ensure Your data is treated securely.
                </P>
                <P>
                  You have the right to delete or request that We assist in deleting
                  the Personal Data We have collected about You. You may update, amend
                  or delete Your information at any time by signing in to Your Account
                  or by contacting Us. We may need to retain certain information where
                  we have a legal obligation or lawful basis to do so.
                </P>
              </section>

              <section id="disclosure" className="mt-6 flex scroll-mt-[120px] flex-col gap-[12px]">
                <h2 className="text-2xl font-semibold text-black">
                  Disclosure of Your Personal Data
                </h2>
                <P>
                  If the Company is involved in a merger, acquisition or asset sale,
                  Your Personal Data may be transferred (we will provide notice
                  beforehand). Under certain circumstances, the Company may be required
                  to disclose Your Personal Data if required to do so by law or in
                  response to valid requests by public authorities.
                </P>
                <P>The Company may disclose Your Personal Data in good faith to:</P>
                <List
                  items={[
                    "Comply with a legal obligation",
                    "Protect and defend the rights or property of the Company",
                    "Prevent or investigate possible wrongdoing in connection with the Service",
                    "Protect the personal safety of Users of the Service or the public",
                    "Protect against legal liability",
                  ]}
                />
              </section>

              <section id="security" className="mt-6 flex scroll-mt-[120px] flex-col gap-[12px]">
                <h2 className="text-2xl font-semibold text-black">
                  Security &amp; Children’s Privacy
                </h2>
                <P>
                  The security of Your Personal Data is important to Us, but no method
                  of transmission over the Internet or method of electronic storage is
                  100% secure. While We strive to use commercially acceptable means to
                  protect Your Personal Data, We cannot guarantee its absolute
                  security.
                </P>
                <P>
                  Our Service does not address anyone under the age of 13, and We do
                  not knowingly collect personally identifiable information from anyone
                  under 13. If You are a parent or guardian and aware that Your child
                  has provided Us with Personal Data, please contact Us.
                </P>
              </section>

              <section id="changes" className="mt-6 flex scroll-mt-[120px] flex-col gap-[12px]">
                <h2 className="text-2xl font-semibold text-black">
                  Changes &amp; Contact
                </h2>
                <P>
                  We may update Our Privacy Policy from time to time. We will notify
                  You of any changes by posting the new Privacy Policy on this page and
                  updating the “Last updated” date. Changes are effective when they are
                  posted on this page.
                </P>
                <div className="mt-2 flex flex-col gap-2 rounded-[8px] bg-field p-6">
                  <h3 className="text-base font-semibold text-black">Contact Us</h3>
                  <P>
                    If you have any questions about this Privacy Policy, you can
                    contact us by email at{" "}
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-brand hover:underline"
                    >
                      {settings.email}
                    </a>{" "}
                    or call{" "}
                    <a href={settings.phoneHref} className="text-brand hover:underline">
                      {settings.phoneDisplay}
                    </a>
                    .
                  </P>
                </div>
              </section>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
