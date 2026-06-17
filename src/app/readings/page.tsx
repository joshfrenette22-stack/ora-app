"use client";

import { useEffect, useMemo, useState } from "react";
import { Fleuron } from "@/components/Sacred";
import { Kicker } from "@/components/UI";
import { PlayerBar, SpokenText, useNarration, useRegisterNarration, type NarrationSegment } from "@/components/PrayerPlayer";
import { countWords } from "@/lib/words";
import type { DailyReadings } from "@/lib/readings";
import { localDateISO } from "@/lib/clientDate";
import { Flame, Clock, BookOpen } from "lucide-react";
import { Illustration } from "@/components/Illustration";

type Tab = "first" | "psalm" | "second" | "gospel";

const TAB_LABEL: Record<Tab, string> = {
  first: "First Reading",
  psalm: "Psalm",
  second: "Second Reading",
  gospel: "Gospel",
};

// Canonical proclamation order; the second reading only appears on Sundays/solemnities.
const TAB_ORDER: Tab[] = ["first", "psalm", "second", "gospel"];

const ALSO_TODAY = [
  { icon: <Flame size={16} strokeWidth={1.6} />, label: "Saint of the Day", sub: "The day’s memorial" },
  { icon: <Clock size={16} strokeWidth={1.6} />, label: "Sext · Midday", sub: "12:00 Prayer" },
  { icon: <BookOpen size={16} strokeWidth={1.6} />, label: "Office of Readings", sub: "Breviary" },
];

// Static fallback so the page renders before the API responds.
const FALLBACK: DailyReadings = {
  date: "",
  representative: true,
  source: "",
  first: { label: "First Reading", cite: "1 Kings 17 · 1–6", title: "Elijah by the Brook", body: "And Elijah the Thesbite said to Achab: As the Lord liveth, before whom I stand, there shall not be dew nor rain these years, but according to the words of my mouth." },
  psalm: { label: "Responsorial Psalm", cite: "Psalm 4 · 2–8", title: "In Peace I Will Lie Down", refrain: "Let the light of thy countenance, O Lord, be signed upon us.", body: "In peace in the selfsame I will sleep, and I will rest: for thou, O Lord, singularly hast settled me in hope." },
  gospel: { label: "Gospel", cite: "Matthew 5 · 1–12", title: "The Beatitudes", body: "Blessed are the poor in spirit: for theirs is the kingdom of heaven. Blessed are the meek: for they shall possess the land." },
  reflect: {
    first: "Where is God calling you to trust him with your daily bread?",
    psalm: "How does resting in God's peace speak to a burden you carry today?",
    gospel: "Which Beatitude speaks most directly to your heart right now?",
  },
};

export default function ReadingsPage() {
  const [active, setActive] = useState<Tab>("first");
  const [data, setData] = useState<DailyReadings>(FALLBACK);

  useEffect(() => {
    let alive = true;
    fetch(`/api/readings?date=${localDateISO()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d) setData(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // Tabs present today (second reading is omitted on weekdays).
  const order = useMemo<Tab[]>(() => TAB_ORDER.filter((k) => data[k]), [data]);
  const activeTab = order.includes(active) ? active : "first";
  const reading = data[activeTab]!;
  const isPsalm = activeTab === "psalm";

  // Narrate the whole Mass in order; follow along by switching tabs.
  const segments = useMemo<NarrationSegment[]>(() => {
    return order.map((key) => {
      const r = data[key]!;
      const refrain = key === "psalm" && r.refrain ? `${r.refrain} ` : "";
      return { id: key, label: r.cite || TAB_LABEL[key], text: `${r.title}. ${refrain}${r.body}` };
    });
  }, [data, order]);

  const narration = useNarration({
    segments,
    onSegmentChange: (i) => setActive(order[i]),
  });
  useRegisterNarration(narration, "Listen to the Readings");

  // Word-highlight bookkeeping: the spoken segment reads "<title>. <refrain> <body>",
  // so the body's words start after the title (and refrain, on psalms).
  const speaking = narration.status !== "idle";
  const titleWords = countWords(reading.title);
  const refrainWords = isPsalm && reading.refrain ? countWords(reading.refrain) : 0;
  const bodyOffset = titleWords + refrainWords;

  return (
    <div className="pw-readings" style={{ display: "flex", gap: 0, alignItems: "flex-start", minHeight: "100%", overflowX: "hidden" }}>

      {/* Main reading column */}
      <div className="pw-readings-main" style={{ flex: 1, padding: "40px 48px 72px", minWidth: 0, maxWidth: "100%", overflowX: "hidden" }}>

        {/* Segmented control */}
        <div className="pw-reading-tabs" style={{
          display: "inline-flex",
          background: "var(--paper-edge)",
          borderRadius: 12,
          padding: 4,
          gap: 2,
          marginBottom: 24,
          maxWidth: "100%",
        }}>
          {order.map((key) => {
            const on = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => narration.seek(order.indexOf(key))}
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: on ? 600 : 500,
                  fontSize: 11.5,
                  letterSpacing: ".01em",
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
                {TAB_LABEL[key]}
              </button>
            );
          })}
        </div>

        {/* Audio player — listen to the Mass */}
        <div style={{ maxWidth: 700, marginBottom: 40 }}>
          <PlayerBar narration={narration} title="Listen to the Readings" />
        </div>

        {/* Reading content — max 700px centered */}
        <div style={{ maxWidth: 700 }}>

          <Kicker style={{ marginBottom: 10 }}>{reading.cite}</Kicker>

          <h1 className="pw-reveal pw-reading-title" style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 500,
            fontSize: 40,
            lineHeight: 1.14,
            color: "var(--ink)",
            margin: "0 0 28px",
            letterSpacing: "-.015em",
          }}>
            {reading.title}
          </h1>

          {/* Psalm refrain block */}
          {isPsalm && reading.refrain && (
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
                letterSpacing: ".02em",
                color: "var(--gold-deep)",
                fontStyle: "normal",
                marginBottom: 8,
                fontWeight: 600,
              }}>
                Refrain
              </div>
              <SpokenText as="span" text={reading.refrain} active={speaking} wordIndex={narration.wordIndex} wordOffset={titleWords} />
            </div>
          )}

          {/* Body with drop cap */}
          <SpokenText
            as="p"
            className="pw-dropcap"
            text={reading.body}
            active={speaking}
            wordIndex={narration.wordIndex}
            wordOffset={bodyOffset}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 19,
              lineHeight: 1.72,
              color: "var(--ink)",
              margin: "0 0 36px",
              letterSpacing: ".005em",
            }}
          />

          <Fleuron width={200} style={{ marginBottom: 32 }} />

          {/* Acclamation footer */}
          <div style={{
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
            fontSize: 16,
            color: "var(--stone-400)",
            lineHeight: 1.7,
          }}>
            {activeTab === "gospel"
              ? <>The Gospel of the Lord. <span style={{ color: "var(--gold-deep)", fontStyle: "normal", fontWeight: 600 }}>— Praise to you, Lord Jesus Christ.</span></>
              : <>The Word of the Lord. <span style={{ color: "var(--gold-deep)", fontStyle: "normal", fontWeight: 600 }}>— Thanks be to God.</span></>
            }
          </div>

        </div>
      </div>

      {/* Right sidebar */}
      <div className="pw-readings-aside" style={{
        width: 300,
        flexShrink: 0,
        borderLeft: "1px solid var(--stone-200)",
        padding: "40px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        minHeight: "100%",
        background: "var(--bone-raised)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Ambient texture */}
        <div style={{ position: "absolute", bottom: -40, right: -40, pointerEvents: "none", zIndex: 0 }}>
          <Illustration name="section-daily-mass" size={240} invertOnDark opacity={0.35} />
        </div>

        {/* Also Today */}
        <div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 10.5,
            letterSpacing: ".02em",
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
                  <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "var(--ink)", lineHeight: 1.2 }}>
                    {item.label}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--stone-400)", marginTop: 2 }}>
                    {item.sub}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: "var(--stone-200)", margin: "28px 0" }} />

        {/* Reflect section */}
        <div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 10.5,
            letterSpacing: ".02em",
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
            {data.reflect[activeTab]}
          </div>
        </div>

        <div style={{ height: 1, background: "var(--stone-200)", margin: "28px 0" }} />

        {/* Lectionary note */}
        <div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 10.5,
            letterSpacing: ".02em",
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
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            {data.source && <><br /><span style={{ fontStyle: "italic", fontSize: 12 }}>{data.source}</span></>}
          </div>
        </div>

      </div>
    </div>
  );
}
