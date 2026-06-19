import { supabase } from "./supabase";

export interface PrayerLog {
  prayer_type: string;
  prayer_name?: string;
  segments_count?: number;
  duration_seconds?: number;
}

/** Log a completed prayer. Works for both authed and anonymous users. */
export async function logPrayer(log: PrayerLog) {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("prayer_logs").insert({
    user_id: user?.id ?? null,
    prayer_type: log.prayer_type,
    prayer_name: log.prayer_name ?? null,
    segments_count: log.segments_count ?? 1,
    duration_seconds: log.duration_seconds ?? null,
  });
}

export interface CommunityStats {
  prayers_today: number;
  minutes_today: number;
  users_today: number;
}

/** Fetch today's community prayer stats. */
export async function getCommunityStats(): Promise<CommunityStats> {
  const { data, error } = await supabase.rpc("community_stats_today");
  if (error || !data) return { prayers_today: 0, minutes_today: 0, users_today: 0 };
  return data as CommunityStats;
}
