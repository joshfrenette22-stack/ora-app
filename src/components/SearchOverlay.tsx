"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LucideIcon } from "./UI";
import { Cross } from "./Sacred";
import { ListenButton, useNarration, useRegisterNarration, type NarrationSegment } from "./PrayerPlayer";
import { PRAYER_CATALOG, type Prayer } from "@/data/prayers";
import { markPrayed } from "@/lib/journey";

// Every place in the app, searchable alongside the prayer catalog.
const SECTIONS: { label: string; sub: string; href: string; lucide?: string; cross?: boolean; terms?: string }[] = [
  { label: "Today", sub: "Home", href: "/", lucide: "sun" },
  { label: "Daily Mass Readings", sub: "Lectionary of the day", href: "/readings", lucide: "book-open", terms: "gospel psalm first reading mass" },
  { label: "Liturgy of the Hours", sub: "The Divine Office", href: "/hours", lucide: "clock", terms: "office lauds vespers compline sext breviary" },
  { label: "The Holy Rosary", sub: "Guided or interactive", href: "/rosary", cross: true, terms: "mysteries joyful sorrowful glorious luminous beads" },
  { label: "My Playlist", sub: "Your prayer sequence", href: "/playlist", lucide: "list-music" },
  { label: "Saint of the Day", sub: "Life, patronage & feast", href: "/saints", lucide: "flame", terms: "saints feast" },
  { label: "Liturgical Calendar", sub: "Feasts & seasons", href: "/calendar", lucide: "calendar", terms: "month feast season" },
  { label: "Devotions", sub: "Chaplets & prayers", href: "/devotions", lucide: "bell", terms: "angelus divine mercy michael memorare" },
  { label: "Chaplet of the Holy Face", sub: "Guided or interactive", href: "/holy-face", cross: true, terms: "chaplet reparation" },
  { label: "Auxilium Christianorum", sub: "Help of Christians · daily", href: "/auxilium", lucide: "shield", terms: "protection spiritual warfare" },
  { label: "The Practice of the Love of Jesus Christ", sub: "St. Alphonsus · audiobook", href: "/practice-love", lucide: "book-open", terms: "liguori audiobook book" },
  { label: "Confession", sub: "Examination of conscience", href: "/confession", lucide: "heart", terms: "examen sins penance reconciliation" },
  { label: "Settings", sub: "Voice, speed & display", href: "/settings", lucide: "settings", terms: "voice night mode speed" },
];

/** Rank a haystack against the query: prefix > word-prefix > substring. */
function score(hay: string, q: string): number {
  const h = hay.toLowerCase();
  if (h.startsWith(q)) return 3;
  if (h.includes(" " + q)) return 2;
  if (h.includes(q)) return 1;
  return 0;
}

// Mounted only while open, so query/reader state starts fresh each time.
export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [reading, setReading] = useState<Prayer | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Inline reader: the found prayer is readable and listenable on the spot.
  const segments = useMemo<NarrationSegment[]>(
    () => (reading ? [{ id: reading.id, label: reading.title, text: reading.text }] : []),
    [reading],
  );
  const narration = useNarration({ segments, onComplete: () => markPrayed("devotion") });
  useRegisterNarration(narration, reading ? reading.title : "Search", false, reading?.illustration);

  useEffect(() => {
    // Focus after the overlay paints.
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, []);

  const q = query.trim().toLowerCase();

  const prayerHits = useMemo(() => {
    if (!q) return PRAYER_CATALOG.slice(0, 6);
    return PRAYER_CATALOG
      .map((p) => ({ p, s: Math.max(score(p.title, q), score(p.sub ?? "", q) * 0.9, score(p.category, q) * 0.7) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8)
      .map((x) => x.p);
  }, [q]);

  const sectionHits = useMemo(() => {
    if (!q) return SECTIONS.slice(1, 5);
    return SECTIONS
      .map((s) => ({ s, r: Math.max(score(s.label, q), score(s.sub, q) * 0.9, score(s.terms ?? "", q) * 0.8) }))
      .filter((x) => x.r > 0)
      .sort((a, b) => b.r - a.r)
      .slice(0, 6)
      .map((x) => x.s);
  }, [q]);

  function close() {
    narration.stop();
    onClose();
  }

  const rowStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 13, width: "100%", textAlign: "left",
    padding: "11px 14px", borderRadius: 12, border: "none", background: "transparent",
    cursor: "pointer", color: "var(--ink)",
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Search" style={{ position: "fixed", inset: 0, zIndex: 320, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div onClick={close} style={{ position: "absolute", inset: 0, background: "rgba(20,14,8,0.45)", backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)" }} />

      <div className="pw-search-panel" style={{
        position: "relative", width: "min(600px, calc(100vw - 24px))", marginTop: "min(12vh, 110px)",
        maxHeight: "min(72vh, 640px)", display: "flex", flexDirection: "column",
        background: "var(--bone-raised)", borderRadius: 18, boxShadow: "var(--shadow-lg)",
        border: "1px solid var(--stone-200)", overflow: "hidden",
      }}>
        {reading ? (
          <>
            {/* Reader */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--stone-200)", flexShrink: 0 }}>
              <button onClick={() => { narration.stop(); setReading(null); }} aria-label="Back to search" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--stone-200)", background: "transparent", color: "var(--ink-500)", cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <LucideIcon name="arrow-left" size={17} />
              </button>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, letterSpacing: ".02em", color: "var(--gold-deep)" }}>{reading.category}</div>
                <div style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 19, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{reading.title}</div>
              </div>
              <button onClick={close} aria-label="Close search" style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "var(--stone-100)", color: "var(--stone-400)", cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <LucideIcon name="x" size={17} />
              </button>
            </div>
            <div className="pw-scroll" style={{ overflowY: "auto", padding: "20px 22px 26px" }}>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 17.5, lineHeight: 1.75, color: "var(--ink-700)", whiteSpace: "pre-line" }}>
                {reading.text}
              </div>
              <div style={{ marginTop: 22 }}>
                <ListenButton narration={narration} label={`Pray ${reading.title} aloud`} />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Input */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderBottom: "1px solid var(--stone-200)", flexShrink: 0 }}>
              <span style={{ color: "var(--stone-400)", display: "grid", placeItems: "center" }}>
                <LucideIcon name="search" size={18} />
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search prayers, devotions, pages…"
                aria-label="Search prayers, devotions, pages"
                style={{
                  flex: 1, border: "none", outline: "none", background: "transparent",
                  fontFamily: "var(--font-body)", fontSize: 16.5, color: "var(--ink)",
                  padding: "13px 0",
                }}
              />
              <button onClick={close} aria-label="Close search" style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "var(--stone-100)", color: "var(--stone-400)", cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <LucideIcon name="x" size={16} />
              </button>
            </div>

            {/* Results */}
            <div className="pw-scroll" style={{ overflowY: "auto", padding: "10px 8px 14px" }}>
              {prayerHits.length === 0 && sectionHits.length === 0 && (
                <div style={{ textAlign: "center", padding: "34px 0", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--stone-400)" }}>
                  Nothing found for &ldquo;{query}&rdquo;.
                </div>
              )}

              {prayerHits.length > 0 && (
                <>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10.5, letterSpacing: ".04em", color: "var(--stone-400)", padding: "8px 14px 4px", textTransform: "uppercase" }}>
                    Prayers
                  </div>
                  {prayerHits.map((p) => (
                    <button key={p.id} className="pw-search-row" style={rowStyle} onClick={() => setReading(p)}>
                      <span style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--gold-faint)", color: "var(--gold-deep)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                        <LucideIcon name={p.lucide ?? "bookmark"} size={16} />
                      </span>
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ display: "block", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</span>
                        <span style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--stone-400)", marginTop: 1 }}>{p.sub ?? p.category}</span>
                      </span>
                      <span style={{ color: "var(--stone-300)", flexShrink: 0 }}><LucideIcon name="chevron-right" size={16} /></span>
                    </button>
                  ))}
                </>
              )}

              {sectionHits.length > 0 && (
                <>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10.5, letterSpacing: ".04em", color: "var(--stone-400)", padding: "12px 14px 4px", textTransform: "uppercase" }}>
                    Go to
                  </div>
                  {sectionHits.map((s) => (
                    <button key={s.href} className="pw-search-row" style={rowStyle} onClick={() => { close(); router.push(s.href); }}>
                      <span style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--stone-100)", color: "var(--ink-500)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                        {s.cross ? <Cross size={15} /> : <LucideIcon name={s.lucide!} size={16} />}
                      </span>
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ display: "block", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</span>
                        <span style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--stone-400)", marginTop: 1 }}>{s.sub}</span>
                      </span>
                      <span style={{ color: "var(--stone-300)", flexShrink: 0 }}><LucideIcon name="arrow-right" size={15} /></span>
                    </button>
                  ))}
                </>
              )}
            </div>

            <div className="pw-desktop-only" style={{ padding: "9px 16px", borderTop: "1px solid var(--stone-200)", fontFamily: "var(--font-display)", fontSize: 11, color: "var(--stone-400)", letterSpacing: ".03em", flexShrink: 0 }}>
              esc to close · press / anywhere to search
            </div>
          </>
        )}
      </div>
    </div>
  );
}
