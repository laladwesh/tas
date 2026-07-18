"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces in the server logs / browser console for debugging.
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[70vh] w-full items-center justify-center bg-white px-5 pt-[120px]">
      <div className="flex max-w-[440px] flex-col items-center gap-4 text-center">
        <span className="text-4xl">⚠️</span>
        <h1 className="text-2xl font-semibold text-black">Something went wrong</h1>
        <p className="text-sm leading-[1.6] text-black/60">
          A hiccup on our end — it’s been logged. Try again, or head back home.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-[48px] bg-ink px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-[48px] border border-cool-20 px-6 py-2.5 text-sm text-ink transition-colors hover:border-ink"
          >
            Go home
          </Link>
        </div>
      </div>
    </section>
  );
}
