"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Fleuron } from "@/components/Sacred";
import { Kicker } from "@/components/UI";
import { ListenButton, SpokenText, useNarration, useRegisterNarration, type NarrationSegment } from "@/components/PrayerPlayer";
import { LucideIcon } from "@/components/UI";
import { Illustration } from "@/components/Illustration";
import { DEVOTION_ART, type IllustrationKey } from "@/lib/illustrations";
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
  return (
    <SpokenText as="p" text={block.text} active={active} wordIndex={wordIndex}
      style={{ fontFamily: "var(--font-body)", fontSize: 17, lineHeight: 1.72, color: "var(--ink-700)", margin: "0 0 14px" }} />
  );
}

const ROW: React.CSSProperties = {
  position: "relative", overflow: "hidden",
  background: "var(--bone-raised)", border: "1px solid var(--stone-200)",
  borderRadius: 18, boxShadow: "var(--shadow-sm)",
};
const HEADER: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left",
  padding: "15px 18px", background: "transparent", border: "none", cursor: "pointer",
};
const ICON: React.CSSProperties = {
  width: 44, height: 44, borderRadius: "50%", background: "var(--gold-faint)",
  color: "var(--gold-deep)", display: "grid", placeItems: "center", flexShrink: 0,
};
const TITLE: React.CSSProperties = {
  fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 20, color: "var(--ink)",
  margin: "1px 0 0", letterSpacing: "-.01em",
};

/** A devotion shown collapsed by default; tapping the row expands the full
 *  prayer with the Listen button. Controlled so only one is open at a time. */
function DevotionRow({ dkey, lucide, open, onToggle }: { dkey: DevotionKey; lucide: string; open: boolean; onToggle: () => void }) {
  const d = DEVOTIONS[dkey];
  const segments = useMemo(() => segmentsFor(d.blocks, d.title), [d]);
  const narration = useNarration({ segments });
  useRegisterNarration(narration, `Pray ${d.title} aloud`, false, DEVOTION_ART[dkey] as IllustrationKey | undefined);
  const speaking = narration.status !== "idle";
  let seg = -1;

  return (
    <section id={dkey} style={{ ...ROW, scrollMarginTop: 16 }}>
      <button onClick={onToggle} aria-expanded={open} style={HEADER}>
        <span style={ICON}><LucideIcon name={lucide} size={21} /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <Kicker>{d.sub}</Kicker>
          <span style={{ ...TITLE, display: "block" }} className="pw-devotion-title">{d.title}</span>
        </span>
        <LucideIcon name={open ? "chevron-up" : "chevron-down"} size={18} />
      </button>

      {open && (
        <div style={{ padding: "0 20px 24px", position: "relative" }}>
          {DEVOTION_ART[dkey] && (
            <div style={{ position: "absolute", right: -10, top: -40, pointerEvents: "none", zIndex: 0 }}>
              <Illustration name={DEVOTION_ART[dkey]} size={170} invertOnDark opacity={0.4} />
            </div>
          )}
          <div style={{ marginBottom: 20, position: "relative" }}>
            <ListenButton narration={narration} label={`Pray ${d.title}`} />
          </div>
          <div style={{ position: "relative" }}>
            {d.blocks.map((b, i) => {
              const si = b.type === "rule" ? -1 : ++seg;
              return <BlockView key={i} block={b} active={speaking && narration.index === si} wordIndex={narration.wordIndex} />;
            })}
          </div>
        </div>
      )}
    </section>
  );
}

/** A devotion that lives on its own page — a compact row that links out. */
function DevotionLink({ href, lucide, kicker, title }: { href: string; lucide: string; kicker: string; title: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none", color: "var(--stone-400)" }}>
      <section style={ROW}>
        <div style={HEADER}>
          <span style={ICON}><LucideIcon name={lucide} size={21} /></span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <Kicker>{kicker}</Kicker>
            <span style={{ ...TITLE, display: "block" }}>{title}</span>
          </span>
          <LucideIcon name="arrow-right" size={18} />
        </div>
      </section>
    </Link>
  );
}

export default function DevotionsPage() {
  const [open, setOpen] = useState<DevotionKey | null>(null);

  return (
    <div className="pw-devotions-pad" style={{ maxWidth: 600, margin: "0 auto", padding: "26px 18px 64px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <h1 className="pw-reveal" style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 30, color: "var(--ink)", margin: 0, letterSpacing: "-.015em" }}>
          Devotions
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--stone-400)", margin: "6px 0 0", lineHeight: 1.5 }}>
          Tap a prayer to open it.
        </p>
        <Fleuron width={160} style={{ margin: "14px auto 4px" }} />
      </div>

      {ORDER.map(({ key, lucide }) => (
        <DevotionRow key={key} dkey={key} lucide={lucide} open={open === key} onToggle={() => setOpen(open === key ? null : key)} />
      ))}

      <DevotionLink href="/holy-face" lucide="cross" kicker="Chaplet · Guided or Interactive" title="Chaplet of the Holy Face" />
      <DevotionLink href="/auxilium" lucide="shield" kicker="Help of Christians · Daily" title="Auxilium Christianorum" />
      <DevotionLink href="/practice-love" lucide="book-open" kicker="Audiobook · St. Alphonsus Liguori" title="The Practice of the Love of Jesus Christ" />
    </div>
  );
}
