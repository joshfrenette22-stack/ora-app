"use client";

import { useMemo } from "react";
import { Fleuron } from "@/components/Sacred";
import { Kicker } from "@/components/UI";
import { PlayerBar, SpokenText, useNarration, type NarrationSegment } from "@/components/PrayerPlayer";
import { LucideIcon } from "@/components/UI";
import { Illustration } from "@/components/Illustration";
import { DEVOTION_ART } from "@/lib/illustrations";
import { DEVOTIONS } from "@/data/content";

type DevotionKey = keyof typeof DEVOTIONS;
type Block = (typeof DEVOTIONS)[DevotionKey]["blocks"][number];

// Order + an icon per devotion (Angelus leads — it is the most-prayed).
const ORDER: { key: DevotionKey; lucide: string }[] = [
  { key: "angelus", lucide: "bell" },
  { key: "mercy", lucide: "heart" },
  { key: "michael", lucide: "shield" },
  { key: "memorare", lucide: "flower" },
];

function segmentsFor(blocks: readonly Block[], title: string): NarrationSegment[] {
  return blocks
    .filter((b): b is Exclude<Block, { type: "rule" }> => b.type !== "rule")
    .map((b, i) => ({ id: `${title}-${i}`, label: title, text: b.text }));
}

function BlockView({ block, active, wordIndex }: { block: Block; active: boolean; wordIndex: number }) {
  if (block.type === "rule") {
    return <div style={{ height: 1, background: "var(--stone-200)", margin: "18px 0" }} />;
  }
  if (block.type === "versicle") {
    return (
      <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 17, lineHeight: 1.6, color: "var(--ink-700)", margin: "0 0 8px", display: "flex", gap: 10 }}>
        <span style={{ color: "var(--gold-deep)", fontStyle: "normal", fontWeight: 600, flexShrink: 0 }}>{block.a}</span>
        <SpokenText as="span" text={block.text} active={active} wordIndex={wordIndex} />
      </p>
    );
  }
  if (block.type === "lead") {
    return (
      <SpokenText as="p" className="pw-dropcap" text={block.text} active={active} wordIndex={wordIndex}
        style={{ fontFamily: "var(--font-body)", fontSize: 17.5, lineHeight: 1.72, color: "var(--ink-700)", margin: "0 0 14px" }} />
    );
  }
  // body
  return (
    <SpokenText as="p" text={block.text} active={active} wordIndex={wordIndex}
      style={{ fontFamily: "var(--font-body)", fontSize: 17, lineHeight: 1.72, color: "var(--ink-700)", margin: "0 0 14px" }} />
  );
}

function DevotionCard({ dkey, lucide }: { dkey: DevotionKey; lucide: string }) {
  const d = DEVOTIONS[dkey];
  const segments = useMemo(() => segmentsFor(d.blocks, d.title), [d]);
  const narration = useNarration({ segments });
  const speaking = narration.status !== "idle";

  // Each non-rule block maps to one narration segment, in order.
  let seg = -1;

  return (
    <section id={dkey} className="pw-devotion-card" style={{ scrollMarginTop: 24, position: "relative", overflow: "hidden", background: "var(--bone-raised)", border: "1px solid var(--stone-200)", borderRadius: 20, padding: "28px 28px 30px", boxShadow: "var(--shadow-sm)" }}>
      {DEVOTION_ART[dkey] && (
        <div style={{ position: "absolute", right: -10, top: -10, pointerEvents: "none", zIndex: 0 }}>
          <Illustration name={DEVOTION_ART[dkey]} size={200} invertOnDark opacity={0.5} />
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, position: "relative" }}>
        <span style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--gold-faint)", color: "var(--gold-deep)", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <LucideIcon name={lucide} size={22} />
        </span>
        <div>
          <Kicker>{d.sub}</Kicker>
          <h2 className="pw-devotion-title" style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 27, color: "var(--ink)", margin: "2px 0 0", letterSpacing: "-.01em" }}>
            {d.title}
          </h2>
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <PlayerBar narration={narration} title={`Pray ${d.title} aloud`} />
      </div>

      <div>
        {d.blocks.map((b, i) => {
          const si = b.type === "rule" ? -1 : ++seg;
          return <BlockView key={i} block={b} active={speaking && narration.index === si} wordIndex={narration.wordIndex} />;
        })}
      </div>
    </section>
  );
}

export default function DevotionsPage() {
  return (
    <div className="pw-devotions-pad" style={{ maxWidth: 600, margin: "0 auto", padding: "32px 18px 64px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <Illustration name="section-devotions" size={160} invertOnDark opacity={0.6} />
        </div>
        <h1 className="pw-reveal" style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 34, color: "var(--ink)", margin: 0, letterSpacing: "-.015em" }}>
          Daily Devotions
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--stone-400)", margin: "8px 0 0", lineHeight: 1.5 }}>
          A few words to lift the heart — at noon, at three, in time of trial.
        </p>
        <Fleuron width={200} style={{ margin: "20px auto 0" }} />
      </div>

      {ORDER.map(({ key, lucide }) => (
        <DevotionCard key={key} dkey={key} lucide={lucide} />
      ))}
    </div>
  );
}
