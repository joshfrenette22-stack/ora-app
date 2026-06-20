"use client";
import type { ReactNode, CSSProperties } from "react";
import * as Lucide from "lucide-react";
import { Cross } from "./Sacred";

const LIT: Record<string, { c: string; label: string }> = {
  green: { c: "var(--lit-green)", label: "Ordinary Time" },
  violet: { c: "var(--lit-violet)", label: "Lent" },
  red: { c: "var(--lit-red)", label: "Memorial" },
  gold: { c: "var(--gold)", label: "Solemnity" },
  rose: { c: "var(--lit-rose)", label: "Gaudete" },
};

export function SeasonBadge({ season = "green", children, dark = false }: { season?: string; children?: ReactNode; dark?: boolean }) {
  const s = LIT[season] || LIT.green;
  const c = dark ? "var(--gold-bright)" : s.c;
  return (
    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11.5, letterSpacing: ".02em", color: c, display: "inline-flex", alignItems: "center", gap: 7 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: dark ? "var(--gold-bright)" : s.c }} />
      {children || s.label}
    </span>
  );
}

export function Kicker({ children, style = {} }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12.5, letterSpacing: ".01em", color: "var(--ink-700)", ...style }}>
      {children}
    </div>
  );
}

export function Btn({ variant = "primary", children, onClick, icon, style = {}, full = false }: {
  variant?: "primary" | "ink" | "ghost";
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  style?: CSSProperties;
  full?: boolean;
}) {
  const base: CSSProperties = {
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    fontSize: 14,
    letterSpacing: ".005em",
    border: "none",
    borderRadius: 11,
    padding: "13px 24px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    whiteSpace: "nowrap",
    width: full ? "100%" : undefined,
    transition: "transform .14s, filter .14s",
  };
  const variants: Record<string, CSSProperties> = {
    primary: { background: "var(--gilt)", color: "#2A2008", boxShadow: "var(--shadow-gold)" },
    ink: { background: "var(--ink)", color: "var(--gold-bright)" },
    ghost: { background: "transparent", color: "var(--gold-deep)", boxShadow: "inset 0 0 0 1.5px var(--gold)" },
  };
  return (
    <button
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseDown={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(1px)")}
      onMouseUp={(e) => ((e.currentTarget as HTMLElement).style.transform = "")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "")}
    >
      {icon}
      {children}
    </button>
  );
}

export function FeatureCard({ kicker, title, meta, onClick, motif }: {
  kicker: string;
  title: string;
  meta: string;
  onClick?: () => void;
  motif?: ReactNode;
}) {
  return (
    <button className="pw-card pw-feature-card" onClick={onClick} style={{ position: "relative", overflow: "hidden", textAlign: "left", cursor: "pointer", background: "var(--surface-ink)", color: "var(--gold-bright)", borderRadius: 18, padding: "30px 34px", boxShadow: "var(--shadow-lg)", border: "none", display: "flex", alignItems: "center", gap: 20, width: "100%" }}>
      {motif && <div style={{ position: "absolute", right: -10, top: -10, color: "var(--gold-bright)" }}>{motif}</div>}
      <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
        <Kicker style={{ color: "var(--gold-bright)", opacity: 0.85 }}>{kicker}</Kicker>
        <div className="pw-feature-title" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 32, color: "#F3EEE2", marginTop: 6 }}>{title}</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 16, opacity: 0.72, marginTop: 4 }}>{meta}</div>
      </div>
      <span className="pw-feature-btn">
        <Btn variant="primary" icon={<Cross size={15} />} onClick={() => { onClick?.(); }}>
          Begin
        </Btn>
      </span>
    </button>
  );
}

export function SurfaceCard({ kicker, title, meta, onClick, lucide, motif, cta }: {
  kicker: string;
  title: string;
  meta: string;
  onClick?: () => void;
  lucide?: string;
  motif?: ReactNode;
  /** Optional call-to-action shown at the foot of the card, e.g. "Learn more". */
  cta?: string;
}) {
  return (
    <button className="pw-card" onClick={onClick} style={{ textAlign: "left", cursor: "pointer", background: "var(--bone-raised)", border: "1px solid var(--stone-200)", borderRadius: 18, padding: "24px 26px", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: 14, width: "100%", position: "relative", overflow: "hidden" }}>
      {motif && <div style={{ position: "absolute", right: -10, bottom: -10, pointerEvents: "none" }}>{motif}</div>}
      <span style={{ width: 50, height: 50, borderRadius: "50%", background: "var(--gold-faint)", color: "var(--gold-deep)", display: "grid", placeItems: "center", position: "relative" }}>
        {lucide ? <LucideIcon name={lucide} size={24} /> : <Cross size={22} />}
      </span>
      <div style={{ position: "relative", minWidth: 0 }}>
        <Kicker>{kicker}</Kicker>
        <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 22, color: "var(--ink)", marginTop: 3 }}>{title}</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--stone-400)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis" }}>{meta}</div>
        {cta && (
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 5, marginTop: 12, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, letterSpacing: ".01em", color: "var(--gold-deep)" }}>
            {cta}<LucideIcon name="arrow-right" size={14} />
          </div>
        )}
      </div>
    </button>
  );
}

export function LucideIcon({ name, size = 20, stroke = 1.6 }: { name: string; size?: number; stroke?: number }) {
  // Look up the icon from a statically-imported namespace so the bundler can
  // resolve it; render outside any try/catch so render errors surface normally.
  const pascal = name.split("-").map((s) => s[0].toUpperCase() + s.slice(1)).join("");
  const icons = Lucide as unknown as Record<string, React.FC<{ size?: number; strokeWidth?: number }>>;
  const Icon = icons[pascal];
  if (Icon) return <Icon size={size} strokeWidth={stroke} />;
  return <span style={{ width: size, height: size, display: "inline-block" }} />;
}
