import type { Metadata } from "next";

import PageHero from "@/app/_components/site/PageHero";
import { Container } from "@/app/_components/site/ui";
import Calculator from "./Calculator";
import { getSettings } from "@/server/services/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Fence Cost Calculator Perth",
  description:
    "Work out what your fence will cost in Perth. Pick the type, height and length, add gates and extras, and get an instant estimate — no forms, no waiting.",
  alternates: { canonical: "/calculator" },
};

/** Service slug (from a "Calculate your fence cost" link) → calculator fence id. */
const SERVICE_TO_FENCE: Record<string, string> = {
  "colorbond-fencing": "colorbond-privacy",
  "slat-fencing": "slat-privacy",
  "timber-fencing": "timber-privacy",
  "pool-fencing": "tubular-pool",
  "security-fencing": "security-steel",
};

export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; type?: string }>;
}) {
  const { service = "", type = "" } = await searchParams;
  const settings = await getSettings();

  // Accept either an explicit ?type=<fenceId> or ?service=<slug>.
  const initialFenceId = type || SERVICE_TO_FENCE[service] || undefined;

  return (
    <>
      <PageHero
        title="Fence Calculator"
        subtitle="Your local experts in durable fencing and construction solutions."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Fence Calculator" },
        ]}
        phoneHref={settings.phoneHref}
      />

      <section className="w-full bg-white py-12 lg:py-16">
        <Container>
          <div className="mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-[26px] font-semibold text-black sm:text-[32px]">
                Build your fencing estimate
              </h2>
              <p className="mt-1 max-w-[560px] text-[13px] leading-[1.6] text-black/60">
                Pick a fence, set the run, and see a live Perth-metro price. Change
                anything and it recalculates instantly — no form, no waiting.
              </p>
            </div>

            <span className="rounded-[20px] border border-black/15 px-3 py-1 text-[11px] font-medium text-black/60">
              Instant estimate · incl. Tax
            </span>
          </div>

          <Calculator initialFenceId={initialFenceId} />
        </Container>
      </section>
    </>
  );
}
