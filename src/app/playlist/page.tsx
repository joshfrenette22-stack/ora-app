"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fleuron } from "@/components/Sacred";
import { Kicker, LucideIcon } from "@/components/UI";
import { ListenButton, SpokenText, useNarration, useRegisterNarration, type NarrationSegment } from "@/components/PrayerPlayer";
import { PRAYER_CATALOG, CATEGORIES, type Prayer } from "@/data/prayers";
import { Illustration } from "@/components/Illustration";

// ── Persistence ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "ora-playlist";

function loadPlaylist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function savePlaylist(ids: string[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch {}
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function prayerById(id: string): Prayer | undefined {
  return PRAYER_CATALOG.find((p) => p.id === id);
}

// ── Picker modal ─────────────────────────────────────────────────────────────

function PrayerPicker({ onAdd, onClose, existing }: { onAdd: (id: string) => void; onClose: () => void; existing: Set<string> }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = useMemo(() => {
    let list = PRAYER_CATALOG;
    if (cat) list = list.filter((p) => p.category === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.sub?.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    return list;
  }, [search, cat]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", flexDirection: "column" }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }} />

      {/* Sheet */}
      <div style={{
        position: "relative", marginTop: "auto", maxHeight: "85vh",
        background: "var(--bone-raised)", borderRadius: "20px 20px 0 0",
        display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 22, color: "var(--ink)", margin: 0 }}>
              Add Prayer
            </h2>
            <button onClick={onClose} aria-label="Close" style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "var(--stone-100)", color: "var(--stone-400)", cursor: "pointer", display: "grid", placeItems: "center" }}>
              <LucideIcon name="x" size={18} />
            </button>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 14 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--stone-400)" }}>
              <LucideIcon name="search" size={16} />
            </span>
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prayers..."
              style={{
                width: "100%", padding: "11px 14px 11px 40px", borderRadius: 12,
                border: "1px solid var(--stone-200)", background: "var(--bone)",
                fontFamily: "var(--font-body)", fontSize: 15, color: "var(--ink)",
                outline: "none",
              }}
            />
          </div>

          {/* Category pills */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 14, WebkitOverflowScrolling: "touch" }}>
            <button
              onClick={() => setCat(null)}
              style={{
                padding: "7px 14px", borderRadius: 999, border: "none", cursor: "pointer",
                fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600,
                background: !cat ? "var(--ink)" : "var(--stone-100)",
                color: !cat ? "var(--gold-bright)" : "var(--stone-400)",
                whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(cat === c ? null : c)}
                style={{
                  padding: "7px 14px", borderRadius: 999, border: "none", cursor: "pointer",
                  fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600,
                  background: cat === c ? "var(--ink)" : "var(--stone-100)",
                  color: cat === c ? "var(--gold-bright)" : "var(--stone-400)",
                  whiteSpace: "nowrap", flexShrink: 0,
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Prayer list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
          {filtered.map((p) => {
            const inList = existing.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => { onAdd(p.id); }}
                style={{
                  display: "flex", alignItems: "center", gap: 14, width: "100%",
                  padding: "14px 0", border: "none", borderBottom: "1px solid var(--stone-200)",
                  background: "transparent", cursor: "pointer", textAlign: "left",
                }}
              >
                <span style={{
                  width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                  background: inList ? "var(--gold-faint)" : "var(--stone-100)",
                  color: inList ? "var(--gold-deep)" : "var(--stone-400)",
                  display: "grid", placeItems: "center",
                }}>
                  <LucideIcon name={inList ? "check" : (p.lucide ?? "bookmark")} size={18} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "var(--ink)", lineHeight: 1.3 }}>
                    {p.title}
                  </div>
                  {p.sub && (
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--stone-400)", marginTop: 2 }}>
                      {p.sub}
                    </div>
                  )}
                </div>
                <span style={{
                  fontFamily: "var(--font-display)", fontSize: 10, fontWeight: 600,
                  color: "var(--stone-400)", letterSpacing: ".02em",
                  padding: "4px 10px", borderRadius: 999, background: "var(--stone-100)",
                  flexShrink: 0,
                }}>
                  {p.category}
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--stone-400)", fontFamily: "var(--font-body)", fontSize: 15 }}>
              No prayers found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Playlist item (draggable row) ────────────────────────────────────────────

function PlaylistItem({
  prayer,
  index,
  isActive,
  isPlaying,
  wordIndex,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  prayer: Prayer;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  wordIndex: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: isActive ? "var(--gold-faint)" : "var(--bone-raised)",
      border: isActive ? "1px solid var(--gold)" : "1px solid var(--stone-200)",
      borderRadius: 16,
      overflow: "hidden",
      transition: "background .2s, border-color .2s",
    }}>
      {/* Row header */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 16px",
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded(!expanded); }
        }}
      >
        {/* Number badge */}
        <span style={{
          width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
          background: isActive ? "var(--gold-deep)" : "var(--stone-100)",
          color: isActive ? "#fff" : "var(--stone-400)",
          fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700,
          display: "grid", placeItems: "center",
        }}>
          {isActive && isPlaying ? <LucideIcon name="volume-2" size={14} /> : index + 1}
        </span>

        {/* Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15,
            color: isActive ? "var(--gold-deep)" : "var(--ink)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {prayer.title}
          </div>
          {prayer.sub && (
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--stone-400)", marginTop: 1 }}>
              {prayer.sub}
            </div>
          )}
        </div>

        {/* Reorder + remove */}
        <div style={{ display: "flex", gap: 2, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label="Move up"
            style={{
              width: 34, height: 34, borderRadius: "50%", border: "none",
              background: "transparent", cursor: isFirst ? "default" : "pointer",
              color: isFirst ? "var(--stone-300)" : "var(--stone-400)",
              display: "grid", placeItems: "center",
            }}
          >
            <LucideIcon name="chevron-up" size={14} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            aria-label="Move down"
            style={{
              width: 34, height: 34, borderRadius: "50%", border: "none",
              background: "transparent", cursor: isLast ? "default" : "pointer",
              color: isLast ? "var(--stone-300)" : "var(--stone-400)",
              display: "grid", placeItems: "center",
            }}
          >
            <LucideIcon name="chevron-down" size={14} />
          </button>
          <button
            onClick={onRemove}
            aria-label="Remove"
            style={{
              width: 34, height: 34, borderRadius: "50%", border: "none",
              background: "transparent", cursor: "pointer",
              color: "var(--stone-400)",
              display: "grid", placeItems: "center",
            }}
          >
            <LucideIcon name="x" size={14} />
          </button>
        </div>
      </div>

      {/* Expanded: show prayer text */}
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--stone-200)" }}>
          <SpokenText
            as="p"
            text={prayer.text}
            active={isActive}
            wordIndex={wordIndex}
            style={{
              fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.65,
              color: "var(--ink-700)", margin: "14px 0 0",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── Next Up sidebar ──────────────────────────────────────────────────────────

function NextUp({ prayers, currentIndex, playing }: { prayers: Prayer[]; currentIndex: number; playing: boolean }) {
  const upcoming = prayers.slice(currentIndex + 1);
  const current = prayers[currentIndex];

  return (
    <div>
      {current && playing && (
        <div style={{ marginBottom: 20 }}>
          <Kicker style={{ marginBottom: 10 }}>Now Playing</Kicker>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 16px", borderRadius: 12,
            background: "var(--gold-faint)", border: "1px solid var(--gold)",
          }}>
            <span style={{
              width: 32, height: 32, borderRadius: "50%", background: "var(--gold-deep)",
              color: "#fff", display: "grid", placeItems: "center", flexShrink: 0,
            }}>
              <LucideIcon name="volume-2" size={14} />
            </span>
            <div>
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--gold-deep)" }}>
                {current.title}
              </div>
              {current.sub && (
                <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--stone-400)" }}>
                  {current.sub}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Kicker style={{ marginBottom: 10 }}>
        {upcoming.length > 0 ? "Next Up" : "Queue Empty"}
      </Kicker>

      {upcoming.length === 0 && (
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--stone-400)", fontStyle: "italic" }}>
          Add prayers to build your playlist.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {upcoming.map((p, i) => (
          <div
            key={`${p.id}-${currentIndex + 1 + i}`}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 0",
              borderBottom: i < upcoming.length - 1 ? "1px solid var(--stone-200)" : "none",
            }}
          >
            <span style={{
              width: 26, height: 26, borderRadius: "50%", background: "var(--stone-100)",
              color: "var(--stone-400)", fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700,
              display: "grid", placeItems: "center", flexShrink: 0,
            }}>
              {currentIndex + 2 + i}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14,
                color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {p.title}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function PlaylistPage() {
  const [ids, setIds] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => { setIds(loadPlaylist()); }, []);

  const updateIds = useCallback((next: string[]) => {
    setIds(next);
    savePlaylist(next);
  }, []);

  const prayers = useMemo(() => ids.map(prayerById).filter(Boolean) as Prayer[], [ids]);
  const existingSet = useMemo(() => new Set(ids), [ids]);

  const addPrayer = useCallback((id: string) => {
    // Allow duplicates (e.g. multiple Hail Marys) — just append
    updateIds([...ids, id]);
  }, [ids, updateIds]);

  const removePrayer = useCallback((index: number) => {
    const next = [...ids];
    next.splice(index, 1);
    updateIds(next);
  }, [ids, updateIds]);

  const moveUp = useCallback((index: number) => {
    if (index <= 0) return;
    const next = [...ids];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    updateIds(next);
  }, [ids, updateIds]);

  const moveDown = useCallback((index: number) => {
    if (index >= ids.length - 1) return;
    const next = [...ids];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    updateIds(next);
  }, [ids, updateIds]);

  const clearAll = useCallback(() => { updateIds([]); }, [updateIds]);

  // Build narration segments from the playlist
  const segments = useMemo<NarrationSegment[]>(
    () => prayers.map((p, i) => ({ id: `${p.id}-${i}`, label: p.title, text: p.text })),
    [prayers],
  );

  const narration = useNarration({ segments });
  useRegisterNarration(narration, "My Playlist", false, "app-icon-crucifix");

  const speaking = narration.status !== "idle";

  // Find illustration for the currently playing prayer
  const currentPrayer = prayers[narration.index];

  return (
    <>
      <div className="pw-playlist" style={{ display: "flex", gap: 0, alignItems: "flex-start", minHeight: "100%" }}>

        {/* Main column */}
        <div className="pw-playlist-main" style={{ flex: 1, padding: "40px 48px 72px", minWidth: 0, maxWidth: "100%" }}>

          {/* The content bar already titles this page — go straight to a short helper. */}
          <p style={{
            fontFamily: "var(--font-body)", fontSize: 15, color: "var(--stone-400)",
            margin: "0 0 24px", lineHeight: 1.5,
          }}>
            Build your own prayer sequence — add, reorder, and pray through them in one session.
          </p>

          {/* Controls bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 24,
            flexWrap: "wrap",
          }}>
            {prayers.length > 0 && (
              <ListenButton narration={narration} label="Pray My Playlist" />
            )}
            <button
              onClick={() => setPickerOpen(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 22px", borderRadius: 14, border: "1px solid var(--stone-200)",
                background: "var(--bone-raised)", cursor: "pointer",
                fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700,
                color: "var(--ink-500)", letterSpacing: ".01em",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <LucideIcon name="plus" size={16} />
              Add Prayer
            </button>
            {prayers.length > 0 && (
              <button
                onClick={clearAll}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "10px 16px", borderRadius: 999, border: "none",
                  background: "transparent", cursor: "pointer",
                  fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600,
                  color: "var(--stone-400)",
                }}
              >
                <LucideIcon name="trash-2" size={13} />
                Clear All
              </button>
            )}
          </div>

          <Fleuron width={200} style={{ marginBottom: 24 }} />

          {/* Playlist items */}
          {prayers.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              border: "2px dashed var(--stone-200)", borderRadius: 20,
              background: "var(--bone)",
            }}>
              <div style={{ marginBottom: 16, color: "var(--stone-300)" }}>
                <LucideIcon name="list-music" size={48} />
              </div>
              <div style={{
                fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 500,
                color: "var(--ink)", marginBottom: 8,
              }}>
                Your playlist is empty
              </div>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: 15, color: "var(--stone-400)",
                margin: "0 0 20px", lineHeight: 1.5,
              }}>
                Tap "Add Prayer" to build a sequence of prayers to pray aloud.
              </p>
              <button
                onClick={() => setPickerOpen(true)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 24px", borderRadius: 14, border: "none",
                  background: "var(--gilt)", color: "#FFF8ED", cursor: "pointer",
                  fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700,
                  boxShadow: "var(--shadow-gold)",
                }}
              >
                <LucideIcon name="plus" size={16} />
                Add Your First Prayer
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {prayers.map((p, i) => (
                <PlaylistItem
                  key={`${p.id}-${i}`}
                  prayer={p}
                  index={i}
                  isActive={speaking && narration.index === i}
                  isPlaying={narration.status === "playing" && narration.index === i}
                  wordIndex={narration.wordIndex}
                  onRemove={() => removePrayer(i)}
                  onMoveUp={() => moveUp(i)}
                  onMoveDown={() => moveDown(i)}
                  isFirst={i === 0}
                  isLast={i === prayers.length - 1}
                />
              ))}
            </div>
          )}

          {/* Quick-add suggestions */}
          {prayers.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <Kicker style={{ marginBottom: 14 }}>Quick Add</Kicker>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PRAYER_CATALOG.slice(0, 8).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addPrayer(p.id)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "8px 14px", borderRadius: 999,
                      border: "1px solid var(--stone-200)",
                      background: "var(--bone-raised)", cursor: "pointer",
                      fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500,
                      color: "var(--ink-500)",
                    }}
                  >
                    <LucideIcon name="plus" size={12} />
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar — Next Up */}
        <div className="pw-playlist-aside" style={{
          width: 280, flexShrink: 0, borderLeft: "1px solid var(--stone-200)",
          padding: "40px 24px", background: "var(--bone-raised)",
          minHeight: "100%", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", bottom: -30, right: -30, pointerEvents: "none", zIndex: 0 }}>
            <Illustration name="app-icon-crucifix" size={200} invertOnDark opacity={0.3} />
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <NextUp prayers={prayers} currentIndex={speaking ? narration.index : -1} playing={speaking} />
          </div>
        </div>
      </div>

      {/* Picker modal */}
      {pickerOpen && (
        <PrayerPicker
          onAdd={(id) => { addPrayer(id); }}
          onClose={() => setPickerOpen(false)}
          existing={existingSet}
        />
      )}
    </>
  );
}
