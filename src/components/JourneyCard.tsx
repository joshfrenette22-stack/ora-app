"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, Check } from "lucide-react";
import { LucideIcon } from "./UI";
import { Cross } from "./Sacred";
import {
  type JourneyKey,
  getDay,
  getStreak,
  getTotals,
  markPrayed,
  unmarkPrayed,
  onJourneyChange,
} from "@/lib/journey";

// The daily plan. Rows navigate; the circle toggles "prayed" by hand for
// anyone who prays without narration.
const PLAN: { key: JourneyKey; label: string; sub: string; href: string; lucide?: string; cross?: boolean }[] = [
  { key: "readings", label: "Daily Readings", sub: "The Mass of the day", href: "/readings", lucide: "book-open" },
  { key: "rosary", label: "The Rosary", sub: "Today's mysteries", href: "/rosary", cross: true },
  { key: "hours", label: "The Hours", sub: "Pray the current hour", href: "/hours", lucide: "clock" },
  { key: "devotion", label: "A Devotion", sub: "Chaplets & prayers", href: "/devotions", lucide: "bell" },
];

function fmtMinutes(totalSeconds: number): string {
  const m = Math.round(totalSeconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} hr ${m % 60} min`;
}

export function JourneyCard() {
  const router = useRouter();
  // All journey state comes from localStorage, so resolve it after mount.
  const [state, setState] = useState<{
    done: JourneyKey[];
    todaySeconds: number;
    streak: number;
    totalSeconds: number;
  } | null>(null);

  useEffect(() => {
    const read = () => {
      const today = getDay();
      setState({
        done: today.done,
        todaySeconds: today.seconds,
        streak: getStreak(),
        totalSeconds: getTotals().totalSeconds,
      });
    };
    read();
    const off = onJourneyChange(read);
    const onVis = () => { if (!document.hidden) read(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { off(); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  const doneCount = state ? state.done.length : 0;
  const streak = state?.streak ?? 0;

  return (
    <div className="pw-card" style={{
      background: "var(--bone-raised)", border: "1px solid var(--stone-200)", borderRadius: 18,
      padding: "22px 24px", boxShadow: "var(--shadow-sm)",
    }}>
      {/* Header: streak + progress */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span style={{
            width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
            background: streak > 0 ? "var(--gilt)" : "var(--gold-faint)",
            color: streak > 0 ? "#2A2008" : "var(--gold-deep)",
            display: "grid", placeItems: "center",
          }}>
            <Flame size={17} strokeWidth={1.9} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 19, color: "var(--ink)", letterSpacing: "-.01em" }}>
              {state === null ? "Your prayer today" : streak > 0 ? `${streak}-day streak` : "Begin your streak"}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--stone-400)", marginTop: 1 }}>
              {state === null
                ? " "
                : state.todaySeconds >= 60
                  ? `${fmtMinutes(state.todaySeconds)} in prayer today · ${fmtMinutes(state.totalSeconds)} all time`
                  : streak > 0
                    ? "Keep the flame lit — pray one thing today."
                    : "Pray any one thing today to begin."}
            </div>
          </div>
        </div>
        <div aria-label={`${doneCount} of ${PLAN.length} prayed today`} style={{ display: "flex", gap: 5, flexShrink: 0 }}>
          {PLAN.map((p) => (
            <span key={p.key} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: state?.done.includes(p.key) ? "var(--gold)" : "var(--stone-200)",
              transition: "background .2s",
            }} />
          ))}
        </div>
      </div>

      {/* Plan rows */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {PLAN.map((p, i) => {
          const isDone = state?.done.includes(p.key) ?? false;
          return (
            <div key={p.key} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 0",
              borderTop: i > 0 ? "1px solid var(--stone-100)" : "none",
            }}>
              <button
                onClick={() => (isDone ? unmarkPrayed(p.key) : markPrayed(p.key))}
                aria-label={isDone ? `Mark ${p.label} not prayed` : `Mark ${p.label} prayed`}
                aria-pressed={isDone}
                style={{
                  width: 34, height: 34, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
                  border: isDone ? "none" : "1.5px solid var(--stone-300)",
                  background: isDone ? "var(--gold)" : "transparent",
                  color: isDone ? "#2A2008" : "var(--stone-300)",
                  display: "grid", placeItems: "center", transition: "background .15s, border-color .15s",
                }}
              >
                {isDone && <Check size={16} strokeWidth={2.4} />}
              </button>
              <div
                role="button"
                tabIndex={0}
                onClick={() => router.push(p.href)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(p.href); } }}
                style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
              >
                <span style={{ width: 20, display: "grid", placeItems: "center", color: isDone ? "var(--gold)" : "var(--stone-400)", flexShrink: 0 }}>
                  {p.cross ? <Cross size={15} /> : <LucideIcon name={p.lucide!} size={17} />}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15,
                    color: isDone ? "var(--stone-400)" : "var(--ink)",
                    textDecoration: isDone ? "line-through" : "none",
                    textDecorationColor: "var(--stone-300)",
                  }}>
                    {p.label}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--stone-400)", marginTop: 0 }}>
                    {p.sub}
                  </div>
                </div>
                <span style={{ marginLeft: "auto", color: "var(--stone-300)", flexShrink: 0 }}>
                  <LucideIcon name="chevron-right" size={17} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
