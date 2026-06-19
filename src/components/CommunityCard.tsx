"use client";

import { useEffect, useState } from "react";
import { getCommunityStats, type CommunityStats } from "@/lib/prayers";

export function CommunityCard() {
  const [stats, setStats] = useState<CommunityStats | null>(null);

  useEffect(() => {
    getCommunityStats().then(setStats).catch(() => {});
    // Refresh every 60 seconds
    const t = setInterval(() => {
      getCommunityStats().then(setStats).catch(() => {});
    }, 60_000);
    return () => clearInterval(t);
  }, []);

  const prayers = stats?.prayers ?? 0;
  const minutes = stats?.minutes ?? 0;

  return (
    <div style={{
      background: "var(--surface-ink)",
      borderRadius: 18,
      padding: "20px 22px",
      boxShadow: "var(--shadow-lg)",
      border: "1px solid rgba(239,230,214,0.08)",
    }}>
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".04em",
        color: "rgba(239,230,214,0.5)",
        marginBottom: 12,
      }}>
        PRAYING TOGETHER · ALL TIME
      </div>

      {stats === null ? (
        <div style={{
          display: "flex",
          gap: 24,
        }}>
          {[0, 1].map((i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ height: 28, borderRadius: 8, background: "rgba(239,230,214,0.06)", marginBottom: 6 }} />
              <div style={{ height: 12, borderRadius: 6, background: "rgba(239,230,214,0.04)", width: "60%" }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 24 }}>
          <div>
            <div style={{
              fontFamily: "var(--font-serif)",
              fontSize: 28,
              fontWeight: 500,
              color: "var(--gold-bright, #EFE6D6)",
              lineHeight: 1,
              letterSpacing: "-.01em",
            }}>
              {prayers.toLocaleString()}
            </div>
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "rgba(239,230,214,0.5)",
              marginTop: 4,
            }}>
              {prayers === 1 ? "prayer" : "prayers"} offered
            </div>
          </div>
          <div style={{ width: 1, background: "rgba(239,230,214,0.1)" }} />
          <div>
            <div style={{
              fontFamily: "var(--font-serif)",
              fontSize: 28,
              fontWeight: 500,
              color: "var(--gold-bright, #EFE6D6)",
              lineHeight: 1,
              letterSpacing: "-.01em",
            }}>
              {minutes.toLocaleString()}
            </div>
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "rgba(239,230,214,0.5)",
              marginTop: 4,
            }}>
              {minutes === 1 ? "minute" : "minutes"} in prayer
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
