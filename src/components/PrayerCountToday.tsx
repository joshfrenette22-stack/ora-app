"use client";

import { Kicker, LucideIcon } from "./UI";
import { useTodayPrayerCount } from "@/lib/prayerStats";

/** Home-screen card: how many prayers have been prayed on this device today. */
export function PrayerCountToday() {
  const count = useTodayPrayerCount();
  const sub =
    count === 0 ? "Offer your first prayer today"
    : count === 1 ? "A good beginning"
    : count < 5 ? "Keep the flame burning"
    : "A faithful day of prayer";

  return (
    <div className="pw-card" style={{
      display: "flex", alignItems: "center", gap: 16,
      background: "var(--bone-raised)", border: "1px solid var(--stone-200)", borderRadius: 18,
      padding: "18px 22px", marginBottom: 30, boxShadow: "var(--shadow-sm)",
    }}>
      <span style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--gold-faint)", color: "var(--gold-deep)", display: "grid", placeItems: "center", flexShrink: 0 }}>
        <LucideIcon name="flame" size={22} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Kicker>Prayed Today</Kicker>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 2 }}>
          <span style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 32, color: "var(--ink)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {count}
          </span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--stone-400)" }}>
            {count === 1 ? "prayer" : "prayers"}
          </span>
        </div>
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: 13.5, color: "var(--stone-400)", textAlign: "right", maxWidth: 150, lineHeight: 1.45 }}>
        {sub}
      </div>
    </div>
  );
}
