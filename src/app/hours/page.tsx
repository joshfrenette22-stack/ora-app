"use client";

import { useState, useEffect } from "react";
import { Sunrise, Sun, Sunset, Moon } from "lucide-react";
import { Cross } from "@/components/Sacred";
import { SeasonBadge, Kicker, Btn } from "@/components/UI";
import { PrayerPlayer } from "@/components/PrayerPlayer";
import { HOURS } from "@/data/content";

type HourName = typeof HOURS[number]["name"];

function getCurrentHour(): HourName {
  const h = new Date().getHours();
  if (h >= 5 && h < 8) return "Lauds";
  if (h >= 8 && h < 11) return "Terce";
  if (h >= 11 && h < 14) return "Sext";
  if (h >= 14 && h < 17) return "None";
  if (h >= 17 && h < 21) return "Vespers";
  return "Compline";
}

const HOUR_ICONS: Record<string, typeof Sun> = {
  sunrise: Sunrise,
  sun: Sun,
  sunset: Sunset,
  moon: Moon,
};

const ANTIPHONS: Record<HourName, string> = {
  Lauds: "O Lord, open my lips, and my mouth shall declare thy praise.",
  Terce: "Come, Holy Spirit, fill the hearts of thy faithful.",
  Sext: "The Lord is my light and my salvation; whom shall I fear?",
  None: "My soul yearns and pines for the courts of the Lord.",
  Vespers: "Let my prayer be directed as incense in thy sight.",
  Compline: "He who dwells in the shelter of the Most High shall abide under the shadow of the Almighty.",
};

export default function HoursPage() {
  const [currentHour, setCurrentHour] = useState<HourName>("Sext");

  useEffect(() => {
    // Resolve the live hour on the client after mount to avoid a hydration
    // mismatch (server and client clocks can land in different hours).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentHour(getCurrentHour());
  }, []);

  const activeHour = HOURS.find((h) => h.name === currentHour) ?? HOURS[2];
  const ActiveIcon = HOUR_ICONS[activeHour.lucide] ?? Sun;

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "24px 16px 48px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* Feature card — current hour */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: "var(--surface-ink)",
          borderRadius: 20,
          padding: "30px 28px 28px",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 70% 30%, rgba(181,145,47,0.12) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Top meta row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          <SeasonBadge season="gold" dark>
            Now · {activeHour.time}
          </SeasonBadge>
          <ActiveIcon size={20} strokeWidth={1.4} style={{ color: "var(--gold-bright)", opacity: 0.7 }} />
        </div>

        {/* Hour title */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 28,
              color: "#F3EEE2",
              letterSpacing: ".03em",
            }}
          >
            {activeHour.name}
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              color: "var(--gold-bright)",
              opacity: 0.72,
              marginTop: 2,
            }}
          >
            {activeHour.en}
          </div>
        </div>

        {/* Antiphon */}
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
            fontSize: 15.5,
            lineHeight: 1.65,
            color: "var(--gold-bright)",
            opacity: 0.82,
            margin: 0,
            borderLeft: "2px solid var(--gold)",
            paddingLeft: 14,
            position: "relative",
          }}
        >
          {ANTIPHONS[currentHour]}
        </p>

        {/* CTA button */}
        <div style={{ position: "relative", marginTop: 4 }}>
          <Btn variant="primary" icon={<Cross size={14} />}>
            Pray {activeHour.name}
          </Btn>
        </div>

        {/* Voice player — the antiphon read aloud */}
        <div style={{ position: "relative", marginTop: 6 }}>
          <PrayerPlayer
            dark
            title={`Listen · ${activeHour.name}`}
            segments={[{ id: currentHour, label: `${activeHour.name} · Antiphon`, text: ANTIPHONS[currentHour] }]}
          />
        </div>
      </div>

      {/* Hours list section */}
      <div>
        <Kicker style={{ marginBottom: 12 }}>The Hours Today</Kicker>

        <div
          style={{
            background: "var(--bone-raised)",
            border: "1px solid var(--stone-200)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {HOURS.map((hour, i) => {
            const Icon = HOUR_ICONS[hour.lucide] ?? Sun;
            const isActive = hour.name === currentHour;
            const isLast = i === HOURS.length - 1;

            return (
              <div key={hour.name}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "16px 20px",
                    background: isActive ? "var(--gold-faint)" : "transparent",
                    cursor: "pointer",
                    transition: "background .14s",
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: isActive ? "rgba(181,145,47,0.18)" : "var(--stone-100)",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      color: isActive ? "var(--gold-deep)" : "var(--stone-400)",
                    }}
                  >
                    <Icon size={17} strokeWidth={1.6} />
                  </div>

                  {/* Name + sub */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 600,
                        fontSize: 20,
                        color: isActive ? "var(--gold-deep)" : "var(--ink)",
                        lineHeight: 1.2,
                      }}
                    >
                      {hour.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: 14,
                        color: "var(--stone-400)",
                        marginTop: 1,
                      }}
                    >
                      {hour.en}
                    </div>
                  </div>

                  {/* Time + badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    {isActive && <SeasonBadge season="gold">Now</SeasonBadge>}
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 13,
                        fontWeight: 500,
                        color: isActive ? "var(--gold-deep)" : "var(--stone-400)",
                        letterSpacing: ".04em",
                      }}
                    >
                      {hour.time}
                    </span>
                  </div>
                </div>

                {/* Hairline divider */}
                {!isLast && (
                  <div
                    style={{
                      height: 1,
                      background: "var(--stone-100)",
                      margin: "0 20px",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
