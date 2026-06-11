import Link from "next/link";
import { getAuthErrorMessage } from "@/lib/auth-helpers";

interface AuthErrorPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = (await searchParams) ?? {};
  const errorCode = typeof params.error === "string" ? params.error : undefined;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-lg text-center">
        <h1 className="mb-4 text-2xl font-bold tracking-tight">
          Sign-in error
        </h1>
        <p className="mb-6 text-sm text-red-500">
          {getAuthErrorMessage(errorCode)}
        </p>
        <Link
          href="/auth/signin"
          className="inline-block rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-2.5 font-medium text-white shadow-md transition-opacity hover:opacity-90"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
