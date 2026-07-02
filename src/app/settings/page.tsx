"use client";

import { useEffect, useRef, useState } from "react";
import { Kicker, LucideIcon } from "@/components/UI";
import { useVoice } from "@/components/VoiceProvider";
import { useTheme } from "@/components/ThemeProvider";
import { VOICES, VOICE_TIERS, TIER_NOTE, type Voice } from "@/lib/voices";

const PREVIEW_TEXT = "The Lord be with you, and with your spirit.";

// Decorative coral "voice track" shown while a voice is previewing.
const WAVE = Array.from({ length: 38 }, (_, i) => {
  const t = i / 37;
  const taper = 0.35 + 0.65 * Math.sin(Math.PI * t);
  const w = Math.abs(Math.sin(i * 1.7) * 0.6 + Math.sin(i * 0.7) * 0.4 + Math.cos(i * 2.3) * 0.25);
  return Math.max(0.2, Math.min(1, taper * (0.45 + w)));
});

function MiniWave() {
  return (
    <div className="ora-wave-live" style={{ display: "flex", alignItems: "center", gap: 2, height: 24 }}>
      {WAVE.map((h, i) => (
        <span key={i} style={{ flex: 1, minWidth: 2, height: `${Math.round(h * 100)}%`, borderRadius: 2, background: "var(--gold)" }} />
      ))}
    </div>
  );
}

// Mirrors the speed steps offered by the player's cycle button.
const SPEEDS = [0.75, 1, 1.25, 1.5];

export default function SettingsPage() {
  const { voice, setVoice, speed, setSpeed } = useVoice();
  const { night, setNight } = useTheme();
  const [cloud, setCloud] = useState(true);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Force the freshest deployed build: drop any cached service worker / caches,
  // then reload so the latest version comes down from the server.
  async function refreshApp() {
    setRefreshing(true);
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      /* best effort — reload regardless */
    }
    // Navigate to a unique URL so iOS (which caches the installed app's shell
    // and ignores a plain reload) is forced to fetch the latest build.
    window.location.replace(`/?_r=${Date.now()}`);
  }

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
    <div className="pw-settings-pad" style={{ padding: "40px 28px 80px", maxWidth: 640, margin: "0 auto" }}>

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
        if (voices.length === 0) return null;
        return (
          <div key={tier} style={{ marginBottom: 26 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, letterSpacing: ".02em", color: "var(--ink)" }}>
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
                    role="button"
                    tabIndex={0}
                    aria-pressed={on}
                    aria-label={`${v.gender} voice, ${v.desc}`}
                    onClick={() => setVoice(v.id)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setVoice(v.id); } }}
                    style={{
                      display: "flex", flexDirection: "column", gap: 11, cursor: "pointer",
                      padding: "13px 16px", borderRadius: 14,
                      background: on ? "var(--gold-faint)" : "var(--bone-raised)",
                      border: on ? "1.5px solid var(--gold)" : "1px solid var(--stone-200)",
                      transition: "background .14s, border-color .14s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      {/* Preview button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); preview(v); }}
                        aria-label={`Preview ${v.gender} ${v.desc}`}
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
                          {v.name}
                        </div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--stone-400)", marginTop: 1 }}>
                          {v.desc} &middot; {v.gender} &middot; {v.free ? "Free" : "Premium"}
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

                    {/* Voice track — appears while previewing */}
                    {previewing === v.id && <MiniWave />}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Narration speed */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        padding: "14px 16px", borderRadius: 12, background: "var(--bone-raised)", border: "1px solid var(--stone-200)",
        marginBottom: 26,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <span style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--gold-faint)", color: "var(--gold-deep)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <LucideIcon name="gauge" size={18} />
          </span>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 17, color: "var(--ink)" }}>
            Reading Speed
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {SPEEDS.map((s) => {
            const on = speed === s;
            const label = `${Number.isInteger(s) ? s : String(s).replace(/0+$/, "")}×`;
            return (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                aria-pressed={on}
                aria-label={`Reading speed ${label}`}
                style={{
                  fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12.5,
                  padding: "9px 12px", borderRadius: 999, cursor: "pointer",
                  border: on ? "1.5px solid var(--gold)" : "1px solid var(--stone-200)",
                  background: on ? "var(--gold-faint)" : "transparent",
                  color: on ? "var(--gold-deep)" : "var(--stone-400)",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

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
          role="switch"
          aria-checked={night}
          aria-label="Night mode"
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

      {/* App section */}
      <div style={{ height: 1, background: "var(--stone-200)", margin: "26px 0" }} />
      <Kicker style={{ marginBottom: 14 }}>App</Kicker>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px", borderRadius: 12, background: "var(--bone-raised)", border: "1px solid var(--stone-200)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--gold-faint)", color: "var(--gold-deep)", display: "grid", placeItems: "center" }}>
            <LucideIcon name="refresh-cw" size={18} />
          </span>
          <div>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 17, color: "var(--ink)" }}>
              Refresh app
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--stone-400)", marginTop: 1 }}>
              Load the latest version
            </div>
          </div>
        </div>
        <button
          onClick={refreshApp}
          disabled={refreshing}
          style={{
            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
            border: "none", borderRadius: 10, padding: "10px 18px", cursor: refreshing ? "default" : "pointer",
            background: "var(--gilt)", color: "#2A2008", boxShadow: "var(--shadow-gold)", opacity: refreshing ? 0.7 : 1,
          }}
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>
    </div>
  );
}
