import type { ReactNode } from "react";

/**
 * Animates open/closed to the content's natural height.
 *
 * Uses the CSS grid `0fr -> 1fr` trick rather than max-height: it animates to
 * the real height (no guessing a max), and stays smooth for any content size.
 */
export default function Collapse({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
