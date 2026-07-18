"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export type LoginState = { error: string } | null;

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/admin",
    });
    return null;
  } catch (error) {
    // signIn throws a NEXT_REDIRECT on success — it must bubble up.
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
