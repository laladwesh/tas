export default function Footer({ text }: { text: string }) {
  return (
    <footer className="w-full bg-[#0d0d0d]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="py-16 lg:py-20">
          <p className="max-w-[260px] text-sm leading-relaxed text-gray-300">
            {text}
          </p>
        </div>
      </div>

      {/* Brand-red strip along the very bottom */}
      <div className="h-2.5 w-full bg-brand" />
    </footer>
  );
}
