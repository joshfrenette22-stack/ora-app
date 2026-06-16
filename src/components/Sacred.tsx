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

export function HaloRays({ size = 150, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} fill="none" stroke="currentColor" style={{ display: "block", ...style }} aria-hidden="true">
      {Array.from({ length: 24 }).map((_, i) => {
        const a = ((i * 15 - 90) * Math.PI) / 180;
        return (
          <line key={i} x1={100} y1={100} x2={100 + (i % 2 ? 78 : 94) * Math.cos(a)} y2={100 + (i % 2 ? 78 : 94) * Math.sin(a)} strokeWidth={i % 2 ? 1 : 2.4} strokeOpacity={i % 2 ? 0.5 : 0.9} strokeLinecap="round" />
        );
      })}
      <circle cx="100" cy="100" r="26" strokeWidth="2" />
    </svg>
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
