import { PhoneIcon, StagLogo, StagWordmark } from "@/components/icons";

type Props = {
  phoneDisplay: string;
  phoneHref: string;
};

export default function Navbar({ phoneDisplay, phoneHref }: Props) {
  return (
    <header className="w-full bg-brand text-white">
      <div className="flex h-18 w-full items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 sm:gap-3">
          <StagLogo className="h-9 w-auto shrink-0 sm:h-11" />
          <StagWordmark className="h-3 w-auto sm:h-3.5" />
        </a>

        {/* Phone */}
        <a
          href={phoneHref}
          className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/25"
        >
          <PhoneIcon className="h-4 w-4" />
          <span>{phoneDisplay}</span>
        </a>
      </div>
    </header>
  );
}
