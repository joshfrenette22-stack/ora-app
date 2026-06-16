// Render scripture passages from the public-domain Douay–Rheims (server-side).
//
// Given a USCCB-style citation (e.g. "Lk 13:10-17", "Ps 68:2 and 4, 6-7ab")
// we resolve the book, expand the verse ranges, and return the DRA text. If the
// book is absent from this edition (it lacks Sirach and 1 Maccabees) or the
// citation can't be resolved, we return null and the caller keeps the original.

import draData from "@/data/dra.json";

type Bible = Record<string, Record<string, Record<string, string>>>;
const DRA = draData as Bible;

// Normalised USCCB/NAB abbreviation → Douay–Rheims book name used in the data.
// (Sirach and 1 Maccabees are intentionally absent — not in this edition.)
const BOOK_MAP: Record<string, string> = {
  gn: "Genesis", gen: "Genesis",
  ex: "Exodus", exod: "Exodus",
  lv: "Leviticus", lev: "Leviticus",
  nm: "Numbers", num: "Numbers",
  dt: "Deuteronomy", deut: "Deuteronomy",
  jos: "Joshua", josh: "Joshua",
  jgs: "Judges", judg: "Judges",
  ru: "Ruth", ruth: "Ruth",
  "1sm": "1 Samuel", "1sam": "1 Samuel",
  "2sm": "2 Samuel", "2sam": "2 Samuel",
  "1kgs": "1 Kings", "2kgs": "2 Kings",
  "1chr": "1 Chronicles", "2chr": "2 Chronicles",
  ezr: "Ezra", ezra: "Ezra",
  neh: "Nehemiah",
  tb: "Tobit", tob: "Tobit",
  jdt: "Judith",
  est: "Esther", esth: "Esther",
  "2mc": "2 Maccabees", "2macc": "2 Maccabees",
  jb: "Job", job: "Job",
  ps: "Psalm", pss: "Psalm", psalm: "Psalm", psalms: "Psalm",
  prv: "Proverbs", prov: "Proverbs",
  eccl: "Ecclesiastes", qoh: "Ecclesiastes",
  sg: "Song of Solomon", song: "Song of Solomon", ct: "Song of Solomon",
  wis: "Wisdom",
  is: "Isaiah", isa: "Isaiah",
  jer: "Jeremiah",
  lam: "Lamentations",
  bar: "Baruch",
  ez: "Ezekiel", ezek: "Ezekiel",
  dn: "Daniel", dan: "Daniel",
  hos: "Hosea",
  jl: "Joel", joel: "Joel",
  am: "Amos", amos: "Amos",
  ob: "Obadiah", obad: "Obadiah",
  jon: "Jonah", jonah: "Jonah",
  mi: "Micah", mic: "Micah",
  na: "Nahum", nah: "Nahum",
  hb: "Habakkuk", hab: "Habakkuk",
  zep: "Zephaniah", zeph: "Zephaniah",
  hg: "Haggai", hag: "Haggai",
  zec: "Zechariah", zech: "Zechariah",
  mal: "Malachi",
  mt: "Matthew", matt: "Matthew",
  mk: "Mark", mark: "Mark",
  lk: "Luke", luke: "Luke",
  jn: "John", john: "John",
  acts: "Acts",
  rom: "Romans",
  "1cor": "1 Corinthians", "2cor": "2 Corinthians",
  gal: "Galatians",
  eph: "Ephesians",
  phil: "Philippians", php: "Philippians",
  col: "Colossians",
  "1thes": "1 Thessalonians", "1thess": "1 Thessalonians",
  "2thes": "2 Thessalonians", "2thess": "2 Thessalonians",
  "1tm": "1 Timothy", "1tim": "1 Timothy",
  "2tm": "2 Timothy", "2tim": "2 Timothy",
  ti: "Titus", tit: "Titus",
  phlm: "Philemon",
  heb: "Hebrews",
  jas: "James",
  "1pt": "1 Peter", "1pet": "1 Peter",
  "2pt": "2 Peter", "2pet": "2 Peter",
  "1jn": "1 John", "1john": "1 John",
  "2jn": "2 John", "2john": "2 John",
  "3jn": "3 John", "3john": "3 John",
  jude: "Jude",
  rv: "Revelation", rev: "Revelation",
};

function resolveBook(token: string): string | null {
  const key = token.toLowerCase().replace(/[.\s]/g, "");
  return BOOK_MAP[key] ?? null;
}

function lastVerse(book: string, chapter: number): number {
  const ch = DRA[book]?.[String(chapter)];
  if (!ch) return 0;
  return Math.max(0, ...Object.keys(ch).map(Number));
}

interface Ref { chapter: number; verse: number }

/** Expand a USCCB citation into an ordered list of (chapter, verse) refs. */
export function parseRefs(cite: string): { book: string; refs: Ref[] } | null {
  const m = cite.trim().match(/^((?:[1-4]\s)?[A-Za-z]+)\s+(.+)$/);
  if (!m) return null;
  const book = resolveBook(m[1]);
  if (!book || !DRA[book]) return null;

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
        const end = c === c2 ? v2 : lastVerse(book, c);
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
export function renderPassage(cite: string): Rendered | null {
  const parsed = parseRefs(cite);
  if (!parsed) return null;
  const lines: string[] = [];
  for (const { chapter, verse } of parsed.refs) {
    const text = DRA[parsed.book]?.[String(chapter)]?.[String(verse)];
    if (text) lines.push(text);
  }
  if (!lines.length) return null;
  return { text: lines.join(" "), book: parsed.book, chapter: parsed.refs[0].chapter };
}

/** Render a single verse (used for the psalm refrain). */
export function renderVerse(book: string, chapter: number, verse: number): string | null {
  return DRA[book]?.[String(chapter)]?.[String(verse)] ?? null;
}
