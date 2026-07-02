"use client";

import { useMemo, useState } from "react";
import { Cross, Fleuron } from "@/components/Sacred";
import { Illustration } from "@/components/Illustration";
import { Btn, LucideIcon } from "@/components/UI";
import { ListenButton, SpokenText, useNarration, useRegisterNarration, type NarrationSegment } from "@/components/PrayerPlayer";
import { countWords } from "@/lib/words";
import { markPrayed } from "@/lib/journey";
import { HOLY_FACE_STEPS, HOLY_FACE_SECTIONS, type HFLine } from "@/data/holyFace";

type Mode = "menu" | "interactive" | "guided";
const cream = (a: number) => `rgba(239,230,214,${a})`;

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

function LineView({ line, active, wordIndex, offset }: { line: HFLine; active: boolean; wordIndex: number; offset: number }) {
  if (line.a) {
    return (
      <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 21, lineHeight: 1.55, color: cream(0.85), margin: "0 0 10px", display: "flex", gap: 12, justifyContent: "center", textAlign: "left", maxWidth: 560 }}>
        <span style={{ color: "var(--gold)", fontStyle: "normal", fontWeight: 600, flexShrink: 0 }}>{line.a}</span>
        <SpokenText as="span" dark text={line.text} active={active} wordIndex={wordIndex} wordOffset={offset} />
      </p>
    );
  }
  return (
    <SpokenText as="p" dark text={line.text} active={active} wordIndex={wordIndex} wordOffset={offset}
      style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 22, lineHeight: 1.56, color: cream(0.85), textAlign: "center", maxWidth: 580, margin: "0 0 14px" }} />
  );
}

export default function HolyFacePage() {
  const [mode, setMode] = useState<Mode>("menu");

  const steps = HOLY_FACE_STEPS;
  const segments = useMemo<NarrationSegment[]>(
    () => steps.map((s, i) => ({ id: String(i), label: `${s.kicker} · ${s.title}`, text: s.speech })),
    [steps],
  );

  const narration = useNarration({ segments, onComplete: () => markPrayed("devotion"), storageKey: "holy-face" });
  useRegisterNarration(narration, mode === "guided" ? "Fully guided" : "Listen", true, "section-devotions");

  const idx = Math.min(narration.index, steps.length - 1);
  const step = steps[idx] ?? steps[0];
  const speaking = narration.status !== "idle";

  function advance() {
    // Reaching the end interactively (praying silently) also counts.
    if (idx + 1 >= steps.length) markPrayed("devotion");
    narration.seek(idx + 1 >= steps.length ? 0 : idx + 1);
  }
  function jumpTo(i: number) { narration.seek(i); }
  function backToMenu() { narration.reset(0); setMode("menu"); }
  function start(m: Mode) {
    narration.reset(0);
    setMode(m);
    // Fully-guided plays the whole chaplet aloud. Start synchronously inside the
    // tap gesture — iOS drops audio/speech begun outside the user gesture task.
    if (m === "guided") narration.play(0);
  }

  // ── MODE CHOOSER ────────────────────────────────────────────────────────────
  if (mode === "menu") {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--surface-ink)", color: "var(--gold-bright)", padding: "40px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none" }}>
          <Illustration name="section-devotions" size={440} invertOnDark opacity={0.5} />
        </div>
        <div style={{ width: 56, height: 56, borderRadius: "50%", border: `1.5px solid ${cream(0.4)}`, display: "grid", placeItems: "center", color: "var(--gold)", marginBottom: 20, position: "relative" }}>
          <Cross size={26} />
        </div>
        <h1 className="pw-reveal" style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 31, color: "#F6F0E6", margin: 0, letterSpacing: "-.015em", textAlign: "center" }}>
          Chaplet of the Holy Face
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: cream(0.7), margin: "12px 0 24px", textAlign: "center", maxWidth: 420, lineHeight: 1.55 }}>
          Honoring the five senses of Our Lord and the years of His life, prayed in reparation for blasphemy and in defense of His Church.
        </p>

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

  // Current section's beads, for the tracker.
  const groupStart = steps.findIndex((s) => s.group === step.group);
  const groupSteps = steps.filter((s) => s.group === step.group);
  const posInGroup = idx - groupStart;

  // ── PRAYER (interactive / guided) ───────────────────────────────────────────
  return (
    <div style={{ height: "100%", display: "flex", color: "var(--gold-bright)", background: "var(--surface-ink)", overflow: "hidden" }}>

      {/* LEFT PANEL (desktop) */}
      <aside className="pw-rosary-aside" style={{ width: 300, flexShrink: 0, borderRight: `1px solid ${cream(0.12)}`, display: "flex", flexDirection: "column", padding: "24px 0 28px", overflowY: "auto" }}>
        <button onClick={backToMenu} style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 20px 18px", padding: "8px 12px", borderRadius: 999, border: `1px solid ${cream(0.18)}`, background: "transparent", color: cream(0.8), cursor: "pointer", fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600, alignSelf: "flex-start" }}>
          <LucideIcon name="arrow-left" size={14} /> Change mode
        </button>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, letterSpacing: ".01em", color: "var(--gold)", padding: "0 22px 12px" }}>
          The Chaplet
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {HOLY_FACE_SECTIONS.map((sec) => {
            const on = sec.id === step.group;
            return (
              <button key={sec.id} onClick={() => jumpTo(sec.index)} style={{
                display: "flex", alignItems: "baseline", gap: 12, padding: "12px 22px", border: "none", cursor: "pointer", textAlign: "left",
                background: on ? "rgba(210,107,67,0.14)" : "transparent",
                borderLeft: on ? "2px solid var(--gold)" : "2px solid transparent", transition: "all .14s",
              }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: on ? 600 : 400, color: on ? "#F6F0E6" : cream(0.55), lineHeight: 1.3 }}>
                  {sec.label}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* CENTER */}
      <main className="pw-rosary-main" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 60px", minWidth: 0, position: "relative", overflowY: "auto" }}>

        {/* Mobile: back */}
        <div className="pw-rosary-sets" style={{ width: "100%", flexDirection: "column", gap: 16, marginBottom: 24, alignItems: "flex-start" }}>
          <button onClick={backToMenu} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, border: `1px solid ${cream(0.18)}`, background: "transparent", color: cream(0.8), cursor: "pointer", fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600 }}>
            <LucideIcon name="arrow-left" size={14} /> Change mode
          </button>
        </div>

        <div style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600, letterSpacing: ".02em", color: "var(--gold)", marginBottom: 8, textAlign: "center" }}>
          {step.kicker}
        </div>

        <h1 className="pw-reveal pw-mystery-name" style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 32, color: "#F6F0E6", margin: "0 0 28px", textAlign: "center", lineHeight: 1.18, letterSpacing: "-.015em", maxWidth: 560 }}>
          {step.title}
        </h1>

        <div style={{ position: "absolute", top: "12%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none", maxWidth: "70%" }}>
          <Illustration name="section-devotions" size={240} invertOnDark opacity={0.18} />
        </div>

        {step.beadLabel && (
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, letterSpacing: ".02em", color: "var(--gold)", marginBottom: 16, textAlign: "center" }}>
            {step.beadLabel}
          </div>
        )}

        {/* Prayer lines */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 30 }}>
          {(() => {
            let off = 0;
            return step.lines.map((l, i) => {
              const node = <LineView key={i} line={l} active={speaking && narration.index === idx} wordIndex={narration.wordIndex} offset={off} />;
              off += countWords(l.text);
              return node;
            });
          })()}
        </div>

        <Fleuron width={170} style={{ marginBottom: 28 }} />

        {mode === "interactive" && (
          <Btn variant="primary" onClick={advance} style={{ minWidth: 180 }}>Continue</Btn>
        )}

        {/* Bead tracker for the current section */}
        <div style={{ marginTop: mode === "interactive" ? 40 : 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: "center", flexWrap: "wrap", maxWidth: 320 }}>
            {groupSteps.map((s, i) => (
              s.large
                ? <BeadDiamond key={i} filled={i < posInGroup} active={i === posInGroup} />
                : <BeadCircle key={i} filled={i < posInGroup} active={i === posInGroup} />
            ))}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 11, letterSpacing: ".01em", color: cream(0.4), textAlign: "center", marginTop: 12 }}>
            {step.beadLabel || step.kicker}
          </div>
        </div>

        {/* Voice player */}
        <div style={{ marginTop: 30, width: "100%", maxWidth: 460 }}>
          <ListenButton narration={narration} dark label={mode === "guided" ? "Fully guided" : "Listen"} />
        </div>
      </main>
    </div>
  );
}
