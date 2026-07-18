import { SITE_URL } from "@/lib/env";
import type { ServiceDTO, FaqDTO, SiteSettings } from "@/server/services/content";

/* Static, non-editable config. Everything else now comes from Site settings
   in the admin (see server/services/content.ts). */
export const siteConfig = {
  name: "Stag Fencing",
  url: SITE_URL,
  ogImage: "/hero1.png",
  keywords: [
    "fencing Perth",
    "Perth fencing contractor",
    "fencing contractors Perth",
    "Colorbond fencing Perth",
    "pool fencing Perth",
    "aluminium slat fencing Perth",
    "retaining walls Perth",
    "gates and automation Perth",
    "asbestos fence removal Perth",
    "fence installation Perth",
    "fencing company Perth",
  ],
  // TODO: add Facebook / Instagram / Google Business Profile URLs.
  sameAs: [] as string[],
};

const abs = (path: string) => `${siteConfig.url}${path}`;
const BUSINESS_ID = `${siteConfig.url}/#business`;

/** Normalises "0431703770" -> "+61431703770" for schema.org. */
function toIntlPhone(display: string) {
  const digits = display.replace(/\D/g, "");
  if (digits.startsWith("0")) return `+61${digits.slice(1)}`;
  if (digits.startsWith("61")) return `+${digits}`;
  return display;
}

/** LocalBusiness markup — the key driver of Perth local-pack visibility. */
export function businessJsonLd(services: ServiceDTO[], settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": BUSINESS_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    image: abs(siteConfig.ogImage),
    logo: abs("/icon.svg"),
    telephone: toIntlPhone(settings.phoneDisplay),
    email: settings.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      ...(settings.addressStreet ? { streetAddress: settings.addressStreet } : {}),
      addressLocality: settings.addressLocality,
      addressRegion: settings.addressRegion,
      postalCode: settings.addressPostalCode,
      addressCountry: settings.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: settings.geoLat,
      longitude: settings.geoLng,
    },
    areaServed: [
      { "@type": "City", name: "Perth" },
      { "@type": "AdministrativeArea", name: "Western Australia" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "07:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "08:00",
        closes: "14:00",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Fencing Services in Perth",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.title,
          areaServed: "Perth, Western Australia",
          provider: { "@id": BUSINESS_ID },
        },
      })),
    },
    ...(siteConfig.sameAs.length ? { sameAs: siteConfig.sameAs } : {}),
  };
}

export function websiteJsonLd(settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: settings.seoDescription,
    inLanguage: "en-AU",
    publisher: { "@id": BUSINESS_ID },
  };
}

/** FAQPage markup — can earn expandable FAQ rich results in Google. */
export function faqJsonLd(faqs: FaqDTO[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
