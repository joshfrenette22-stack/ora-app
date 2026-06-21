import { type NextRequest } from "next/server";
import { parseDate } from "@/lib/liturgical";
import { liturgicalForDate } from "@/lib/calendar";
import { saintForDate, saintExtras } from "@/lib/saints";
import { supabase } from "@/lib/supabase";
import {
  generateSaintProfile,
  aiEnabled,
  saintSlug,
  type SaintProfile,
  type SaintSource,
} from "@/lib/saintProfile";

export const dynamic = "force-dynamic";
// Claude web search can take 20–40s; give it room so the page gets the grounded
// profile rather than falling back to the curated bio.
export const maxDuration = 60;

// One generation per saint is plenty — cache the result in memory for the life
// of the server. Durable storage (and human corrections) live in Supabase.
const cache = new Map<string, SaintProfile>();

interface ProfileRow {
  slug: string;
  name: string;
  feast_day: string | null;
  canonization: string | null;
  history: string | null;
  contributions: string | null;
  patronage: string | null;
  feast_engagement: string | null;
  summary: string | null;
  sources: SaintSource[] | null;
  verified: boolean | null;
}

function rowToProfile(r: ProfileRow): SaintProfile {
  return {
    slug: r.slug,
    name: r.name,
    feastDay: r.feast_day ?? "",
    canonization: r.canonization ?? "",
    history: r.history ?? "",
    contributions: r.contributions ?? "",
    patronage: r.patronage ?? "",
    feastEngagement: r.feast_engagement ?? "",
    summary: r.summary ?? "",
    sources: Array.isArray(r.sources) ? r.sources : [],
    source: "stored",
  };
}

/** Best-effort read of a stored (possibly human-corrected) profile. */
async function readStored(slug: string): Promise<SaintProfile | null> {
  try {
    const { data, error } = await supabase
      .from("saint_profiles")
      .select("slug,name,feast_day,canonization,history,contributions,patronage,feast_engagement,summary,sources,verified")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return rowToProfile(data as ProfileRow);
  } catch {
    return null;
  }
}

/** Best-effort persist for later review/correction. Never overwrites a row a
 *  human has marked verified (the RPC enforces that). */
async function persist(p: SaintProfile): Promise<void> {
  try {
    await supabase.rpc("upsert_saint_profile", {
      p_slug: p.slug,
      p_name: p.name,
      p_feast_day: p.feastDay,
      p_canonization: p.canonization,
      p_history: p.history,
      p_contributions: p.contributions,
      p_patronage: p.patronage,
      p_feast_engagement: p.feastEngagement,
      p_summary: p.summary,
      p_sources: p.sources,
    });
  } catch {
    /* table/RPC not present yet — the in-memory cache still serves the page */
  }
}

export async function GET(request: NextRequest) {
  const date = parseDate(request.nextUrl.searchParams.get("date"));
  const lit = await liturgicalForDate(date);
  const saint = saintForDate(date);
  const extras = saintExtras(date);

  const isFeria = lit.rank === "feria" || saint.name === "Feria";
  // No saint to profile on a feria — let the page keep its feria note.
  if (isFeria) return Response.json({ profile: null, reason: "feria" });

  const name = lit.name || saint.name;
  const title = extras.title ?? saint.title ?? null;
  const monthDay = date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const slug = saintSlug(name);

  // 1) In-memory cache.
  const cached = cache.get(slug);
  if (cached) return Response.json({ profile: cached });

  // 2) Stored/curated row (includes any human corrections).
  const stored = await readStored(slug);
  if (stored) {
    cache.set(slug, stored);
    return Response.json({ profile: stored });
  }

  // 3) No AI configured → hand back the curated bio so the page still enriches.
  if (!aiEnabled()) {
    const fallback: SaintProfile = {
      slug, name, feastDay: monthDay,
      canonization: "", history: extras.bio ?? saint.bio ?? "",
      contributions: "", patronage: "", feastEngagement: "",
      summary: extras.bio ?? saint.bio ?? "", sources: [], source: "calendar",
    };
    return Response.json({ profile: fallback });
  }

  // 4) Generate, persist for review, cache.
  const generated = await generateSaintProfile(name, title, monthDay);
  if (!generated) {
    const fallback: SaintProfile = {
      slug, name, feastDay: monthDay,
      canonization: "", history: extras.bio ?? saint.bio ?? "",
      contributions: "", patronage: "", feastEngagement: "",
      summary: extras.bio ?? saint.bio ?? "", sources: [], source: "calendar",
    };
    return Response.json({ profile: fallback });
  }

  cache.set(slug, generated);
  await persist(generated);
  return Response.json({ profile: generated });
}
