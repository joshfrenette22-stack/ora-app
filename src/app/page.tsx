"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fleuron, RoseWindow } from "@/components/Sacred";
import { SeasonBadge, SurfaceCard, FeatureCard } from "@/components/UI";
import { Sun } from "lucide-react";
import { localDateISO } from "@/lib/clientDate";

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

  useEffect(() => {
    let alive = true;
    fetch(`/api/today?date=${localDateISO()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d) setData(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const { liturgical, verse, saint, readings } = data;
  const gospelMeta = `${readings.first.cite} · ${readings.psalm.cite} · ${readings.gospel.title}`;

  return (
    <div style={{ padding: "44px 44px 64px", maxWidth: 900, margin: "0 auto" }}>

      {/* Season badge */}
      <div style={{ marginBottom: 32 }}>
        <SeasonBadge season={liturgical.badgeSeason}>{liturgical.label}</SeasonBadge>
      </div>

      {/* Hero verse */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <blockquote style={{
          fontFamily: "var(--font-body)",
          fontStyle: "italic",
          fontSize: 30,
          lineHeight: 1.48,
          color: "var(--ink)",
          fontWeight: 400,
          margin: "0 auto",
          maxWidth: 640,
          letterSpacing: ".01em",
        }}>
          &ldquo;{verse.text}&rdquo;
        </blockquote>

        <Fleuron width={220} style={{ margin: "24px auto" }} />

        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: 11.5,
          letterSpacing: ".26em",
          textTransform: "uppercase",
          color: "var(--gold-deep)",
          fontWeight: 600,
        }}>
          {verse.cite}
        </div>
      </div>

      {/* Card grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 48 }}>

        {/* Feature card — full width */}
        <div style={{ gridColumn: "1 / -1" }}>
          <FeatureCard
            kicker="Today · Holy Mass"
            title="Daily Readings"
            meta={gospelMeta}
            onClick={() => router.push("/readings")}
            motif={<RoseWindow size={220} />}
          />
        </div>

        {/* Liturgy of the Hours */}
        <Link href="/hours" style={{ textDecoration: "none" }}>
          <SurfaceCard
            kicker="Liturgy of the Hours"
            title="Sext · Midday"
            meta="Midday Prayer · 12:00"
            lucide="clock"
          />
        </Link>

        {/* Rosary */}
        <Link href="/rosary" style={{ textDecoration: "none" }}>
          <SurfaceCard
            kicker="The Holy Rosary"
            title="Glorious Mysteries"
            meta="Monday · Wednesday · Saturday"
            lucide="circle-dot"
          />
        </Link>

        {/* Saint of the Day */}
        <Link href="/saints" style={{ textDecoration: "none" }}>
          <SurfaceCard
            kicker="Saint of the Day"
            title={saint.name}
            meta={saint.title ?? ""}
            lucide="flame"
          />
        </Link>

        {/* Devotions */}
        <div>
          <SurfaceCard
            kicker="Devotions"
            title="Angelus"
            meta="Recited at noon"
            lucide="bell"
          />
        </div>

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
          letterSpacing: ".2em",
          textTransform: "uppercase",
        }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </span>
      </div>
    </div>
  );
}
