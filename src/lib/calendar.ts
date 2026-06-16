// Authoritative liturgical calendar via romcal (server-side only).
//
// romcal is heavy (it computes a whole year) and pulls in moment, so it must
// never be imported into a client component. The route handlers call these
// helpers and the client pages consume the JSON they return.

import Romcal from "romcal";
import type { LitColor } from "./liturgical";
import type { Rank } from "./saints";

interface RomcalDay {
  moment: string;
  type: string;
  name: string;
  data?: {
    season?: { key?: string; value?: string };
    meta?: { liturgicalColor?: { key?: string }; titles?: string[] };
  };
}

export interface LiturgicalInfo {
  date: string;
  season: string;
  color: LitColor;
  /** Display label, e.g. "Ordinary Time · Week 11". */
  label: string;
  /** Celebration / day name, e.g. "Saint Ephrem, Deacon and Doctor". */
  name: string;
  rank: Rank;
  titles: string[];
}

const COLOR: Record<string, LitColor> = {
  GREEN: "green", RED: "red", WHITE: "white",
  VIOLET: "violet", PURPLE: "violet", ROSE: "rose",
  GOLD: "gold", BLACK: "violet",
};

const RANK: Record<string, Rank> = {
  SOLEMNITY: "solemnity",
  FEAST: "feast",
  MEMORIAL: "memorial",
  OPT_MEMORIAL: "memorial",
  SUNDAY: "feria",
  FERIA: "feria",
};

// Cache the full-year computation (one promise per year).
const yearCache = new Map<number, Promise<RomcalDay[]>>();

function yearCalendar(year: number): Promise<RomcalDay[]> {
  let p = yearCache.get(year);
  if (!p) {
    p = Romcal.calendarFor({ year, country: "unitedStates", locale: "en" }) as Promise<RomcalDay[]>;
    yearCache.set(year, p);
  }
  return p;
}

function seasonDisplay(season: string | undefined): string {
  if (!season) return "Ordinary Time";
  if (season === "Eastertide") return "Easter";
  return season;
}

function toInfo(e: RomcalDay): LiturgicalInfo {
  const season = seasonDisplay(e.data?.season?.value);
  const color = COLOR[e.data?.meta?.liturgicalColor?.key ?? "GREEN"] ?? "green";
  const rank = RANK[e.type] ?? "feria";
  const wk = e.name.match(/(\d+)(?:st|nd|rd|th)/);
  const label = wk ? `${season} · Week ${wk[1]}` : season;
  return {
    date: String(e.moment).slice(0, 10),
    season,
    color,
    label,
    name: e.name,
    rank,
    titles: e.data?.meta?.titles ?? [],
  };
}

export async function liturgicalForDate(date: Date): Promise<LiturgicalInfo> {
  const iso = date.toISOString().slice(0, 10);
  const cal = await yearCalendar(date.getUTCFullYear());
  const entry = cal.find((d) => String(d.moment).slice(0, 10) === iso);
  if (entry) return toInfo(entry);
  // Should not happen, but never throw — synthesize a plausible feria.
  return { date: iso, season: "Ordinary Time", color: "green", label: "Ordinary Time", name: "Weekday", rank: "feria", titles: [] };
}

export interface MonthFeast {
  name: string;
  color: LitColor;
  rank: Rank;
}

/** Every observed celebration (memorial and above) in a month, keyed "YYYY-M-D". */
export async function feastsForMonth(year: number, month: number): Promise<Record<string, MonthFeast>> {
  const cal = await yearCalendar(year);
  const out: Record<string, MonthFeast> = {};
  for (const e of cal) {
    const m = String(e.moment).slice(0, 10).split("-").map(Number);
    if (m[1] !== month) continue;
    const rank = RANK[e.type] ?? "feria";
    if (rank === "feria") continue; // skip plain weekdays and Sundays
    out[`${m[0]}-${m[1]}-${m[2]}`] = {
      name: e.name,
      color: COLOR[e.data?.meta?.liturgicalColor?.key ?? "WHITE"] ?? "white",
      rank,
    };
  }
  return out;
}
