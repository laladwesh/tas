/**
 * Shown instantly while the next route's server component renders, so clicking
 * a nav link gives immediate feedback instead of feeling stuck. The header and
 * footer live in the layout and stay put; only this fills the content area.
 * The spacer keeps the footer from jumping up during the brief load.
 */
export default function SiteLoading() {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden bg-transparent">
        <div className="h-full w-1/3 animate-[loadbar_1.1s_ease-in-out_infinite] rounded-full bg-brand" />
      </div>
      <div className="min-h-[75vh]" aria-hidden />
    </>
  );
}
