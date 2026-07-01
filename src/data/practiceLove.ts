/** "The Practice of the Love of Jesus Christ" — St. Alphonsus Liguori (1768).
 *
 *  A spoken-word (audiobook) presentation of this public-domain devotional
 *  classic, read aloud through the same cloud-TTS narration engine used by the
 *  Rosary and the Devotions. The book develops St. Paul's hymn to charity
 *  (1 Corinthians 13) into a practical rule for loving Jesus Christ.
 *
 *  Source: catholictradition.org's "christ7" series is this work; christ7-1.htm
 *  is its Introduction. That host could not be reached from the build
 *  environment (egress policy), so the text below is transcribed from the
 *  public-domain English translation (Rev. Eugene Grimm, The Ascetical Works,
 *  Vol. VI). It is kept in this one file so the exact source wording can be
 *  pasted in to replace or extend it, and more chapters added, without touching
 *  the page or the player.
 *
 *  Structure mirrors the other narrated content (auxilium.ts / content.ts): a
 *  book has ordered chapters, each a list of paragraphs. Every paragraph becomes
 *  one narration segment, so the reader can follow along word-by-word and skip
 *  between paragraphs. */

export interface AudiobookChapter {
  /** Stable id, used in narration segment ids and the saved-position key. */
  id: string;
  /** Section label, e.g. "Introduction", "Chapter I". */
  number: string;
  /** Chapter title (may be empty for the Introduction). */
  title: string;
  /** Body paragraphs, in reading order. Each is one narrated segment. */
  paragraphs: string[];
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
  chapters: AudiobookChapter[];
}

export const PRACTICE_LOVE: Audiobook = {
  slug: "practice-love-of-jesus",
  title: "The Practice of the Love of Jesus Christ",
  author: "St. Alphonsus Liguori",
  translator: "Trans. Rev. Eugene Grimm",
  blurb:
    "St. Alphonsus's best-loved devotional work — St. Paul's hymn to charity turned into a rule of life for loving Jesus Christ. Read aloud.",
  sourceLabel: "Public-domain text · Ascetical Works, Vol. VI",
  chapters: [
    {
      id: "introduction",
      number: "Introduction",
      title: "The Love of Jesus Christ",
      paragraphs: [
        "The whole sanctity and perfection of a soul consists in loving Jesus Christ, our God, our sovereign good, and our Redeemer. Whoever loves me, says Jesus Christ himself, shall be loved by my eternal Father: My Father loveth you, because you have loved me.",
        "Some, says Saint Francis de Sales, make perfection consist in an austere life; others in prayer; others in frequenting the sacraments; others in almsdeeds. But they deceive themselves: perfection consists in loving God with our whole heart. For it is charity, the Apostle tells us, that is the bond of perfection; it is charity that keeps united and preserves all those other virtues which together make a man perfect.",
        "Hence Saint Augustine said, Love, and do what thou wilt; because a soul that truly loves God is by that same love taught never to do anything that would displease him, and to leave nothing undone by which she may please him.",
        "But perhaps you think that God does not deserve all your love. Cast a glance, then, upon that cross; look upon that Man of Sorrows, mangled with wounds and dying for you upon a shameful gibbet; and see whether he who has borne so much for love of you does not deserve to be loved. He gave his whole self to you: how can you refuse to give yourself wholly to him?",
        "The Apostle Saint Paul, in the thirteenth chapter of his First Epistle to the Corinthians, describes the qualities and the effects of that holy charity of which a soul that loves Jesus Christ should be possessed. He says: Charity is patient, is kind: charity envieth not, dealeth not perversely; is not puffed up, is not ambitious, seeketh not her own, is not provoked to anger, thinketh no evil; rejoiceth not in iniquity, but rejoiceth with the truth; beareth all things, believeth all things, hopeth all things, endureth all things.",
        "In order, then, that we may understand how far we are from that perfect love to which we ought to aspire, we shall consider these several qualities of charity one by one; and, examining ourselves upon each, we shall see wherein we are wanting, and shall add to each the acts and prayers that may help us to obtain this holy love.",
        "O my beloved Jesus, thou art worthy of an infinite love, and thou hast done so much to oblige me to love thee. Suffer me no longer to live ungrateful for so much goodness. I love thee, my Jesus; I love thee, my sovereign good; I love thee above all things, and I desire nothing but to love thee for evermore. Give me strength to love thee, and then do with me whatsoever thou wilt.",
        "And thou, O Mary, my hope, Mother of fair love, obtain for me the grace to love in earnest thy Son Jesus Christ, and to love him always until the last breath of my life. This I ask, this I hope from thee.",
      ],
    },
  ],
};

/** All chapters of a book flattened into narration segments (paragraph-level),
 *  labelled with the chapter number so the player shows where the reader is. */
export function chapterSegments(book: Audiobook, chapter: AudiobookChapter) {
  return chapter.paragraphs.map((text, i) => ({
    id: `${book.slug}-${chapter.id}-${i}`,
    label: chapter.number,
    text,
  }));
}

/** The full spoken text of a book, for the playlist catalogue (one listenable
 *  item). Chapters are joined so a whole reading plays end to end. */
export function audiobookText(book: Audiobook): string {
  return book.chapters.flatMap((c) => c.paragraphs).join(" ");
}
