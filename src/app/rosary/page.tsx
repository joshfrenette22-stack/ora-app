"use client";

import { useMemo, useState } from "react";
import { HaloRays, Cross, Fleuron } from "@/components/Sacred";
import { Btn } from "@/components/UI";
import { PlayerBar, useNarration, type NarrationSegment } from "@/components/PrayerPlayer";
import { MYSTERY_SETS, ROSARY_PRAYERS } from "@/data/content";

type SetKey = keyof typeof MYSTERY_SETS;
const SET_KEYS: SetKey[] = ["Joyful", "Sorrowful", "Glorious", "Luminous"];

const ORDINALS = ["First", "Second", "Third", "Fourth", "Fifth"];

// Bead sequence per decade:
// 0 = Our Father, 1–10 = Hail Marys, 11 = Glory Be
const TOTAL_BEADS = 12; // indices 0..11

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

// Bead dot component
function BeadDots({ current }: { current: number }) {
  // Layout: diamond(0) · 10 circles(1-10) · diamond(11)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: "center" }}>
      {/* Our Father diamond */}
      <BeadDiamond filled={current >= 0} active={current === 0} />
      {/* 10 Hail Marys */}
      {Array.from({ length: 10 }).map((_, i) => (
        <BeadCircle key={i} filled={current > i} active={current === i + 1} />
      ))}
      {/* Glory Be diamond */}
      <BeadDiamond filled={current >= 11} active={current === 11} />
    </div>
  );
}

function BeadDiamond({ filled, active }: { filled: boolean; active: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
      <rect
        x="1.8" y="1.8" width="8.4" height="8.4"
        rx="1"
        transform="rotate(45 6 6)"
        fill={filled ? "var(--gold-bright)" : "none"}
        stroke="var(--gold-bright)"
        strokeWidth={active ? 2 : 1.2}
        opacity={active ? 1 : filled ? 1 : 0.35}
      />
    </svg>
  );
}

function BeadCircle({ filled, active }: { filled: boolean; active: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" style={{ flexShrink: 0 }}>
      <circle
        cx="5" cy="5" r="3.8"
        fill={filled ? "var(--gold-bright)" : "none"}
        stroke="var(--gold-bright)"
        strokeWidth={active ? 2 : 1.1}
        opacity={active ? 1 : filled ? 1 : 0.3}
      />
    </svg>
  );
}

export default function RosaryPage() {
  const [activeSet, setActiveSet] = useState<SetKey>("Glorious");
  const [mysteryIdx, setMysteryIdx] = useState(0);
  const [bead, setBead] = useState(0);

  const mysteries = MYSTERY_SETS[activeSet];
  const [mysteryName, mysteryFruit] = mysteries[mysteryIdx] as [string, string];
  const ordinal = ORDINALS[mysteryIdx];
  const beadLabel = getBeadLabel(bead);
  const prayer = getBeadPrayer(bead);

  // Full hands-free sequence: 5 mysteries × 12 beads, narrated in order.
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

  // Narration is the single source of truth for position; the visible mystery
  // and bead are derived from it via onSegmentChange.
  const narration = useNarration({
    segments,
    rate: 0.9,
    onSegmentChange: (i) => {
      setMysteryIdx(Math.floor(i / TOTAL_BEADS));
      setBead(i % TOTAL_BEADS);
    },
  });

  function advance() {
    const g = mysteryIdx * TOTAL_BEADS + bead;
    narration.seek(g + 1 >= segments.length ? 0 : g + 1);
  }

  function jumpToMystery(idx: number) {
    narration.seek(idx * TOTAL_BEADS);
  }

  function changeSet(key: SetKey) {
    setActiveSet(key);
    narration.reset(0);
  }

  return (
    <div style={{
      height: "100%",
      display: "flex",
      color: "var(--gold-bright)",
      background: "var(--surface-ink)",
      overflow: "hidden",
    }}>

      {/* ── LEFT PANEL ── */}
      <aside style={{
        width: 300,
        flexShrink: 0,
        borderRight: "1px solid rgba(216,188,118,.15)",
        display: "flex",
        flexDirection: "column",
        padding: "28px 0 28px",
        overflowY: "auto",
      }}>

        {/* Mystery set pills */}
        <div style={{ padding: "0 20px 24px", display: "flex", flexWrap: "wrap", gap: 7 }}>
          {SET_KEYS.map((key) => {
            const on = key === activeSet;
            return (
              <button
                key={key}
                onClick={() => changeSet(key)}
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 10,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  padding: "7px 13px",
                  borderRadius: 999,
                  border: on ? "none" : "1px solid rgba(216,188,118,.22)",
                  cursor: "pointer",
                  background: on ? "var(--gilt)" : "rgba(216,188,118,0.08)",
                  color: on ? "#2A2008" : "var(--gold-bright)",
                  transition: "all .16s",
                }}
              >
                {key}
              </button>
            );
          })}
        </div>

        {/* Set kicker */}
        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 10,
          letterSpacing: ".24em",
          textTransform: "uppercase",
          color: "var(--gold-deep)",
          padding: "0 22px 14px",
        }}>
          {activeSet} Mysteries
        </div>

        {/* Mystery list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {(mysteries as readonly (readonly [string, string])[]).map(([name], i) => {
            const on = i === mysteryIdx;
            return (
              <button
                key={i}
                onClick={() => jumpToMystery(i)}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 14,
                  padding: "13px 22px",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  background: on ? "rgba(216,188,118,0.10)" : "transparent",
                  borderLeft: on ? "2px solid var(--gold-bright)" : "2px solid transparent",
                  transition: "all .14s",
                }}
              >
                {/* Roman numeral */}
                <span style={{
                  fontFamily: "var(--font-ornament)",
                  fontSize: 11,
                  color: on ? "var(--gold-bright)" : "rgba(216,188,118,0.38)",
                  letterSpacing: ".06em",
                  flexShrink: 0,
                  lineHeight: 1,
                }}>
                  {["I", "II", "III", "IV", "V"][i]}
                </span>
                {/* Mystery name */}
                <span style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  fontWeight: on ? 600 : 400,
                  color: on ? "#F3EEE2" : "rgba(236,227,204,0.55)",
                  lineHeight: 1.3,
                }}>
                  {name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Fruit of the mystery at bottom */}
        <div style={{ marginTop: "auto", padding: "24px 22px 0" }}>
          <div style={{
            height: 1,
            background: "rgba(216,188,118,0.12)",
            marginBottom: 16,
          }} />
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: 10,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "var(--gold-deep)",
            marginBottom: 6,
          }}>
            Fruit of this Mystery
          </div>
          <div style={{
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
            fontSize: 14,
            color: "rgba(236,227,204,0.65)",
            lineHeight: 1.5,
          }}>
            {mysteryFruit.replace(/^.*— Fruit: /, "")}
          </div>
        </div>
      </aside>

      {/* ── CENTER ── */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 60px",
        gap: 0,
        minWidth: 0,
        position: "relative",
        overflowY: "auto",
      }}>

        {/* Mystery ordinal */}
        <div style={{
          fontFamily: "var(--font-ornament)",
          fontSize: 12,
          letterSpacing: ".26em",
          textTransform: "uppercase",
          color: "var(--gold-deep)",
          marginBottom: 8,
          textAlign: "center",
        }}>
          {ordinal} {activeSet} Mystery
        </div>

        {/* Mystery name */}
        <h1 style={{
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: 34,
          color: "#F3EEE2",
          margin: "0 0 36px",
          textAlign: "center",
          lineHeight: 1.22,
          letterSpacing: ".01em",
          maxWidth: 560,
        }}>
          {mysteryName}
        </h1>

        {/* Decorative halo + cross */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 160, height: 160, marginBottom: 36 }}>
          <HaloRays
            size={160}
            style={{
              position: "absolute",
              inset: 0,
              color: "var(--gold)",
              opacity: 0.55,
            }}
          />
          <div style={{
            position: "relative",
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "1.5px solid rgba(216,188,118,0.45)",
            background: "rgba(216,188,118,0.07)",
            display: "grid",
            placeItems: "center",
            color: "var(--gold-bright)",
          }}>
            <Cross size={26} />
          </div>
        </div>

        {/* Prayer label */}
        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 11,
          letterSpacing: ".22em",
          textTransform: "uppercase",
          color: "var(--gold)",
          marginBottom: 16,
          textAlign: "center",
        }}>
          {beadLabel}
        </div>

        {/* Prayer text */}
        <p style={{
          fontFamily: "var(--font-body)",
          fontStyle: "italic",
          fontSize: 22,
          lineHeight: 1.62,
          color: "rgba(243,238,226,0.82)",
          textAlign: "center",
          maxWidth: 580,
          margin: "0 0 40px",
          letterSpacing: ".01em",
        }}>
          {prayer}
        </p>

        {/* Fleuron */}
        <Fleuron width={180} style={{ marginBottom: 36 }} />

        {/* Continue button (silent tap-through) */}
        <Btn
          variant="primary"
          onClick={advance}
          style={{ minWidth: 180 }}
        >
          Continue
        </Btn>

        {/* Bead tracker */}
        <div style={{ marginTop: 48 }}>
          <BeadDots current={bead} />
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: 10,
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "rgba(216,188,118,0.38)",
            textAlign: "center",
            marginTop: 12,
          }}>
            {bead === 0
              ? "Opening Prayer"
              : bead >= 1 && bead <= 10
              ? `Hail Mary ${bead} of 10`
              : "Closing Prayer"}
          </div>
        </div>

        {/* Hands-free voice player */}
        <div style={{ marginTop: 36, width: "100%", maxWidth: 460 }}>
          <PlayerBar narration={narration} dark title="Pray hands-free" />
        </div>

      </main>
    </div>
  );
}
