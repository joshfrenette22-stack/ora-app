// Hand-verified fixes for OCR damage in the public-domain Douay–Rheims sources.
//
// Both upstream sources used by build-dra.mjs are scans of the 1899 American
// Edition, and both carry scattered OCR errors. The most visible one reached the
// app as a responsorial refrain: Psalm 103:8 read "The ford is compassionate and
// merciful" instead of "The Lord is compassionate and merciful".
//
// Each entry is an exact substring replacement scoped to a single verse, so the
// table is idempotent and reports anything that no longer matches (e.g. if an
// upstream source is corrected) instead of silently drifting.
//
// Run directly to patch the committed src/data/dra.json in place:
//   node scripts/dra-corrections.mjs
// build-dra.mjs applies the same table whenever it regenerates the file.
//
// NOTE: this table is not exhaustive, and can't be made so automatically. A
// corpus scan (rare tokens one edit away from a very common one) flags roughly
// 200 further OCR suspects that have not been verified against a printed edition
// yet, and it is blind by construction to substitutions that happen to land on a
// real word ("hurl" for "hurt"), which only a read-through catches. Only errors
// confirmed against the printed text belong here.

/** [book, chapter, verse, wrong, right] — `wrong` must occur exactly once in the verse. */
export const CORRECTIONS = [
  // ── The divine name ────────────────────────────────────────────────────────
  ["Psalm", 103, 8, "The ford is", "The Lord is"],
  ["Deuteronomy", 26, 11, "the sight of the ford thy God", "the sight of the Lord thy God"],
  ["Numbers", 8, 21, "in the sight of the Lard", "in the sight of the Lord"],
  ["Isaiah", 42, 10, "Sing ye to the Lora a new song", "Sing ye to the Lord a new song"],
  ["Genesis", 43, 14, "my almighty Bod", "my almighty God"],
  ["Jeremiah", 29, 8, "the Lord of hoses", "the Lord of hosts"],
  ["2 Maccabees", 11, 10, "a helper from Peaven, and the who shewed mercy", "a helper from heaven, and the Lord who shewed mercy"],

  // ── Proper names ───────────────────────────────────────────────────────────
  ["1 Samuel", 14, 12, "into the hands of I srael", "into the hands of Israel"],
  ["2 Chronicles", 25, 9, "the soldiers of Israeli and the man of God", "the soldiers of Israel? And the man of God"],
  ["Genesis", 28, 4, "the blessings of Abrabam", "the blessings of Abraham"],
  ["Genesis", 41, 54, "he named the second Epharaim", "he named the second Ephraim"],
  ["Genesis", 48, 17, "from Ephraims head", "from Ephraim's head"],
  ["Exodus", 29, 28, "fall to Aarons share", "fall to Aaron's share"],
  ["1 Samuel", 9, 3, "the asses of Cis, Sauls father", "the asses of Cis, Saul's father"],
  ["1 Samuel", 28, 5, "the army of the Plilistines", "the army of the Philistines"],
  ["2 Maccabees", 11, 8, "there appeared at Jerusatem", "there appeared at Jerusalem"],
  ["1 Chronicles", 12, 13, "Jerenias the tenth", "Jeremias the tenth"],
  ["Ezekiel", 1, 3, "the priest the son of Bud", "the priest the son of Buzi"],
  ["Joshua", 18, 19, "the stone of Been the son of Ruben", "the stone of Boen the son of Ruben"],

  // ── Ordinary words ─────────────────────────────────────────────────────────
  ["Genesis", 20, 4, "that is ignorant and justl", "that is ignorant and just?"],
  ["Genesis", 29, 34, "she called hi sname Levi", "she called his name Levi"],
  ["Genesis", 42, 28, "given me again, hehold it is in the sack", "given me again, behold it is in the sack"],
  ["Genesis", 42, 28, "And thye were astonished", "And they were astonished"],
  ["Genesis", 43, 27, "of whom uou told me", "of whom you told me"],
  ["Genesis", 43, 30, "made haste becouse his heart", "made haste because his heart"],
  ["Genesis", 44, 32, "Let me be tht proper servant", "Let me be thy proper servant"],
  ["Genesis", 45, 8, "lord of his whold house", "lord of his whole house"],
  ["Genesis", 45, 28, "Iwill go and see him", "I will go and see him"],
  ["Joshua", 14, 7, "I was forty Bears old", "I was forty years old"],
  ["Joshua", 14, 7, "sent me m from Cadesbarne", "sent me from Cadesbarne"],
  ["Judges", 20, 4, "Answered: I came into Gabaa", "He answered: I came into Gabaa"],
  ["2 Kings", 14, 2, "and nine and twenty gears he reigned", "and nine and twenty years he reigned"],
  ["Ezra", 10, 26, "Zacharias, annd Jehiel", "Zacharias, and Jehiel"],
  ["Esther", 6, 7, "Answered: The man whom the king", "He answered: The man whom the king"],
  ["Job", 2, 3, "that I sho uld afflict him", "that I should afflict him"],
  ["Psalm", 31, 2, "Iet me never be confounded", "let me never be confounded"],
  ["Psalm", 38, 19, "I will declare my inequity", "I will declare my iniquity"],
  ["Psalm", 76, 4, "the sword, and the battie", "the sword, and the battle"],
  ["Ecclesiastes", 3, 11, "man cannot flnd out", "man cannot find out"],
  ["Ecclesiastes", 5, 11, "whether he eat lttle or much", "whether he eat little or much"],
  ["Jeremiah", 7, 34, "and the coice of gladness", "and the voice of gladness"],
  ["Jeremiah", 13, 2, "a girdle accoding to the word", "a girdle according to the word"],
  ["Jeremiah", 22, 21, "in thy properity: and thoiu saidst", "in thy prosperity: and thou saidst"],
  ["Jeremiah", 23, 14, "the way of lying in the peophets", "the way of lying in the prophets"],
  ["Jeremiah", 23, 38, "Say not, Tne burden of the Lord", "Say not, The burden of the Lord"],
  ["Jeremiah", 24, 5, "into the land oif the Chaldeans", "into the land of the Chaldeans"],
  ["Jeremiah", 48, 28, "and be ye Iike the dove", "and be ye like the dove"],
  ["Ezekiel", 4, 13, "the children of Israel Beat their bread", "the children of Israel eat their bread"],
  ["Hosea", 1, 7, "and Iwill not save them", "and I will not save them"],
  ["Nehemiah", 6, 11, "Should such a man as I Bee?", "Should such a man as I flee?"],
  ["Mark", 2, 16, "said to his disiples", "said to his disciples"],
  ["Mark", 2, 18, "And the disiples of John", "And the disciples of John"],
  ["Mark", 3, 31, "his mother and his bretheren came", "his mother and his brethren came"],
  ["Luke", 5, 12, "when he was ina certain city", "when he was in a certain city"],
  ["Acts", 9, 2, "if he found any men and wemen", "if he found any men and women"],

  // Substitutions that land on a real English word, so the rare-token scan below
  // can't see them — these turn up only by reading. This one was live in the
  // Sunday readings for Ordinary Time Week 24.
  ["Sirach", 28, 2, "if he hath hurl thee", "if he hath hurt thee"],
];

/**
 * Apply CORRECTIONS to a `{ book: { chapter: { verse: text } } }` bible in place.
 * Returns `{ applied, skipped, problems }` — `skipped` counts entries already
 * corrected upstream, `problems` describes entries that matched nothing.
 */
export function applyCorrections(bible) {
  let applied = 0;
  let skipped = 0;
  const problems = [];

  for (const [book, chapter, verse, wrong, right] of CORRECTIONS) {
    const ref = `${book} ${chapter}:${verse}`;
    const text = bible[book]?.[String(chapter)]?.[String(verse)];
    if (typeof text !== "string") {
      problems.push(`${ref} — verse not found`);
      continue;
    }
    const hits = text.split(wrong).length - 1;
    if (hits === 0) {
      if (text.includes(right)) skipped++;
      else problems.push(`${ref} — no match for ${JSON.stringify(wrong)}`);
      continue;
    }
    if (hits > 1) {
      problems.push(`${ref} — ${JSON.stringify(wrong)} matches ${hits}× (must be unique)`);
      continue;
    }
    bible[book][String(chapter)][String(verse)] = text.replace(wrong, right);
    applied++;
  }

  return { applied, skipped, problems };
}

// Run directly: patch the committed src/data/dra.json in place.
if (import.meta.url === `file://${process.argv[1]}`) {
  const { readFileSync, writeFileSync } = await import("node:fs");
  const path = new URL("../src/data/dra.json", import.meta.url);
  const bible = JSON.parse(readFileSync(path, "utf8"));
  const { applied, skipped, problems } = applyCorrections(bible);
  if (applied) writeFileSync(path, JSON.stringify(bible));
  console.log(`dra-corrections: ${applied} applied, ${skipped} already correct`);
  for (const p of problems) console.warn(`  ! ${p}`);
  if (problems.length) process.exitCode = 1;
}
