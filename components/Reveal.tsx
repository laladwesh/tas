"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fades + lifts its children in the first time they scroll into view.
 * Falls back to "always visible" when the browser has no IntersectionObserver
 * or the user prefers reduced motion — so content is never hidden.
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  /** ms — stagger sibling reveals. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect(); // reveal once, never re-hide
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : "0ms" }}
      className={`transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100 ${
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
