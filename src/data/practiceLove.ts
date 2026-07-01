/** "The Practice of the Love of Jesus Christ" — St. Alphonsus Liguori (1768).
 *
 *  A spoken-word (audiobook) presentation of this public-domain devotional
 *  classic, read aloud through the same cloud-TTS narration engine used by the
 *  Rosary and the Devotions. The book develops St. Paul's hymn to charity
 *  (1 Corinthians 13) into a practical rule for loving Jesus Christ.
 *
 *  The chapter content lives in practiceLove.json, generated from the vendored
 *  public-domain source by scripts/build-practice-love.mjs (run it after
 *  editing the source). Types and helpers are here so the page and the player
 *  stay decoupled from how the text is produced.
 *
 *  A chapter is a list of blocks. "heading" blocks (section labels such as
 *  "Affections and Prayers") are shown but not read aloud; "lead" and "body"
 *  blocks are narrated — each becomes one segment, so the reader follows along
 *  word-by-word and can skip between paragraphs. */

import bookData from "./practiceLove.json";

export type ReadingBlockType = "heading" | "lead" | "body";

export interface ReadingBlock {
  type: ReadingBlockType;
  text: string;
}

export interface ReadingChapter {
  /** Stable id, used in narration segment ids and the saved-position key. */
  id: string;
  /** Section label, e.g. "Chapter 1" or "Chapter 4 · Part 2". */
  number: string;
  /** Chapter title (the charity phrase). */
  title: string;
  blocks: ReadingBlock[];
}

export interface Audiobook {
  slug: string;
  title: string;
  author: string;
  /** Translator / edition, shown in the source line. */
  translator?: string;
  /** One-line description for headers and cards. */
  blurb: string;
  /** Human-readable attribution of the underlying source. */
  sourceLabel: string;
  /** The page the text is drawn from. */
  sourceUrl?: string;
  chapters: ReadingChapter[];
}

export const PRACTICE_LOVE = bookData as Audiobook;

/** The spoken form of a block, or null for non-narrated blocks (headings). */
export function blockSpeech(b: ReadingBlock): string | null {
  return b.type === "heading" ? null : b.text;
}

/** A chapter's narrated blocks as player segments, labelled with the chapter
 *  number so the player shows where the reader is. */
export function chapterSegments(book: Audiobook, chapter: ReadingChapter) {
  const segs: { id: string; label: string; text: string }[] = [];
  chapter.blocks.forEach((b, i) => {
    const text = blockSpeech(b);
    if (text) segs.push({ id: `${book.slug}-${chapter.id}-${i}`, label: chapter.number, text });
  });
  return segs;
}

/** The full spoken text of a book (all narrated blocks, in order). */
export function audiobookText(book: Audiobook): string {
  return book.chapters
    .flatMap((c) => c.blocks.map(blockSpeech).filter((t): t is string => t !== null))
    .join(" ");
}
