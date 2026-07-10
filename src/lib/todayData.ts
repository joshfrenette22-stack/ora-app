"use client";

// Shared client-side fetch for /api/today. The home screen alone has three
// consumers (page, sidebar, content bar); sharing one in-flight promise per
// date means one network round-trip instead of three, and instant reuse on
// later navigations within the same day.

import { localDateISO } from "./clientDate";

export interface TodayLiturgical {
  season: string;
  color: string;
  label: string;
  name: string;
  rank: string;
  badgeSeason: string;
}

export interface TodayPayload {
  date: string;
  liturgical: TodayLiturgical;
  verse: { text: string; cite: string };
  saint: { name: string; title: string | null; rank: string; monogram: string; color: string };
  readings: {
    first: { cite: string; title: string };
    psalm: { cite: string; title: string };
    second?: { cite: string; title: string };
    gospel: { cite: string; title: string };
    representative: boolean;
    source: string;
  };
}

const inflight = new Map<string, Promise<TodayPayload | null>>();

/** Fetch today's liturgical payload, deduplicated per date. Resolves null on
 *  any failure (a failed fetch is not memoised, so the next caller retries). */
export function fetchToday(dateISO: string = localDateISO()): Promise<TodayPayload | null> {
  const existing = inflight.get(dateISO);
  if (existing) return existing;
  const p = fetch(`/api/today?date=${dateISO}`)
    .then((r) => (r.ok ? (r.json() as Promise<TodayPayload>) : null))
    .catch(() => null)
    .then((d) => {
      if (!d) inflight.delete(dateISO); // let a later caller retry
      return d;
    });
  inflight.set(dateISO, p);
  return p;
}
