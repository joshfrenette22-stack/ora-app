// Local-first record of the user's own prayer life, powering the streak and
// "today's plan" card on the Today page. Community totals live in Supabase
// (prayer_logs); this is the personal ledger, kept on-device so it works
// offline and needs no account.

import { localDateISO } from "./clientDate";

export type JourneyKey = "readings" | "rosary" | "hours" | "devotion";

export interface DayRecord {
  done: JourneyKey[];
  /** Seconds spent listening to narration that day. */
  seconds: number;
}

type Store = Record<string, DayRecord>;

const KEY = "ora-journey";
const EVENT = "ora-journey-change";
const KEEP_DAYS = 400;

function load(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Store) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function save(store: Store) {
  try {
    const days = Object.keys(store).sort();
    for (const d of days.slice(0, Math.max(0, days.length - KEEP_DAYS))) delete store[d];
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* storage may be unavailable — the card just shows nothing */
  }
  try {
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}

function day(store: Store, iso: string): DayRecord {
  const d = store[iso];
  if (d && Array.isArray(d.done)) return d;
  return (store[iso] = { done: [], seconds: 0 });
}

export function getDay(iso: string = localDateISO()): DayRecord {
  const d = load()[iso];
  return d && Array.isArray(d.done) ? d : { done: [], seconds: 0 };
}

/** Mark one plan item prayed today (idempotent). */
export function markPrayed(key: JourneyKey, iso: string = localDateISO()) {
  const store = load();
  const d = day(store, iso);
  if (!d.done.includes(key)) d.done.push(key);
  save(store);
}

export function unmarkPrayed(key: JourneyKey, iso: string = localDateISO()) {
  const store = load();
  const d = day(store, iso);
  d.done = d.done.filter((k) => k !== key);
  save(store);
}

/** Accumulate listening time (called from the narration player's flush). */
export function addJourneySeconds(secs: number, iso: string = localDateISO()) {
  if (!Number.isFinite(secs) || secs <= 0) return;
  const store = load();
  day(store, iso).seconds += Math.round(secs);
  save(store);
}

function prevISO(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

function prayed(store: Store, iso: string): boolean {
  const d = store[iso];
  return !!d && (d.done.length > 0 || d.seconds >= 60);
}

/**
 * Consecutive days prayed, ending today. An empty today doesn't break the
 * chain until the day is over — yesterday's streak still shows as running.
 */
export function getStreak(todayISO: string = localDateISO()): number {
  const store = load();
  let count = 0;
  let cursor = prayed(store, todayISO) ? todayISO : prevISO(todayISO);
  while (prayed(store, cursor)) {
    count += 1;
    cursor = prevISO(cursor);
  }
  return count;
}

export interface JourneyTotals {
  daysPrayed: number;
  totalSeconds: number;
  bestStreak: number;
}

export function getTotals(): JourneyTotals {
  const store = load();
  const days = Object.keys(store).filter((iso) => prayed(store, iso)).sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const iso of days) {
    run = prev !== null && prevISO(iso) === prev ? run + 1 : 1;
    if (run > best) best = run;
    prev = iso;
  }
  const totalSeconds = Object.values(store).reduce((s, d) => s + (d.seconds || 0), 0);
  return { daysPrayed: days.length, totalSeconds, bestStreak: best };
}

/** Subscribe to journey changes (same-tab writes and other-tab storage events). */
export function onJourneyChange(listener: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) listener();
  };
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
