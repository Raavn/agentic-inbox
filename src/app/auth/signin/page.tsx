import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { getAuthErrorMessage } from "@/lib/auth-helpers";

interface SignInPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = (await searchParams) ?? {};
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : "/inbox";
  const errorCode = typeof params.error === "string" ? params.error : undefined;

  const session = await auth();
  if (session?.user?.id) {
    redirect(callbackUrl);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-lg text-center">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">
          Agentic Inbox
        </h1>
        {errorCode && (
          <p role="alert" className="mb-4 text-sm text-red-500">
            {getAuthErrorMessage(errorCode)}
          </p>
        )}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: callbackUrl });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 py-2.5 font-medium text-white shadow-md transition-opacity hover:opacity-90"
          >
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}
