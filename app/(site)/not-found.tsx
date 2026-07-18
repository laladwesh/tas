import Link from "next/link";

import PageHero from "@/app/_components/site/PageHero";
import { Container } from "@/app/_components/site/ui";

export default function NotFound() {
  return (
    <>
      <PageHero
        title="Page not found"
        subtitle="That page has moved or never existed. Let’s get you back on track."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "404" }]}
        showActions={false}
      />

      <section className="w-full bg-white py-16 lg:py-24">
        <Container>
          <div className="flex flex-col items-center gap-6 text-center">
            <p className="text-sm text-black/60">
              Try one of these instead:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { href: "/", label: "Home" },
                { href: "/services", label: "Services" },
                { href: "/shop", label: "Shop" },
                { href: "/calculator", label: "Fence calculator" },
                { href: "/#quote", label: "Get a free quote" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-[48px] border border-cool-20 px-5 py-2 text-sm text-ink transition-colors hover:border-ink"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
