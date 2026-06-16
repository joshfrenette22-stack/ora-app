"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fleuron, RoseWindow } from "@/components/Sacred";
import { SeasonBadge, SurfaceCard, FeatureCard } from "@/components/UI";
import { Sun, BookOpen, Clock, Flame, Bell } from "lucide-react";

export default function TodayPage() {
  const router = useRouter();

  return (
    <div style={{ padding: "44px 44px 64px", maxWidth: 900, margin: "0 auto" }}>

      {/* Season badge */}
      <div style={{ marginBottom: 32 }}>
        <SeasonBadge season="green">Ordinary Time · Week X</SeasonBadge>
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
          &ldquo;Put on the full armour of God, that you may be able to stand against the wiles of the devil.&rdquo;
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
          Ephesians 6 &middot; 11
        </div>
      </div>

      {/* Card grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 48 }}>

        {/* Feature card — full width */}
        <div style={{ gridColumn: "1 / -1" }}>
          <FeatureCard
            kicker="Today · Holy Mass"
            title="Daily Readings"
            meta="1 Kings 17 · Psalm 4 · Matthew 5 — The Beatitudes"
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
            title="St. Ephrem"
            meta="Doctor of the Church · June 9"
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
