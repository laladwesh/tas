"use client";

import { useActionState } from "react";
import {
  requestOtpAction,
  verifyOtpAction,
  type OtpState,
} from "@/app/login/_actions";

const inputClass =
  "w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand";

const initial: OtpState = { step: "email", email: "" };

export default function OtpForm() {
  const [emailState, sendCode, sending] = useActionState(requestOtpAction, initial);

  // Once a code has been sent we render the verify form, seeded with that email.
  if (emailState.step === "code") {
    return <VerifyStep initial={emailState} />;
  }

  return (
    <form action={sendCode} className="space-y-3">
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
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      {emailState.error && (
        <p role="alert" className="text-sm text-brand">
          {emailState.error}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-sm bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-70"
      >
        {sending ? "Sending code..." : "Email me a code"}
      </button>
    </form>
  );
}

function VerifyStep({ initial }: { initial: OtpState }) {
  const [state, verify, verifying] = useActionState(verifyOtpAction, initial);

  return (
    <form action={verify} className="space-y-3">
      <input type="hidden" name="email" value={state.email} />

      <div>
        <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-gray-700">
          6-digit code
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          placeholder="123456"
          className={`${inputClass} tracking-[0.4em]`}
        />
        <p className="mt-1.5 text-xs text-gray-500">
          Sent to <span className="font-medium text-gray-700">{state.email}</span>. Expires in 10 minutes.
        </p>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-brand">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={verifying}
        className="w-full rounded-sm bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-70"
      >
        {verifying ? "Verifying..." : "Verify & sign in"}
      </button>
    </form>
  );
}
