import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const invite = await prisma.invite.findUnique({ where: { token } });

  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Invite link is invalid or expired" },
      { status: 400 },
    );
  }

  const body = await req.json() as {
    email?: string;
    fullName?: string;
    password?: string;
  };

  const { email, fullName, password } = body;

  if (!email?.trim() || !fullName?.trim() || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Email, full name, and password (min 8 chars) are required" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.trim() },
  });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.create({
      data: {
        email: email.trim(),
        fullName: fullName.trim(),
        passwordHash,
        accountType: invite.accountType,
        isAdmin: false,
      },
    }),
    prisma.invite.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ success: true }, { status: 201 });
}
