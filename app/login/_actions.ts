"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { requestOtp } from "@/server/services/otp";
import { otpRequestSchema, otpVerifySchema } from "@/lib/validation";

export type OtpState = {
  step: "email" | "code";
  email: string;
  message?: string;
  error?: string;
};

/** Step 1 — email the 6-digit code. */
export async function requestOtpAction(
  _prev: OtpState,
  formData: FormData
): Promise<OtpState> {
  const parsed = otpRequestSchema.safeParse({
    email: String(formData.get("email") ?? ""),
  });
  if (!parsed.success) {
    return { step: "email", email: "", error: "Enter a valid email address." };
  }

  const result = await requestOtp(parsed.data.email);
  if (!result.ok) {
    return { step: "email", email: parsed.data.email, error: result.message };
  }
  return { step: "code", email: parsed.data.email, message: result.message };
}

/** Step 2 — verify the code and sign in. */
export async function verifyOtpAction(
  prev: OtpState,
  formData: FormData
): Promise<OtpState> {
  const parsed = otpVerifySchema.safeParse({
    email: String(formData.get("email") ?? ""),
    code: String(formData.get("code") ?? ""),
  });
  if (!parsed.success) {
    return { ...prev, step: "code", error: "Enter the 6-digit code." };
  }

  try {
    await signIn("email-otp", {
      email: parsed.data.email,
      code: parsed.data.code,
      redirectTo: "/",
    });
    return prev;
  } catch (error) {
    // A successful signIn throws NEXT_REDIRECT — let it bubble.
    if (error instanceof AuthError) {
      return {
        ...prev,
        step: "code",
        error: "That code is invalid or has expired.",
      };
    }
    throw error;
  }
}

export async function oauthSignInAction(formData: FormData) {
  const provider = String(formData.get("provider") ?? "");
  if (provider !== "google" && provider !== "apple") return;
  await signIn(provider, { redirectTo: "/" });
}
