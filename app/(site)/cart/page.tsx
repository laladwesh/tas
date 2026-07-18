import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import PageHero from "@/app/_components/site/PageHero";
import { Container } from "@/app/_components/site/ui";
import { getCart } from "@/server/services/cart";
import { getSettings } from "@/server/services/content";
import { formatCents } from "@/lib/money";
import { updateQuantityAction, removeFromCartAction } from "./_actions";

// A cart is per-visitor — never cache it.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const [cart, settings] = await Promise.all([getCart(), getSettings()]);

  return (
    <>
      <PageHero
        title="Your cart"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]}
        showActions={false}
        phoneHref={settings.phoneHref}
      />

      <section className="w-full bg-white py-12 lg:py-16">
        <Container>
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-[16px] text-black/60">Your cart is empty.</p>
              <Link
                href="/shop"
                className="flex h-[44px] items-center rounded-[48px] bg-brand px-6 text-[14px] font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                Browse the shop
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
              {/* Lines */}
              <ul className="flex-1">
                {cart.items.map((line) => (
                  <li
                    key={line.productSlug}
                    className="flex flex-col gap-4 border-b border-black/10 py-5 sm:flex-row sm:items-center"
                  >
                    <Link
                      href={`/shop/${line.productSlug}`}
                      className="relative size-[88px] shrink-0 overflow-hidden rounded-[4px] bg-field"
                    >
                      <Image
                        src={line.image}
                        alt={line.title}
                        fill
                        sizes="88px"
                        className="object-cover"
                      />
                    </Link>

                    <div className="flex-1">
                      <Link
                        href={`/shop/${line.productSlug}`}
                        className="text-[14px] font-semibold leading-[1.4] text-black hover:underline"
                      >
                        {line.title}
                      </Link>
                      <p className="mt-1 text-[12px] text-black/60">
                        {formatCents(line.unitPriceCents)} each
                      </p>
                    </div>

                    {/* Quantity */}
                    <form
                      action={updateQuantityAction}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="slug" value={line.productSlug} />
                      <input
                        name="quantity"
                        type="number"
                        min={0}
                        max={99}
                        defaultValue={line.quantity}
                        aria-label={`Quantity for ${line.title}`}
                        className="h-[36px] w-[68px] rounded-[4px] border border-black/15 bg-field px-2 text-[13px] outline-none focus:border-brand"
                      />
                      <button
                        type="submit"
                        className="h-[36px] rounded-[4px] border border-black/15 px-3 text-[12px] font-medium text-ink transition hover:bg-black/5"
                      >
                        Update
                      </button>
                    </form>

                    <p className="w-[90px] text-right text-[14px] font-semibold text-ink">
                      {formatCents(line.lineTotalCents)}
                    </p>

                    <form action={removeFromCartAction}>
                      <input type="hidden" name="slug" value={line.productSlug} />
                      <button
                        type="submit"
                        className="text-[12px] text-brand hover:underline"
                      >
                        Remove
                      </button>
                    </form>
                  </li>
                ))}
              </ul>

              {/* Summary */}
              <aside className="w-full shrink-0 lg:w-[320px]">
                <div className="flex flex-col gap-3 rounded-[8px] bg-field p-6">
                  <h2 className="text-[16px] font-semibold text-ink">
                    Order summary
                  </h2>

                  <div className="flex justify-between text-[13px] text-black/70">
                    <span>Items</span>
                    <span>{cart.count}</span>
                  </div>
                  <div className="flex justify-between text-[13px] text-black/70">
                    <span>Subtotal</span>
                    <span>{formatCents(cart.subtotalCents)}</span>
                  </div>
                  <div className="flex justify-between text-[13px] text-black/70">
                    <span>Delivery</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-[12px] text-black/50">
                    <span>Includes GST</span>
                    <span>{formatCents(cart.gstCents)}</span>
                  </div>

                  <hr className="my-2 border-black/10" />

                  <div className="flex justify-between text-[16px] font-semibold text-ink">
                    <span>Total</span>
                    <span>{formatCents(cart.totalCents)}</span>
                  </div>

                  <Link
                    href="/checkout"
                    className="mt-3 flex h-[44px] items-center justify-center rounded-[48px] bg-brand text-[14px] font-semibold text-white transition-colors hover:bg-brand-dark"
                  >
                    Proceed to checkout
                  </Link>
                  <Link
                    href="/shop"
                    className="text-center text-[12px] text-black/60 hover:underline"
                  >
                    Continue shopping
                  </Link>
                </div>
              </aside>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
