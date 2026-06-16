// English Standard Version (ESV) passage rendering via Crossway's ESV API
// (server-side only).
//
// SETUP: set the ESV_API_KEY environment variable to a token from
// https://api.esv.org/ (free registration). Without it, this returns null and
// the caller falls back to the Douay–Rheims rendering.
//
// LICENSING: the ESV is © Crossway. The free API tier is for NON-COMMERCIAL use;
// a public/commercial app requires a separate license from Crossway. Crossway
// also requires an attribution notice, which we include in the readings `source`.
//
// SCOPE: api.esv.org serves the 66-book ESV only — it has no deuterocanon, so
// those books (and the Greek additions to Daniel/Esther) resolve to null here
// and fall back to Douay–Rheims.

import { bookName } from "./dra";

// Books absent from the (Protestant) ESV API — skip the call and let DRA handle them.
const DEUTEROCANON = new Set([
  "Tobit", "Judith", "Wisdom", "Sirach", "Baruch", "1 Maccabees", "2 Maccabees",
]);

export const ESV_ATTRIBUTION =
  "Scripture quotations from the ESV® Bible, © Crossway. Used by permission.";

/** Render a USCCB citation as ESV text, or null (no key / deuterocanon / failure). */
export async function renderEsv(cite: string): Promise<string | null> {
  const key = process.env.ESV_API_KEY;
  if (!key) return null;

  const m = cite.trim().match(/^((?:[1-4]\s)?[A-Za-z]+)\s+(.+)$/);
  if (!m) return null;
  const book = bookName(m[1]);
  if (!book || DEUTEROCANON.has(book)) return null;

  const q = `${book} ${m[2].replace(/—|–/g, "-")}`;
  try {
    const url = new URL("https://api.esv.org/v3/passage/text/");
    url.searchParams.set("q", q);
    url.searchParams.set("include-headings", "false");
    url.searchParams.set("include-footnotes", "false");
    url.searchParams.set("include-verse-numbers", "false");
    url.searchParams.set("include-short-copyright", "false");
    url.searchParams.set("include-passage-references", "false");

    const res = await fetch(url, {
      headers: { Authorization: `Token ${key}` },
      next: { revalidate: 21_600 }, // a day's readings never change
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (Array.isArray(data?.parsed) && data.parsed.length === 0) return null; // unknown reference
    const text = Array.isArray(data?.passages) ? data.passages.join(" ") : "";
    const clean = text.replace(/\s+/g, " ").trim();
    return clean || null;
  } catch {
    return null;
  }
}
