"use client";

import { useEffect, useRef, useState } from "react";
import { Logomark, RoseWindow, Fleuron } from "./Sacred";
import { getUserName, setUserName, hasAskedName, markAskedName } from "@/lib/userName";

// Shown on a visitor's first session: an animated welcome, then (on a new
// device) a gentle prompt for their name so the app can greet them personally.
const SEEN_KEY = "pw-splash-seen";
const HOLD_MS = 2800; // time the welcome is held before it advances
const FADE_MS = 650;  // fade-out duration

type Phase = "hidden" | "shown" | "out";
type Content = "welcome" | "name";

const cream = (a: number) => `rgba(239,230,214,${a})`;

export function SplashScreen() {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [content, setContent] = useState<Content>("welcome");
  const [nameInput, setNameInput] = useState("");
  const needNameRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(SEEN_KEY) === "1"; } catch { /* blocked */ }
    const needName = !hasAskedName() && !getUserName();
    if (seen && !needName) return; // returning visitor — show nothing
    needNameRef.current = needName;

    /* eslint-disable react-hooks/set-state-in-effect */
    if (!seen) {
      try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* blocked */ }
      setContent("welcome");
      setPhase("shown");
      timerRef.current = setTimeout(() => {
        if (needName) setContent("name");
        else setPhase("out");
      }, HOLD_MS);
    } else {
      // Existing visitor who hasn't given a name yet (e.g. after an update).
      setContent("name");
      setPhase("shown");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // Once the fade-out has played, unmount entirely.
  useEffect(() => {
    if (phase !== "out") return;
    const t = setTimeout(() => setPhase("hidden"), FADE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "hidden") return null;

  const advanceFromWelcome = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (needNameRef.current) setContent("name");
    else setPhase("out");
  };
  const submitName = (e: React.FormEvent) => { e.preventDefault(); setUserName(nameInput); setPhase("out"); };
  const skipName = () => { markAskedName(); setPhase("out"); };

  const isName = content === "name";

  return (
    <div
      role="dialog"
      aria-label="Welcome to The Prayer Warrior App"
      onClick={!isName ? advanceFromWelcome : undefined}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "var(--surface-ink)",
        cursor: isName ? "default" : "pointer",
        opacity: phase === "out" ? 0 : 1,
        transition: `opacity ${FADE_MS}ms var(--ease-sacred)`,
        animation: phase === "shown" && content === "welcome" ? "oraSplashBg .5s var(--ease-sacred) both" : undefined,
        padding: "32px 28px",
        overflow: "hidden",
      }}
    >
      {/* Warm radial glow + vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 34%, rgba(210,107,67,0.20) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.45) 100%)", pointerEvents: "none" }} />

      {/* Emblem — a gilded cross, with a turning rose window on the welcome step */}
      <div className="pw-splash-emblem" style={{ position: "relative", width: "clamp(132px, 38vw, 188px)", height: "clamp(132px, 38vw, 188px)", display: "grid", placeItems: "center", marginBottom: isName ? 24 : 30 }}>
        <div className="pw-splash-glow" style={{ position: "absolute", inset: "-8%", borderRadius: "50%", background: "radial-gradient(circle, rgba(210,107,67,0.55) 0%, transparent 68%)", pointerEvents: "none" }} />
        {!isName && (
          <div className="pw-splash-ring" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--gold)" }}>
            <RoseWindow size={188} strokeWidth={1} style={{ opacity: 0.32, width: "100%", height: "100%" }} />
          </div>
        )}
        <span style={{ position: "relative", color: "var(--gold)", filter: "drop-shadow(0 4px 18px rgba(210,107,67,0.45))" }}>
          <Logomark size={isName ? 64 : 84} />
        </span>
      </div>

      {isName ? (
        /* ── Name step ──────────────────────────────────────────────────── */
        <div key="name" style={{ position: "relative", width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", alignItems: "center", animation: "oraReveal .7s var(--ease-sacred) both" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: cream(0.5), marginBottom: 10 }}>
            Welcome
          </div>
          <h1 style={{ margin: 0, textAlign: "center", fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: "clamp(24px, 6.5vw, 32px)", lineHeight: 1.15, letterSpacing: "-.01em", color: "#F6F0E6" }}>
            What may we call you?
          </h1>
          <p style={{ margin: "10px 0 22px", textAlign: "center", fontFamily: "var(--font-body)", fontSize: 14.5, lineHeight: 1.5, color: cream(0.6) }}>
            So we can greet you as you pray. This stays on your device.
          </p>
          <form onSubmit={submitName} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              autoFocus
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your name"
              aria-label="Your name"
              maxLength={40}
              style={{
                width: "100%", textAlign: "center",
                fontFamily: "var(--font-body)", fontSize: 16, color: "#F6F0E6",
                background: cream(0.08), border: `1px solid ${cream(0.2)}`, borderRadius: 12,
                padding: "14px 16px", outline: "none",
              }}
            />
            <button type="submit" disabled={!nameInput.trim()} style={{
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
              border: "none", borderRadius: 12, padding: "14px 18px",
              cursor: nameInput.trim() ? "pointer" : "default",
              background: nameInput.trim() ? "var(--gilt)" : cream(0.12),
              color: nameInput.trim() ? "#2A1A0E" : cream(0.4),
              boxShadow: nameInput.trim() ? "var(--shadow-gold)" : "none",
              transition: "background .15s, color .15s",
            }}>
              Continue
            </button>
          </form>
          <button onClick={skipName} style={{ marginTop: 16, border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, letterSpacing: ".02em", color: cream(0.45) }}>
            Skip for now
          </button>
        </div>
      ) : (
        /* ── Welcome step ───────────────────────────────────────────────── */
        <>
          <h1 style={{
            position: "relative", margin: 0, textAlign: "center",
            fontFamily: "var(--font-serif)", fontWeight: 500,
            fontSize: "clamp(28px, 8vw, 44px)", lineHeight: 1.12, letterSpacing: "-.015em",
            color: "#F6F0E6", animation: "oraReveal .9s var(--ease-sacred) .45s both",
          }}>
            The Prayer Warrior App
          </h1>

          <Fleuron width={180} style={{ margin: "20px 0", position: "relative", animation: "oraReveal .9s var(--ease-sacred) .8s both" }} />

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
        </>
      )}
    </div>
  );
}
