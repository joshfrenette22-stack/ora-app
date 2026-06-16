"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Fleuron } from "@/components/Sacred";
import { SeasonBadge } from "@/components/UI";

// ── Static feast / liturgical data ──────────────────────────────────────────
// Keyed as "YYYY-M-D" (no zero-padding on month/day for easy lookup)
type LitColor = "green" | "violet" | "red" | "gold" | "rose" | "white";

interface FeastDay {
  name: string;
  color: LitColor;
  rank?: "solemnity" | "feast" | "memorial" | "feria";
}

const FEASTS: Record<string, FeastDay> = {
  // June 2026
  "2026-6-1":  { name: "St. Justin, Martyr", color: "red", rank: "memorial" },
  "2026-6-5":  { name: "St. Boniface, Bishop & Martyr", color: "red", rank: "memorial" },
  "2026-6-9":  { name: "St. Ephrem, Deacon & Doctor", color: "green", rank: "memorial" },
  "2026-6-11": { name: "St. Barnabas, Apostle", color: "red", rank: "feast" },
  "2026-6-13": { name: "St. Anthony of Padua", color: "white", rank: "memorial" },
  "2026-6-19": { name: "Sacred Heart of Jesus", color: "white", rank: "solemnity" },
  "2026-6-21": { name: "St. Aloysius Gonzaga", color: "white", rank: "memorial" },
  "2026-6-22": { name: "Sts. John Fisher & Thomas More", color: "red", rank: "memorial" },
  "2026-6-24": { name: "Birth of St. John the Baptist", color: "white", rank: "solemnity" },
  "2026-6-27": { name: "St. Cyril of Alexandria", color: "white", rank: "memorial" },
  "2026-6-28": { name: "St. Irenaeus, Bishop & Martyr", color: "red", rank: "memorial" },
  "2026-6-29": { name: "Sts. Peter & Paul, Apostles", color: "red", rank: "solemnity" },

  // July 2026
  "2026-7-1":  { name: "Bl. Junípero Serra", color: "white", rank: "memorial" },
  "2026-7-3":  { name: "St. Thomas, Apostle", color: "red", rank: "feast" },
  "2026-7-4":  { name: "Independence Day (USA)", color: "green", rank: "feria" },
  "2026-7-11": { name: "St. Benedict, Abbot", color: "white", rank: "feast" },
  "2026-7-14": { name: "Bl. Kateri Tekakwitha", color: "white", rank: "memorial" },
  "2026-7-16": { name: "Our Lady of Mount Carmel", color: "white", rank: "memorial" },
  "2026-7-22": { name: "St. Mary Magdalene", color: "white", rank: "feast" },
  "2026-7-25": { name: "St. James, Apostle", color: "red", rank: "feast" },
  "2026-7-26": { name: "Sts. Joachim & Anne", color: "white", rank: "memorial" },
  "2026-7-29": { name: "St. Martha", color: "white", rank: "memorial" },
  "2026-7-31": { name: "St. Ignatius of Loyola", color: "white", rank: "memorial" },

  // May 2026
  "2026-5-1":  { name: "St. Joseph the Worker", color: "white", rank: "memorial" },
  "2026-5-2":  { name: "St. Athanasius, Bishop & Doctor", color: "white", rank: "memorial" },
  "2026-5-3":  { name: "Sts. Philip & James, Apostles", color: "red", rank: "feast" },
  "2026-5-14": { name: "St. Matthias, Apostle", color: "red", rank: "feast" },
  "2026-5-21": { name: "Ascension of the Lord", color: "white", rank: "solemnity" },
  "2026-5-31": { name: "Visitation of the Blessed Virgin", color: "white", rank: "feast" },
};

// Season bands — rough ordinary time for 2026
function getSeason(year: number, month: number): LitColor {
  // Lent: Feb 18 – Apr 2, 2026; Easter: Apr 5 – May 24; Advent: Nov 29 – Dec 24
  if (month === 12) return "violet";
  if (month === 2 && year === 2026) return "violet";
  if (month === 3 && year === 2026) return "violet";
  if (month === 4 && year === 2026) return "white"; // Easter season
  if (month === 5 && year === 2026) return "white";
  return "green";
}

const LIT_COLOR_MAP: Record<LitColor, string> = {
  green:  "var(--lit-green)",
  violet: "var(--lit-violet)",
  red:    "var(--lit-red)",
  gold:   "var(--gold)",
  rose:   "var(--lit-rose)",
  white:  "var(--gold-bright)",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function feastKey(year: number, month: number, day: number) {
  return `${year}-${month}-${day}`;
}

export default function CalendarPage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1); // 1-based

  function prevMonth() {
    if (viewMonth === 1) { setViewMonth(12); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 12) { setViewMonth(1); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const daysInPrev = new Date(viewYear, viewMonth - 1, 0).getDate();

  // Total cells: fill to complete rows
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const season = getSeason(viewYear, viewMonth);
  const seasonLabel = season === "green" ? "Ordinary Time" : season === "violet" ? "Lent / Advent" : "Easter Season";

  return (
    <div style={{ padding: "40px 44px 64px", maxWidth: 860, margin: "0 auto" }}>

      {/* Season badge */}
      <div style={{ marginBottom: 28 }}>
        <SeasonBadge season={season}>{seasonLabel}</SeasonBadge>
      </div>

      {/* Month header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <button
          onClick={prevMonth}
          aria-label="Previous month"
          style={{
            width: 42, height: 42, borderRadius: 10,
            border: "1px solid var(--stone-200)",
            background: "var(--bone-raised)",
            color: "var(--ink-500)",
            cursor: "pointer",
            display: "grid", placeItems: "center",
          }}
        >
          <ChevronLeft size={20} strokeWidth={1.6} />
        </button>

        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            color: "var(--ink)",
          }}>
            {MONTH_NAMES[viewMonth - 1]}
          </div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: 11,
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: "var(--stone-400)",
            marginTop: 4,
          }}>
            Anno Domini {viewYear}
          </div>
        </div>

        <button
          onClick={nextMonth}
          aria-label="Next month"
          style={{
            width: 42, height: 42, borderRadius: 10,
            border: "1px solid var(--stone-200)",
            background: "var(--bone-raised)",
            color: "var(--ink-500)",
            cursor: "pointer",
            display: "grid", placeItems: "center",
          }}
        >
          <ChevronRight size={20} strokeWidth={1.6} />
        </button>
      </div>

      {/* Decorative divider */}
      <Fleuron width={220} style={{ margin: "0 auto 32px" }} />

      {/* Day headers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 0,
        marginBottom: 6,
      }}>
        {DAY_HEADERS.map((d) => (
          <div key={d} style={{
            fontFamily: "var(--font-display)",
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "var(--stone-400)",
            textAlign: "center",
            padding: "6px 0 10px",
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 3,
      }}>
        {Array.from({ length: totalCells }).map((_, cellIdx) => {
          const dayNum = cellIdx - firstDay + 1;
          const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;

          // Ghost days from prev/next month
          let displayNum: number;
          let displayLabel: string;
          if (!isCurrentMonth) {
            if (cellIdx < firstDay) {
              displayNum = daysInPrev - (firstDay - cellIdx - 1);
            } else {
              displayNum = dayNum - daysInMonth;
            }
            displayLabel = String(displayNum);
          } else {
            displayLabel = String(dayNum);
          }

          const isToday =
            isCurrentMonth &&
            dayNum === today.getDate() &&
            viewMonth === today.getMonth() + 1 &&
            viewYear === today.getFullYear();

          const feast = isCurrentMonth
            ? FEASTS[feastKey(viewYear, viewMonth, dayNum)]
            : undefined;

          const isSunday = cellIdx % 7 === 0;

          return (
            <DayCell
              key={cellIdx}
              label={displayLabel}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              isSunday={isSunday}
              feast={feast}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: 40,
        display: "flex",
        flexWrap: "wrap",
        gap: "12px 24px",
        borderTop: "1px solid var(--stone-200)",
        paddingTop: 24,
      }}>
        {(
          [
            ["green",  "Ordinary Time"],
            ["white",  "Feast / Memorial"],
            ["red",    "Martyr / Apostle"],
            ["gold",   "Solemnity"],
            ["violet", "Lent / Advent"],
          ] as [LitColor, string][]
        ).map(([color, label]) => (
          <div key={color} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 10, height: 10, borderRadius: "50%",
              background: LIT_COLOR_MAP[color],
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: 10.5,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--stone-400)",
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Day Cell ─────────────────────────────────────────────────────────────────
function DayCell({
  label,
  isCurrentMonth,
  isToday,
  isSunday,
  feast,
}: {
  label: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSunday: boolean;
  feast?: FeastDay;
}) {
  const [hovered, setHovered] = useState(false);

  const feastColor = feast ? LIT_COLOR_MAP[feast.color] : undefined;
  const isSolemnity = feast?.rank === "solemnity";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minHeight: 82,
        borderRadius: 10,
        padding: "10px 10px 8px",
        background: isToday
          ? "var(--gold-faint)"
          : hovered && isCurrentMonth
          ? "var(--stone-100)"
          : "transparent",
        border: isToday
          ? "1.5px solid var(--gold)"
          : "1.5px solid transparent",
        cursor: isCurrentMonth ? "pointer" : "default",
        transition: "background .12s, border-color .12s",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {/* Day number */}
      <div style={{
        fontFamily: "var(--font-display)",
        fontWeight: isToday ? 700 : isSunday && isCurrentMonth ? 600 : 400,
        fontSize: 14,
        letterSpacing: ".04em",
        color: isToday
          ? "var(--gold-deep)"
          : !isCurrentMonth
          ? "var(--stone-300)"
          : isSunday
          ? "var(--lit-red)"
          : "var(--ink)",
      }}>
        {label}
      </div>

      {/* Feast dot + name */}
      {feast && isCurrentMonth && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{
              width: isSolemnity ? 9 : 7,
              height: isSolemnity ? 9 : 7,
              borderRadius: "50%",
              background: feastColor,
              flexShrink: 0,
              boxShadow: isSolemnity ? `0 0 6px ${feastColor}` : "none",
            }} />
            <span style={{
              fontFamily: "var(--font-body)",
              fontSize: 11,
              lineHeight: 1.3,
              color: "var(--ink-500)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {feast.name}
            </span>
          </div>
          {isSolemnity && (
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: 9,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: feastColor,
              marginLeft: 12,
            }}>
              Solemnity
            </span>
          )}
        </div>
      )}
    </div>
  );
}
