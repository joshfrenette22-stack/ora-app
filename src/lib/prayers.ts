// The community prayer counter on the Today page.
//
// Both calls here talk to public.prayer_logs (see
// supabase/migrations/0003_prayer_logs.sql). Neither swallows its errors: this
// counter silently read 0 for as long as the table was missing, because the
// failures had nowhere to surface.

import { supabase } from "./supabase";

export interface PrayerLog {
  prayer_type: string;
  prayer_name?: string;
  segments_count?: number;
  duration_seconds?: number;
}

/** Warn once per distinct problem — this runs on every prayer, not just once. */
const warned = new Set<string>();
function warnOnce(what: string, detail: unknown) {
  if (warned.has(what)) return;
  warned.add(what);
  console.warn(`[prayers] ${what} failed — the community counter will be wrong.`, detail);
}

/**
 * Log a completed prayer. Works for both authed and anonymous users.
 * Returns false if it didn't reach the database, so callers can tell the
 * difference between "recorded" and "lost".
 */
export async function logPrayer(log: PrayerLog): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("prayer_logs").insert({
      user_id: user?.id ?? null,
      prayer_type: log.prayer_type,
      prayer_name: log.prayer_name ?? null,
      segments_count: log.segments_count ?? 1,
      duration_seconds: log.duration_seconds ?? null,
    });
    if (error) {
      warnOnce("logPrayer", error);
      return false;
    }
    return true;
  } catch (e) {
    warnOnce("logPrayer", e);
    return false;
  }
}

export interface CommunityStats {
  prayers: number;
  minutes: number;
  users: number;
}

/**
 * All-time community totals, or null when they can't be fetched.
 *
 * Null rather than zeros on purpose: "nobody has prayed" and "we couldn't ask"
 * are different things, and showing the first when the second is true is how
 * this counter sat broken in plain sight.
 */
export async function getCommunityStats(): Promise<CommunityStats | null> {
  try {
    const { data, error } = await supabase.rpc("community_stats_all_time");
    if (error || !data) {
      warnOnce("getCommunityStats", error);
      return null;
    }
    const s = data as Partial<CommunityStats>;
    return {
      prayers: Number(s.prayers) || 0,
      minutes: Number(s.minutes) || 0,
      users: Number(s.users) || 0,
    };
  } catch (e) {
    warnOnce("getCommunityStats", e);
    return null;
  }
}
