// Build the "Practice of the Love of Jesus Christ" audiobook data.
//
// Parses the vendored public-domain markdown (scripts/sources/) into the
// structured chapter/block model consumed by the reader page, and writes
// src/data/practiceLove.json. Re-run after editing the source:
//
//     node scripts/build-practice-love.mjs
//
// Cleaning applied to spoken/displayed text:
//   • bracketed footnote citations  [Rom. viii. 29.]  → removed
//   • Latin chapter epigraphs        (Charitas patiens est.)  → dropped
//   • runs of dashes (OCR artifacts) -----  → a single em dash
//   • markdown bold markers          **I.**  → I.
// Headings (###/####) become non-spoken "heading" blocks; the short thesis
// line under a chapter becomes a "lead"; everything else is a "body" paragraph.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "sources", "practice-love-of-jesus.md");
const OUT = join(__dirname, "..", "src", "data", "practiceLove.json");

// Minor words kept lowercase in titles (unless the first word).
const MINOR = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "her", "his", "in", "is",
  "no", "nor", "not", "of", "on", "or", "own", "the", "this", "to", "up", "with",
]);

function titleCase(s) {
  const words = s.toLowerCase().trim().split(/\s+/);
  return words
    .map((w, i) => {
      // Keep a trailing comma etc. attached; case the leading letter.
      const bare = w.replace(/[^a-z]/gi, "");
      if (i !== 0 && MINOR.has(bare)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

/** Clean a spoken/displayed paragraph. */
function clean(text) {
  return text
    .replace(/\[[^\]]*\]/g, " ") // footnote citations
    .replace(/\*\*/g, "") // bold markers
    .replace(/-{2,}/g, "—") // dash runs → em dash
    .replace(/\s+/g, " ") // collapse whitespace
    .replace(/\s+([,.;:!?])/g, "$1") // no space before punctuation
    .trim();
}

const lines = readFileSync(SRC, "utf8").split("\n");

const chapters = [];
let current = null; // { id, number, title, blocks, firstContent }
let sawHeaderJustNow = false; // previous non-blank line was the chapter header

function chapterMeta(header) {
  // "CHAPTER 4: CHARITY DEALETH NOT PERVERSELY, PART 1" → number/title/id.
  const m = header.match(/^CHAPTER\s+(\d+)\s*:\s*(.+)$/i);
  if (m) {
    let rest = m[2].trim();
    const part = rest.match(/\bPART\s+(\d+)\b/i);
    let number = `Chapter ${m[1]}`;
    if (part) {
      number += ` · Part ${part[1]}`;
      rest = rest.replace(/[,—-]*\s*\bPART\s+\d+\b/i, "").trim();
    }
    const id = `chapter-${m[1]}${part ? `-part-${part[1]}` : ""}`;
    // Trim trailing punctuation/ellipses left over from the header (". . .").
    return { id, number, title: titleCase(rest.replace(/[,.\s]+$/, "")) };
  }
  if (/^ABSTRACT/i.test(header)) {
    return { id: "abstract", number: "Abstract", title: "Virtues to be Practised" };
  }
  return { id: header.toLowerCase().replace(/[^a-z0-9]+/g, "-"), number: header, title: "" };
}

for (const raw of lines) {
  const line = raw.trim();

  if (line.startsWith("## ")) {
    // New chapter / part / abstract section.
    const header = line.slice(3).trim();
    current = { ...chapterMeta(header), blocks: [] };
    chapters.push(current);
    sawHeaderJustNow = true;
    continue;
  }
  if (!current) continue; // skip front matter before Chapter 1

  if (line === "" || line === "---") continue;

  if (line.startsWith("#")) {
    // ### / #### subsection label → non-spoken heading.
    const text = clean(line.replace(/^#+\s*/, ""));
    if (text) current.blocks.push({ type: "heading", text });
    sawHeaderJustNow = false;
    continue;
  }

  // A Latin epigraph sits directly under the chapter header, e.g.
  // "(Charitas patiens est.-----1 Cor. xiii. 4.)". Drop it.
  if (sawHeaderJustNow && line.startsWith("(")) {
    continue;
  }

  const text = clean(line);
  sawHeaderJustNow = false;
  if (!text) continue;

  // The first content paragraph of a chapter, when short, is the thesis line —
  // render it as an emphasised "lead" tagline rather than a body paragraph.
  const firstBlock = current.blocks.length === 0;
  const type = firstBlock && text.length < 170 ? "lead" : "body";
  current.blocks.push({ type, text });
}

const book = {
  slug: "practice-love-of-jesus",
  title: "The Practice of the Love of Jesus Christ",
  author: "St. Alphonsus Liguori",
  translator: "Trans. Rev. Eugene Grimm",
  blurb:
    "St. Alphonsus's best-loved devotional work — St. Paul's hymn to charity turned into a rule of life for loving Jesus Christ. Read aloud.",
  sourceLabel: "Public-domain text · catholictradition.org",
  sourceUrl: "https://www.catholictradition.org/Christ/christ7.htm",
  chapters,
};

writeFileSync(OUT, JSON.stringify(book, null, 2) + "\n", "utf8");

const nBlocks = chapters.reduce((n, c) => n + c.blocks.length, 0);
const nSpoken = chapters.reduce((n, c) => n + c.blocks.filter((b) => b.type !== "heading").length, 0);
console.log(`Wrote ${OUT}`);
console.log(`  ${chapters.length} sections, ${nBlocks} blocks (${nSpoken} narrated).`);
for (const c of chapters) console.log(`  · ${c.number}: ${c.title} (${c.blocks.length})`);
