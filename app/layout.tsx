import type { Metadata } from "next";
import { Manrope, Roboto } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/seo";
import { getSettings } from "@/server/services/content";

/* Figma uses Manrope for everything except a few small "Body/XS" Roboto bits. */
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--ff-manrope",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--ff-roboto",
  display: "swap",
});

/** Title/description are editable in Admin → Site settings.
 *  getSettings() falls back to defaults if Mongo is unavailable. */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: settings.seoTitle,
      template: "%s | Stag Fencing Perth",
    },
    description: settings.seoDescription,
    applicationName: siteConfig.name,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "Home Improvement",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "en_AU",
      url: siteConfig.url,
      siteName: siteConfig.name,
      title: settings.seoTitle,
      description: settings.seoDescription,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 800,
          alt: "Stag Fencing — Perth fencing specialists",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seoTitle,
      description: settings.seoDescription,
      images: [siteConfig.ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className="scroll-smooth" suppressHydrationWarning>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla adds
          cz-shortcut-listen, Grammarly adds data-gr-*) inject attributes on
          <body> before React hydrates, causing a harmless mismatch warning. */}
      <body
        className={`${manrope.variable} ${roboto.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
