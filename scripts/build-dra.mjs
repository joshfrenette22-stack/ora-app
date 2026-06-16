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
// Output shape: { [bookName]: { [chapter]: { [verse]: "text" } } }

import { writeFileSync } from "node:fs";

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

writeFileSync(new URL("../src/data/dra.json", import.meta.url), JSON.stringify(out));
const books = Object.keys(out).length;
const verses = Object.values(out).reduce((n, ch) => n + Object.values(ch).reduce((m, v) => m + Object.keys(v).length, 0), 0);
console.log(`Wrote src/data/dra.json — ${books} books, ${verses} verses`);
