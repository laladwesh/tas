import SiteHeader from "@/app/_components/site/SiteHeader";
import SiteFooter from "@/app/_components/site/SiteFooter";
import { getSettings } from "@/server/services/content";

/**
 * Shared chrome for every public page.
 *
 * The header is absolutely positioned so it floats over each page's hero
 * image (that's how every screen is drawn in Figma). Pages therefore start
 * with a <PageHero /> that reserves the top padding.
 *
 * NOTE: this layout must NOT read the cart cookie — that would force every
 * page dynamic and break the ISR/static pages (DYNAMIC_SERVER_USAGE). The cart
 * badge is loaded client-side in SiteHeader via /api/cart/count instead.
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <div className="min-h-screen bg-white">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 z-20">
          <SiteHeader
            phoneDisplay={settings.phoneDisplay}
            phoneHref={settings.phoneHref}
            email={settings.email}
          />
        </div>
        {children}
      </div>

      <SiteFooter
        phoneDisplay={settings.phoneDisplay}
        phoneHref={settings.phoneHref}
      />
    </div>
  );
}
