import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/app/_components/site/PageHero";
import { Container } from "@/app/_components/site/ui";
import { getSettings } from "@/server/services/content";
import { connectDB } from "@/server/db/mongoose";
import { Order } from "@/server/models";
import { clearCart } from "@/server/services/cart";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order received",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const [{ order: orderNumber }, settings] = await Promise.all([
    searchParams,
    getSettings(),
  ]);

  let paid = false;
  let totalCents = 0;

  if (orderNumber) {
    try {
      await connectDB();
      const order = await Order.findOne({ orderNumber }).lean();
      if (order) {
        paid = order.paymentStatus === "paid";
        totalCents = order.totalCents;

        // The order exists, so it's safe to empty the cart. (With Stripe we
        // deliberately keep the cart until the shopper actually gets here —
        // an abandoned checkout must not wipe it.)
        await clearCart();
      }
    } catch (error) {
      console.error("[checkout/success] lookup failed:", error);
    }
  }

  return (
    <>
      <PageHero
        title="Order received"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Order" }]}
        showActions={false}
        phoneHref={settings.phoneHref}
      />

      <section className="w-full bg-white py-16 lg:py-24">
        <Container>
          <div className="mx-auto flex max-w-[560px] flex-col items-center gap-5 text-center">
            <span className="flex size-[56px] items-center justify-center rounded-full bg-brand/10 text-[24px] text-brand">
              ✓
            </span>

            <h2 className="text-[26px] font-semibold text-ink">
              Thanks — we&rsquo;ve got your order.
            </h2>

            {orderNumber && (
              <p className="text-[14px] text-black/70">
                Your order number is{" "}
                <span className="font-semibold text-ink">{orderNumber}</span>
                {totalCents > 0 && (
                  <>
                    {" "}
                    · <span className="font-semibold text-ink">
                      {formatCents(totalCents)}
                    </span>
                  </>
                )}
                . We&rsquo;ve emailed you a confirmation.
              </p>
            )}

            <p className="text-[14px] leading-[1.6] text-black/70">
              {paid
                ? "Payment received. We'll be in touch shortly to arrange delivery or pickup."
                : "We'll be in touch shortly to arrange payment and delivery or pickup."}{" "}
              If you need anything sooner, call us on{" "}
              <a href={settings.phoneHref} className="text-brand hover:underline">
                {settings.phoneDisplay}
              </a>
              .
            </p>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/shop"
                className="flex h-[44px] items-center rounded-[48px] bg-brand px-6 text-[14px] font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                Keep shopping
              </Link>
              <Link
                href="/"
                className="flex h-[44px] items-center rounded-[48px] border border-ink px-6 text-[14px] font-medium text-ink transition hover:bg-ink hover:text-white"
              >
                Back home
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
