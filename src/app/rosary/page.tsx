"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Cross, Fleuron } from "@/components/Sacred";
import { Illustration } from "@/components/Illustration";
import { MYSTERY_ART, type IllustrationKey } from "@/lib/illustrations";
import { Btn, LucideIcon } from "@/components/UI";
import { ListenButton, SpokenText, useNarration, useRegisterNarration, type NarrationSegment } from "@/components/PrayerPlayer";
import { countWords } from "@/lib/words";
import { MYSTERY_SETS, ROSARY_PRAYERS, WEEKDAY_SET } from "@/data/content";
import { RosarySlide } from "@/components/RosarySlide";
import { hasSlides, rosarySlide } from "@/data/rosarySlides";

type SetKey = keyof typeof MYSTERY_SETS;
const SET_KEYS: SetKey[] = ["Joyful", "Sorrowful", "Glorious", "Luminous"];
const ORDINALS = ["First", "Second", "Third", "Fourth", "Fifth"];
const TOTAL_BEADS = 12; // 0 = Our Father, 1–10 = Hail Marys, 11 = Glory Be
type Mode = "menu" | "interactive" | "guided";

// Dark-surface palette helpers
const cream = (a: number) => `rgba(239,230,214,${a})`;

/** One screen of the Rosary — an introductory prayer, a single bead, or a closing
 *  prayer. The whole Rosary is flattened to an ordered list of these so the
 *  introduction flows into the five decades and on into the concluding prayers
 *  (Hail Holy Queen, the closing prayer, the prayer to St. Michael). */
interface Step {
  phase: "intro" | "mystery" | "closing";
  kicker: string;       // small gold label above the title
  title: string;        // large serif heading
  beadLabel: string;    // gold label above the prayer ("" hides it)
  prayer: string;       // text shown on screen
  speech: string;       // text read aloud (may carry a spoken preamble)
  speechOffset: number; // words spoken before `prayer` begins (for highlight sync)
  mysteryIdx: number;   // -1 for intro/closing, else 0–4
  bead: number;         // -1 for intro/closing, else 0–11
  phaseStep: number;    // index within the intro/closing phase, else -1
  pause?: boolean;      // a moment for the user's own intentions
}

const INTRO_LEN = 9;
const CLOSING_LEN = 3;

function buildSteps(activeSet: SetKey): Step[] {
  const P = ROSARY_PRAYERS;
  const introPrayer = (title: string, prayer: string, phaseStep: number, extra?: Partial<Step>): Step => ({
    phase: "intro", kicker: "Introduction", title, beadLabel: "", prayer, speech: prayer,
    speechOffset: 0, mysteryIdx: -1, bead: -1, phaseStep, ...extra,
  });
  const hailFor = (virtue: string, n: number, phaseStep: number): Step => {
    const preamble = `For an increase of ${virtue.toLowerCase()}.`;
    return {
      phase: "intro", kicker: "Introduction", title: `For an increase of ${virtue}`,
      beadLabel: `Hail Mary · ${n} of 3`, prayer: P.hail, speech: `${preamble} ${P.hail}`,
      speechOffset: countWords(preamble), mysteryIdx: -1, bead: -1, phaseStep,
    };
  };

  const intro: Step[] = [
    introPrayer("The Sign of the Cross", P.signCross, 0),
    introPrayer("The Offering", P.offering, 1),
    introPrayer("Your Intentions", P.intentions, 2, { pause: true }),
    introPrayer("The Apostles’ Creed", P.creed, 3),
    introPrayer("Our Father", P.our, 4),
    hailFor("Faith", 1, 5),
    hailFor("Hope", 2, 6),
    hailFor("Charity", 3, 7),
    introPrayer("Glory Be", P.glory, 8),
  ];

  const mysteries = MYSTERY_SETS[activeSet] as readonly (readonly [string, string])[];
  const decades: Step[] = [];
  mysteries.forEach(([name], mi) => {
    const kicker = `${ORDINALS[mi]} ${activeSet} Mystery`;
    for (let bead = 0; bead < TOTAL_BEADS; bead++) {
      let beadLabel: string, prayer: string, speech: string, speechOffset = 0;
      if (bead === 0) {
        const preamble = `The ${ORDINALS[mi]} ${activeSet} Mystery. ${name}.`;
        beadLabel = "Our Father"; prayer = P.our; speech = `${preamble} ${P.our}`;
        speechOffset = countWords(preamble);
      } else if (bead <= 10) {
        beadLabel = `Hail Mary · ${bead} of 10`; prayer = P.hail; speech = P.hail;
      } else {
        beadLabel = "Glory Be"; prayer = P.glory; speech = `${P.glory} ${P.fatima}`;
      }
      decades.push({ phase: "mystery", kicker, title: name, beadLabel, prayer, speech, speechOffset, mysteryIdx: mi, bead, phaseStep: -1 });
    }
  });

  const closingPrayer = (title: string, beadLabel: string, prayer: string, phaseStep: number): Step => ({
    phase: "closing", kicker: "Closing Prayers", title, beadLabel, prayer, speech: prayer,
    speechOffset: 0, mysteryIdx: -1, bead: -1, phaseStep,
  });
  const closing: Step[] = [
    closingPrayer("Hail, Holy Queen", "Salve Regina", P.queen, 0),
    closingPrayer("Let Us Pray", "", P.closing, 1),
    closingPrayer("Prayer to St. Michael", "", P.michael, 2),
  ];

  return [...intro, ...decades, ...closing];
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
function PhaseDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <BeadCircle key={i} filled={current > i} active={current === i} />
      ))}
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

  // Default to the day's mysteries (client-side to avoid a hydration mismatch).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveSet(WEEKDAY_SET[new Date().getDay()] as SetKey);
  }, []);

  const steps = useMemo(() => buildSteps(activeSet), [activeSet]);

  const segments = useMemo<NarrationSegment[]>(
    () => steps.map((s, i) => ({
      id: String(i),
      label: s.phase === "intro" ? `Introduction · ${s.title}` : `${ORDINALS[s.mysteryIdx]} · ${s.beadLabel}`,
      text: s.speech,
    })),
    [steps],
  );

  const narration = useNarration({ segments });

  // Stable getter for the current rosary slide (used by the full-screen player).
  // It reads a ref kept in sync with the active step below; intro/closing steps
  // carry no slide (mysteryIdx -1) and fall back to the ambient illustration.
  const slideStateRef = useRef<{ set: SetKey; mysteryIdx: number; bead: number }>({ set: activeSet, mysteryIdx: -1, bead: -1 });
  const getImageSrc = useCallback(() => {
    const { set, mysteryIdx: mi, bead: b } = slideStateRef.current;
    return mi >= 0 ? rosarySlide(set, mi, b) : null;
  }, []);
  useRegisterNarration(narration, mode === "guided" ? "Fully guided" : "Listen", true, MYSTERY_ART[activeSet] as IllustrationKey | undefined, getImageSrc);

  // Fully-guided mode plays the whole rosary aloud, auto-advancing the text.
  useEffect(() => {
    if (mode === "guided") narration.play(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const idx = Math.min(narration.index, steps.length - 1);
  const step = steps[idx] ?? steps[0];
  const mysteries = MYSTERY_SETS[activeSet] as readonly (readonly [string, string])[];

  // Feed the current slide (mystery beads only) to the full-screen player.
  useEffect(() => { slideStateRef.current = { set: activeSet, mysteryIdx: step.mysteryIdx, bead: step.bead }; });

  function advance() { narration.seek(idx + 1 >= steps.length ? 0 : idx + 1); }
  function jumpToMystery(i: number) { narration.seek(INTRO_LEN + i * TOTAL_BEADS); }
  function jumpToIntro() { narration.seek(0); }
  function jumpToClosing() { narration.seek(INTRO_LEN + MYSTERY_SETS[activeSet].length * TOTAL_BEADS); }
  function changeSet(key: SetKey) { setActiveSet(key); narration.reset(0); }
  function backToMenu() { narration.reset(0); setMode("menu"); }
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

  const isIntro = step.phase === "intro";
  const isClosing = step.phase === "closing";
  const isMystery = step.phase === "mystery";

  // ── PRAYER (interactive / guided) ───────────────────────────────────────────
  return (
    <div style={{ height: "100%", display: "flex", color: "var(--gold-bright)", background: "var(--surface-ink)", overflow: "hidden" }}>

      {/* LEFT PANEL (desktop) */}
      <aside className="pw-rosary-aside" style={{ width: 300, flexShrink: 0, borderRight: `1px solid ${cream(0.12)}`, display: "flex", flexDirection: "column", padding: "24px 0 28px", overflowY: "auto" }}>
        <button onClick={backToMenu} style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 20px 18px", padding: "8px 12px", borderRadius: 999, border: `1px solid ${cream(0.18)}`, background: "transparent", color: cream(0.8), cursor: "pointer", fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600, alignSelf: "flex-start" }}>
          <LucideIcon name="arrow-left" size={14} /> Change mode
        </button>

        <SetPills activeSet={activeSet} onChange={changeSet} style={{ padding: "0 20px 22px" }} />

        {/* Introduction */}
        <button onClick={jumpToIntro} style={{
          display: "flex", alignItems: "baseline", gap: 14, padding: "13px 22px", border: "none", cursor: "pointer", textAlign: "left",
          background: isIntro ? "rgba(210,107,67,0.14)" : "transparent",
          borderLeft: isIntro ? "2px solid var(--gold)" : "2px solid transparent", transition: "all .14s",
        }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700, color: isIntro ? "var(--gold)" : cream(0.35), flexShrink: 0, lineHeight: 1 }}>
            <LucideIcon name="sparkles" size={13} />
          </span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: isIntro ? 600 : 400, color: isIntro ? "#F6F0E6" : cream(0.55), lineHeight: 1.3 }}>
            Introductory Prayers
          </span>
        </button>

        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, letterSpacing: ".01em", color: "var(--gold)", padding: "16px 22px 12px" }}>
          {activeSet} Mysteries
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {mysteries.map(([name], i) => {
            const on = step.phase === "mystery" && i === step.mysteryIdx;
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

        {/* Closing Prayers */}
        <button onClick={jumpToClosing} style={{
          display: "flex", alignItems: "baseline", gap: 14, padding: "13px 22px", marginTop: 8, border: "none", cursor: "pointer", textAlign: "left",
          background: isClosing ? "rgba(210,107,67,0.14)" : "transparent",
          borderLeft: isClosing ? "2px solid var(--gold)" : "2px solid transparent", transition: "all .14s",
        }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700, color: isClosing ? "var(--gold)" : cream(0.35), flexShrink: 0, lineHeight: 1 }}>
            <LucideIcon name="crown" size={13} />
          </span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: isClosing ? 600 : 400, color: isClosing ? "#F6F0E6" : cream(0.55), lineHeight: 1.3 }}>
            Closing Prayers
          </span>
        </button>

        <div style={{ marginTop: "auto", padding: "24px 22px 0" }}>
          <div style={{ height: 1, background: cream(0.12), marginBottom: 16 }} />
          {isMystery ? (
            <>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 11, letterSpacing: ".01em", color: "var(--gold)", marginBottom: 6 }}>Fruit of this Mystery</div>
              <div style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: 14, color: cream(0.65), lineHeight: 1.5 }}>
                {(mysteries[step.mysteryIdx][1]).replace(/^.*— Fruit: /, "")}
              </div>
            </>
          ) : (
            <div style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: 14, color: cream(0.65), lineHeight: 1.5 }}>
              {isClosing
                ? "We end with the Hail Holy Queen, the closing prayer, and the prayer to St. Michael."
                : "We begin with the introductory prayers, offering the Rosary for our intentions and the Holy Father."}
            </div>
          )}
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
          {step.kicker}
        </div>

        <h1 className="pw-reveal pw-mystery-name" style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 34, color: "#F6F0E6", margin: "0 0 34px", textAlign: "center", lineHeight: 1.18, letterSpacing: "-.015em", maxWidth: 560 }}>
          {step.title}
        </h1>

        {/* Slide art during the decades (sets with images); ambient illustration
            during the introduction/closing prayers and for Luminous (no slides). */}
        {isMystery && hasSlides(activeSet) ? (
          <RosarySlide set={activeSet} mysteryIdx={step.mysteryIdx} bead={step.bead} />
        ) : (
          <div style={{ position: "absolute", top: "12%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none", maxWidth: "70%" }}>
            <Illustration
              name={isMystery ? MYSTERY_ART[activeSet] : "section-rosary"}
              size={240}
              invertOnDark
              opacity={0.25}
            />
          </div>
        )}

        {step.beadLabel && (
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, letterSpacing: ".02em", color: "var(--gold)", marginBottom: 14, textAlign: "center" }}>
            {step.beadLabel}
          </div>
        )}

        <SpokenText
          as="p"
          dark
          text={step.prayer}
          active={narration.status !== "idle"}
          wordIndex={narration.wordIndex}
          wordOffset={step.speechOffset}
          style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 23, lineHeight: 1.58, color: cream(0.85), textAlign: "center", maxWidth: 580, margin: "0 0 36px", width: "100%" }}
        />

        {step.pause && mode === "interactive" && (
          <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontStyle: "italic", color: cream(0.5), marginTop: -18, marginBottom: 30, textAlign: "center" }}>
            Take a moment in silence, then continue when you are ready.
          </div>
        )}

        <Fleuron width={170} style={{ marginBottom: 32 }} />

        {/* Interactive: tap to advance */}
        {mode === "interactive" && (
          <Btn variant="primary" onClick={advance} style={{ minWidth: 180 }}>Continue</Btn>
        )}

        {/* Optional continuation — the Rosary ends with St. Michael; the Auxilium
            Christianorum is offered here as an optional next devotion. */}
        {isClosing && step.phaseStep === CLOSING_LEN - 1 && (
          <Link href="/auxilium" style={{
            display: "flex", alignItems: "center", gap: 11, textDecoration: "none",
            marginTop: 22, padding: "11px 16px", borderRadius: 12, width: "100%", maxWidth: 420,
            border: `1px solid ${cream(0.16)}`, background: cream(0.04), color: cream(0.6),
          }}>
            <span style={{ width: 32, height: 32, borderRadius: "50%", background: cream(0.07), color: "var(--gold)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <LucideIcon name="shield" size={16} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 10.5, letterSpacing: ".03em", textTransform: "uppercase", color: "var(--gold)" }}>Optional · After the Rosary</span>
              <span style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 14, color: cream(0.8), marginTop: 1 }}>Continue to the Auxilium Christianorum</span>
            </span>
            <LucideIcon name="arrow-right" size={16} />
          </Link>
        )}

        {/* Progress tracker */}
        <div style={{ marginTop: mode === "interactive" ? 44 : 8 }}>
          {isMystery
            ? <BeadDots current={step.bead} />
            : <PhaseDots current={step.phaseStep} total={isIntro ? INTRO_LEN : CLOSING_LEN} />}
          <div style={{ fontFamily: "var(--font-display)", fontSize: 11, letterSpacing: ".01em", color: cream(0.4), textAlign: "center", marginTop: 12 }}>
            {isIntro
              ? "Introductory Prayers"
              : isClosing
                ? "Closing Prayers"
                : step.bead === 0 ? "Opening Prayer" : step.bead >= 1 && step.bead <= 10 ? `Hail Mary ${step.bead} of 10` : "Glory Be"}
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
