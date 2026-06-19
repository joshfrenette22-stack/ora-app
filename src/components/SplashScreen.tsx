"use client";

import { useEffect, useState } from "react";
import { Logomark, RoseWindow, Fleuron } from "./Sacred";

// An animated welcome loader shown when the app opens. Name collection and
// onboarding are handled separately by the Supabase-backed WelcomeOverlay, which
// sits beneath this (lower z-index) and is revealed once the splash fades.
//
// Gated per session (sessionStorage) so it greets you on each fresh launch
// without nagging within a session. Switch SHOWN_KEY to localStorage to show it
// only once, ever.
const SHOWN_KEY = "pw-splash-shown";
const HOLD_MS = 2600; // time the welcome is held before it auto-fades
const FADE_MS = 650;  // fade-out duration

type Phase = "hidden" | "in" | "out";

const cream = (a: number) => `rgba(239,230,214,${a})`;

export function SplashScreen() {
  const [phase, setPhase] = useState<Phase>("hidden");

  useEffect(() => {
    let shown = false;
    try { shown = sessionStorage.getItem(SHOWN_KEY) === "1"; } catch { /* blocked */ }
    if (shown) return;
    try { sessionStorage.setItem(SHOWN_KEY, "1"); } catch { /* blocked */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase("in");
    const t = setTimeout(() => setPhase("out"), HOLD_MS);
    return () => clearTimeout(t);
  }, []);

  // Once the fade-out has played, unmount entirely.
  useEffect(() => {
    if (phase !== "out") return;
    const t = setTimeout(() => setPhase("hidden"), FADE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div
      role="dialog"
      aria-label="The Prayer Warrior App"
      onClick={() => setPhase("out")}
      style={{
        position: "fixed", inset: 0, zIndex: 310, // above the onboarding overlay (300)
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "var(--surface-ink)",
        cursor: "pointer",
        opacity: phase === "out" ? 0 : 1,
        transition: `opacity ${FADE_MS}ms var(--ease-sacred)`,
        animation: phase === "in" ? "oraSplashBg .5s var(--ease-sacred) both" : undefined,
        padding: "32px 28px",
        overflow: "hidden",
      }}
    >
      {/* Warm radial glow + vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 34%, rgba(210,107,67,0.20) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.45) 100%)", pointerEvents: "none" }} />

      {/* Emblem — a gilded cross within a slowly turning rose window and a breathing halo */}
      <div className="pw-splash-emblem" style={{ position: "relative", width: "clamp(150px, 42vw, 200px)", height: "clamp(150px, 42vw, 200px)", display: "grid", placeItems: "center", marginBottom: 30 }}>
        <div className="pw-splash-glow" style={{ position: "absolute", inset: "-8%", borderRadius: "50%", background: "radial-gradient(circle, rgba(210,107,67,0.55) 0%, transparent 68%)", pointerEvents: "none" }} />
        <div className="pw-splash-ring" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--gold)" }}>
          <RoseWindow size={200} strokeWidth={1} style={{ opacity: 0.32, width: "100%", height: "100%" }} />
        </div>
        <span style={{ position: "relative", color: "var(--gold)", filter: "drop-shadow(0 4px 18px rgba(210,107,67,0.45))" }}>
          <Logomark size={84} />
        </span>
      </div>

      {/* Name */}
      <h1 style={{
        position: "relative", margin: 0, textAlign: "center",
        fontFamily: "var(--font-serif)", fontWeight: 500,
        fontSize: "clamp(28px, 8vw, 44px)", lineHeight: 1.12, letterSpacing: "-.015em",
        color: "#F6F0E6", animation: "oraReveal .9s var(--ease-sacred) .45s both",
      }}>
        The Prayer Warrior App
      </h1>

      <Fleuron width={180} style={{ margin: "20px 0", position: "relative", animation: "oraReveal .9s var(--ease-sacred) .8s both" }} />

      {/* Tagline */}
      <p style={{
        position: "relative", margin: 0, textAlign: "center", maxWidth: 440,
        fontFamily: "var(--font-body)", fontWeight: 500,
        fontSize: "clamp(13px, 3.4vw, 16px)", lineHeight: 1.55, letterSpacing: ".01em",
        color: cream(0.72), animation: "oraReveal .9s var(--ease-sacred) 1.05s both",
      }}>
        The old school app for Catholic prayers and devotions.
      </p>

      {/* Loader line — fills over the hold, so it reads as an opening loader */}
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: "max(40px, env(safe-area-inset-bottom, 0px))", width: "min(220px, 56vw)", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ width: "100%", height: 2, borderRadius: 2, background: cream(0.12), overflow: "hidden" }}>
          <div className="pw-splash-bar" style={{ height: "100%", borderRadius: 2, background: "var(--gilt)", animationDuration: `${HOLD_MS}ms` }} />
        </div>
        <span className="pw-splash-hint" style={{ fontFamily: "var(--font-display)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: cream(0.5) }}>
          Tap to enter
        </span>
      </div>
    </div>
  );
}
