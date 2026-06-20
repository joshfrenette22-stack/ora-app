// Server-side: generate an accurate, source-grounded profile of the saint or
// feast of the day with Gemini + Google Search grounding.
//
// SETUP: set GEMINI_API_KEY to a key from Google AI Studio
// (https://aistudio.google.com/apikey). Without it, the saint page degrades to
// the curated bio. Generation is grounded in live web search so every claim is
// drawn from credible Catholic sources (Vatican.va, USCCB, the Catholic
// Encyclopedia, Butler's Lives, Franciscan Media, EWTN, CNA, the Roman
// Martyrology) and returned with its citations.

import { GoogleGenAI } from "@google/genai";

// Flash supports Google Search grounding and is fast enough to stay well within
// serverless time limits; grounding — not the model's memory — does the factual
// work, and every profile is generated once then cached/persisted.
const MODEL = "gemini-2.5-flash";

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

export function geminiEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

const SYSTEM =
  "You are a meticulous Catholic hagiographer compiling an accurate, reverent profile of a saint or feast for a Catholic prayer app. " +
  "You MUST ground every claim in credible Catholic sources found via Google Search — strongly prefer Vatican.va and Vatican News, USCCB.org, the Catholic Encyclopedia (newadvent.org), Butler's Lives of the Saints, Franciscan Media's 'Saint of the Day', EWTN, Catholic News Agency, and the Roman Martyrology. " +
  "Do not invent facts, dates, or patronages. If a detail is genuinely unknown or not applicable, say so plainly — for ancient saints, canonization is often 'Pre-Congregation (by immemorial cult)' rather than a formal date; for feasts of the Lord or Our Lady, give the origin of the feast instead of a canonization. " +
  "Distinguish documented history from pious tradition when it matters. Be concise and reverent.";

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
  const fenced = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const user =
      `Compile a profile of the saint or feast the Catholic Church celebrates: ${name}` +
      `${title ? ` (${title})` : ""}. Feast day: ${monthDay}.\n\n` +
      "Return ONLY a JSON object (no markdown, no code fences) with these string fields:\n" +
      '- "name": the proper name of the saint or feast\n' +
      '- "feastDay": the feast day (e.g. "June 20")\n' +
      '- "canonization": when and by whom they were canonized; for pre-Congregation saints explain that; for feasts give the feast\'s origin\n' +
      '- "history": 2–4 sentences of accurate biography/history\n' +
      '- "contributions": 2–3 sentences on what they did and why they matter\n' +
      '- "patronage": what they are the patron saint of (or "—" if none)\n' +
      '- "feastEngagement": 2–3 sentences on how a Catholic can keep this feast day (customs, prayers, practices)\n' +
      '- "summary": a 2–3 sentence overview suitable to be read aloud';

    const resp = await ai.models.generateContent({
      model: MODEL,
      contents: user,
      config: {
        systemInstruction: SYSTEM,
        temperature: 0.2,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = resp.text ?? "";
    const json = extractJson(text);
    if (!json) return null;
    const raw = JSON.parse(json) as RawProfile;
    if (!raw.history && !raw.summary) return null;

    // Citations from the grounding search.
    const chunks =
      (resp.candidates?.[0]?.groundingMetadata?.groundingChunks ?? []) as Array<{
        web?: { uri?: string; title?: string };
      }>;
    const seen = new Set<string>();
    const sources: SaintSource[] = [];
    for (const c of chunks) {
      const url = c.web?.uri;
      if (!url || seen.has(url)) continue;
      seen.add(url);
      sources.push({ url, title: c.web?.title || url });
    }

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
