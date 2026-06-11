import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

const publicPaths = ["/auth", "/invite"];
const exemptPaths = ["/_next", "/favicon.ico", "/api/auth", "/api/ai"];

export default auth(function middleware(req) {
  const pathname = (req as NextRequest).nextUrl.pathname;

  if (exemptPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const session = req.auth;

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    if (session?.user?.id) {
      return NextResponse.redirect(
        new URL("/inbox", (req as NextRequest).url),
      );
    }
    return NextResponse.next();
  }

  if (!session?.user?.id) {
    return NextResponse.redirect(
      new URL("/auth/signin", (req as NextRequest).url),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
