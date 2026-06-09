import { NextResponse } from "next/server";
import { requireAiToken } from "@/lib/require-ai-token";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = requireAiToken(req);
  if (!auth.ok) return auth.response;

  const user = await prisma.user.findUnique({
    where: { id: auth.mindUserId },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const limitParam = url.searchParams.get("limit");
  const take = Math.min(parseInt(limitParam ?? "20", 10) || 20, 100);

  const items = await prisma.inboxItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, title: true, body: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ items });
}
