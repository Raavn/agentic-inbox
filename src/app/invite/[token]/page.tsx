import { signIn } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invite = await prisma.invite.findUnique({ where: { token } });
  const valid = !!invite && !invite.usedAt && invite.expiresAt > new Date();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-lg text-center">
        <h1 className="mb-2 text-2xl font-bold tracking-tight">
          Agentic Inbox
        </h1>
        {valid ? (
          <>
            <p className="mb-6 text-sm text-slate-500">
              You&apos;ve been invited to Agentic Inbox. Sign in with the
              Google account you&apos;d like to use.
            </p>
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/inbox" });
              }}
            >
              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 py-2.5 font-medium text-white shadow-md transition-opacity hover:opacity-90"
              >
                Continue with Google
              </button>
            </form>
          </>
        ) : (
          <p className="text-sm text-red-500">
            This invite link is invalid or has expired.
          </p>
        )}
      </div>
    </div>
  );
}
