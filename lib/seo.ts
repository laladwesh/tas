import { services } from "@/data/services";
import { faqs } from "@/data/faqs";

/* ===========================================================================
   Central SEO config. Update the TODO fields with the real business details
   for the strongest Perth local-search results.
   =========================================================================== */
export const siteConfig = {
  name: "Stag Fencing",
  url: "https://stagfencing.com.au",
  title: "Stag Fencing Perth | Colorbond, Pool & Slat Fencing Experts",
  description:
    "Perth's trusted fencing contractor — Colorbond, aluminium slat, pool fencing, gates, automation, retaining walls and asbestos fence removal. Built for Perth's sun, sand & salt. Get a free quote.",
  phoneDisplay: "0431703770",
  phoneIntl: "+61431703770",
  email: "quote@stagfencing.com.au",
  ogImage: "/hero1.png",

  // TODO: confirm the real street address, postcode and coordinates.
  address: {
    streetAddress: "", // e.g. "12 Example St, Suburb"
    locality: "Perth",
    region: "WA",
    postalCode: "6000",
    country: "AU",
  },
  // Perth CBD as a placeholder — set to the real business location.
  geo: { latitude: -31.9523, longitude: 115.8613 },

  // TODO: add Facebook / Instagram / Google Business Profile URLs — these
  // strengthen local SEO and entity trust.
  sameAs: [] as string[],

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
};

const abs = (path: string) => `${siteConfig.url}${path}`;
const BUSINESS_ID = `${siteConfig.url}/#business`;

/** LocalBusiness markup — the key driver of Perth local-pack visibility. */
export function businessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": BUSINESS_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    image: abs(siteConfig.ogImage),
    logo: abs("/icon.svg"),
    telephone: siteConfig.phoneIntl,
    email: siteConfig.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      ...(siteConfig.address.streetAddress
        ? { streetAddress: siteConfig.address.streetAddress }
        : {}),
      addressLocality: siteConfig.address.locality,
      addressRegion: siteConfig.address.region,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    areaServed: [
      { "@type": "City", name: "Perth" },
      { "@type": "AdministrativeArea", name: "Western Australia" },
    ],
    // TODO: adjust opening hours to the real ones.
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

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: "en-AU",
    publisher: { "@id": BUSINESS_ID },
  };
}

/** FAQPage markup — can earn expandable FAQ rich results in Google. */
export function faqJsonLd() {
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
