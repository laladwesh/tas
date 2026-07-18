import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Reads the session cookie, so must never be cached.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    const u = session?.user as
      | { name?: string; email?: string; image?: string; role?: string }
      | undefined;
    if (!u) return NextResponse.json({ user: null });

    return NextResponse.json({
      user: {
        name: u.name ?? "",
        email: u.email ?? "",
        image: u.image ?? "",
        role: u.role ?? "customer",
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
