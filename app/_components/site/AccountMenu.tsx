"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/login/signout-action";
import { UserIcon } from "@/components/icons";
import SafeImage from "@/components/SafeImage";

type Me = { name: string; email: string; image: string; role: string } | null;

export default function AccountMenu() {
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [me, setMe] = useState<Me>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  // Load session state client-side (keeps pages static). Refresh on navigation.
  useEffect(() => {
    let alive = true;
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setMe(d.user);
        setLoaded(true);
      })
      .catch(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  // Signed out (or still loading) → plain link to the sign-in page.
  if (!loaded || !me) {
    return (
      <Link href="/login" aria-label="Sign in" className="text-ink">
        <UserIcon className="size-[20px]" />
      </Link>
    );
  }

  const initials = (me.name || me.email || "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  const isStaff = me.role === "admin" || me.role === "editor";

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const r = wrapRef.current?.getBoundingClientRect();
    if (r) {
      setCoords({
        top: r.bottom + 12,
        right: Math.max(8, window.innerWidth - r.right),
      });
    }
    setOpen(true);
  };

  return (
    <div ref={wrapRef} className="relative flex items-center">
      <button
        type="button"
        aria-label="Account"
        aria-expanded={open}
        onClick={toggle}
        className="flex size-[28px] items-center justify-center overflow-hidden rounded-full bg-ink text-[11px] font-semibold text-white"
      >
        {me.image ? (
          <SafeImage src={me.image} alt="" width={28} height={28} className="size-full object-cover" />
        ) : (
          initials || "U"
        )}
      </button>

      {open && (
        <div
          style={{ top: coords.top, right: coords.right }}
          className="fixed z-[60] w-[240px] overflow-hidden rounded-[12px] border border-cool-20 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.14)]"
        >
          <div className="border-b border-cool-20 px-[16px] py-[12px]">
            <p className="truncate text-sm font-semibold text-black">
              {me.name || "Signed in"}
            </p>
            <p className="truncate text-xs text-black/50">{me.email}</p>
          </div>

          <div className="flex flex-col p-[6px]">
            {isStaff && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="rounded-[8px] px-[10px] py-[8px] text-sm text-black/80 transition-colors hover:bg-field"
              >
                Admin dashboard
              </Link>
            )}
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="rounded-[8px] px-[10px] py-[8px] text-sm text-black/80 transition-colors hover:bg-field"
            >
              My cart
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full rounded-[8px] px-[10px] py-[8px] text-left text-sm text-brand transition-colors hover:bg-field"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
