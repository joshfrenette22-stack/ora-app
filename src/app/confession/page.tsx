"use client";

import { useEffect, useState } from "react";
import { Fleuron } from "@/components/Sacred";
import { Kicker, LucideIcon } from "@/components/UI";
import { EXAMINATION, CONFESSION_STEPS, ACT_OF_CONTRITION } from "@/data/confession";

const STORE_KEY = "ora-examen";

export default function ConfessionPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setChecked(JSON.parse(raw));
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(checked)); } catch { /* ignore */ }
    }
  }, [checked, loaded]);

  const markedCount = Object.values(checked).filter(Boolean).length;

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }
  function clearAll() {
    setChecked({});
  }

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "32px 18px 80px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <h1 className="pw-reveal" style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 34, color: "var(--ink)", margin: 0, letterSpacing: "-.015em" }}>
          Preparing for Confession
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, color: "var(--stone-400)", margin: "8px 0 0", lineHeight: 1.55 }}>
          “If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all iniquity.” — 1 John 1:9
        </p>
        <Fleuron width={200} style={{ margin: "20px auto 0" }} />
      </div>

      {/* How to make a good confession */}
      <section style={{ marginTop: 26 }}>
        <Kicker style={{ marginBottom: 14 }}>How to make a good confession</Kicker>
        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {CONFESSION_STEPS.map((s, i) => (
            <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--gold-faint)", color: "var(--gold-deep)", display: "grid", placeItems: "center", flexShrink: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13 }}>
                {i + 1}
              </span>
              <div>
                <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>{s.title}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.6, color: "var(--ink-700)", marginTop: 2 }}>{s.text}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div style={{ height: 1, background: "var(--stone-200)", margin: "32px 0" }} />

      {/* Examination of conscience */}
      <section>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
          <Kicker>Examination of conscience</Kicker>
          {markedCount > 0 && (
            <button onClick={clearAll} style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600, color: "var(--gold-deep)", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
              Clear ({markedCount})
            </button>
          )}
        </div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--stone-400)", margin: "0 0 18px", lineHeight: 1.55 }}>
          Pray for light, then read slowly. Tap any line that applies, to remember it for confession. Your marks stay on this device only.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {EXAMINATION.map((sec) => (
            <div key={sec.id} style={{ background: "var(--bone-raised)", border: "1px solid var(--stone-200)", borderRadius: 16, padding: "18px 18px 8px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, letterSpacing: ".02em", color: "var(--gold-deep)" }}>{sec.commandment}</div>
              <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 16, lineHeight: 1.5, color: "var(--ink)", margin: "3px 0 12px" }}>{sec.summary}</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {sec.questions.map((q, i) => {
                  const id = `${sec.id}-${i}`;
                  const on = !!checked[id];
                  return (
                    <button
                      key={id}
                      onClick={() => toggle(id)}
                      aria-pressed={on}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 12, width: "100%", textAlign: "left",
                        background: "transparent", border: "none", cursor: "pointer",
                        padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid var(--stone-100)",
                      }}
                    >
                      <span style={{
                        width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 1,
                        display: "grid", placeItems: "center",
                        background: on ? "var(--gilt)" : "transparent",
                        border: on ? "none" : "1.5px solid var(--stone-300)",
                        color: "#2A2008", transition: "background .12s",
                      }}>
                        {on && <LucideIcon name="check" size={14} stroke={2.6} />}
                      </span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 15.5, lineHeight: 1.55, color: on ? "var(--ink)" : "var(--ink-700)" }}>
                        {q}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: 1, background: "var(--stone-200)", margin: "32px 0" }} />

      {/* Act of Contrition */}
      <section>
        <Kicker style={{ marginBottom: 12 }}>Act of Contrition</Kicker>
        <div style={{ background: "var(--gold-faint)", borderRadius: 16, padding: "22px 24px", boxShadow: "var(--shadow-sm)" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 18, lineHeight: 1.7, color: "var(--ink-700)", margin: 0 }}>
            {ACT_OF_CONTRITION}
          </p>
        </div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--stone-400)", margin: "18px 0 0", lineHeight: 1.6, textAlign: "center" }}>
          Go in peace — your sins are forgiven. Remember to do your penance, and give thanks.
        </p>
      </section>
    </div>
  );
}
