"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Illustration } from "@/components/Illustration";
import { SurfaceCard, FeatureCard } from "@/components/UI";
import { Sun } from "lucide-react";
import { localDateISO } from "@/lib/clientDate";
import { HOURS, currentHourName, WEEKDAY_SET } from "@/data/content";

type Hour = typeof HOURS[number];

// Which weekdays each set of mysteries is traditionally prayed.
const SET_DAYS: Record<string, string> = {
  Joyful: "Monday · Saturday",
  Sorrowful: "Tuesday · Friday",
  Glorious: "Wednesday · Sunday",
  Luminous: "Thursday",
};

interface TodayData {
  liturgical: { label: string; badgeSeason: string };
  verse: { text: string; cite: string };
  saint: { name: string; title: string | null; monogram: string };
  readings: {
    first: { cite: string; title: string };
    psalm: { cite: string; title: string };
    gospel: { cite: string; title: string };
  };
}

const WAYS = [
  { label: "The Rosary", href: "/rosary" },
  { label: "Daily Mass", href: "/readings" },
  { label: "The Hours", href: "/hours" },
];

// Static fallback so the page renders instantly and works without the API.
const FALLBACK: TodayData = {
  liturgical: { label: "Ordinary Time", badgeSeason: "green" },
  verse: { text: "Put on the full armour of God, that you may be able to stand against the wiles of the devil.", cite: "Ephesians 6 · 11" },
  saint: { name: "St. Ephrem", title: "Doctor of the Church · June 9", monogram: "E" },
  readings: {
    first: { cite: "1 Kings 17", title: "Elijah by the Brook" },
    psalm: { cite: "Psalm 4", title: "In Peace I Will Lie Down" },
    gospel: { cite: "Matthew 5 · 1–12", title: "The Beatitudes" },
  },
};

export default function TodayPage() {
  const router = useRouter();
  const [data, setData] = useState<TodayData>(FALLBACK);
  const [greeting, setGreeting] = useState<string | null>(null);
  const [hour, setHour] = useState<Hour | null>(null);
  const [rosarySet, setRosarySet] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/today?date=${localDateISO()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d) setData(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    // Time-of-day greeting + nearest hour, resolved on the client to avoid a
    // hydration mismatch.
    const h = new Date().getHours();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
    setHour(HOURS.find((x) => x.name === currentHourName()) ?? null);
    setRosarySet(WEEKDAY_SET[new Date().getDay()]);
  }, []);

  const { liturgical, verse, saint, readings } = data;
  const gospelMeta = `${readings.first.cite} · ${readings.psalm.cite} · ${readings.gospel.title}`;

  return (
    <div className="pw-today-pad" style={{ padding: "44px 44px 64px", maxWidth: 900, margin: "0 auto" }}>

      {/* Greeting card */}
      <div style={{ position: "relative", overflow: "hidden", background: "var(--surface-ink)", borderRadius: 22, padding: "26px 26px 24px", marginBottom: 30, boxShadow: "var(--shadow-lg)" }}>
        {/* Layered texture: illustration band + altar watermark + warm gradient */}
        <Illustration name="today-greeting-band" alt="" width={560} height={140} invertOnDark style={{ position: "absolute", right: -20, top: -10, opacity: 0.45, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: -30, bottom: -40, pointerEvents: "none" }}>
          <Illustration name="splash-altar" alt="" size={220} invertOnDark opacity={0.4} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 88% 0%, rgba(210,107,67,0.18) 0%, transparent 58%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: "rgba(239,230,214,0.6)" }}>{greeting ?? "Welcome"}</div>
          <h1 className="pw-reveal pw-greeting-heading" style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 500, color: "#F6F0E6", lineHeight: 1.2, letterSpacing: "-.01em", margin: "8px 0 0" }}>
            How would you like to pray today?
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.6, color: "rgba(239,230,214,0.72)", margin: "12px 0 0" }}>
            It is <span style={{ color: "var(--gold-bright)", fontWeight: 600 }}>{liturgical.label}</span>
            {saint.name && saint.name !== "Feria" ? (
              <> · the Church keeps <span style={{ color: "var(--gold-bright)", fontWeight: 600 }}>{saint.name}</span>.</>
            ) : "."}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
            {WAYS.map((w) => (
              <button
                key={w.href}
                onClick={() => router.push(w.href)}
                style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, padding: "9px 16px", borderRadius: 999, border: "1px solid rgba(239,230,214,0.18)", background: "rgba(239,230,214,0.06)", color: "#F6F0E6", cursor: "pointer" }}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero verse */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <blockquote className="pw-reveal pw-hero-verse" style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 30,
          lineHeight: 1.42,
          color: "var(--ink)",
          fontWeight: 400,
          margin: "0 auto",
          maxWidth: 640,
          letterSpacing: "0",
        }}>
          &ldquo;{verse.text}&rdquo;
        </blockquote>

        <div style={{ display: "flex", justifyContent: "center", margin: "24px auto" }}>
          <Illustration name="today-hero-verse-ornament" alt="" size={200} invertOnDark opacity={0.6} />
        </div>

        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: 11.5,
          letterSpacing: ".02em",
          color: "var(--gold-deep)",
          fontWeight: 600,
        }}>
          {verse.cite}
        </div>
      </div>

      {/* Card grid */}
      <div className="pw-card-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 48 }}>

        {/* Feature card — full width */}
        <div style={{ gridColumn: "1 / -1" }}>
          <FeatureCard
            kicker="Today · Holy Mass"
            title="Daily Readings"
            meta={gospelMeta}
            onClick={() => router.push("/readings")}
            motif={<Illustration name="today-daily-readings" alt="" size={260} invertOnDark={false} opacity={0.5} />}
          />
        </div>

        {/* Liturgy of the Hours */}
        <Link href="/hours" style={{ textDecoration: "none" }}>
          <SurfaceCard
            kicker="Liturgy of the Hours"
            title={hour ? hour.name : "The Divine Office"}
            meta={hour ? `${hour.en} · ${hour.time}` : "Pray the hours"}
            lucide="clock"
            motif={<Illustration name="section-hours" alt="" size={180} invertOnDark opacity={0.55} />}
          />
        </Link>

        {/* Rosary */}
        <Link href="/rosary" style={{ textDecoration: "none" }}>
          <SurfaceCard
            kicker="The Holy Rosary"
            title={rosarySet ? `${rosarySet} Mysteries` : "The Holy Rosary"}
            meta={rosarySet ? `${SET_DAYS[rosarySet]} · today` : "Pray the Rosary"}
            lucide="circle-dot"
            motif={<Illustration name="section-rosary" alt="" size={180} invertOnDark opacity={0.55} />}
          />
        </Link>

        {/* Saint of the Day */}
        <Link href="/saints" style={{ textDecoration: "none" }}>
          <SurfaceCard
            kicker="Saint of the Day"
            title={saint.name}
            meta={saint.title ?? ""}
            lucide="flame"
            motif={<Illustration name="splash-altar" alt="" size={180} invertOnDark opacity={0.5} />}
          />
        </Link>

        {/* Devotions */}
        <Link href="/devotions" style={{ textDecoration: "none" }}>
          <SurfaceCard
            kicker="Devotions"
            title="The Angelus"
            meta="Recited at noon"
            lucide="bell"
            motif={<Illustration name="section-devotions" alt="" size={180} invertOnDark opacity={0.55} />}
          />
        </Link>

      </div>

      {/* Bottom date strip */}
      <div style={{
        marginTop: 52,
        display: "flex",
        alignItems: "center",
        gap: 12,
        color: "var(--stone-400)",
      }}>
        <Sun size={15} strokeWidth={1.6} />
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: 11,
          letterSpacing: ".02em",
        }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </span>
      </div>
    </div>
  );
}
