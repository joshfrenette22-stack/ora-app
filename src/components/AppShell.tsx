"use client";
import { type ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Cross, Logomark } from "./Sacred";
import { SeasonBadge, LucideIcon } from "./UI";
import { useTheme } from "./ThemeProvider";
import { localDateISO } from "@/lib/clientDate";
import { FloatingPlayer, MediaSessionManager } from "./PrayerPlayer";

const NAV = [
  { id: "/", label: "Today", short: "Today", lucide: "sun" },
  { id: "/readings", label: "Daily Mass Readings", short: "Readings", lucide: "book-open" },
  { id: "/hours", label: "Liturgy of the Hours", short: "Hours", lucide: "clock" },
  { id: "/rosary", label: "The Holy Rosary", short: "Rosary", cross: true },
  { id: "/playlist", label: "My Playlist", short: "Playlist", lucide: "list-music" },
  { id: "/saints", label: "Saints", short: "Saints", lucide: "flame" },
  { id: "/calendar", label: "Calendar", short: "Calendar", lucide: "calendar" },
];

const TITLES: Record<string, [string, string | null]> = {
  "/": ["Today", "Monday · Ordinary Time"],
  "/readings": ["Daily Mass Readings", "Lectionary · Year C"],
  "/hours": ["Liturgy of the Hours", "The Divine Office"],
  "/rosary": ["The Holy Rosary", null],
  "/holy-face": ["Chaplet of the Holy Face", null],
  "/saints": ["Saint of the Day", "June IX"],
  "/calendar": ["Liturgical Calendar", "Anno Domini MMXXVI"],
  "/playlist": ["My Playlist", "Build your prayer sequence"],
  "/devotions": ["Devotions", "Prayers for every hour"],
  "/auxilium": ["Auxilium Christianorum", "Help of Christians · Daily Prayers"],
  "/practice-love": ["The Practice of the Love of Jesus Christ", "St. Alphonsus Liguori · Audiobook"],
  "/confession": ["Confession", "Examine · prepare · be cleansed"],
  "/settings": ["Settings", "Voice & display"],
  "/pray": ["Pray", "The Office, the Rosary & devotions"],
  "/focus": ["Enter Into Prayer", null],
};

function Sidebar({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  const { night, setNight } = useTheme();
  const [lit, setLit] = useState<{ label: string; badgeSeason: string }>({ label: "Ordinary Time", badgeSeason: "green" });
  const [dayLabel, setDayLabel] = useState("Feria");

  useEffect(() => {
    let alive = true;
    fetch(`/api/today?date=${localDateISO()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d) return;
        setLit(d.liturgical);
        setDayLabel(d.saint.rank === "feria" ? "Feria" : d.saint.name);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <div className="pw-sidebar" style={{ width: 256, flexShrink: 0, background: "var(--bone-raised)", display: "flex", flexDirection: "column", padding: "26px 0", borderRight: "1px solid var(--stone-200)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 24px 26px" }}>
        <span style={{ color: "var(--gold)" }}><Logomark size={32} /></span>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, letterSpacing: ".16em", color: "var(--ink)", lineHeight: 1.15 }}>
          PRAYER<br />WARRIOR
        </div>
      </div>
      <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 3 }}>
        {NAV.map((n) => {
          const on = active === n.id;
          return (
            <button key={n.id} onClick={() => onChange(n.id)} style={{
              display: "flex", alignItems: "center", gap: 13, padding: "11px 14px", borderRadius: 12,
              border: "none", cursor: "pointer", textAlign: "left", width: "100%",
              background: on ? "var(--gold-faint)" : "transparent",
              color: on ? "var(--gold-deep)" : "var(--ink-500)",
              fontFamily: "var(--font-body)", fontSize: 15.5, fontWeight: on ? 700 : 500,
              transition: "background .14s, color .14s",
            }}>
              <span style={{ width: 22, display: "grid", placeItems: "center", color: on ? "var(--gold)" : "var(--stone-400)" }}>
                {n.cross ? <Cross size={17} /> : <LucideIcon name={n.lucide!} size={19} stroke={on ? 2 : 1.7} />}
              </span>
              {n.label}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: "auto", padding: "0 22px" }}>
        <div style={{ height: 1, background: "var(--stone-200)", margin: "0 0 16px" }} />
        <SeasonBadge season={lit.badgeSeason}>{lit.label}</SeasonBadge>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--stone-400)", marginTop: 7 }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · {dayLabel}
        </div>
        <button
          onClick={() => setNight(!night)}
          aria-label="Toggle night mode"
          style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
        >
          <span style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--gold-faint)", color: "var(--gold-deep)", display: "grid", placeItems: "center" }}>
            <LucideIcon name={night ? "sun" : "moon"} size={16} />
          </span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink-500)" }}>
            {night ? "Day mode" : "Night mode"}
          </span>
        </button>
      </div>
    </div>
  );
}

function ContentBar({ title, sub, pathname }: { title: string; sub: string | null; pathname: string }) {
  const { night, setNight } = useTheme();
  const router = useRouter();

  // Date-dependent subtitles ("Wednesday · Ordinary Time", "June 17") are
  // resolved on the client so they stay correct instead of hard-coding a day.
  const [liveSub, setLiveSub] = useState<string | null>(null);
  useEffect(() => {
    const now = new Date();
    const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
    const base =
      pathname === "/saints" ? now.toLocaleDateString("en-US", { month: "long", day: "numeric" })
      : pathname === "/" ? `${weekday} · Ordinary Time`
      : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLiveSub(base);
    if (pathname === "/") {
      fetch(`/api/today?date=${localDateISO()}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d?.liturgical?.label) setLiveSub(`${weekday} · ${d.liturgical.label}`); })
        .catch(() => {});
    }
  }, [pathname]);

  const shownSub = liveSub ?? sub;
  const iconBtn: React.CSSProperties = {
    width: 42, height: 42, borderRadius: "50%", border: "1px solid var(--stone-200)",
    background: "var(--bone-raised)", color: "var(--ink-500)", cursor: "pointer",
    display: "grid", placeItems: "center",
  };
  return (
    <div className="pw-contentbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 44px", borderBottom: "1px solid var(--stone-200)" }}>
      <div>
        {shownSub && (
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, letterSpacing: ".02em", color: "var(--stone-400)" }}>
            {shownSub}
          </div>
        )}
        <div className="pw-contentbar-title" style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 25, letterSpacing: "-.01em", color: "var(--ink)", marginTop: shownSub ? 2 : 0 }}>
          {title}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {/* Night toggle — the sidebar's copy is hidden on phones, so surface it here. */}
        <button className="pw-mobile-only pw-iconbtn" onClick={() => setNight(!night)} aria-label="Toggle night mode" style={{ ...iconBtn, placeItems: "center" }}>
          <LucideIcon name={night ? "sun" : "moon"} size={19} />
        </button>
        <button className="pw-iconbtn" style={iconBtn} aria-label="Settings" onClick={() => router.push("/settings")}>
          <LucideIcon name="settings" size={19} />
        </button>
      </div>
    </div>
  );
}

function BottomNav({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  return (
    <nav
      className="pw-bottomnav"
      style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50,
        background: "var(--bone-raised)", borderTop: "1px solid var(--stone-200)",
        boxShadow: "0 -6px 22px rgba(45,30,18,.07)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        alignItems: "stretch", justifyContent: "space-around",
      }}
    >
      {NAV.map((n) => {
        const on = active === n.id;
        return (
          <button
            key={n.id}
            onClick={() => onChange(n.id)}
            aria-label={n.label}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              padding: "9px 2px 7px", border: "none", background: "transparent", cursor: "pointer",
              color: on ? "var(--gold-deep)" : "var(--stone-400)",
            }}
          >
            <span style={{ display: "grid", placeItems: "center", height: 26, width: 46, borderRadius: 999, background: on ? "var(--gold-faint)" : "transparent", color: on ? "var(--gold)" : "var(--stone-400)", transition: "background .15s" }}>
              {n.cross ? <Cross size={17} /> : <LucideIcon name={n.lucide!} size={20} stroke={on ? 2 : 1.7} />}
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 10, letterSpacing: ".01em", fontWeight: on ? 700 : 500 }}>
              {n.short}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const immersive = pathname === "/rosary" || pathname === "/focus" || pathname === "/holy-face";
  const titleEntry = TITLES[pathname] || ["Prayer Warrior", null];

  return (
    <div style={{ height: "100vh", display: "flex", fontFamily: "var(--font-body)" }}>
      <Sidebar active={pathname} onChange={(id) => router.push(id)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: immersive ? "var(--surface-ink)" : "var(--bone)", minWidth: 0 }}>
        {!immersive && <ContentBar title={titleEntry[0]} sub={titleEntry[1]} pathname={pathname} />}
        <div className="pw-scroll" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {children}
        </div>
      </div>
      <FloatingPlayer />
      <MediaSessionManager />
      <BottomNav active={pathname} onChange={(id) => router.push(id)} />
    </div>
  );
}
