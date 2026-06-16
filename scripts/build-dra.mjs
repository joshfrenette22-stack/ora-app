// Builds src/data/dra.json from the public-domain Douay–Rheims Zefania XML.
// Run with: node scripts/build-dra.mjs
//
// Source: seven1m/open-bibles — eng-dra.zefania.xml
//   "Douay-Rheims 1899 American Edition" · Public Domain
//
// Output shape: { [bookName]: { [chapter]: { [verse]: "text" } } }

import { writeFileSync } from "node:fs";

const SRC = "https://raw.githubusercontent.com/seven1m/open-bibles/master/eng-dra.zefania.xml";

const xml = await (await fetch(SRC)).text();

const out = {};
const bookRe = /<BIBLEBOOK bnumber="\d+" bname="([^"]*)"[^>]*>([\s\S]*?)<\/BIBLEBOOK>/g;
const chapRe = /<CHAPTER cnumber="(\d+)">([\s\S]*?)<\/CHAPTER>/g;
const versRe = /<VERS vnumber="(\d+)">([\s\S]*?)<\/VERS>/g;

function unescapeXml(s) {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

let books = 0, verses = 0;
for (const b of xml.matchAll(bookRe)) {
  const name = b[1];
  const chapters = {};
  for (const c of b[2].matchAll(chapRe)) {
    const vmap = {};
    for (const v of c[2].matchAll(versRe)) {
      vmap[v[1]] = unescapeXml(v[2]);
      verses++;
    }
    chapters[c[1]] = vmap;
  }
  out[name] = chapters;
  books++;
}

writeFileSync(new URL("../src/data/dra.json", import.meta.url), JSON.stringify(out));
console.log(`Wrote src/data/dra.json — ${books} books, ${verses} verses`);
