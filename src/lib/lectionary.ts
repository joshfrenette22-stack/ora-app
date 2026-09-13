// The Order of Mass framing around each reading of the Liturgy of the Word.
//
// In the Roman Rite each scripture reading is proclaimed inside a fixed frame
// (Order of Mass, Liturgy of the Word):
//
//   First reading   "A reading from the Book of …"   →  text  →  "The word of the
//                                                                 Lord." / "Thanks be to God."
//   Psalm           (no introduction)                →  text  →  (no conclusion)
//                   The psalmist sings or says the psalm and the people answer
//                   with the refrain; it is a response to the reading, not a
//                   reading in its own right.
//   Second reading  as the first reading
//   Gospel          "A reading from the holy Gospel   →  text  →  "The Gospel of the
//                    according to N." / "Glory to                  Lord." / "Praise to
//                    you, O Lord."                                 you, Lord Jesus Christ."
//
// The introduction wording is the Lectionary's and depends on the book: the
// prophets are "the Book of the Prophet N", Paul's letters name him, Hebrews
// deliberately does not, and Acts and the Song of Songs have their own forms.

import { bookName } from "./dra";

export type Section = "first" | "psalm" | "second" | "gospel";

/** What the reader says and how the people answer. */
export interface Acclamation {
  say: string;
  reply: string;
}

const WORD_OF_THE_LORD: Acclamation = { say: "The word of the Lord.", reply: "Thanks be to God." };
const GOSPEL_OF_THE_LORD: Acclamation = { say: "The Gospel of the Lord.", reply: "Praise to you, Lord Jesus Christ." };

/** The people's answer to the Gospel introduction, said before the Gospel is read. */
export const GOSPEL_REPLY = "Glory to you, O Lord.";

/** The Gospel alone opens with a greeting, said by the Deacon or Priest at the ambo. */
const GOSPEL_GREETING: Acclamation = { say: "The Lord be with you.", reply: "And with your spirit." };

const GOSPELS = new Set(["Matthew", "Mark", "Luke", "John"]);

// Prophets take "the Book of the Prophet N". Lamentations and Baruch are grouped
// with the prophets in the canon but keep their own forms below.
const PROPHETS = new Set([
  "Isaiah", "Jeremiah", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah",
  "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Baruch",
]);

// Books whose introduction is not "the Book of N".
const SPECIAL: Record<string, string> = {
  "Song of Solomon": "the Song of Songs",
  Acts: "the Acts of the Apostles",
  Hebrews: "the Letter to the Hebrews", // not ascribed to Paul
  James: "the Letter of Saint James",
  Jude: "the Letter of Saint Jude",
};

// Paul's letters, keyed by the book name without any "1 "/"2 " prefix.
const PAULINE: Record<string, string> = {
  Romans: "the Romans",
  Corinthians: "the Corinthians",
  Galatians: "the Galatians",
  Ephesians: "the Ephesians",
  Philippians: "the Philippians",
  Colossians: "the Colossians",
  Thessalonians: "the Thessalonians",
  Timothy: "Timothy",
  Titus: "Titus",
  Philemon: "Philemon",
};

// Catholic letters that carry the apostle's name.
const APOSTOLIC: Record<string, string> = { Peter: "Saint Peter", John: "Saint John" };

const ORDINALS = ["", "first", "second", "third", "fourth"];

/** Split "1 Corinthians" into its ordinal number and stem. */
function splitNumbered(book: string): { n: number; stem: string } {
  const m = book.match(/^([1-4])\s+(.+)$/);
  return m ? { n: Number(m[1]), stem: m[2] } : { n: 0, stem: book };
}

/** "1 Kings" → "the first Book of Kings"; "Genesis" → "the Book of Genesis". */
function bookPhrase(book: string): string {
  if (SPECIAL[book]) return SPECIAL[book];

  const { n, stem } = splitNumbered(book);
  const nth = n ? `${ORDINALS[n]} ` : "";

  if (PAULINE[stem]) return `the ${nth}Letter of Saint Paul to ${PAULINE[stem]}`;
  if (APOSTOLIC[stem]) return `the ${nth}Letter of ${APOSTOLIC[stem]}`;
  if (PROPHETS.has(book)) return `the Book of the Prophet ${book}`;
  return `the ${nth}Book of ${stem}`;
}

/**
 * The reader's introduction for a citation, e.g. "A reading from the Book of
 * Genesis." — or null when the book can't be resolved, so the caller simply
 * omits the line. The Responsorial Psalm has no introduction.
 */
export function readingIntro(cite: string, section: Section): string | null {
  if (section === "psalm") return null;

  const m = cite.trim().match(/^((?:[1-4]\s)?[A-Za-z]+)/);
  const book = m ? bookName(m[1]) : null;
  if (!book) return null;

  if (GOSPELS.has(book)) return `A reading from the holy Gospel according to ${book}.`;
  return `A reading from ${bookPhrase(book)}.`;
}

/**
 * The acclamation that closes a reading, or null for the Responsorial Psalm —
 * the psalm is the people's response to the first reading and is not closed
 * with "The word of the Lord."
 */
export function readingAcclamation(section: Section): Acclamation | null {
  if (section === "psalm") return null;
  return section === "gospel" ? GOSPEL_OF_THE_LORD : WORD_OF_THE_LORD;
}

/** The framing fields to spread onto a reading. Empty for the Responsorial Psalm. */
export interface Frame {
  /** "The Lord be with you." / "And with your spirit." — the Gospel only. */
  greeting?: Acclamation;
  intro?: string;
  /** The people's answer to the introduction — the Gospel only. */
  introReply?: string;
  acclamation?: Acclamation;
}

/**
 * The Order of Mass frame for a reading, ready to spread onto it. Resolving this
 * server-side keeps the book tables (and the bundled Douay–Rheims they share)
 * out of the client bundle.
 */
export function frameFor(cite: string, section: Section): Frame {
  const intro = readingIntro(cite, section);
  const acclamation = readingAcclamation(section);
  const isGospel = section === "gospel";
  return {
    ...(isGospel ? { greeting: GOSPEL_GREETING } : {}),
    ...(intro ? { intro } : {}),
    ...(intro && isGospel ? { introReply: GOSPEL_REPLY } : {}),
    ...(acclamation ? { acclamation } : {}),
  };
}
