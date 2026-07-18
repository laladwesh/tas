import Link from "next/link";
import { auth } from "@/auth";
import { signOutAction } from "@/app/admin/_actions/auth";
import { StagLogo, StagWordmark } from "@/components/icons";

export const metadata = { title: "Admin" };

// Admin always reflects live DB state — never serve a cached shell.
export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/projects", label: "Gallery" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/hero", label: "Hero slides" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/settings", label: "Site settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // The login page renders inside this layout too; it has no session.
  if (!session?.user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <header className="bg-brand">
        <div className="flex h-16 w-full items-center justify-between px-5 lg:px-8">
          <Link href="/admin" className="flex items-center gap-3 text-cool-10">
            <StagLogo className="h-8 w-auto" />
            <StagWordmark className="hidden h-3 w-auto sm:block" />
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-sm text-white/80 transition hover:text-white"
            >
              View site ↗
            </Link>
            <span className="hidden text-sm text-white/70 sm:inline">
              {session.user.email}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/25"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="w-full px-5 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)]">
          <nav className="lg:sticky lg:top-8 lg:self-start">
            <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white hover:text-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
