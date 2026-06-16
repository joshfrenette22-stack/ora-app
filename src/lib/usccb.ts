// Daily Mass readings scraped from the USCCB lectionary (server-side only).
//
// USCCB pages are server-rendered HTML, so a plain `fetch` + parse is enough —
// no headless browser needed. The page lives at:
//   https://bible.usccb.org/bible/readings/MMDDYY.cfm
//
// We use USCCB only for the day's structure and citations (which passages are
// read), then render the text from a chosen translation:
//   ESV (api.esv.org, if ESV_API_KEY is set) → Douay–Rheims → scraped NABRE.
// The ESV is © Crossway and the NABRE © CCD/USCCB; each response carries the
// appropriate attribution in `source`.
//
// This module never throws: on any network/parse failure it returns null and
// the caller falls back to the public-domain representative readings.

import { parse } from "node-html-parser";
import { readingsForDate, type DailyReadings, type Reading } from "./readings";
import { renderPassage, parseRefs } from "./dra";
import { renderEsv, ESV_ATTRIBUTION } from "./esv";

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const SOURCE_NABRE = "USCCB Lectionary for Mass · NABRE © Confraternity of Christian Doctrine, USCCB";

const GENERIC_REFLECT: Record<string, string> = {
  first: "What word or phrase in this reading stays with you? Sit with it before God.",
  psalm: "Pray the refrain slowly. What does it ask you to trust today?",
  second: "How does the apostle's exhortation meet a struggle you carry right now?",
  gospel: "Where is Christ calling you to follow him more closely today?",
};

/** USCCB date slug, e.g. 2026-06-16 → "061626". */
export function usccbSlug(date: Date): string {
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const yy = String(date.getUTCFullYear()).slice(-2);
  return `${mm}${dd}${yy}`;
}

type Section = "first" | "psalm" | "second" | "gospel" | null;

function classify(name: string): Section {
  const n = name.toLowerCase();
  if (n.startsWith("reading 1") || n.startsWith("reading i")) return "first";
  if (n.startsWith("reading 2") || n.startsWith("reading ii")) return "second";
  if (n.includes("psalm")) return "psalm";
  if (n.startsWith("gospel") && !n.includes("acclamation")) return "gospel";
  return null; // Alleluia / Gospel Acclamation / Sequence / Verse Before the Gospel
}

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"',
  "&apos;": "'", "&rsquo;": "’", "&lsquo;": "‘", "&ldquo;": "“",
  "&rdquo;": "”", "&mdash;": "—", "&ndash;": "–", "&hellip;": "…",
};

function decode(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&[a-z]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m);
}

/** Convert a content-body innerHTML fragment to clean plain text. */
function htmlToText(html: string): string {
  const cut = html.search(/<strong>\s*OR/i); // drop optional alternate readings
  const main = cut > -1 ? html.slice(0, cut) : html;
  return decode(
    main
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/ /g, " ")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function tidyCite(s: string): string {
  return decode(s).replace(/\s+/g, " ").trim();
}

const TITLES: Record<Exclude<Section, null>, string> = {
  first: "First Reading",
  psalm: "Responsorial Psalm",
  second: "Second Reading",
  gospel: "Gospel",
};

/** Parse a USCCB readings page. Returns null if the expected structure is absent. */
export function parseUsccbHtml(html: string, date: string): DailyReadings | null {
  const root = parse(html);
  const blocks = root.querySelectorAll(".innerblock");
  const found: Partial<Record<Exclude<Section, null>, Reading>> = {};

  for (const block of blocks) {
    const nameEl = block.querySelector(".content-header h3.name") || block.querySelector("h3.name");
    const bodyEl = block.querySelector(".content-body");
    if (!nameEl || !bodyEl) continue;
    const section = classify(nameEl.text.trim());
    if (!section || found[section]) continue;

    const citeEl = block.querySelector(".address a") || block.querySelector(".address");
    const cite = citeEl ? tidyCite(citeEl.text) : "";
    const body = htmlToText(bodyEl.innerHTML);
    if (!body) continue;

    const reading: Reading = { label: TITLES[section], cite, title: TITLES[section], body };

    // Capture the psalm refrain sentence + verse number from the "R. (21a) ..."
    // marker; the refrain is re-rendered in the chosen translation later.
    if (section === "psalm") {
      const flat = body.replace(/\s+/g, " ");
      const m = flat.match(/R\.?\s*(?:\((\d+)[a-z]*\)\s*)?([^.]*\.)/);
      if (m) {
        if (m[1]) reading.refrainVerse = Number(m[1]);
        reading.refrain = m[2].trim();
      }
    }

    found[section] = reading;
  }

  if (!found.first || !found.gospel) return null; // not a readings page we understand

  const psalm = found.psalm ?? { label: "Responsorial Psalm", cite: "", title: "Responsorial Psalm", body: found.first.body };
  return {
    date,
    representative: false,
    source: SOURCE_NABRE, // replaced by translateReadings() with the rendered translation
    first: found.first,
    psalm,
    second: found.second,
    gospel: found.gospel,
    reflect: {
      first: GENERIC_REFLECT.first,
      psalm: GENERIC_REFLECT.psalm,
      ...(found.second ? { second: GENERIC_REFLECT.second } : {}),
      gospel: GENERIC_REFLECT.gospel,
    },
  };
}

// ── Translation pipeline: ESV (protocanon) → Douay–Rheims → scraped NABRE ─────

type Provider = "esv" | "dra";
interface Translated { text: string; provider: Provider; book: string; chapter: number }

async function translateCitation(cite: string): Promise<Translated | null> {
  const esv = await renderEsv(cite);
  if (esv) {
    const refs = parseRefs(cite);
    return { text: esv, provider: "esv", book: refs?.book ?? "", chapter: refs?.refs[0]?.chapter ?? 0 };
  }
  const dra = renderPassage(cite);
  if (dra) return { text: dra.text, provider: "dra", book: dra.book, chapter: dra.chapter };
  return null;
}

const SECTIONS: Exclude<Section, null>[] = ["first", "psalm", "second", "gospel"];

/** Replace each scraped reading's text with the best available translation. */
export async function translateReadings(readings: DailyReadings): Promise<DailyReadings> {
  let esv = 0, dra = 0, nabre = 0;
  for (const key of SECTIONS) {
    const r = readings[key];
    if (!r || !r.cite) continue;
    const t = await translateCitation(r.cite);
    if (!t) {
      nabre++; // keep the scraped NABRE text for this reading
      delete r.refrainVerse;
      continue;
    }
    r.body = t.text;
    if (t.provider === "esv") esv++; else dra++;
    if (key === "psalm" && r.refrainVerse && t.book && t.chapter) {
      const rf = await translateCitation(`${t.book} ${t.chapter}:${r.refrainVerse}`);
      r.refrain = rf?.text ?? undefined; // refrain in the same translation as the body
    }
    delete r.refrainVerse;
  }
  readings.source = buildSource(esv, dra, nabre);
  return readings;
}

function buildSource(esv: number, dra: number, nabre: number): string {
  const parts: string[] = [];
  if (esv) parts.push("English Standard Version © Crossway");
  if (dra) parts.push("Douay–Rheims (public domain)");
  if (nabre) parts.push("USCCB/NABRE © CCD");
  const tail = esv ? ` ${ESV_ATTRIBUTION}` : "";
  return `${parts.join(" · ")} · citations from the USCCB Lectionary.${tail}`;
}

/** Fetch + parse the USCCB readings for a date. Returns null on any failure. */
export async function fetchUsccbReadings(date: Date): Promise<DailyReadings | null> {
  const url = `https://bible.usccb.org/bible/readings/${usccbSlug(date)}.cfm`;
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html" },
      // Readings for a given day never change — cache hard.
      next: { revalidate: 21_600 },
    });
    if (!res.ok) return null;
    return parseUsccbHtml(await res.text(), date.toISOString().slice(0, 10));
  } catch {
    return null;
  }
}

/** Authentic USCCB readings (translated), else the public-domain fallback. */
export async function getDailyReadings(date: Date): Promise<DailyReadings> {
  const scraped = await fetchUsccbReadings(date);
  if (scraped) return translateReadings(scraped);
  return readingsForDate(date);
}
