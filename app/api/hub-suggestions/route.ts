import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getHubSuggestions } from "@/lib/hub-suggestions";

export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const secret = process.env.HUB_SUGGESTIONS_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getHubSuggestions());
}
