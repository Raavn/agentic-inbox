import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

const useSecureCookies = process.env.NODE_ENV === "production";
const cookieDomain = process.env.AUTH_COOKIE_DOMAIN;
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        domain: cookieDomain,
      },
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user.email) return false;

      const email = user.email.toLowerCase();
      let dbUser = await prisma.user.findUnique({ where: { email } });

      if (!dbUser) {
        const invite = await prisma.invite.findFirst({
          where: {
            usedAt: null,
            expiresAt: { gt: new Date() },
            OR: [{ email: null }, { email }],
          },
        });

        if (!invite) return "/auth/error?error=AccessDenied";

        dbUser = await prisma.$transaction(async (tx) => {
          const created = await tx.user.create({
            data: {
              email,
              fullName: user.name ?? email,
              accountType: invite.accountType,
              isAdmin: false,
            },
          });
          await tx.invite.update({
            where: { id: invite.id },
            data: { usedAt: new Date() },
          });
          return created;
        });
      }

      (user as { id?: string; isAdmin?: boolean }).id = dbUser.id;
      (user as { id?: string; isAdmin?: boolean }).isAdmin = dbUser.isAdmin;

      return true;
    },
  },
});
