import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (!dbUser?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as { accountType?: string; email?: string };
  const accountType = body.accountType === "Company" ? "Company" : "Founder";

  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invite = await prisma.invite.create({
    data: {
      token,
      email: body.email?.trim() || null,
      accountType,
      createdById: session.user.id,
      expiresAt,
    },
  });

  const appUrl = process.env.APP_URL ?? "";
  const inviteUrl = `${appUrl}/invite/${invite.token}`;

  return NextResponse.json({ inviteUrl, expiresAt }, { status: 201 });
}
