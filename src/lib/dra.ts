// Render scripture passages from the public-domain Douay–Rheims (server-side).
//
// Given a USCCB-style citation (e.g. "Lk 13:10-17", "Ps 68:2 and 4, 6-7ab")
// we resolve the book, expand the verse ranges, and return the DRA text. If the
// book is absent from this edition (it lacks Sirach and 1 Maccabees) or the
// citation can't be resolved, we return null and the caller keeps the original.
//
// The bundled text is ~4.6 MB of JSON, so it is loaded lazily on the first DRA
// render rather than parsed on every cold start — most requests are satisfied
// by the ESV path (or the CDN cache) and never need it.

import { resolveBook } from "./bibleBooks";

export { bookName } from "./bibleBooks";

type Bible = Record<string, Record<string, Record<string, string>>>;

let draPromise: Promise<Bible> | null = null;

function loadDra(): Promise<Bible> {
  if (!draPromise) {
    draPromise = import("@/data/dra.json").then((m) => m.default as Bible);
  }
  return draPromise;
}

function lastVerse(DRA: Bible, book: string, chapter: number): number {
  const ch = DRA[book]?.[String(chapter)];
  if (!ch) return 0;
  return Math.max(0, ...Object.keys(ch).map(Number));
}

interface Ref { chapter: number; verse: number }

/** Expand a USCCB citation into an ordered list of (chapter, verse) refs. */
export async function parseRefs(cite: string): Promise<{ book: string; refs: Ref[] } | null> {
  const m = cite.trim().match(/^((?:[1-4]\s)?[A-Za-z]+)\s+(.+)$/);
  if (!m) return null;
  const book = resolveBook(m[1]);
  if (!book) return null;
  const DRA = await loadDra();
  if (!DRA[book]) return null;

  // Normalise: drop sub-verse letters ("6-7ab" → "6-7"), "and" → comma.
  const body = m[2]
    .replace(/—|–/g, "-")
    .replace(/\band\b/gi, ",")
    .replace(/([0-9])[a-z]+/gi, "$1")
    .replace(/\s+/g, "");

  const refs: Ref[] = [];
  let chapter = 0;
  for (const tokenRaw of body.split(",")) {
    const token = tokenRaw.trim();
    if (!token) continue;

    // Cross-chapter range, e.g. "1:1-2:2".
    const cross = token.match(/^(\d+):(\d+)-(\d+):(\d+)$/);
    if (cross) {
      const [c1, v1, c2, v2] = cross.slice(1).map(Number);
      for (let c = c1; c <= c2; c++) {
        const start = c === c1 ? v1 : 1;
        const end = c === c2 ? v2 : lastVerse(DRA, book, c);
        for (let v = start; v <= end; v++) refs.push({ chapter: c, verse: v });
      }
      chapter = c2;
      continue;
    }

    // "C:Vstart-Vend" or "C:V" — sets the working chapter.
    const withChapter = token.match(/^(\d+):(.+)$/);
    const versePart = withChapter ? withChapter[2] : token;
    if (withChapter) chapter = Number(withChapter[1]);
    if (!chapter) continue;

    const range = versePart.match(/^(\d+)-(\d+)$/);
    if (range) {
      for (let v = Number(range[1]); v <= Number(range[2]); v++) refs.push({ chapter, verse: v });
    } else if (/^\d+$/.test(versePart)) {
      refs.push({ chapter, verse: Number(versePart) });
    }
  }

  return refs.length ? { book, refs } : null;
}

export interface Rendered { text: string; book: string; chapter: number }

/** Render a citation as Douay–Rheims text, or null if it can't be resolved. */
export async function renderPassage(cite: string): Promise<Rendered | null> {
  const parsed = await parseRefs(cite);
  if (!parsed) return null;
  const DRA = await loadDra();
  const lines: string[] = [];
  for (const { chapter, verse } of parsed.refs) {
    const text = DRA[parsed.book]?.[String(chapter)]?.[String(verse)];
    if (text) lines.push(text);
  }
  if (!lines.length) return null;
  return { text: lines.join(" "), book: parsed.book, chapter: parsed.refs[0].chapter };
}

/** Render a single verse (used for the psalm refrain). */
export async function renderVerse(book: string, chapter: number, verse: number): Promise<string | null> {
  const DRA = await loadDra();
  return DRA[book]?.[String(chapter)]?.[String(verse)] ?? null;
}
