"use client";

import { useEffect, useMemo, useState } from "react";
import { Fleuron } from "@/components/Sacred";
import { Illustration } from "@/components/Illustration";
import { Kicker, LucideIcon } from "@/components/UI";
import { ListenButton, SpokenText, useNarration, useRegisterNarration, type NarrationSegment } from "@/components/PrayerPlayer";
import {
  AUXILIUM_DAILY,
  AUXILIUM_CONCLUDING,
  auxiliumProperForDay,
  auxBlockSpeech,
  type AuxBlock,
} from "@/data/auxilium";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function BlockView({ block, active, wordIndex }: { block: AuxBlock; active: boolean; wordIndex: number }) {
  if (block.type === "rule") {
    return <div style={{ height: 1, background: "var(--stone-200)", margin: "20px 0" }} />;
  }
  if (block.type === "heading") {
    return (
      <div style={{ margin: "26px 0 14px" }}>
        <Kicker style={{ color: "var(--gold-deep)", fontSize: 13, letterSpacing: ".04em", textTransform: "uppercase" }}>
          {block.text}
        </Kicker>
      </div>
    );
  }
  if (block.type === "versicle") {
    return (
      <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 17, lineHeight: 1.6, color: "var(--ink-700)", margin: "0 0 8px", display: "flex", gap: 10 }}>
        <span style={{ color: "var(--gold-deep)", fontStyle: "normal", fontWeight: 600, flexShrink: 0 }}>{block.a}</span>
        <SpokenText as="span" text={block.text} active={active} wordIndex={wordIndex} />
      </p>
    );
  }
  if (block.type === "petition") {
    // A litany line: invocation, then its fixed response in gold. The whole line
    // is gently highlighted while it is being prayed aloud.
    return (
      <p style={{
        fontFamily: "var(--font-serif)", fontSize: 16.5, lineHeight: 1.62, color: "var(--ink-700)",
        margin: "0 0 6px", padding: "2px 8px", borderRadius: 7,
        background: active ? "rgba(210,107,67,0.10)" : "transparent", transition: "background .15s",
      }}>
        <span style={{ fontStyle: "italic" }}>{block.text} </span>
        <span style={{ color: "var(--gold-deep)", fontWeight: 600 }}>{block.r}</span>
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

export default function AuxiliumPage() {
  // Default to today's proper, resolved on the client to avoid a hydration
  // mismatch (the server has no fixed weekday).
  const [day, setDay] = useState(0);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDay(new Date().getDay());
  }, []);

  const proper = auxiliumProperForDay(day);

  // Everyday prayers → today's proper → the concluding prayer.
  const blocks = useMemo<AuxBlock[]>(
    () => [...AUXILIUM_DAILY, ...proper.blocks, ...AUXILIUM_CONCLUDING],
    [proper],
  );

  const segments = useMemo<NarrationSegment[]>(() => {
    const segs: NarrationSegment[] = [];
    blocks.forEach((b, i) => {
      const text = auxBlockSpeech(b);
      if (text) segs.push({ id: `aux-${i}`, label: "Auxilium Christianorum", text });
    });
    return segs;
  }, [blocks]);

  const narration = useNarration({ segments, storageKey: `auxilium:${day}` });
  useRegisterNarration(narration, "Pray the Auxilium Christianorum", false, "devotion-st-michael");
  const speaking = narration.status !== "idle";

  // Map each narrated block to its segment index, in order.
  let seg = -1;

  return (
    <div className="pw-devotions-pad" style={{ maxWidth: 620, margin: "0 auto", padding: "32px 18px 64px" }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <Illustration name="devotion-st-michael" size={150} invertOnDark opacity={0.6} />
        </div>
        <Kicker style={{ color: "var(--gold-deep)", letterSpacing: ".04em" }}>Help of Christians · Daily Prayers</Kicker>
        <h1 className="pw-reveal" style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 33, color: "var(--ink)", margin: "6px 0 0", letterSpacing: "-.015em" }}>
          Auxilium Christianorum
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--stone-400)", margin: "10px auto 0", lineHeight: 1.5, maxWidth: 440 }}>
          A daily rule of prayer for spiritual protection — said in full each day, with a proper prayer for every day of the week. Traditionally prayed after the Rosary.
        </p>
        <Fleuron width={200} style={{ margin: "20px auto 0" }} />
      </div>

      {/* Weekday picker — today is selected by default */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center", marginBottom: 8 }}>
        {DAYS.map((name, i) => {
          const on = i === day;
          return (
            <button key={name} onClick={() => { setDay(i); narration.reset(0); }} style={{
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11.5, letterSpacing: ".01em",
              padding: "7px 13px", borderRadius: 999, cursor: "pointer",
              border: on ? "none" : "1px solid var(--stone-200)",
              background: on ? "var(--gilt)" : "var(--bone-raised)",
              color: on ? "#2A1A0E" : "var(--ink-500)", transition: "all .15s",
            }}>
              {name.slice(0, 3)}
            </button>
          );
        })}
      </div>
      <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: 14.5, color: "var(--stone-400)", margin: "0 0 22px" }}>
        {proper.day}&rsquo;s proper · {proper.summary}
      </p>

      <section style={{ position: "relative", overflow: "hidden", background: "var(--bone-raised)", border: "1px solid var(--stone-200)", borderRadius: 20, padding: "26px 26px 30px", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ position: "absolute", right: -10, top: -10, pointerEvents: "none", zIndex: 0 }}>
          <Illustration name="devotion-st-michael" size={180} invertOnDark opacity={0.18} />
        </div>

        <div style={{ marginBottom: 22, position: "relative" }}>
          <ListenButton narration={narration} label="Pray the Auxilium" />
        </div>

        <div style={{ position: "relative" }}>
          {blocks.map((b, i) => {
            const si = auxBlockSpeech(b) ? ++seg : -1;
            return <BlockView key={i} block={b} active={speaking && narration.index === si} wordIndex={narration.wordIndex} />;
          })}
        </div>
      </section>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--stone-400)", fontStyle: "italic" }}>
          <LucideIcon name="shield" size={15} /> Confraternity of the Auxilium Christianorum
        </span>
      </div>
    </div>
  );
}
