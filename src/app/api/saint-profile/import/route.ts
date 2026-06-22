import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { filterCatholicSources, type SaintSource } from "@/lib/saintProfile";
import records from "@/data/saint-imports.json";

export const dynamic = "force-dynamic";

// Imports human-authored saint profiles committed at src/data/saint-imports.json
// (e.g. researched in batches by Claude) into the saint_profiles table. Each
// record carries the app's canonical slug so it lights up on the right day.
// Idempotent — re-running upserts; the RPC never overwrites a verified row.
//
//   GET /api/saint-profile/import   (optionally ?token=BACKFILL_TOKEN)

interface ImportRecord {
  slug: string;
  name: string;
  feast_day?: string;
  canonization?: string;
  history?: string;
  contributions?: string;
  patronage?: string;
  feast_engagement?: string;
  summary?: string;
  sources?: SaintSource[];
}

export async function GET(request: NextRequest) {
  const token = process.env.BACKFILL_TOKEN;
  if (token && request.nextUrl.searchParams.get("token") !== token) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const recs = records as ImportRecord[];
  const ok: string[] = [];
  const failed: string[] = [];

  for (const r of recs) {
    if (!r.slug || !r.history) { failed.push(r.slug || "(no slug)"); continue; }
    try {
      const { error } = await supabase.rpc("upsert_saint_profile", {
        p_slug: r.slug,
        p_name: r.name,
        p_feast_day: r.feast_day ?? "",
        p_canonization: r.canonization ?? "",
        p_history: r.history ?? "",
        p_contributions: r.contributions ?? "",
        p_patronage: r.patronage ?? "",
        p_feast_engagement: r.feast_engagement ?? "",
        p_summary: r.summary ?? "",
        p_sources: filterCatholicSources(r.sources ?? []),
      });
      if (error) failed.push(r.slug); else ok.push(r.slug);
    } catch {
      failed.push(r.slug);
    }
  }

  return Response.json({ total: recs.length, imported: ok.length, failed });
}
