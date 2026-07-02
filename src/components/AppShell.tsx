"use client";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Cross, Logomark } from "./Sacred";
import { SeasonBadge, LucideIcon } from "./UI";
import { useTheme } from "./ThemeProvider";
import { localDateISO } from "@/lib/clientDate";
import { FloatingPlayer, MediaSessionManager } from "./PrayerPlayer";
import { SearchOverlay } from "./SearchOverlay";

const NAV = [
  { id: "/", label: "Today", short: "Today", lucide: "sun" },
  { id: "/readings", label: "Daily Mass Readings", short: "Readings", lucide: "book-open" },
  { id: "/hours", label: "Liturgy of the Hours", short: "Hours", lucide: "clock" },
  { id: "/rosary", label: "The Holy Rosary", short: "Rosary", cross: true },
  { id: "/playlist", label: "My Playlist", short: "Playlist", lucide: "list-music" },
  { id: "/saints", label: "Saints", short: "Saints", lucide: "flame" },
  { id: "/calendar", label: "Calendar", short: "Calendar", lucide: "calendar" },
];

// Sidebar-only entries — the phone bottom nav stays at seven tabs, and these
// remain reachable there through the Today page cards.
const NAV_MORE = [
  { id: "/devotions", label: "Devotions", short: "Devotions", lucide: "bell" },
  { id: "/confession", label: "Confession", short: "Confession", lucide: "heart" },
];

// Sub-pages highlight their section in the sidebar and get a back button in
// the content bar pointing at their parent.
const PARENT: Record<string, string> = {
  "/holy-face": "/devotions",
  "/auxilium": "/devotions",
  "/practice-love": "/devotions",
  "/devotions": "/",
  "/confession": "/",
  "/settings": "/",
};

function navActive(pathname: string): string {
  if (pathname === "/holy-face" || pathname === "/auxilium" || pathname === "/practice-love") return "/devotions";
  return pathname;
}

function romanNumeral(n: number): string {
  const table: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  for (const [v, s] of table) while (n >= v) { out += s; n -= v; }
  return out;
}

// Sunday lectionary cycle (A/B/C). The liturgical year is named for the
// calendar year it ends in; it begins on the First Sunday of Advent
// (the fourth Sunday before Christmas).
function lectionaryYear(now: Date): string {
  const y = now.getFullYear();
  const dec25 = new Date(y, 11, 25);
  const dow = dec25.getDay();
  const adventStart = new Date(y, 11, 25 - (dow === 0 ? 7 : dow) - 21);
  const litYear = now >= adventStart ? y + 1 : y;
  return ["C", "A", "B"][litYear % 3];
}

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
};

function Sidebar({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  const { night, setNight } = useTheme();
  const [lit, setLit] = useState<{ label: string; badgeSeason: string }>({ label: "Ordinary Time", badgeSeason: "green" });
  const [dayLabel, setDayLabel] = useState("Feria");
  // Resolved on the client — the server may render in a different timezone.
  const [dateLabel, setDateLabel] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDateLabel(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
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
        <div style={{ height: 1, background: "var(--stone-200)", margin: "12px 10px" }} />
        {NAV_MORE.map((n) => {
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
                <LucideIcon name={n.lucide} size={19} stroke={on ? 2 : 1.7} />
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
          {dateLabel ? `${dateLabel} · ${dayLabel}` : " "}
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

// Pages whose body opens with its own large hero heading — the content bar
// shows only chrome (back button, actions) there so the title isn't doubled.
const HERO_PAGES = new Set(["/auxilium", "/practice-love", "/confession"]);

function ContentBar({ title, sub, pathname, onSearch }: { title: string | null; sub: string | null; pathname: string; onSearch: () => void }) {
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
      : pathname === "/readings" ? `Lectionary · Year ${lectionaryYear(now)}`
      : pathname === "/calendar" ? `Anno Domini ${romanNumeral(now.getFullYear())}`
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
  const parent = PARENT[pathname];
  return (
    <div className="pw-contentbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 44px", borderBottom: "1px solid var(--stone-200)" }}>
      {parent && (
        <button
          className="pw-iconbtn"
          style={{ ...iconBtn, marginRight: 14, flexShrink: 0 }}
          aria-label="Back"
          onClick={() => router.push(parent)}
        >
          <LucideIcon name="arrow-left" size={19} />
        </button>
      )}
      <div style={{ minWidth: 0, marginRight: "auto" }}>
        {title && shownSub && (
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, letterSpacing: ".02em", color: "var(--stone-400)" }}>
            {shownSub}
          </div>
        )}
        {title && (
          <div className="pw-contentbar-title" style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 25, letterSpacing: "-.01em", color: "var(--ink)", marginTop: shownSub ? 2 : 0 }}>
            {title}
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, flexShrink: 0, marginLeft: 14 }}>
        <button className="pw-iconbtn" style={iconBtn} aria-label="Search" onClick={onSearch}>
          <LucideIcon name="search" size={19} />
        </button>
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
  const immersive = pathname === "/rosary" || pathname === "/holy-face";
  const titleEntry = TITLES[pathname] || ["Prayer Warrior", null];
  const active = navActive(pathname);
  const [searchOpen, setSearchOpen] = useState(false);

  // The scroll container persists across route changes, so reset it manually.
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [pathname]);

  // "/" or Cmd/Ctrl+K opens search anywhere (except while typing).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (!typing && (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"))) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", fontFamily: "var(--font-body)" }}>
      <Sidebar active={active} onChange={(id) => router.push(id)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: immersive ? "var(--surface-ink)" : "var(--bone)", minWidth: 0 }}>
        {!immersive && (
          <ContentBar
            title={HERO_PAGES.has(pathname) ? null : titleEntry[0]}
            sub={HERO_PAGES.has(pathname) ? null : titleEntry[1]}
            pathname={pathname}
            onSearch={() => setSearchOpen(true)}
          />
        )}
        <div ref={scrollRef} className="pw-scroll" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {children}
        </div>
      </div>
      <FloatingPlayer />
      <MediaSessionManager />
      <BottomNav active={active} onChange={(id) => router.push(id)} />
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
