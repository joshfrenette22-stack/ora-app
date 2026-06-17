"use client";

export function Cross({ size = 18, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 72 120" fill="currentColor" style={{ height: size, width: "auto", display: "block", ...style }} aria-hidden="true">
      <path d="M31.4 10 L40.6 10 L40.6 92 L36 112 L31.4 92 Z" />
      <rect x="12" y="36" width="48" height="9.4" rx="1" />
      <circle cx="36" cy="7" r="3.4" />
    </svg>
  );
}

export function Logomark({ size = 40, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 120" fill="currentColor" style={{ width: size, height: size, display: "block", ...style }} aria-label="ORA Prayer Warrior">
      <circle cx="60" cy="60" r="53" fill="none" stroke="currentColor" strokeWidth="2.4" opacity=".9" />
      <circle cx="60" cy="60" r="46" fill="none" stroke="currentColor" strokeWidth="1" opacity=".4" />
      <path d="M55.4 26 L64.6 26 L64.6 88 L60 104 L55.4 88 Z" />
      <rect x="38" y="46.5" width="44" height="9.2" rx="1" />
      <circle cx="60" cy="23.5" r="3.6" />
    </svg>
  );
}

export function Fleuron({ color = "var(--gold)", width = 200, style = {} }: { color?: string; width?: number; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, color, width, ...style }}>
      <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,currentColor)", opacity: 0.55 }} />
      <svg viewBox="0 0 24 24" width="13" height="13">
        <path d="M12 2 L16 12 L12 22 L8 12 Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M12 7 V17 M7 12 H17" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,currentColor,transparent)", opacity: 0.55 }} />
    </div>
  );
}

export function RoseWindow({ size = 200, strokeWidth = 1.2, style = {} }: { size?: number; strokeWidth?: number; style?: React.CSSProperties }) {
  const c = 100;
  const foils = 12;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} style={{ display: "block", ...style }} aria-hidden="true">
      <circle cx={c} cy={c} r="94" />
      <circle cx={c} cy={c} r="86" strokeOpacity=".5" />
      <circle cx={c} cy={c} r="34" />
      <circle cx={c} cy={c} r="14" strokeOpacity=".7" />
      {Array.from({ length: foils }).map((_, i) => {
        const a = ((i * 360) / foils - 90) * (Math.PI / 180);
        return <circle key={`f${i}`} cx={c + 60 * Math.cos(a)} cy={c + 60 * Math.sin(a)} r="22" strokeOpacity=".6" />;
      })}
      {Array.from({ length: foils }).map((_, i) => {
        const a = ((i * 360) / foils - 90) * (Math.PI / 180);
        return <line key={`s${i}`} x1={c + 34 * Math.cos(a)} y1={c + 34 * Math.sin(a)} x2={c + 86 * Math.cos(a)} y2={c + 86 * Math.sin(a)} strokeOpacity=".32" />;
      })}
      {Array.from({ length: 4 }).map((_, i) => {
        const a = ((i * 90 + 45 - 90) * Math.PI) / 180;
        return <circle key={`q${i}`} cx={c + 20 * Math.cos(a)} cy={c + 20 * Math.sin(a)} r="11" strokeOpacity=".75" />;
      })}
      <circle cx={c} cy={c} r="4" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Calm concentric-ring halo (no spikes) — a quiet glow behind a motif. */
export function SoftHalo({ size = 150, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} fill="none" stroke="currentColor" style={{ display: "block", ...style }} aria-hidden="true">
      <circle cx="100" cy="100" r="92" strokeWidth="1" strokeOpacity="0.22" />
      <circle cx="100" cy="100" r="74" strokeWidth="1" strokeOpacity="0.38" />
      <circle cx="100" cy="100" r="56" strokeWidth="1.4" strokeOpacity="0.6" />
    </svg>
  );
}

/**
 * A gilded devotional medallion — a religious-medal style emblem (soft disk,
 * fine rim, beaded inner border, crowning cross) holding a saint's monogram.
 * Replaces the old sunburst crest with something quieter and more Catholic.
 */
export function SaintMedallion({ monogram, size = 140, style = {} }: { monogram: string; size?: number; style?: React.CSSProperties }) {
  const beads = 44;
  const gid = `oraMedal-${monogram.charCodeAt(0) || 0}`;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "grid", placeItems: "center", ...style }}>
      <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id={gid} cx="50%" cy="40%" r="66%">
            <stop offset="0%" stopColor="var(--gold-bright)" />
            <stop offset="100%" stopColor="var(--gold-faint)" />
          </radialGradient>
        </defs>
        {/* medal disk */}
        <circle cx="100" cy="104" r="80" fill={`url(#${gid})`} />
        {/* rim — two fine gilt rings */}
        <circle cx="100" cy="104" r="80" fill="none" stroke="var(--gold)" strokeWidth="2" strokeOpacity="0.9" />
        <circle cx="100" cy="104" r="85" fill="none" stroke="var(--gold)" strokeWidth="1" strokeOpacity="0.32" />
        {/* beaded inner border */}
        {Array.from({ length: beads }).map((_, i) => {
          const a = ((i * 360) / beads - 90) * (Math.PI / 180);
          return <circle key={i} cx={100 + 68 * Math.cos(a)} cy={104 + 68 * Math.sin(a)} r="1.5" fill="var(--gold-deep)" fillOpacity="0.5" />;
        })}
        {/* crowning cross */}
        <g fill="var(--gold)">
          <rect x="96.8" y="5" width="6.4" height="21" rx="1.2" />
          <rect x="90.5" y="11.5" width="19" height="5.6" rx="1.2" />
        </g>
      </svg>
      <span
        style={{
          fontFamily: "var(--font-ornament)",
          fontSize: size * 0.36,
          fontWeight: 500,
          color: "var(--gold-deep)",
          lineHeight: 1,
          position: "relative",
          zIndex: 1,
          userSelect: "none",
          marginTop: size * 0.03,
        }}
      >
        {monogram}
      </span>
    </div>
  );
}

export function OraWordmark({ size = 30, dark = false, tagline = true }: { size?: number; dark?: boolean; tagline?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1 }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size, letterSpacing: ".3em", textIndent: ".3em", color: dark ? "#F3EEE2" : "var(--ink)" }}>ORA</div>
      {tagline && (
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: size * 0.26, letterSpacing: ".34em", textIndent: ".34em", color: dark ? "var(--gold-bright)" : "var(--gold-deep)", marginTop: size * 0.28 }}>
          PRAYER WARRIOR
        </div>
      )}
    </div>
  );
}
