import { NextResponse } from "next/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type RequireAiResult =
  | { ok: true; mindUserId: string }
  | { ok: false; response: NextResponse };

export function requireAiToken(req: Request): RequireAiResult {
  const expected = process.env.AIMEKO_TOKEN;
  if (!expected) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "AIMEKO_TOKEN not configured on server" },
        { status: 500 },
      ),
    };
  }

  const presented = req.headers.get("x-ai-token");
  if (!presented || presented !== expected) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const mindUserId = req.headers.get("x-ai-user-id");
  if (!mindUserId || !UUID_RE.test(mindUserId)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Missing or invalid x-ai-user-id header" },
        { status: 400 },
      ),
    };
  }

  return { ok: true, mindUserId };
}
