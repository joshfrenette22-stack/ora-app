// Builds src/data/dra.json — the public-domain Douay–Rheims 1899 American Edition.
// Run with: node scripts/build-dra.mjs
//
// Sources (both Public Domain, both the same 1899 American Edition):
//   • Protocanon: seven1m/open-bibles — eng-dra.zefania.xml (clean, single file)
//   • Deuterocanon: wldeh/bible-api "en-dra" (the Zefania file's deuterocanon
//     books are mislabelled/jumbled, so we take those from wldeh instead)
//
// Baruch is absent from both public-domain sources; citations to it fall back
// to the scraped text at runtime.
//
// The Zefania file is damaged in places: it pads some chapters with the literal
// verse text "dummy verses inserted by amos" and, in the same chapters, hoists the
// last verse of the padded block to verse 1 (Isaiah 5:1 holds the text of 5:10).
// repairPlaceholderChapters() below restores those chapters from wldeh.
//
// Output shape: { [bookName]: { [chapter]: { [verse]: "text" } } }

import { writeFileSync } from "node:fs";
import { applyCorrections } from "./dra-corrections.mjs";

const ZEFANIA = "https://raw.githubusercontent.com/seven1m/open-bibles/master/eng-dra.zefania.xml";
const WLDEH = "https://raw.githubusercontent.com/wldeh/bible-api/main/bibles/en-dra";

// The 66 protocanonical books, taken from the (reliable) Zefania file.
const PROTOCANON = new Set([
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges",
  "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
  "Ezra", "Nehemiah", "Esther", "Job", "Psalm", "Proverbs", "Ecclesiastes",
  "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel",
  "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John",
  "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy",
  "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
  "1 John", "2 John", "3 John", "Jude", "Revelation",
]);

// Deuterocanon (+ Catholic Daniel/Esther with the additions) from wldeh.
// wldeh book id → the book name we key by in dra.json.
const WLDEH_BOOKS = {
  tobit: "Tobit",
  judith: "Judith",
  esther: "Esther", // Catholic (Greek) Esther replaces the Hebrew one
  wisdomofsolomon: "Wisdom",
  sirach: "Sirach",
  daniel: "Daniel", // 14-chapter Daniel (canticle, Susanna, Bel)
  "1maccabees": "1 Maccabees",
  "2maccabees": "2 Maccabees",
};

function clean(s) {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Protocanon from the Zefania XML ──────────────────────────────────────────
const xml = await (await fetch(ZEFANIA)).text();
const out = {};
const bookRe = /<BIBLEBOOK bnumber="\d+" bname="([^"]*)"[^>]*>([\s\S]*?)<\/BIBLEBOOK>/g;
const chapRe = /<CHAPTER cnumber="(\d+)">([\s\S]*?)<\/CHAPTER>/g;
const versRe = /<VERS vnumber="(\d+)">([\s\S]*?)<\/VERS>/g;

for (const b of xml.matchAll(bookRe)) {
  if (!PROTOCANON.has(b[1])) continue; // skip the jumbled deuterocanon
  const chapters = {};
  for (const c of b[2].matchAll(chapRe)) {
    const vmap = {};
    for (const v of c[2].matchAll(versRe)) vmap[v[1]] = clean(v[2]);
    chapters[c[1]] = vmap;
  }
  out[b[1]] = chapters;
}

// ── Deuterocanon from wldeh (chapter count auto-discovered) ───────────────────
for (const [id, name] of Object.entries(WLDEH_BOOKS)) {
  const chapters = {};
  for (let c = 1; ; c++) {
    const res = await fetch(`${WLDEH}/books/${id}/chapters/${c}.json`);
    if (!res.ok) break;
    const { data } = await res.json();
    const vmap = {};
    for (const row of data) vmap[row.verse] = String(row.text).replace(/\s+/g, " ").trim();
    chapters[c] = vmap;
  }
  out[name] = chapters;
  console.log(`${name}: ${Object.keys(chapters).length} chapters`);
}

// ── Chapters the Zefania file damaged ────────────────────────────────────────
// Placeholder text standing in for verses the Zefania file lost. src/lib/dra.ts
// refuses to render a passage containing it (and falls back to the scraped text).
const PLACEHOLDER = "dummy verses inserted by amos";

// Chapters restored from wldeh, which keeps the verses as printed. Each one was
// checked by hand: wldeh's verse count matches the NABRE/Hebrew count the
// lectionary cites, and every verse the Zefania file did get right matches wldeh.
const SAME_NUMBERING = [
  ["Genesis", 17], ["Genesis", 20], ["Genesis", 27], ["Genesis", 38], ["Genesis", 39],
  ["Genesis", 40], ["Genesis", 41], ["Exodus", 9], ["Deuteronomy", 1], ["Joshua", 18],
  ["Judges", 2], ["Judges", 6], ["2 Samuel", 5], ["1 Kings", 6], ["Job", 32],
  ["Isaiah", 5], ["Isaiah", 22], ["Isaiah", 25], ["Jeremiah", 21], ["Jeremiah", 31],
  ["Ezekiel", 23], ["Micah", 6], ["Matthew", 12], ["John", 4], ["John", 15],
  ["Romans", 9], ["Romans", 11], ["1 Thessalonians", 2], ["1 Thessalonians", 5],
  ["Hebrews", 11],
];

// wldeh numbers the psalms as the Douay–Rheims was printed (Vulgate); dra.json
// keeps the Hebrew numbering the lectionary cites. These two were verified verse
// by verse against the verses the Zefania file did keep.
const PSALM_REPAIRS = [
  { chapter: 73, last: 28, src: (v) => [72, v] },
  { chapter: 116, last: 19, src: (v) => (v <= 9 ? [114, v] : [115, v - 9]) },
];

// Not repaired, and left to the runtime fallback: Genesis 49 and Numbers 7 (the
// Zefania and wldeh versifications disagree), and Psalm 149, whose text is
// really Vulgate Psalm 147 — the Zefania file numbers the end of the Psalter
// differently from the Hebrew numbering the lectionary uses.

const wldehId = (book) => (book === "Psalm" ? "psalms" : book.toLowerCase().replace(/\s+/g, ""));
const straighten = (s) =>
  s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\s+/g, " ").trim();
const words = (s) => new Set(s.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean));
function similarity(a, b) {
  const A = words(a), B = words(b);
  if (!A.size || !B.size) return 0;
  let hit = 0;
  for (const w of A) if (B.has(w)) hit++;
  return hit / Math.max(A.size, B.size);
}

const wldehCache = new Map();
async function wldehChapter(book, chapter) {
  const key = `${book}|${chapter}`;
  if (!wldehCache.has(key)) {
    const res = await fetch(`${WLDEH}/books/${wldehId(book)}/chapters/${chapter}.json`);
    if (!res.ok) throw new Error(`wldeh ${book} ${chapter}: HTTP ${res.status}`);
    const { data } = await res.json();
    wldehCache.set(key, Object.fromEntries(data.map((r) => [r.verse, straighten(String(r.text))])));
  }
  return wldehCache.get(key);
}

/**
 * Rebuild one chapter against wldeh's numbering. The Zefania file often has a
 * verse right but filed under a neighbouring number (a padding verse shifted
 * everything after it), so each verse already present is moved to its proper
 * number — keeping its OCR and any hand corrections — and only verses the file
 * truly lost (placeholders, or text that matches nothing) take wldeh's text.
 * Returns the verse numbers filled from wldeh.
 */
async function repairChapter(bible, book, chapter, last, src) {
  const old = bible[book]?.[String(chapter)] ?? {};
  const free = Object.keys(old).filter((k) => old[k] !== PLACEHOLDER);
  const repaired = {};
  const filled = [];
  for (let v = 1; v <= last; v++) {
    const [wc, wv] = src(v);
    const text = (await wldehChapter(book, wc))[wv];
    if (!text) throw new Error(`wldeh has no ${book} ${wc}:${wv} (for ${chapter}:${v})`);
    let best = null;
    let bestSim = 0.6;
    for (const k of free) {
      const sim = similarity(old[k], text);
      if (sim > bestSim || (sim === bestSim && best !== null && Math.abs(k - v) < Math.abs(best - v))) {
        best = k;
        bestSim = sim;
      }
    }
    if (best === null) {
      repaired[v] = text;
      filled.push(v);
    } else {
      repaired[v] = old[best];
      free.splice(free.indexOf(best), 1);
    }
  }
  bible[book][String(chapter)] = repaired;
  return filled;
}

async function repairPlaceholderChapters(bible) {
  let verses = 0;
  const jobs = [
    ...SAME_NUMBERING.map(([book, chapter]) => ({ book, chapter, src: (v) => [chapter, v] })),
    ...PSALM_REPAIRS.map((p) => ({ book: "Psalm", ...p })),
  ];
  for (const { book, chapter, last, src } of jobs) {
    const n = last ?? Object.keys(await wldehChapter(book, chapter)).length;
    const filled = await repairChapter(bible, book, chapter, n, src);
    verses += filled.length;
    console.log(`repaired ${book} ${chapter}: filled ${filled.length} of ${n} verses from wldeh (${filled.join(",")})`);
  }
  const left = [];
  for (const [book, chapters] of Object.entries(bible))
    for (const [c, vmap] of Object.entries(chapters))
      for (const [v, text] of Object.entries(vmap)) if (text === PLACEHOLDER) left.push(`${book} ${c}:${v}`);
  console.log(`placeholder repair: ${verses} verses filled from wldeh, ${left.length} placeholders left (${left.join(", ")})`);
}

await repairPlaceholderChapters(out);

// Both sources are OCR of the same printed edition; repair the verses we've
// verified by hand (see dra-corrections.mjs) before writing.
const fixes = applyCorrections(out);
console.log(`corrections: ${fixes.applied} applied, ${fixes.skipped} already correct`);
for (const p of fixes.problems) console.warn(`  ! ${p}`);

writeFileSync(new URL("../src/data/dra.json", import.meta.url), JSON.stringify(out));
const books = Object.keys(out).length;
const verses = Object.values(out).reduce((n, ch) => n + Object.values(ch).reduce((m, v) => m + Object.keys(v).length, 0), 0);
console.log(`Wrote src/data/dra.json — ${books} books, ${verses} verses`);
