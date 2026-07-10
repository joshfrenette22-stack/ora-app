// Fail-closed guard for the cost-bearing admin endpoints (profile backfill /
// import, TTS warm). These drive paid AI + TTS synthesis and database writes,
// so they must never be publicly callable: when BACKFILL_TOKEN is not
// configured the endpoints are disabled outright rather than left open.

import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

/** True when the request carries the admin token (Authorization: Bearer …,
 *  or legacy ?token= for curl convenience). */
export function adminAuthorized(request: NextRequest): boolean {
  const token = process.env.BACKFILL_TOKEN;
  if (!token) return false;
  const header = request.headers.get("authorization");
  const presented = header?.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : request.nextUrl.searchParams.get("token");
  if (!presented) return false;
  const a = Buffer.from(presented);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function adminUnauthorizedResponse(): Response {
  const configured = Boolean(process.env.BACKFILL_TOKEN);
  return Response.json(
    { error: configured ? "unauthorized" : "disabled — set BACKFILL_TOKEN to enable admin endpoints" },
    { status: 401 },
  );
}
