// Small shared helpers for liturgical colour. The authoritative calendar
// (seasons, feasts, weeks) now comes from romcal in calendar.ts; this file only
// keeps the colour type, the date parser, and the SeasonBadge colour mapping
// used by both the server routes and the client components.

export type LitColor = "green" | "violet" | "red" | "gold" | "rose" | "white";

function utc(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m - 1, d));
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
