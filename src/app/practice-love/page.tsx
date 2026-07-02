"use client";

import { useMemo, useState } from "react";
import { Fleuron } from "@/components/Sacred";
import { Illustration } from "@/components/Illustration";
import { Kicker, LucideIcon } from "@/components/UI";
import {
  ListenButton,
  SpokenText,
  useNarration,
  useRegisterNarration,
  type NarrationSegment,
} from "@/components/PrayerPlayer";
import { PRACTICE_LOVE, blockSpeech, chapterSegments, type ReadingBlock } from "@/data/practiceLove";
import { markPrayed } from "@/lib/journey";

const BOOK = PRACTICE_LOVE;

function BlockView({
  block, dropcap, active, wordIndex,
}: { block: ReadingBlock; dropcap: boolean; active: boolean; wordIndex: number }) {
  if (block.type === "heading") {
    return (
      <div style={{ margin: "26px 0 14px" }}>
        <Kicker style={{ color: "var(--gold-deep)", fontSize: 13, letterSpacing: ".04em", textTransform: "uppercase" }}>
          {block.text}
        </Kicker>
      </div>
    );
  }
  if (block.type === "lead") {
    // The chapter's thesis line — an emphasised serif tagline.
    return (
      <SpokenText as="p" text={block.text} active={active} wordIndex={wordIndex}
        style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 19, lineHeight: 1.5, color: "var(--ink)", margin: "0 0 20px" }} />
    );
  }
  return (
    <SpokenText as="p" className={dropcap ? "pw-dropcap" : undefined} text={block.text} active={active} wordIndex={wordIndex}
      style={{ fontFamily: "var(--font-body)", fontSize: 17.5, lineHeight: 1.75, color: "var(--ink-700)", margin: "0 0 16px" }} />
  );
}

export default function PracticeLovePage() {
  const [chapterIdx, setChapterIdx] = useState(0);
  const chapter = BOOK.chapters[chapterIdx];

  const segments = useMemo<NarrationSegment[]>(
    () => chapterSegments(BOOK, chapter),
    [chapter],
  );

  // Remember the reader's place per chapter so closing the app resumes here.
  const narration = useNarration({ segments, onComplete: () => markPrayed("devotion"), storageKey: `practice-love:${chapter.id}` });
  useRegisterNarration(narration, `${BOOK.title} — ${chapter.number}`, false, "app-icon-crucifix");
  const speaking = narration.status !== "idle";

  // Index of the first narrated body block (gets the drop cap), and a running
  // map from each block to its narration segment index.
  const firstBodyIdx = chapter.blocks.findIndex((b) => b.type === "body");
  let seg = -1;

  return (
    <div className="pw-devotions-pad" style={{ maxWidth: 640, margin: "0 auto", padding: "32px 18px 72px" }}>
      {/* Title block */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <Illustration name="app-icon-crucifix" size={132} invertOnDark opacity={0.7} />
        </div>
        <Kicker style={{ color: "var(--gold-deep)", letterSpacing: ".04em" }}>Audiobook · {BOOK.author}</Kicker>
        <h1 className="pw-reveal" style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 32, color: "var(--ink)", margin: "6px 0 0", letterSpacing: "-.015em", lineHeight: 1.15 }}>
          {BOOK.title}
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--stone-400)", margin: "12px auto 0", lineHeight: 1.5, maxWidth: 460 }}>
          {BOOK.blurb}
        </p>
        <Fleuron width={200} style={{ margin: "20px auto 0" }} />
      </div>

      {/* Chapter picker */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center", marginBottom: 18 }}>
        {BOOK.chapters.map((c, i) => {
          const on = i === chapterIdx;
          return (
            <button key={c.id} onClick={() => { setChapterIdx(i); narration.reset(0); }} style={{
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11.5, letterSpacing: ".01em",
              padding: "7px 13px", borderRadius: 999, cursor: "pointer",
              border: on ? "none" : "1px solid var(--stone-200)",
              background: on ? "var(--gilt)" : "var(--bone-raised)",
              color: on ? "#2A1A0E" : "var(--ink-500)", transition: "all .15s",
            }}>
              {c.number.replace("Chapter ", "Ch. ")}
            </button>
          );
        })}
      </div>

      {/* Reading card */}
      <section style={{ position: "relative", overflow: "hidden", background: "var(--bone-raised)", border: "1px solid var(--stone-200)", borderRadius: 20, padding: "26px 26px 32px", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ position: "absolute", right: -14, top: -14, pointerEvents: "none", zIndex: 0 }}>
          <Illustration name="app-icon-crucifix" size={168} invertOnDark opacity={0.14} />
        </div>

        {/* Chapter heading */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <Kicker style={{ color: "var(--gold-deep)", fontSize: 13, letterSpacing: ".05em", textTransform: "uppercase" }}>
            {chapter.number}
          </Kicker>
          {chapter.title && (
            <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 23, color: "var(--ink)", margin: "4px 0 0", letterSpacing: "-.01em" }}>
              {chapter.title}
            </h2>
          )}
        </div>

        <div style={{ marginBottom: 24, position: "relative" }}>
          <ListenButton narration={narration} label="Listen" />
        </div>

        {/* Follow-along body — the playing paragraph highlights word-by-word. */}
        <div style={{ position: "relative" }}>
          {chapter.blocks.map((b, i) => {
            const si = blockSpeech(b) ? ++seg : -1;
            return (
              <BlockView
                key={i}
                block={b}
                dropcap={i === firstBodyIdx}
                active={speaking && narration.index === si}
                wordIndex={narration.wordIndex}
              />
            );
          })}
        </div>
      </section>

      {/* Source attribution */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 26 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--stone-400)", fontStyle: "italic", textAlign: "center" }}>
          <LucideIcon name="book-open" size={15} />
          {BOOK.author} · {BOOK.translator} · {BOOK.sourceLabel}
        </span>
      </div>
    </div>
  );
}
