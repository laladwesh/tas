import { googleEnabled, appleEnabled } from "@/auth";
import { oauthSignInAction } from "@/app/login/_actions";
import OtpForm from "@/app/login/OtpForm";
import { StagLogo, StagWordmark } from "@/components/icons";
import { GoogleG } from "@/components/icons";

export const metadata = { title: "Sign in" };

/** Auth.js error codes → friendly copy. */
function errorMessage(code?: string) {
  if (!code) return null;
  switch (code) {
    case "OAuthAccountNotLinked":
      return "That email is already registered with a different sign-in method.";
    case "AccessDenied":
      return "Access denied. Please try a different account.";
    case "Configuration":
    case "OAuthCallbackError":
      return "Sign-in isn’t available right now. Please try again shortly.";
    default:
      return "Sign-in failed. Please try again.";
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const anyOauth = googleEnabled || appleEnabled;
  const message = errorMessage(error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d0d0d] px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-cool-10">
          <StagLogo className="h-12 w-auto" />
          <StagWordmark className="h-3.5 w-auto" />
        </div>

        <div className="rounded-sm bg-white p-6 sm:p-8">
          <h1 className="text-lg font-bold text-gray-900">Sign in</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your quotes and orders.
          </p>

          {message && (
            <p className="mt-4 rounded-sm border border-brand/30 bg-brand/5 px-3 py-2 text-sm text-brand">
              {message}
            </p>
          )}

          {anyOauth && (
            <>
              <div className="mt-6 space-y-3">
                {googleEnabled && (
                  <form action={oauthSignInAction}>
                    <input type="hidden" name="provider" value="google" />
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-3 rounded-sm border border-gray-300 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
                    >
                      <GoogleG className="h-5 w-5" />
                      Continue with Google
                    </button>
                  </form>
                )}

                {appleEnabled && (
                  <form action={oauthSignInAction}>
                    <input type="hidden" name="provider" value="apple" />
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-3 rounded-sm bg-black py-2.5 text-sm font-medium text-white transition hover:bg-gray-900"
                    >
                      <AppleIcon className="h-5 w-5" />
                      Continue with Apple
                    </button>
                  </form>
                )}
              </div>

              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-gray-200" />
                <span className="text-xs uppercase tracking-wide text-gray-400">or</span>
                <span className="h-px flex-1 bg-gray-200" />
              </div>
            </>
          )}

          <div className={anyOauth ? "" : "mt-6"}>
            <OtpForm />
          </div>

          {!anyOauth && (
            <p className="mt-4 text-xs text-gray-400">
              Google and Apple sign-in appear once their keys are set in .env.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.365 1.43c0 1.14-.42 2.2-1.25 3.02-.9.9-1.98 1.42-3.14 1.33-.03-1.06.44-2.16 1.24-2.96.85-.86 2.11-1.4 3.15-1.39zM20.6 17.03c-.55 1.27-.81 1.84-1.52 2.96-.99 1.56-2.39 3.5-4.12 3.51-1.54.01-1.93-1-4.02-.99-2.09.01-2.52 1.01-4.06.99-1.73-.02-3.06-1.77-4.05-3.33C.06 15.8-.2 10.7 2.03 8.36c1.13-1.2 2.7-1.9 4.16-1.9 1.5 0 2.44 1 3.68 1 1.2 0 1.93-1 3.67-1 1.31 0 2.7.72 3.69 1.95-3.24 1.78-2.71 6.4.37 7.62z" />
    </svg>
  );
}
