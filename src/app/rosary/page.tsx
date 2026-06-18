"use client";

import { useEffect, useMemo, useState } from "react";
import { Cross, Fleuron } from "@/components/Sacred";
import { Illustration } from "@/components/Illustration";
import { MYSTERY_ART, type IllustrationKey } from "@/lib/illustrations";
import { Btn, LucideIcon } from "@/components/UI";
import { ListenButton, SpokenText, useNarration, useRegisterNarration, type NarrationSegment } from "@/components/PrayerPlayer";
import { countWords } from "@/lib/words";
import { MYSTERY_SETS, ROSARY_PRAYERS, WEEKDAY_SET } from "@/data/content";
import { RosarySlide } from "@/components/RosarySlide";
import { hasSlides } from "@/data/rosarySlides";

type SetKey = keyof typeof MYSTERY_SETS;
const SET_KEYS: SetKey[] = ["Joyful", "Sorrowful", "Glorious", "Luminous"];
const ORDINALS = ["First", "Second", "Third", "Fourth", "Fifth"];
const TOTAL_BEADS = 12; // 0 = Our Father, 1–10 = Hail Marys, 11 = Glory Be
type Mode = "menu" | "interactive" | "guided";

// Dark-surface palette helpers
const cream = (a: number) => `rgba(239,230,214,${a})`;

function getBeadLabel(bead: number): string {
  if (bead === 0) return "Our Father";
  if (bead >= 1 && bead <= 10) return `Hail Mary · ${bead} of 10`;
  return "Glory Be";
}
function getBeadPrayer(bead: number): string {
  if (bead === 0) return ROSARY_PRAYERS.our;
  if (bead >= 1 && bead <= 10) return ROSARY_PRAYERS.hail;
  return ROSARY_PRAYERS.glory;
}

function BeadDots({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: "center" }}>
      <BeadDiamond filled={current >= 0} active={current === 0} />
      {Array.from({ length: 10 }).map((_, i) => (
        <BeadCircle key={i} filled={current > i} active={current === i + 1} />
      ))}
      <BeadDiamond filled={current >= 11} active={current === 11} />
    </div>
  );
}
function BeadDiamond({ filled, active }: { filled: boolean; active: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
      <rect x="1.8" y="1.8" width="8.4" height="8.4" rx="1" transform="rotate(45 6 6)"
        fill={filled ? "var(--gold)" : "none"} stroke="var(--gold)"
        strokeWidth={active ? 2 : 1.2} opacity={active ? 1 : filled ? 1 : 0.4} />
    </svg>
  );
}
function BeadCircle({ filled, active }: { filled: boolean; active: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" style={{ flexShrink: 0 }}>
      <circle cx="5" cy="5" r="3.8"
        fill={filled ? "var(--gold)" : "none"} stroke="var(--gold)"
        strokeWidth={active ? 2 : 1.1} opacity={active ? 1 : filled ? 1 : 0.35} />
    </svg>
  );
}

function SetPills({ activeSet, onChange, className, style }: { activeSet: SetKey; onChange: (k: SetKey) => void; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={{ display: "flex", flexWrap: "wrap", gap: 7, ...style }}>
      {SET_KEYS.map((key) => {
        const on = key === activeSet;
        return (
          <button key={key} onClick={() => onChange(key)} style={{
            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, letterSpacing: ".01em",
            padding: "8px 15px", borderRadius: 999, cursor: "pointer",
            border: on ? "none" : `1px solid ${cream(0.2)}`,
            background: on ? "var(--gilt)" : cream(0.06),
            color: on ? "#2A1A0E" : "var(--gold-bright)", transition: "all .16s",
          }}>
            {key}
          </button>
        );
      })}
    </div>
  );
}

export default function RosaryPage() {
  const [mode, setMode] = useState<Mode>("menu");
  const [activeSet, setActiveSet] = useState<SetKey>("Glorious");
  const [mysteryIdx, setMysteryIdx] = useState(0);
  const [bead, setBead] = useState(0);

  // Default to the day's mysteries (client-side to avoid a hydration mismatch).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveSet(WEEKDAY_SET[new Date().getDay()] as SetKey);
  }, []);

  const mysteries = MYSTERY_SETS[activeSet];
  const [mysteryName, mysteryFruit] = mysteries[mysteryIdx] as [string, string];
  const ordinal = ORDINALS[mysteryIdx];
  const beadLabel = getBeadLabel(bead);
  const prayer = getBeadPrayer(bead);
  // On the opening bead the segment reads "The Nth <Set> Mystery. <Name>." before
  // the Our Father, so the displayed prayer's words start after that preamble.
  const prayerOffset = bead === 0
    ? countWords(`The ${ordinal} ${activeSet} Mystery. ${mysteryName}.`)
    : 0;

  // Full sequence: 5 mysteries × 12 beads, narrated in order.
  const segments = useMemo<NarrationSegment[]>(() => {
    const segs: NarrationSegment[] = [];
    (mysteries as readonly (readonly [string, string])[]).forEach(([name], mi) => {
      for (let b = 0; b < TOTAL_BEADS; b++) {
        let text: string;
        if (b === 0) text = `The ${ORDINALS[mi]} ${activeSet} Mystery. ${name}. ${ROSARY_PRAYERS.our}`;
        else if (b <= 10) text = ROSARY_PRAYERS.hail;
        else text = `${ROSARY_PRAYERS.glory} ${ROSARY_PRAYERS.fatima}`;
        segs.push({ id: `${mi}-${b}`, label: `${ORDINALS[mi]} · ${getBeadLabel(b)}`, text });
      }
    });
    return segs;
  }, [mysteries, activeSet]);

  const narration = useNarration({
    segments,
    onSegmentChange: (i) => { setMysteryIdx(Math.floor(i / TOTAL_BEADS)); setBead(i % TOTAL_BEADS); },
  });
  useRegisterNarration(narration, mode === "guided" ? "Fully guided" : "Listen", true, MYSTERY_ART[activeSet] as IllustrationKey | undefined);

  // Fully-guided mode plays the whole rosary aloud, auto-advancing the text.
  useEffect(() => {
    if (mode === "guided") narration.play(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function advance() {
    const g = mysteryIdx * TOTAL_BEADS + bead;
    narration.seek(g + 1 >= segments.length ? 0 : g + 1);
  }
  function jumpToMystery(idx: number) { narration.seek(idx * TOTAL_BEADS); }
  function changeSet(key: SetKey) { setActiveSet(key); narration.reset(0); }
  function backToMenu() { narration.reset(0); setMysteryIdx(0); setBead(0); setMode("menu"); }
  function start(m: Mode) { narration.reset(0); setMode(m); }

  // ── MODE CHOOSER ──────────────────────────────────────────────────────────
  if (mode === "menu") {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--surface-ink)", color: "var(--gold-bright)", padding: "40px 24px", overflowY: "auto", position: "relative", overflow: "hidden" }}>
        {/* Background rosary watermark */}
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none" }}>
          <Illustration name="section-rosary" size={440} invertOnDark opacity={0.55} />
        </div>
        <div style={{ width: 56, height: 56, borderRadius: "50%", border: `1.5px solid ${cream(0.4)}`, display: "grid", placeItems: "center", color: "var(--gold)", marginBottom: 20, position: "relative" }}>
          <Cross size={26} />
        </div>
        <h1 className="pw-reveal" style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 32, color: "#F6F0E6", margin: 0, letterSpacing: "-.015em" }}>The Holy Rosary</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: cream(0.7), margin: "10px 0 22px", textAlign: "center" }}>
          Today, the Church prays the <span style={{ color: "var(--gold)", fontWeight: 600 }}>{activeSet}</span> Mysteries.
        </p>

        <SetPills activeSet={activeSet} onChange={changeSet} style={{ justifyContent: "center", marginBottom: 28, maxWidth: 320 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 380 }}>
          <button onClick={() => start("guided")} style={{
            display: "flex", alignItems: "center", gap: 14, textAlign: "left", cursor: "pointer",
            background: "var(--gilt)", color: "#2A1A0E", border: "none", borderRadius: 16, padding: "16px 18px", boxShadow: "var(--shadow-gold)",
          }}>
            <span style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(42,26,14,0.14)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <LucideIcon name="headphones" size={20} />
            </span>
            <span>
              <span style={{ display: "block", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>Fully Guided</span>
              <span style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 13.5, opacity: 0.8, marginTop: 1 }}>Each prayer read aloud, hands-free.</span>
            </span>
          </button>

          <button onClick={() => start("interactive")} style={{
            display: "flex", alignItems: "center", gap: 14, textAlign: "left", cursor: "pointer",
            background: cream(0.06), color: "var(--gold-bright)", border: `1px solid ${cream(0.2)}`, borderRadius: 16, padding: "16px 18px",
          }}>
            <span style={{ width: 42, height: 42, borderRadius: "50%", background: cream(0.08), color: "var(--gold)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <LucideIcon name="hand" size={20} />
            </span>
            <span>
              <span style={{ display: "block", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "#F6F0E6" }}>Interactive</span>
              <span style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 13.5, color: cream(0.7), marginTop: 1 }}>Pray at your own pace, tapping through.</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ── PRAYER (interactive / guided) ───────────────────────────────────────────
  return (
    <div style={{ height: "100%", display: "flex", color: "var(--gold-bright)", background: "var(--surface-ink)", overflow: "hidden" }}>

      {/* LEFT PANEL (desktop) */}
      <aside className="pw-rosary-aside" style={{ width: 300, flexShrink: 0, borderRight: `1px solid ${cream(0.12)}`, display: "flex", flexDirection: "column", padding: "24px 0 28px", overflowY: "auto" }}>
        <button onClick={backToMenu} style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 20px 18px", padding: "8px 12px", borderRadius: 999, border: `1px solid ${cream(0.18)}`, background: "transparent", color: cream(0.8), cursor: "pointer", fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600, alignSelf: "flex-start" }}>
          <LucideIcon name="arrow-left" size={14} /> Change mode
        </button>

        <SetPills activeSet={activeSet} onChange={changeSet} style={{ padding: "0 20px 22px" }} />

        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, letterSpacing: ".01em", color: "var(--gold)", padding: "0 22px 12px" }}>
          {activeSet} Mysteries
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {(mysteries as readonly (readonly [string, string])[]).map(([name], i) => {
            const on = i === mysteryIdx;
            return (
              <button key={i} onClick={() => jumpToMystery(i)} style={{
                display: "flex", alignItems: "baseline", gap: 14, padding: "13px 22px", border: "none", cursor: "pointer", textAlign: "left",
                background: on ? "rgba(210,107,67,0.14)" : "transparent",
                borderLeft: on ? "2px solid var(--gold)" : "2px solid transparent", transition: "all .14s",
              }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700, color: on ? "var(--gold)" : cream(0.35), flexShrink: 0, lineHeight: 1 }}>
                  {["I", "II", "III", "IV", "V"][i]}
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: on ? 600 : 400, color: on ? "#F6F0E6" : cream(0.55), lineHeight: 1.3 }}>
                  {name}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: "auto", padding: "24px 22px 0" }}>
          <div style={{ height: 1, background: cream(0.12), marginBottom: 16 }} />
          <div style={{ fontFamily: "var(--font-display)", fontSize: 11, letterSpacing: ".01em", color: "var(--gold)", marginBottom: 6 }}>Fruit of this Mystery</div>
          <div style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: 14, color: cream(0.65), lineHeight: 1.5 }}>
            {mysteryFruit.replace(/^.*— Fruit: /, "")}
          </div>
        </div>
      </aside>

      {/* CENTER */}
      <main className="pw-rosary-main" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 60px", minWidth: 0, position: "relative", overflowY: "auto" }}>

        {/* Mobile: back + set switcher */}
        <div className="pw-rosary-sets" style={{ width: "100%", flexDirection: "column", gap: 16, marginBottom: 24, alignItems: "center" }}>
          <button onClick={backToMenu} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, border: `1px solid ${cream(0.18)}`, background: "transparent", color: cream(0.8), cursor: "pointer", fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600, alignSelf: "flex-start" }}>
            <LucideIcon name="arrow-left" size={14} /> Change mode
          </button>
          <SetPills activeSet={activeSet} onChange={changeSet} style={{ justifyContent: "center" }} />
        </div>

        <div style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600, letterSpacing: ".02em", color: "var(--gold)", marginBottom: 8, textAlign: "center" }}>
          {ordinal} {activeSet} Mystery
        </div>

        <h1 className="pw-reveal pw-mystery-name" style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 34, color: "#F6F0E6", margin: "0 0 34px", textAlign: "center", lineHeight: 1.18, letterSpacing: "-.015em", maxWidth: 560 }}>
          {mysteryName}
        </h1>

        {/* Slide art for sets with images; ambient illustration fallback for Luminous */}
        {hasSlides(activeSet) ? (
          <RosarySlide set={activeSet} mysteryIdx={mysteryIdx} bead={bead} />
        ) : (
          <div style={{ position: "absolute", top: "12%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none", maxWidth: "70%" }}>
            <Illustration
              name={MYSTERY_ART[activeSet]}
              size={240}
              invertOnDark
              opacity={0.25}
            />
          </div>
        )}

        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, letterSpacing: ".02em", color: "var(--gold)", marginBottom: 14, textAlign: "center" }}>
          {beadLabel}
        </div>

        <SpokenText
          as="p"
          dark
          text={prayer}
          active={narration.status !== "idle"}
          wordIndex={narration.wordIndex}
          wordOffset={prayerOffset}
          style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 23, lineHeight: 1.58, color: cream(0.85), textAlign: "center", maxWidth: 580, margin: "0 0 36px", width: "100%" }}
        />

        <Fleuron width={170} style={{ marginBottom: 32 }} />

        {/* Interactive: tap to advance */}
        {mode === "interactive" && (
          <Btn variant="primary" onClick={advance} style={{ minWidth: 180 }}>Continue</Btn>
        )}

        {/* Bead tracker */}
        <div style={{ marginTop: mode === "interactive" ? 44 : 8 }}>
          <BeadDots current={bead} />
          <div style={{ fontFamily: "var(--font-display)", fontSize: 11, letterSpacing: ".01em", color: cream(0.4), textAlign: "center", marginTop: 12 }}>
            {bead === 0 ? "Opening Prayer" : bead >= 1 && bead <= 10 ? `Hail Mary ${bead} of 10` : "Closing Prayer"}
          </div>
        </div>

        {/* Voice player */}
        <div style={{ marginTop: 32, width: "100%", maxWidth: 460 }}>
          <ListenButton narration={narration} dark label={mode === "guided" ? "Fully guided" : "Listen"} />
        </div>
      </main>
    </div>
  );
}
