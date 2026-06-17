"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Sunrise, Sun, Sunset, Moon, BookOpen } from "lucide-react";
import { Cross, Fleuron } from "@/components/Sacred";
import { SeasonBadge, Kicker, Btn } from "@/components/UI";
import { ListenButton, SpokenText, useNarration, useRegisterNarration, type NarrationSegment } from "@/components/PrayerPlayer";
import { countWords } from "@/lib/words";
import { Illustration } from "@/components/Illustration";
import { HOURS, currentHourName as getCurrentHour } from "@/data/content";
import { OFFICE, type OfficePart } from "@/data/office";
import { HOUR_ART } from "@/lib/illustrations";

type HourName = typeof HOURS[number]["name"];

const HOUR_ICONS: Record<string, typeof Sun> = { sunrise: Sunrise, sun: Sun, sunset: Sunset, moon: Moon, "book-open": BookOpen };

export default function HoursPage() {
  const [selected, setSelected] = useState<HourName>("Sext");
  const [activePart, setActivePart] = useState(-1);
  const officeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(getCurrentHour());
  }, []);

  const hour = HOURS.find((h) => h.name === selected) ?? HOURS[2];
  const ActiveIcon = HOUR_ICONS[hour.lucide] ?? Sun;
  const parts = useMemo(() => OFFICE[selected] ?? [], [selected]);
  const opening = parts.find((p) => p.type === "psalm")?.antiphon ?? parts[0]?.text ?? "";

  const segments = useMemo<NarrationSegment[]>(
    () => parts.map((p, i) => ({
      id: `${selected}-${i}`,
      label: p.label ?? hour.name,
      text: (p.antiphon ? `${p.antiphon} ` : "") + p.text,
    })),
    [parts, selected, hour.name],
  );

  const narration = useNarration({ segments, onSegmentChange: setActivePart });
  useRegisterNarration(narration, `Pray ${hour.name} aloud`);

  // Switching hours resets the office narration (reset() clears the highlight
  // via onSegmentChange).
  useEffect(() => {
    narration.reset(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  function pray() {
    officeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    narration.play(0);
  }

  function pickHour(name: HourName) {
    setSelected(name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 64px", display: "flex", flexDirection: "column", gap: 24, position: "relative" }}>

      {/* Feature card — selected hour */}
      <div className="pw-hours-card" style={{ position: "relative", overflow: "hidden", background: "var(--surface-ink)", borderRadius: 20, padding: "30px 28px 28px", boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 30%, rgba(210,107,67,0.14) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: -30, top: -30, pointerEvents: "none" }}>
          <Illustration name={HOUR_ART[selected] ?? "hours-sext"} size={220} invertOnDark opacity={0.5} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          <SeasonBadge season="gold" dark>{selected === getCurrentHour() ? `Now · ${hour.time}` : hour.time}</SeasonBadge>
          <ActiveIcon size={20} strokeWidth={1.4} style={{ color: "var(--gold-bright)", opacity: 0.7 }} />
        </div>

        <div style={{ position: "relative" }}>
          <div className="pw-hour-name" style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 28, color: "#F3EEE2" }}>{hour.name}</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--gold-bright)", opacity: 0.72, marginTop: 2 }}>{hour.en}</div>
        </div>

        <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 15.5, lineHeight: 1.65, color: "var(--gold-bright)", opacity: 0.82, margin: 0, borderLeft: "2px solid var(--gold)", paddingLeft: 14, position: "relative" }}>
          {opening}
        </p>

        <div style={{ position: "relative", marginTop: 4 }}>
          <Btn variant="primary" icon={<Cross size={14} />} onClick={pray}>Pray {hour.name}</Btn>
        </div>
      </div>

      {/* The Office */}
      <div ref={officeRef} style={{ scrollMarginTop: 16 }}>
        <Kicker style={{ marginBottom: 12 }}>{hour.name} · {hour.en}</Kicker>
        <div style={{ marginBottom: 22 }}>
          <ListenButton narration={narration} label={`Listen to ${hour.name}`} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {parts.map((p, i) => (
            <OfficePartView
              key={i}
              part={p}
              active={i === activePart}
              speaking={i === activePart && narration.status !== "idle"}
              wordIndex={narration.wordIndex}
              onClick={() => narration.seek(i)}
            />
          ))}
        </div>

        <Fleuron width={200} style={{ margin: "28px auto 0" }} />
      </div>

      {/* Hours list */}
      <div>
        <Kicker style={{ marginBottom: 12 }}>The Hours Today</Kicker>
        <div style={{ background: "var(--bone-raised)", border: "1px solid var(--stone-200)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
          {HOURS.map((h, i) => {
            const Icon = HOUR_ICONS[h.lucide] ?? Sun;
            const on = h.name === selected;
            const isLast = i === HOURS.length - 1;
            return (
              <div key={h.name}>
                <button
                  onClick={() => pickHour(h.name)}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", width: "100%", border: "none", textAlign: "left", background: on ? "var(--gold-faint)" : "transparent", cursor: "pointer", transition: "background .14s" }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: on ? "var(--gold-faint)" : "var(--stone-100)", display: "grid", placeItems: "center", flexShrink: 0, color: on ? "var(--gold-deep)" : "var(--stone-400)" }}>
                    <Icon size={17} strokeWidth={1.6} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 20, color: on ? "var(--gold-deep)" : "var(--ink)", lineHeight: 1.2 }}>{h.name}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--stone-400)", marginTop: 1 }}>{h.en}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    {h.name === getCurrentHour() && <SeasonBadge season="gold">Now</SeasonBadge>}
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 500, color: on ? "var(--gold-deep)" : "var(--stone-400)", letterSpacing: ".04em" }}>{h.time}</span>
                  </div>
                </button>
                {!isLast && <div style={{ height: 1, background: "var(--stone-100)", margin: "0 20px" }} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── A single part of the Office ───────────────────────────────────────────────
function OfficePartView({ part, active, speaking, wordIndex, onClick }: { part: OfficePart; active: boolean; speaking: boolean; wordIndex: number; onClick: () => void }) {
  const wrap: React.CSSProperties = {
    padding: "14px 16px",
    borderRadius: 12,
    background: active ? "var(--gold-faint)" : "transparent",
    borderLeft: active ? "2px solid var(--gold)" : "2px solid transparent",
    cursor: "pointer",
    transition: "background .15s",
  };
  const interactive = {
    onClick,
    role: "button" as const,
    tabIndex: 0,
    "aria-label": `Play ${part.label ?? "this part"}`,
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } },
  };
  // The spoken segment is "<antiphon> <text>", so the body starts after it.
  const antiphonWords = part.antiphon ? countWords(part.antiphon) : 0;

  if (part.type === "versicle") {
    return (
      <div {...interactive} style={wrap}>
        <SpokenText as="p" text={part.text} active={speaking} wordIndex={wordIndex}
          style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 16, lineHeight: 1.6, color: "var(--ink-700)", textAlign: "center", margin: 0 }} />
      </div>
    );
  }

  if (part.type === "psalm" || part.type === "canticle") {
    return (
      <div {...interactive} style={wrap}>
        <Kicker style={{ marginBottom: 4 }}>{part.label}{part.ref ? ` · ${part.ref}` : ""}</Kicker>
        {part.sub && <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--stone-400)", marginBottom: 6 }}>{part.sub}</div>}
        {part.antiphon && (
          <SpokenText as="p" text={part.antiphon} active={speaking} wordIndex={wordIndex}
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 16, lineHeight: 1.6, color: "var(--gold-deep)", margin: "6px 0 10px" }} />
        )}
        <SpokenText as="p" text={part.text} active={speaking} wordIndex={wordIndex} wordOffset={antiphonWords}
          style={{ fontFamily: "var(--font-body)", fontSize: 17, lineHeight: 1.72, color: "var(--ink)", margin: 0 }} />
      </div>
    );
  }

  // reading / responsory / prayer
  return (
    <div {...interactive} style={wrap}>
      <Kicker style={{ marginBottom: 6 }}>{part.label}{part.ref ? ` · ${part.ref}` : ""}</Kicker>
      <SpokenText as="p" text={part.text} active={speaking} wordIndex={wordIndex}
        style={{ fontFamily: "var(--font-body)", fontStyle: part.type === "reading" ? "normal" : "italic", fontSize: 16.5, lineHeight: 1.68, color: "var(--ink-700)", margin: 0 }} />
    </div>
  );
}
