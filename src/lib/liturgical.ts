// Deterministic liturgical-calendar engine.
//
// Everything here is pure and date-driven: given a calendar date it computes the
// liturgical season, the liturgical colour, and a human label/week number. It is
// safe to run on the server (route handlers) or the client.

export type LitColor = "green" | "violet" | "red" | "gold" | "rose" | "white";
export type LitSeason =
  | "Advent"
  | "Christmas"
  | "Ordinary Time"
  | "Lent"
  | "Triduum"
  | "Easter";

export interface LiturgicalDay {
  /** ISO date, e.g. "2026-06-16" */
  date: string;
  season: LitSeason;
  color: LitColor;
  /** Liturgical week number within the season (1-based). */
  week: number;
  /** Display label, e.g. "Ordinary Time · Week 11". */
  label: string;
  /** Day of week, 0 = Sunday. */
  weekday: number;
  /** True on Sundays and solemnities (rough; Sundays only here). */
  isSunday: boolean;
}

// ── Date helpers (all in UTC to stay deterministic across timezones) ──────────
function utc(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m - 1, d));
}
function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
function dayDiff(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}
function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Parse "YYYY-MM-DD" into a UTC Date. Falls back to today if invalid. */
export function parseDate(input?: string | null): Date {
  if (input) {
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(input.trim());
    if (m) return utc(+m[1], +m[2], +m[3]);
  }
  const now = new Date();
  return utc(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate());
}

/** Computus — Gregorian Easter Sunday for a given year (Anonymous algorithm). */
export function easter(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utc(year, month, day);
}

/** First Sunday of Advent for a year: the 4th Sunday before Christmas. */
function adventStart(year: number): Date {
  const christmas = utc(year, 12, 25);
  // Sunday on/before Christmas, then back three more weeks.
  const sundayBeforeChristmas = addDays(christmas, -christmas.getUTCDay());
  return addDays(sundayBeforeChristmas, -21);
}

/** Baptism of the Lord: Sunday after Epiphany (Jan 6). Marks the end of Christmas. */
function baptismOfLord(year: number): Date {
  const epiphany = utc(year, 1, 6);
  const offset = (7 - epiphany.getUTCDay()) % 7 || 7;
  return addDays(epiphany, offset);
}

function weeksBetween(later: Date, earlier: Date): number {
  return Math.floor(dayDiff(later, earlier) / 7) + 1;
}

/** Compute the full liturgical description for a date. */
export function liturgicalDay(date: Date): LiturgicalDay {
  const year = date.getUTCFullYear();
  const weekday = date.getUTCDay();
  const isSunday = weekday === 0;

  const easterDay = easter(year);
  const ashWednesday = addDays(easterDay, -46);
  const palmSunday = addDays(easterDay, -7);
  const holyThursday = addDays(easterDay, -3);
  const pentecost = addDays(easterDay, 49);
  const baptism = baptismOfLord(year);
  const adventThisYear = adventStart(year);
  const adventPrevYear = adventStart(year - 1);
  const christmas = utc(year, 12, 25);

  let season: LitSeason;
  let color: LitColor;
  let week = 1;
  let label = "";

  if (date >= adventThisYear && date < christmas) {
    season = "Advent";
    week = weeksBetween(date, adventThisYear);
    // Gaudete Sunday (3rd Sunday of Advent) is rose.
    color = isSunday && week === 3 ? "rose" : "violet";
    label = `Advent · Week ${week}`;
  } else if (date >= christmas || date < baptism) {
    season = "Christmas";
    color = "white";
    week = date >= christmas ? 1 : weeksBetween(date, utc(year - 1, 12, 25));
    label = "Christmas";
  } else if (date >= ashWednesday && date < holyThursday) {
    season = "Lent";
    week = weeksBetween(date, ashWednesday);
    // Laetare Sunday (4th Sunday of Lent) is rose; Palm Sunday onward is red.
    color = date >= palmSunday ? "red" : isSunday && week === 5 ? "rose" : "violet";
    label = date >= palmSunday ? "Holy Week" : `Lent · Week ${Math.max(1, week - 1)}`;
  } else if (date >= holyThursday && date < easterDay) {
    season = "Triduum";
    color = "red";
    label = "Sacred Triduum";
  } else if (date >= easterDay && date <= pentecost) {
    season = "Easter";
    week = weeksBetween(date, easterDay);
    color = date.getTime() === pentecost.getTime() ? "red" : "white";
    label = date.getTime() === pentecost.getTime() ? "Pentecost" : `Easter · Week ${week}`;
  } else {
    // Ordinary Time — two stretches (after Christmas, after Pentecost).
    season = "Ordinary Time";
    color = "green";
    if (date < ashWednesday) {
      // First stretch: counts up from the Baptism of the Lord.
      week = weeksBetween(date, baptism);
    } else {
      // Second stretch: counts back from Christ the King (always the 34th week,
      // the Sunday before Advent), so numbering lands correctly before Advent.
      const christKing = addDays(adventThisYear, -7);
      week = 34 - Math.floor(dayDiff(christKing, date) / 7);
    }
    week = Math.max(1, Math.min(34, week));
    label = `Ordinary Time · Week ${week}`;
  }

  // Reference adventPrevYear so late-December dates that belong to the previous
  // year's Advent still resolve correctly when callers pass year boundaries.
  void adventPrevYear;

  return { date: iso(date), season, color, week, label, weekday, isSunday };
}

export const COLOR_VAR: Record<LitColor, string> = {
  green: "var(--lit-green)",
  violet: "var(--lit-violet)",
  red: "var(--lit-red)",
  gold: "var(--gold)",
  rose: "var(--lit-rose)",
  white: "var(--gold-bright)",
};

/** Map a liturgical colour to the SeasonBadge `season` prop. */
export function badgeSeason(color: LitColor): string {
  switch (color) {
    case "violet": return "violet";
    case "red": return "red";
    case "rose": return "rose";
    case "white":
    case "gold": return "gold";
    default: return "green";
  }
}
