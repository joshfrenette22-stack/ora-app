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
    if (m) {
      const d = utc(+m[1], +m[2], +m[3]);
      // Reject rollovers ("2026-13-40" would silently become a real date).
      if (d.getUTCMonth() + 1 === +m[2] && d.getUTCDate() === +m[3]) return d;
    }
  }
  const now = new Date();
  return utc(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate());
}

/**
 * CDN cache policy for content routes whose payload is a pure function of the
 * requested date: cache at the edge for an hour, serve stale for a day while
 * revalidating. Browsers get a short private cache so tab-level refetches
 * within a session are free.
 */
export const DAY_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
} as const;

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
