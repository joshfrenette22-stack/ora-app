"use client";

import { useEffect, useRef, useState } from "react";
import { Kicker, LucideIcon } from "@/components/UI";
import { useVoice } from "@/components/VoiceProvider";
import { useTheme } from "@/components/ThemeProvider";
import { VOICES, VOICE_TIERS, TIER_NOTE, type Voice } from "@/lib/voices";

const PREVIEW_TEXT = "The Lord be with you, and with your spirit.";

export default function SettingsPage() {
  const { voice, setVoice } = useVoice();
  const { night, setNight } = useTheme();
  const [cloud, setCloud] = useState(true);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = typeof Audio !== "undefined" ? new Audio() : null;
    let alive = true;
    fetch("/api/tts?probe=1").then((r) => { if (alive) setCloud(r.status === 204); }).catch(() => {});
    return () => { alive = false; audioRef.current?.pause(); };
  }, []);

  function preview(v: Voice) {
    const a = audioRef.current;
    if (!a || !cloud) return;
    if (previewing === v.id) { a.pause(); setPreviewing(null); return; }
    a.pause();
    a.src = `/api/tts?text=${encodeURIComponent(PREVIEW_TEXT)}&voice=${encodeURIComponent(v.id)}`;
    a.onended = () => setPreviewing(null);
    a.onerror = () => setPreviewing(null);
    a.play().then(() => setPreviewing(v.id)).catch(() => setPreviewing(null));
  }

  return (
    <div style={{ padding: "40px 28px 80px", maxWidth: 640, margin: "0 auto" }}>

      {/* Voice section */}
      <Kicker style={{ marginBottom: 6 }}>Narration Voice</Kicker>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--stone-400)", margin: "0 0 20px", lineHeight: 1.6 }}>
        Choose the voice that reads the readings, prayers, and the Rosary aloud.
      </p>

      {!cloud && (
        <div style={{
          background: "var(--gold-faint)", border: "1px solid var(--gold)", borderRadius: 12,
          padding: "14px 18px", marginBottom: 22,
          fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink-700)", lineHeight: 1.55,
        }}>
          These premium voices activate once the cloud voice is enabled. Until then the app uses your
          device&rsquo;s built-in voice — your selection here is saved for when it&rsquo;s ready.
        </div>
      )}

      {VOICE_TIERS.map((tier) => {
        const voices = VOICES.filter((v) => v.tier === tier);
        return (
          <div key={tier} style={{ marginBottom: 26 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink)" }}>
                {tier}
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--stone-400)", fontStyle: "italic" }}>
                {TIER_NOTE[tier]}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {voices.map((v) => {
                const on = voice === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setVoice(v.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
                      padding: "13px 16px", borderRadius: 12,
                      background: on ? "var(--gold-faint)" : "var(--bone-raised)",
                      border: on ? "1.5px solid var(--gold)" : "1px solid var(--stone-200)",
                      transition: "background .14s, border-color .14s",
                    }}
                  >
                    {/* Preview button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); preview(v); }}
                      aria-label={`Preview ${v.short}`}
                      disabled={!cloud}
                      style={{
                        width: 40, height: 40, borderRadius: "50%", flexShrink: 0, border: "none",
                        cursor: cloud ? "pointer" : "not-allowed",
                        background: cloud ? "var(--gilt)" : "var(--stone-200)",
                        color: cloud ? "#2A2008" : "var(--stone-400)",
                        display: "grid", placeItems: "center",
                      }}
                    >
                      <LucideIcon name={previewing === v.id ? "pause" : "play"} size={17} />
                    </button>

                    {/* Name + meta */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 17, color: "var(--ink)" }}>
                        {v.gender} &middot; {v.short}
                      </div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--stone-400)", marginTop: 1 }}>
                        {v.free ? "Free" : "Premium"}
                      </div>
                    </div>

                    {/* Selected check */}
                    <span style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      display: "grid", placeItems: "center",
                      background: on ? "var(--gold)" : "transparent",
                      color: on ? "#2A2008" : "var(--stone-300)",
                      border: on ? "none" : "1.5px solid var(--stone-200)",
                    }}>
                      {on && <LucideIcon name="check" size={15} stroke={2.4} />}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Display section */}
      <div style={{ height: 1, background: "var(--stone-200)", margin: "10px 0 26px" }} />
      <Kicker style={{ marginBottom: 14 }}>Display</Kicker>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px", borderRadius: 12, background: "var(--bone-raised)", border: "1px solid var(--stone-200)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--gold-faint)", color: "var(--gold-deep)", display: "grid", placeItems: "center" }}>
            <LucideIcon name={night ? "moon" : "sun"} size={18} />
          </span>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 17, color: "var(--ink)" }}>
            Night Mode
          </span>
        </div>
        <button
          onClick={() => setNight(!night)}
          aria-label="Toggle night mode"
          style={{
            width: 52, height: 30, borderRadius: 999, border: "none", cursor: "pointer", position: "relative",
            background: night ? "var(--gilt)" : "var(--stone-200)", transition: "background .18s",
          }}
        >
          <span style={{
            position: "absolute", top: 3, left: night ? 25 : 3, width: 24, height: 24, borderRadius: "50%",
            background: "#fff", boxShadow: "var(--shadow-sm)", transition: "left .18s",
          }} />
        </button>
      </div>
    </div>
  );
}
