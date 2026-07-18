"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/_actions/auth";
import { StagLogo, StagWordmark } from "@/components/icons";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    null
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d0d0d] px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-cool-10">
          <StagLogo className="h-12 w-auto" />
          <StagWordmark className="h-3.5 w-auto" />
        </div>

        <div className="rounded-sm border border-white/10 bg-white p-6 sm:p-8">
          <h1 className="text-lg font-bold text-gray-900">Admin sign in</h1>
          <p className="mt-1 text-sm text-gray-500">
            Staff only. Customers sign in{" "}
            <a href="/login" className="text-brand underline">
              here
            </a>
            .
          </p>

          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>

            {state?.error && (
              <p role="alert" className="text-sm text-brand">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-sm bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-70"
            >
              {pending ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
