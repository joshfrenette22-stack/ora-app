// Daily Mass readings scraped from the USCCB lectionary (server-side only).
//
// USCCB pages are server-rendered HTML, so a plain `fetch` + parse is enough —
// no headless browser needed. The page lives at:
//   https://bible.usccb.org/bible/readings/MMDDYY.cfm
//
// COPYRIGHT: the scripture text is the New American Bible, Revised Edition
// (NABRE), © Confraternity of Christian Doctrine, USCCB. It is reproduced here
// at the app owner's direction. Every response carries an attribution `source`.
//
// This module never throws: on any network/parse failure it returns null and
// the caller falls back to the public-domain representative readings.

import { parse } from "node-html-parser";
import { readingsForDate, type DailyReadings, type Reading } from "./readings";
import { renderPassage, renderVerse } from "./dra";

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const SOURCE_DRA = "Douay–Rheims 1899 (public domain) · citations from the USCCB Lectionary for Mass";
const SOURCE_MIXED = "Douay–Rheims where available; remaining text USCCB/NABRE © CCD · citations from the USCCB Lectionary";

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
  let draCount = 0; // readings rendered from Douay–Rheims
  let total = 0; // readings with a usable citation

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

    // Refrain verse number + sentence from the scraped "R. (21a) ..." marker.
    let refrainVerse = 0;
    if (section === "psalm") {
      const flat = body.replace(/\s+/g, " ");
      const m = flat.match(/R\.?\s*(?:\((\d+)[a-z]*\)\s*)?([^.]*\.)/);
      if (m) {
        if (m[1]) refrainVerse = Number(m[1]);
        reading.refrain = m[2].trim();
      }
    }

    // Replace the NABRE text with the Douay–Rheims rendering of the same
    // citation. Falls back to the scraped text per reading on the rare occasion
    // a citation can't be resolved (an unmapped book or an unusual reference).
    const rendered = renderPassage(cite);
    if (rendered) {
      reading.body = rendered.text;
      total++;
      draCount++;
      if (section === "psalm") {
        const draRefrain = refrainVerse ? renderVerse(rendered.book, rendered.chapter, refrainVerse) : null;
        reading.refrain = draRefrain ?? undefined; // never mix NABRE refrain with DRA body
      }
    } else if (cite) {
      total++;
    }

    found[section] = reading;
  }

  if (!found.first || !found.gospel) return null; // not a readings page we understand

  const psalm = found.psalm ?? { label: "Responsorial Psalm", cite: "", title: "Responsorial Psalm", body: found.first.body };
  const allDra = total > 0 && draCount === total;
  return {
    date,
    representative: false,
    source: allDra ? SOURCE_DRA : SOURCE_MIXED,
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

/** Authentic USCCB readings when reachable, else the public-domain fallback. */
export async function getDailyReadings(date: Date): Promise<DailyReadings> {
  return (await fetchUsccbReadings(date)) ?? readingsForDate(date);
}
