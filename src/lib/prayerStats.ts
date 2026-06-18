// Tracks how many prayers have been prayed on this device today.
//
// A "prayer prayed" is counted at a natural point of completion: a narration
// that plays to its end (any prayer/reading read aloud), or finishing the
// Rosary. The tally is stored locally and resets at midnight (it is keyed by the
// local date). There is no account or server — this is a quiet, personal count.

import { useEffect, useState } from "react";
import { localDateISO } from "./clientDate";

const KEY = "pw-prayer-log";
const EVT = "pw-prayer-recorded";

interface PrayerLog { date: string; count: number }

function read(): PrayerLog {
  const today = localDateISO();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { date: today, count: 0 };
    const log = JSON.parse(raw) as PrayerLog;
    if (!log || log.date !== today) return { date: today, count: 0 };
    return log;
  } catch {
    return { date: today, count: 0 };
  }
}

/** Record one completed prayer for today. Client-only. */
export function recordPrayer(): void {
  try {
    const next: PrayerLog = { date: localDateISO(), count: read().count + 1 };
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(EVT, { detail: next.count }));
  } catch {
    /* storage blocked — counting is best-effort */
  }
}

export function getTodayPrayerCount(): number {
  return read().count;
}

/** Live count of prayers prayed on this device today (updates as they happen). */
export function useTodayPrayerCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const sync = () => setCount(getTodayPrayerCount());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync); // other tabs
    window.addEventListener("focus", sync);   // returning after midnight, etc.
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);
  return count;
}
