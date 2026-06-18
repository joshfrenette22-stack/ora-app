"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Fleuron } from "@/components/Sacred";
import { Illustration } from "@/components/Illustration";
import { Kicker } from "@/components/UI";
import { ListenButton, SpokenText, useNarration, useRegisterNarration, type NarrationSegment } from "@/components/PrayerPlayer";
import {
  AUX_DAILY, AUX_LITANY, AUX_DAYS, AUX_CONCLUDING,
  type AuxBlock, type AuxSection,
} from "@/data/auxilium";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Turn a block into the words spoken aloud (skip dividers & headings).
function blockSpeech(b: AuxBlock): string | null {
  if (b.type === "rule" || b.type === "heading") return null;
  if (b.type === "petition") return `${b.text} ${b.response}`;
  return b.text;
}

function BlockView({ block, active, wordIndex, dark }: { block: AuxBlock; active: boolean; wordIndex: number; dark: boolean }) {
  const ink = dark ? "rgba(239,230,214,0.86)" : "var(--ink-700)";
  const gold = dark ? "var(--gold-bright)" : "var(--gold-deep)";

  if (block.type === "rule") {
    return <div style={{ height: 1, background: dark ? "rgba(239,230,214,0.12)" : "var(--stone-200)", margin: "18px 0" }} />;
  }
  if (block.type === "heading") {
    return (
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, letterSpacing: ".04em", textTransform: "uppercase", color: gold, margin: "4px 0 10px" }}>
        {block.text}
      </div>
    );
  }
  if (block.type === "versicle") {
    return (
      <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 17, lineHeight: 1.6, color: ink, margin: "0 0 8px", display: "flex", gap: 10 }}>
        <span style={{ color: gold, fontStyle: "normal", fontWeight: 600, flexShrink: 0 }}>{block.a}</span>
        <SpokenText as="span" dark={dark} text={block.text} active={active} wordIndex={wordIndex} />
      </p>
    );
  }
  if (block.type === "petition") {
    // Invocation in serif, the response set apart in gold — litany cadence.
    return (
      <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, lineHeight: 1.6, color: ink, margin: "0 0 7px" }}>
        <SpokenText as="span" dark={dark} text={block.text} active={active} wordIndex={wordIndex} />{" "}
        <span style={{ color: gold, fontWeight: 600 }}>{block.response}</span>
      </p>
    );
  }
  if (block.type === "lead") {
    return (
      <SpokenText as="p" dark={dark} className="pw-dropcap" text={block.text} active={active} wordIndex={wordIndex}
        style={{ fontFamily: "var(--font-body)", fontSize: 17, lineHeight: 1.74, color: ink, margin: "0 0 14px" }} />
    );
  }
  // body
  return (
    <SpokenText as="p" dark={dark} text={block.text} active={active} wordIndex={wordIndex}
      style={{ fontFamily: "var(--font-body)", fontSize: 16.5, lineHeight: 1.74, color: ink, margin: "0 0 14px" }} />
  );
}

function SectionCard({
  section, startIndex, narrationIndex, wordIndex, speaking,
}: { section: AuxSection; startIndex: number; narrationIndex: number; wordIndex: number; speaking: boolean }) {
  let seg = startIndex - 1;
  return (
    <section style={{ background: "var(--bone-raised)", border: "1px solid var(--stone-200)", borderRadius: 20, padding: "26px 26px 22px", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ marginBottom: 18 }}>
        <Kicker>{section.sub ?? "Auxilium Christianorum"}</Kicker>
        <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 24, color: "var(--ink)", margin: "3px 0 0", letterSpacing: "-.01em" }}>
          {section.title}
        </h2>
      </div>
      <div>
        {section.blocks.map((b, i) => {
          const si = b.type === "rule" || b.type === "heading" ? -1 : ++seg;
          return <BlockView key={i} block={b} dark={false} active={speaking && si >= 0 && narrationIndex === si} wordIndex={wordIndex} />;
        })}
      </div>
    </section>
  );
}

function AuxiliumInner() {
  const params = useSearchParams();
  const todayDow = new Date().getDay();
  // Allow ?day=N (0–6); otherwise follow today.
  const initialDay = (() => {
    const q = Number(params.get("day"));
    return Number.isInteger(q) && q >= 0 && q <= 6 ? q : todayDow;
  })();
  const [day, setDay] = useState(initialDay);

  const daySection: AuxSection = useMemo(() => {
    const d = AUX_DAYS[day];
    return { id: `day-${day}`, title: d.title, sub: d.sub ?? "Prayer for the day", blocks: d.blocks };
  }, [day]);

  // Render order: daily → litany → today's particular prayer → concluding.
  const sections = useMemo(() => [AUX_DAILY, AUX_LITANY, daySection, AUX_CONCLUDING], [daySection]);

  // Flatten into narration segments, recording each section's starting index.
  const { segments, starts } = useMemo(() => {
    const segs: NarrationSegment[] = [];
    const starts: number[] = [];
    sections.forEach((sec) => {
      starts.push(segs.length);
      sec.blocks.forEach((b, i) => {
        const text = blockSpeech(b);
        if (text) segs.push({ id: `${sec.id}-${i}`, label: sec.title, text });
      });
    });
    return { segments: segs, starts };
  }, [sections]);

  const narration = useNarration({ segments });
  useRegisterNarration(narration, "Auxilium Christianorum", false, "section-devotions");
  const speaking = narration.status !== "idle";

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 18px 80px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <Illustration name="section-devotions" size={150} invertOnDark opacity={0.6} />
        </div>
        <Kicker style={{ textAlign: "center" }}>Mary, Help of Christians</Kicker>
        <h1 className="pw-reveal" style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 34, color: "var(--ink)", margin: "6px 0 0", letterSpacing: "-.015em" }}>
          Auxilium Christianorum
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--stone-400)", margin: "10px auto 0", lineHeight: 1.6, maxWidth: 460 }}>
          Daily prayers for protection in spiritual combat, under the patronage of Our Lady, Help of Christians. Pray them every day, with the prayer proper to each day of the week.
        </p>
        <Fleuron width={200} style={{ margin: "20px auto 0" }} />
      </div>

      {/* Listen */}
      <div style={{ margin: "8px 0 24px" }}>
        <ListenButton narration={narration} label="Pray aloud" />
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--stone-400)", textAlign: "center", margin: "10px 0 0" }}>
          Reads the daily prayers, the prayer for {DAY_LABELS[day]}, and the concluding prayer.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Daily */}
        <SectionCard section={AUX_DAILY} startIndex={starts[0]} narrationIndex={narration.index} wordIndex={narration.wordIndex} speaking={speaking} />
        {/* Litany */}
        <SectionCard section={AUX_LITANY} startIndex={starts[1]} narrationIndex={narration.index} wordIndex={narration.wordIndex} speaking={speaking} />

        {/* Day selector + particular-day prayer */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, margin: "6px 2px 12px" }}>
            <Kicker>Prayer for the day</Kicker>
            {day !== todayDow && (
              <button onClick={() => setDay(todayDow)} style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600, color: "var(--gold-deep)", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                Back to today
              </button>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
            {SHORT.map((label, i) => {
              const on = i === day;
              return (
                <button key={label} onClick={() => { setDay(i); narration.reset(0); }} style={{
                  fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, letterSpacing: ".01em",
                  padding: "8px 14px", borderRadius: 999, cursor: "pointer",
                  border: on ? "none" : "1px solid var(--stone-300)",
                  background: on ? "var(--gilt)" : "transparent",
                  color: on ? "#2A1A0E" : "var(--ink-500)", transition: "all .15s",
                }}>
                  {label}{i === todayDow ? " ·" : ""}
                </button>
              );
            })}
          </div>
          <SectionCard section={daySection} startIndex={starts[2]} narrationIndex={narration.index} wordIndex={narration.wordIndex} speaking={speaking} />
        </div>

        {/* Concluding */}
        <SectionCard section={AUX_CONCLUDING} startIndex={starts[3]} narrationIndex={narration.index} wordIndex={narration.wordIndex} speaking={speaking} />
      </div>
    </div>
  );
}

export default function AuxiliumPage() {
  return (
    <Suspense fallback={null}>
      <AuxiliumInner />
    </Suspense>
  );
}
