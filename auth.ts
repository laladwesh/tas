import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import bcrypt from "bcryptjs";

import { authConfig } from "@/auth.config";
import { connectDB } from "@/server/db/mongoose";
import { User } from "@/server/models";
import { loginSchema, otpVerifySchema } from "@/lib/validation";
import { verifyOtp } from "@/server/services/otp";

/** OAuth providers are only registered when configured, so a missing
 *  client id/secret can't crash sign-in for the other methods. */
export const googleEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);
export const appleEnabled = Boolean(
  process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET
);

const providers: NextAuthConfig["providers"] = [
  /* ---------- Admin: email + password ---------- */
  Credentials({
    id: "credentials",
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;
      const { email, password } = parsed.data;

      await connectDB();
      const user = await User.findOne({ email: email.toLowerCase() }).lean();
      if (!user?.passwordHash) return null;

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return null;

      return {
        id: String(user._id),
        email: user.email,
        name: user.name || user.email,
        role: user.role,
      };
    },
  }),

  /* ---------- Customers: email one-time code ---------- */
  Credentials({
    id: "email-otp",
    name: "Email code",
    credentials: {
      email: { label: "Email", type: "email" },
      code: { label: "Code", type: "text" },
    },
    async authorize(credentials) {
      const parsed = otpVerifySchema.safeParse(credentials);
      if (!parsed.success) return null;
      return await verifyOtp(parsed.data.email, parsed.data.code);
    },
  }),
];

if (googleEnabled) {
  providers.push(
    Google({ allowDangerousEmailAccountLinking: true })
  );
}
if (appleEnabled) {
  providers.push(
    Apple({ allowDangerousEmailAccountLinking: true })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    /**
     * Runs in the Node runtime (route handlers / server components), so Mongo
     * is available here. Middleware uses the DB-free callback in auth.config.ts.
     */
    async jwt({ token, user, account }) {
      if (!user) return token;

      const isOAuth = account?.provider === "google" || account?.provider === "apple";

      if (isOAuth && user.email) {
        await connectDB();
        const doc = await User.findOneAndUpdate(
          { email: user.email.toLowerCase() },
          {
            $setOnInsert: { email: user.email.toLowerCase(), role: "customer" },
            $set: {
              name: user.name ?? "",
              image: user.image ?? "",
              emailVerified: new Date(),
            },
            $addToSet: { providers: account!.provider },
          },
          { upsert: true, returnDocument: "after" }
        );
        token.id = String(doc._id);
        token.role = doc.role;
        return token;
      }

      // Credentials / OTP: authorize() already returned our Mongo user.
      token.id = user.id;
      token.role = (user as { role?: string }).role ?? "customer";
      return token;
    },
  },
});
