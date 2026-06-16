"use client";

import { useState } from "react";
import { Fleuron } from "@/components/Sacred";
import { Kicker } from "@/components/UI";
import { READINGS } from "@/data/content";
import { Flame, Clock, BookOpen } from "lucide-react";

type Tab = "first" | "psalm" | "gospel";

const TABS: { key: Tab; label: string }[] = [
  { key: "first", label: "First Reading" },
  { key: "psalm", label: "Psalm" },
  { key: "gospel", label: "Gospel" },
];

const ALSO_TODAY = [
  { icon: <Flame size={16} strokeWidth={1.6} />, label: "St. Ephrem", sub: "Doctor of the Church" },
  { icon: <Clock size={16} strokeWidth={1.6} />, label: "Sext · Midday", sub: "12:00 Prayer" },
  { icon: <BookOpen size={16} strokeWidth={1.6} />, label: "Office of Readings", sub: "Breviary" },
];

export default function ReadingsPage() {
  const [active, setActive] = useState<Tab>("first");

  const reading = READINGS[active];
  const isPsalm = active === "psalm";
  const psalmReading = active === "psalm" ? READINGS.psalm : null;

  return (
    <div style={{ display: "flex", gap: 0, alignItems: "flex-start", minHeight: "100%" }}>

      {/* Main reading column */}
      <div style={{ flex: 1, padding: "40px 48px 72px", minWidth: 0 }}>

        {/* Segmented control */}
        <div style={{
          display: "inline-flex",
          background: "var(--paper-edge)",
          borderRadius: 12,
          padding: 4,
          gap: 2,
          marginBottom: 44,
        }}>
          {TABS.map((tab) => {
            const on = active === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: on ? 600 : 500,
                  fontSize: 11.5,
                  letterSpacing: ".16em",
                  textTransform: "uppercase",
                  padding: "9px 20px",
                  borderRadius: 9,
                  border: "none",
                  cursor: "pointer",
                  background: on ? "var(--ink)" : "transparent",
                  color: on ? "var(--gold-bright)" : "var(--stone-400)",
                  transition: "background 0.18s, color 0.18s",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Reading content — max 700px centered */}
        <div style={{ maxWidth: 700 }}>

          {/* Kicker citation */}
          <Kicker style={{ marginBottom: 10 }}>{reading.cite}</Kicker>

          {/* Title */}
          <h1 style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: 40,
            lineHeight: 1.18,
            color: "var(--ink)",
            margin: "0 0 28px",
            letterSpacing: "-.01em",
          }}>
            {reading.title}
          </h1>

          {/* Psalm refrain block */}
          {isPsalm && psalmReading && (
            <div style={{
              borderLeft: "2px solid var(--gold)",
              paddingLeft: 20,
              marginBottom: 28,
              fontFamily: "var(--font-body)",
              fontStyle: "italic",
              fontSize: 18,
              lineHeight: 1.55,
              color: "var(--ink-700)",
            }}>
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: 10,
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: "var(--gold-deep)",
                fontStyle: "normal",
                marginBottom: 8,
                fontWeight: 600,
              }}>
                Refrain
              </div>
              {psalmReading.refrain}
            </div>
          )}

          {/* Body with drop cap */}
          <p
            className="pw-dropcap"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 19,
              lineHeight: 1.72,
              color: "var(--ink)",
              margin: "0 0 36px",
              letterSpacing: ".005em",
            }}
          >
            {reading.body}
          </p>

          {/* Fleuron divider */}
          <Fleuron width={200} style={{ marginBottom: 32 }} />

          {/* Acclamation footer */}
          <div style={{
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
            fontSize: 16,
            color: "var(--stone-400)",
            lineHeight: 1.7,
          }}>
            {active === "gospel"
              ? <>The Gospel of the Lord. <span style={{ color: "var(--gold-deep)", fontStyle: "normal", fontWeight: 600 }}>— Praise to you, Lord Jesus Christ.</span></>
              : <>The Word of the Lord. <span style={{ color: "var(--gold-deep)", fontStyle: "normal", fontWeight: 600 }}>— Thanks be to God.</span></>
            }
          </div>

        </div>
      </div>

      {/* Right sidebar */}
      <div style={{
        width: 300,
        flexShrink: 0,
        borderLeft: "1px solid var(--stone-200)",
        padding: "40px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        minHeight: "100%",
        background: "var(--bone-raised)",
      }}>

        {/* Also Today */}
        <div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 10.5,
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: "var(--stone-400)",
            marginBottom: 18,
          }}>
            Also Today
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {ALSO_TODAY.map((item, i) => (
              <button
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "13px 0",
                  background: "none",
                  border: "none",
                  borderBottom: i < ALSO_TODAY.length - 1 ? "1px solid var(--stone-200)" : "none",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  color: "var(--ink)",
                }}
              >
                <span style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--gold-faint)",
                  color: "var(--gold-deep)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}>
                  {item.icon}
                </span>
                <div>
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    fontSize: 15,
                    color: "var(--ink)",
                    lineHeight: 1.2,
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    color: "var(--stone-400)",
                    marginTop: 2,
                  }}>
                    {item.sub}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--stone-200)", margin: "28px 0" }} />

        {/* Reflect section */}
        <div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 10.5,
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: "var(--stone-400)",
            marginBottom: 16,
          }}>
            Reflect
          </div>

          <div style={{
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
            fontSize: 16,
            lineHeight: 1.62,
            color: "var(--ink-700)",
          }}>
            {active === "first" && "Where in your life do you feel God is calling you to trust him with your daily bread, as he provided for Elijah?"}
            {active === "psalm" && "How does resting in God's peace — \"in peace I will sleep\" — speak to a worry or burden you carry today?"}
            {active === "gospel" && "Which Beatitude speaks most directly to the condition of your heart right now? What would it look like to live it today?"}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--stone-200)", margin: "28px 0" }} />

        {/* Lectionary note */}
        <div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 10.5,
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: "var(--stone-400)",
            marginBottom: 10,
          }}>
            Lectionary
          </div>
          <div style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--stone-400)",
            lineHeight: 1.6,
          }}>
            Year C · Ordinary Time<br />
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </div>

      </div>
    </div>
  );
}
