import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import PageHero from "@/app/_components/site/PageHero";
import { Container } from "@/app/_components/site/ui";
import CheckoutForm from "./CheckoutForm";
import { getCart } from "@/server/services/cart";
import { getSettings } from "@/server/services/content";
import { deliveryFeeCents } from "@/server/services/orders";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [cart, settings] = await Promise.all([getCart(), getSettings()]);

  // Nothing to check out — send them back to the cart.
  if (cart.items.length === 0) redirect("/cart");

  const shippingCents = deliveryFeeCents(cart.subtotalCents, "delivery");
  const totalCents = cart.subtotalCents + shippingCents;

  return (
    <>
      <PageHero
        title="Checkout"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
        showActions={false}
        phoneHref={settings.phoneHref}
      />

      <section className="w-full bg-white py-12 lg:py-16">
        <Container>
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
            {/* Details */}
            <div className="flex-1">
              <h2 className="mb-6 text-[20px] font-semibold text-ink">
                Your details
              </h2>
              <CheckoutForm />
            </div>

            {/* Summary */}
            <aside className="w-full shrink-0 lg:w-[360px]">
              <div className="flex flex-col gap-4 rounded-[8px] bg-field p-6">
                <h2 className="text-[16px] font-semibold text-ink">
                  Order summary
                </h2>

                <ul className="flex flex-col gap-3">
                  {cart.items.map((line) => (
                    <li key={line.productSlug} className="flex items-center gap-3">
                      <span className="relative size-[48px] shrink-0 overflow-hidden rounded-[4px] bg-white">
                        <Image
                          src={line.image}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </span>
                      <span className="flex-1 text-[12px] leading-[1.4] text-black/80">
                        {line.title}
                        <span className="block text-black/50">
                          Qty {line.quantity}
                        </span>
                      </span>
                      <span className="text-[13px] font-semibold text-ink">
                        {formatCents(line.lineTotalCents)}
                      </span>
                    </li>
                  ))}
                </ul>

                <hr className="border-black/10" />

                <div className="flex justify-between text-[13px] text-black/70">
                  <span>Subtotal</span>
                  <span>{formatCents(cart.subtotalCents)}</span>
                </div>
                <div className="flex justify-between text-[13px] text-black/70">
                  <span>Delivery</span>
                  <span>
                    {shippingCents === 0 ? "Free" : formatCents(shippingCents)}
                  </span>
                </div>
                <div className="flex justify-between text-[12px] text-black/50">
                  <span>Includes GST</span>
                  <span>{formatCents(cart.gstCents)}</span>
                </div>

                <hr className="border-black/10" />

                <div className="flex justify-between text-[16px] font-semibold text-ink">
                  <span>Total</span>
                  <span>{formatCents(totalCents)}</span>
                </div>

                <p className="text-[11px] text-black/50">
                  Choosing pickup removes the delivery fee.
                </p>

                <Link
                  href="/cart"
                  className="text-center text-[12px] text-black/60 hover:underline"
                >
                  Edit cart
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
