import { type NextRequest } from "next/server";
import { liturgicalForDate } from "@/lib/calendar";
import { allCuratedSaints, saintExtras } from "@/lib/saints";
import { supabase } from "@/lib/supabase";
import { generateSaintProfile, aiEnabled, saintSlug, type SaintProfile } from "@/lib/saintProfile";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Pre-generate ("pull") saint-of-the-day profiles with Claude and store them, so
// every page is ready before anyone visits. Generates a small batch per call
// (web search is slow); call repeatedly until `remaining` is 0.
//
//   GET /api/saint-profile/backfill?limit=4
//
// Guard: if BACKFILL_TOKEN is set, require ?token= to match.

async function persist(p: SaintProfile): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("upsert_saint_profile", {
      p_slug: p.slug, p_name: p.name, p_feast_day: p.feastDay,
      p_canonization: p.canonization, p_history: p.history,
      p_contributions: p.contributions, p_patronage: p.patronage,
      p_feast_engagement: p.feastEngagement, p_summary: p.summary, p_sources: p.sources,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const token = process.env.BACKFILL_TOKEN;
  if (token && request.nextUrl.searchParams.get("token") !== token) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!aiEnabled()) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 400 });
  }

  const limit = Math.min(8, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 4));

  // Which slugs are already stored?
  let existing = new Set<string>();
  try {
    const { data } = await supabase.from("saint_profiles").select("slug");
    if (data) existing = new Set((data as { slug: string }[]).map((r) => r.slug));
  } catch { /* table missing — treat as empty */ }

  // Resolve each curated saint to its canonical name on its 2026 date (so the
  // slug matches what the page requests), skipping ferias and already-stored.
  const year = new Date().getFullYear();
  const todo: { name: string; title: string | null; monthDay: string }[] = [];
  for (const s of allCuratedSaints()) {
    const date = new Date(Date.UTC(year, s.month - 1, s.day));
    const lit = await liturgicalForDate(date);
    if (lit.rank === "feria") continue;
    const name = lit.name || s.name;
    if (existing.has(saintSlug(name))) continue;
    const extras = saintExtras(date);
    const monthDay = date.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
    todo.push({ name, title: extras.title ?? null, monthDay });
  }

  const batch = todo.slice(0, limit);
  const results = await Promise.all(
    batch.map(async (t) => {
      const profile = await generateSaintProfile(t.name, t.title, t.monthDay);
      if (!profile) return { name: t.name, ok: false as const };
      const ok = await persist(profile);
      return { name: profile.name, ok, sources: profile.sources.length };
    }),
  );

  return Response.json({
    generated: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).map((r) => r.name),
    remaining: Math.max(0, todo.length - batch.length),
    results,
  });
}
