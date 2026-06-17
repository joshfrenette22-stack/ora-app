"use client";

import { useEffect, useMemo, useState } from "react";
import { SaintMedallion, Fleuron } from "@/components/Sacred";
import { SeasonBadge, Kicker } from "@/components/UI";
import { PlayerBar, SpokenText, useNarration, type NarrationSegment } from "@/components/PrayerPlayer";
import { countWords } from "@/lib/words";
import { badgeSeason } from "@/lib/liturgical";
import type { Saint } from "@/lib/saints";
import { localDateISO } from "@/lib/clientDate";

const FALLBACK: Saint = {
  name: "St. Ephrem",
  title: "the Syrian · Deacon & Doctor · c. 306–373",
  color: "white",
  rank: "memorial",
  monogram: "E",
  bio: "Deacon, hymnographer, and Doctor of the Church, called the “Harp of the Holy Spirit.” His hymns and metrical homilies defended the faith against the heresies of his day and adorned the liturgy of the Syriac Church with a poetry that is still sung today.",
  collect: "O God, who didst illumine thy Church with the learning and sanctity of the Deacon Saint Ephrem, grant that we, following his example, may ever seek thee above all things and delight in singing thy praises. Through our Lord Jesus Christ. Amen.",
};

export default function SaintsPage() {
  const [saint, setSaint] = useState<Saint>(FALLBACK);

  useEffect(() => {
    let alive = true;
    fetch(`/api/saints?date=${localDateISO()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d) setSaint(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const segments = useMemo<NarrationSegment[]>(() => {
    const segs: NarrationSegment[] = [];
    if (saint.bio) segs.push({ id: "life", label: "The Life", text: `${saint.name}. ${saint.bio}` });
    if (saint.collect) segs.push({ id: "collect", label: "Collect", text: saint.collect });
    return segs;
  }, [saint]);

  const narration = useNarration({ segments });
  const speaking = narration.status !== "idle";
  // The "life" segment reads "<name>. <bio>", so the bio starts after the name.
  const nameWords = countWords(saint.name);
  const lifeActive = speaking && narration.current?.id === "life";
  const collectActive = speaking && narration.current?.id === "collect";

  const rankLabel = saint.rank === "feria" ? "Feria" : saint.rank.charAt(0).toUpperCase() + saint.rank.slice(1);

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "32px 20px 64px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}
    >
      {/* Devotional medallion */}
      <div className="pw-reveal" style={{ marginBottom: 24 }}>
        <SaintMedallion
          size={150}
          monogram={saint.monogram ?? saint.name.replace(/^(St\.|Sts\.|Bl\.)\s*/, "").charAt(0)}
        />
      </div>

      {/* Saint name */}
      <div
        className="pw-reveal"
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 500,
          fontSize: 40,
          color: "var(--ink)",
          letterSpacing: "-.02em",
          textAlign: "center",
          lineHeight: 1.08,
          marginBottom: 10,
        }}
      >
        {saint.name}
      </div>

      {/* Subtitle */}
      {saint.title && (
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
            fontSize: 16,
            color: "var(--stone-400)",
            textAlign: "center",
            lineHeight: 1.5,
            marginBottom: 16,
          }}
        >
          {saint.title}
        </div>
      )}

      {/* Season badge */}
      <div style={{ marginBottom: 28 }}>
        <SeasonBadge season={badgeSeason(saint.color)}>{rankLabel}</SeasonBadge>
      </div>

      {/* Voice player */}
      {segments.length > 0 && (
        <div style={{ width: "100%", marginBottom: 28 }}>
          <PlayerBar narration={narration} title={`Listen · ${saint.name}`} />
        </div>
      )}

      {/* Fleuron divider */}
      <div style={{ marginBottom: 28 }}>
        <Fleuron width={220} />
      </div>

      {/* Hagiography paragraph with drop cap */}
      {saint.bio && (
        <SpokenText
          as="p"
          className="pw-dropcap"
          text={saint.bio}
          active={lifeActive}
          wordIndex={narration.wordIndex}
          wordOffset={nameWords}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 18,
            lineHeight: 1.72,
            color: "var(--ink-700)",
            textAlign: "left",
            margin: "0 0 32px",
            width: "100%",
          }}
        />
      )}

      {/* Collect card */}
      {saint.collect && (
        <div
          style={{
            width: "100%",
            background: "var(--gold-faint)",
            borderRadius: 14,
            padding: "24px 28px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Kicker style={{ marginBottom: 12 }}>Collect</Kicker>
          <SpokenText
            as="p"
            text={saint.collect}
            active={collectActive}
            wordIndex={narration.wordIndex}
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 18,
              lineHeight: 1.65,
              color: "var(--ink-700)",
              margin: 0,
            }}
          />
        </div>
      )}
    </div>
  );
}
