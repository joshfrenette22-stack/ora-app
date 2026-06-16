"use client";
import { type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Cross, Logomark } from "./Sacred";
import { SeasonBadge, LucideIcon } from "./UI";
import { useTheme } from "./ThemeProvider";

const NAV = [
  { id: "/", label: "Today", lucide: "sun" },
  { id: "/readings", label: "Daily Mass", lucide: "book-open" },
  { id: "/hours", label: "Liturgy of the Hours", lucide: "clock" },
  { id: "/rosary", label: "The Holy Rosary", cross: true },
  { id: "/saints", label: "Saints", lucide: "flame" },
  { id: "/calendar", label: "Calendar", lucide: "calendar" },
];

const TITLES: Record<string, [string, string | null]> = {
  "/": ["Today", "Monday \u00b7 Ordinary Time"],
  "/readings": ["Daily Mass", "Lectionary \u00b7 Year C"],
  "/hours": ["Liturgy of the Hours", "The Divine Office"],
  "/rosary": ["The Holy Rosary", null],
  "/saints": ["Saint of the Day", "June IX"],
  "/calendar": ["Liturgical Calendar", "Anno Domini MMXXVI"],
  "/pray": ["Pray", "The Office, the Rosary & devotions"],
  "/focus": ["Enter Into Prayer", null],
};

function Sidebar({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  const { night, setNight } = useTheme();
  return (
    <div style={{ width: 256, flexShrink: 0, background: "var(--surface-ink)", color: "var(--gold-bright)", display: "flex", flexDirection: "column", padding: "26px 0", borderRight: "1px solid rgba(216,188,118,.12)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 24px 26px" }}>
        <span style={{ color: "var(--gold)" }}><Logomark size={34} /></span>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, letterSpacing: ".16em", color: "#F3EEE2", lineHeight: 1.1 }}>
            PRAYER<br />WARRIOR
          </div>
        </div>
      </div>
      <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((n) => {
          const on = active === n.id;
          return (
            <button key={n.id} onClick={() => onChange(n.id)} style={{
              display: "flex", alignItems: "center", gap: 13, padding: "11px 14px", borderRadius: 9,
              border: "none", cursor: "pointer", textAlign: "left", width: "100%",
              background: on ? "rgba(216,188,118,0.12)" : "transparent",
              color: on ? "var(--gold-bright)" : "rgba(236,227,204,0.62)",
              fontFamily: "var(--font-body)", fontSize: 16, fontWeight: on ? 600 : 400,
              boxShadow: on ? "inset 2px 0 0 var(--gold-bright)" : "none",
            }}>
              <span style={{ width: 20, display: "grid", placeItems: "center", color: on ? "var(--gold-bright)" : "rgba(216,188,118,0.55)" }}>
                {n.cross ? <Cross size={17} /> : <LucideIcon name={n.lucide!} size={19} stroke={on ? 2 : 1.6} />}
              </span>
              {n.label}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: "auto", padding: "0 24px" }}>
        <div style={{ height: 1, background: "rgba(216,188,118,0.18)", margin: "0 0 18px" }} />
        <SeasonBadge season="green" dark>Ordinary Time \u00b7 Week X</SeasonBadge>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(236,227,204,0.5)", marginTop: 8 }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} \u00b7 Feria
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18 }}>
          <button
            onClick={() => setNight(!night)}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: night ? "var(--gold-faint)" : "rgba(216,188,118,0.16)",
              color: night ? "var(--gold-deep)" : "var(--gold-bright)",
              display: "grid", placeItems: "center", border: "none", cursor: "pointer",
            }}
            aria-label="Toggle night mode"
          >
            <LucideIcon name={night ? "sun" : "moon"} size={16} />
          </button>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(236,227,204,.6)" }}>
            {night ? "Day Mode" : "Night Mode"}
          </span>
        </div>
      </div>
    </div>
  );
}

function ContentBar({ title, sub }: { title: string; sub: string | null }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 44px", borderBottom: "1px solid var(--stone-200)" }}>
      <div>
        {sub && (
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--stone-400)" }}>
            {sub}
          </div>
        )}
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink)", marginTop: sub ? 4 : 0 }}>
          {title}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={{ width: 42, height: 42, borderRadius: 10, border: "1px solid var(--stone-200)", background: "var(--bone-raised)", color: "var(--ink-500)", cursor: "pointer", display: "grid", placeItems: "center" }}>
          <LucideIcon name="search" size={19} />
        </button>
        <button style={{ width: 42, height: 42, borderRadius: 10, border: "1px solid var(--stone-200)", background: "var(--bone-raised)", color: "var(--ink-500)", cursor: "pointer", display: "grid", placeItems: "center" }}>
          <LucideIcon name="bell" size={19} />
        </button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const immersive = pathname === "/rosary" || pathname === "/focus";
  const titleEntry = TITLES[pathname] || ["ORA", null];

  return (
    <div style={{ height: "100vh", display: "flex", fontFamily: "var(--font-body)" }}>
      <Sidebar active={pathname} onChange={(id) => router.push(id)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: immersive ? "var(--surface-ink)" : "var(--bone)", minWidth: 0 }}>
        {!immersive && <ContentBar title={titleEntry[0]} sub={titleEntry[1]} />}
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
