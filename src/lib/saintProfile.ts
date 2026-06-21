// Server-side: generate an accurate, source-grounded profile of the saint or
// feast of the day with Claude + web search.
//
// Uses ANTHROPIC_API_KEY (already configured for the "Today in the Church"
// briefing). Claude searches the live web, grounds every claim in credible
// Catholic sources (Vatican.va, USCCB, the Catholic Encyclopedia, Butler's
// Lives, Franciscan Media, EWTN, CNA, the Roman Martyrology) and returns the
// pages it consulted as citations. Without the key the saint page degrades to
// the curated bio.

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-4-8";

export interface SaintSource {
  title: string;
  url: string;
}

export interface SaintProfile {
  slug: string;
  name: string;
  /** Feast day, e.g. "June 20". */
  feastDay: string;
  /** When/by whom canonized, or the origin of the feast. */
  canonization: string;
  /** Accurate life/history. */
  history: string;
  /** What they did and why they matter. */
  contributions: string;
  /** What they are the patron saint of. */
  patronage: string;
  /** How to keep/celebrate the feast day. */
  feastEngagement: string;
  /** Short overview, suitable to read aloud. */
  summary: string;
  /** Citations from the grounding search. */
  sources: SaintSource[];
  source: "ai" | "stored" | "calendar";
  generatedAt?: string;
}

/** A stable slug for a saint/feast, keyed on the name (so it recurs each year). */
export function saintSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const SYSTEM =
  "You are a meticulous Catholic hagiographer compiling an accurate, reverent profile of a saint or feast for a Catholic prayer app. " +
  "Use the web_search tool to consult credible Catholic sources — strongly prefer Vatican.va and Vatican News, USCCB.org, the Catholic Encyclopedia (newadvent.org), Butler's Lives of the Saints, Franciscan Media's 'Saint of the Day', EWTN, Catholic News Agency, and the Roman Martyrology. " +
  "Do not invent facts, dates, or patronages. If a detail is genuinely unknown or not applicable, say so plainly — for ancient saints, canonization is often 'Pre-Congregation (by immemorial cult)' rather than a formal date; for feasts of the Lord or Our Lady, give the origin of the feast instead of a canonization. " +
  "Distinguish documented history from pious tradition when it matters. Be concise and reverent. " +
  "Your final message must be ONLY the JSON object requested — no preamble, no markdown, no code fences.";

interface RawProfile {
  name?: string;
  feastDay?: string;
  canonization?: string;
  history?: string;
  contributions?: string;
  patronage?: string;
  feastEngagement?: string;
  summary?: string;
}

/** Pull the first balanced JSON object out of a model response. */
function extractJson(text: string): string | null {
  const fenced = text.replace(/```(?:json)?/gi, "").trim();
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return fenced.slice(start, end + 1);
}

/** Generate a grounded profile, or null on any failure (caller falls back). */
export async function generateSaintProfile(
  name: string,
  title: string | null,
  monthDay: string,
): Promise<SaintProfile | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  try {
    const client = new Anthropic();
    const user =
      `Compile a profile of the saint or feast the Catholic Church celebrates: ${name}` +
      `${title ? ` (${title})` : ""}. Feast day: ${monthDay}.\n\n` +
      "Search credible Catholic sources, then return ONLY a JSON object with these string fields:\n" +
      '- "name": the proper name of the saint or feast\n' +
      '- "feastDay": the feast day (e.g. "June 20")\n' +
      '- "canonization": when and by whom they were canonized; for pre-Congregation saints explain that; for feasts give the feast\'s origin\n' +
      '- "history": 2–4 sentences of accurate biography/history\n' +
      '- "contributions": 2–3 sentences on what they did and why they matter\n' +
      '- "patronage": what they are the patron saint of (or "—" if none)\n' +
      '- "feastEngagement": 2–3 sentences on how a Catholic can keep this feast day (customs, prayers, practices)\n' +
      '- "summary": a 2–3 sentence overview suitable to be read aloud';

    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 1400,
      system: SYSTEM,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }],
      messages: [{ role: "user", content: user }],
    });

    // Accumulate the answer text, the sources Claude actually cited, and (as a
    // fallback) the pages it consulted.
    let text = "";
    const cited: SaintSource[] = [];
    const consulted: SaintSource[] = [];
    const seen = new Set<string>();
    const add = (list: SaintSource[], url?: string, t?: string) => {
      if (!url || seen.has(url)) return;
      seen.add(url);
      list.push({ url, title: t || url });
    };

    for (const block of resp.content as unknown as Array<Record<string, unknown>>) {
      if (block.type === "text") {
        text += block.text as string;
        for (const c of (block.citations as Array<Record<string, string>> | undefined) ?? []) {
          add(cited, c.url, c.title);
        }
      } else if (block.type === "web_search_tool_result") {
        const content = block.content as Array<Record<string, string>> | undefined;
        if (Array.isArray(content)) for (const r of content) add(consulted, r.url, r.title);
      }
    }

    const json = extractJson(text);
    if (!json) return null;
    const raw = JSON.parse(json) as RawProfile;
    if (!raw.history && !raw.summary) return null;

    const sources = [...cited, ...consulted].slice(0, 8);

    return {
      slug: saintSlug(name),
      name: raw.name?.trim() || name,
      feastDay: raw.feastDay?.trim() || monthDay,
      canonization: raw.canonization?.trim() || "",
      history: raw.history?.trim() || "",
      contributions: raw.contributions?.trim() || "",
      patronage: raw.patronage?.trim() || "",
      feastEngagement: raw.feastEngagement?.trim() || "",
      summary: raw.summary?.trim() || "",
      sources,
      source: "ai",
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
