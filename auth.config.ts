import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe slice of the Auth.js config.
 *
 * `middleware.ts` runs on the Edge runtime, where mongoose/bcrypt cannot run.
 * So providers (which touch Mongo) live in `auth.ts`; middleware only uses this
 * DB-free config to read the session cookie and gate routes.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
    // Auth failures (e.g. an OAuth error) land here with ?error=… instead of
    // the raw Auth.js error page.
    error: "/login",
  },
  providers: [], // real providers are added in auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const user = auth?.user as { role?: string } | undefined;
      const isLoggedIn = Boolean(user);
      const isStaff = user?.role === "admin" || user?.role === "editor";

      const { pathname } = nextUrl;
      const isOnLogin = pathname === "/admin/login";
      const isOnAdmin = pathname.startsWith("/admin");

      if (isOnLogin) {
        // Already signed in as staff? Skip the login page.
        if (isLoggedIn && isStaff) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      // Customers (google/apple/otp) must not reach the admin area.
      if (isOnAdmin) return isLoggedIn && isStaff;

      return true;
    },
    // DB-free. auth.ts overrides this with a Mongo-aware version for Node.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "customer";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
