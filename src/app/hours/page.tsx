"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Sunrise, Sun, Sunset, Moon } from "lucide-react";
import { Cross, Fleuron } from "@/components/Sacred";
import { SeasonBadge, Kicker, Btn } from "@/components/UI";
import { PlayerBar, useNarration, type NarrationSegment } from "@/components/PrayerPlayer";
import { HOURS } from "@/data/content";
import { OFFICE, type OfficePart } from "@/data/office";

type HourName = typeof HOURS[number]["name"];

function getCurrentHour(): HourName {
  const h = new Date().getHours();
  if (h >= 5 && h < 8) return "Lauds";
  if (h >= 8 && h < 11) return "Terce";
  if (h >= 11 && h < 14) return "Sext";
  if (h >= 14 && h < 17) return "None";
  if (h >= 17 && h < 21) return "Vespers";
  return "Compline";
}

const HOUR_ICONS: Record<string, typeof Sun> = { sunrise: Sunrise, sun: Sun, sunset: Sunset, moon: Moon };

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
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 64px", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Feature card — selected hour */}
      <div style={{ position: "relative", overflow: "hidden", background: "var(--surface-ink)", borderRadius: 20, padding: "30px 28px 28px", boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 30%, rgba(181,145,47,0.12) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          <SeasonBadge season="gold" dark>{selected === getCurrentHour() ? `Now · ${hour.time}` : hour.time}</SeasonBadge>
          <ActiveIcon size={20} strokeWidth={1.4} style={{ color: "var(--gold-bright)", opacity: 0.7 }} />
        </div>

        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 28, color: "#F3EEE2", letterSpacing: ".03em" }}>{hour.name}</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--gold-bright)", opacity: 0.72, marginTop: 2 }}>{hour.en}</div>
        </div>

        <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: 15.5, lineHeight: 1.65, color: "var(--gold-bright)", opacity: 0.82, margin: 0, borderLeft: "2px solid var(--gold)", paddingLeft: 14, position: "relative" }}>
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
          <PlayerBar narration={narration} title={`Pray ${hour.name} aloud`} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {parts.map((p, i) => (
            <OfficePartView key={i} part={p} active={i === activePart} onClick={() => narration.seek(i)} />
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
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: on ? "rgba(181,145,47,0.18)" : "var(--stone-100)", display: "grid", placeItems: "center", flexShrink: 0, color: on ? "var(--gold-deep)" : "var(--stone-400)" }}>
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
function OfficePartView({ part, active, onClick }: { part: OfficePart; active: boolean; onClick: () => void }) {
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

  if (part.type === "versicle") {
    return (
      <div {...interactive} style={wrap}>
        <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: 16, lineHeight: 1.6, color: "var(--ink-700)", textAlign: "center", margin: 0 }}>
          {part.text}
        </p>
      </div>
    );
  }

  if (part.type === "psalm" || part.type === "canticle") {
    return (
      <div {...interactive} style={wrap}>
        <Kicker style={{ marginBottom: 4 }}>{part.label}{part.ref ? ` · ${part.ref}` : ""}</Kicker>
        {part.sub && <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--stone-400)", marginBottom: 6 }}>{part.sub}</div>}
        {part.antiphon && (
          <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: 16, lineHeight: 1.6, color: "var(--gold-deep)", margin: "6px 0 10px" }}>
            {part.antiphon}
          </p>
        )}
        <p style={{ fontFamily: "var(--font-body)", fontSize: 17, lineHeight: 1.72, color: "var(--ink)", margin: 0 }}>{part.text}</p>
      </div>
    );
  }

  // reading / responsory / prayer
  return (
    <div {...interactive} style={wrap}>
      <Kicker style={{ marginBottom: 6 }}>{part.label}{part.ref ? ` · ${part.ref}` : ""}</Kicker>
      <p style={{ fontFamily: "var(--font-body)", fontStyle: part.type === "reading" ? "normal" : "italic", fontSize: 16.5, lineHeight: 1.68, color: "var(--ink-700)", margin: 0 }}>
        {part.text}
      </p>
    </div>
  );
}
