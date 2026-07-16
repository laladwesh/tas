import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe: authConfig has no DB access. Protects /admin/* via `authorized`.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
