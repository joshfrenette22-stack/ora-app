// USCCB/NAB citation-abbreviation → canonical book names, shared by the
// Douay–Rheims renderer and the ESV layer. Kept free of the (large) DRA data
// so importing it never pulls the whole bible into memory.

// Normalised USCCB/NAB abbreviation → Douay–Rheims book name used in the data.
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
  "1mc": "1 Maccabees", "1macc": "1 Maccabees", "1mac": "1 Maccabees",
  "2mc": "2 Maccabees", "2macc": "2 Maccabees",
  jb: "Job", job: "Job",
  ps: "Psalm", pss: "Psalm", psalm: "Psalm", psalms: "Psalm",
  prv: "Proverbs", prov: "Proverbs",
  eccl: "Ecclesiastes", qoh: "Ecclesiastes",
  sg: "Song of Solomon", song: "Song of Solomon", ct: "Song of Solomon",
  wis: "Wisdom",
  sir: "Sirach", ecclus: "Sirach",
  is: "Isaiah", isa: "Isaiah",
  jer: "Jeremiah",
  lam: "Lamentations",
  // Baruch is absent from both public-domain DRA sources — Bar citations fall back.
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

export function resolveBook(token: string): string | null {
  const key = token.toLowerCase().replace(/[.\s]/g, "");
  return BOOK_MAP[key] ?? null;
}


/** Resolve a USCCB book abbreviation to a full book name. */
export function bookName(token: string): string | null {
  return resolveBook(token);
}
