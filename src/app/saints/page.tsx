"use client";

import { useEffect, useMemo, useState } from "react";
import { Fleuron } from "@/components/Sacred";
import { Illustration } from "@/components/Illustration";
import { SeasonBadge, Kicker, LucideIcon } from "@/components/UI";
import { ListenButton, SpokenText, useNarration, useRegisterNarration, type NarrationSegment } from "@/components/PrayerPlayer";
import { countWords } from "@/lib/words";
import { badgeSeason } from "@/lib/liturgical";
import type { Saint } from "@/lib/saints";
import type { SaintProfile } from "@/lib/saintProfile";
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

/** A labelled prose block that follows along with narration. */
function Section({
  kicker, text, active, wordIndex, wordOffset = 0, dropcap, serif,
}: {
  kicker: string; text: string; active: boolean; wordIndex: number;
  wordOffset?: number; dropcap?: boolean; serif?: boolean;
}) {
  return (
    <div style={{ width: "100%", marginBottom: 30, position: "relative", zIndex: 1 }}>
      <Kicker style={{ marginBottom: 12 }}>{kicker}</Kicker>
      <SpokenText
        as="p"
        className={dropcap ? "pw-dropcap" : undefined}
        text={text}
        active={active}
        wordIndex={wordIndex}
        wordOffset={wordOffset}
        style={{
          fontFamily: serif ? "var(--font-serif)" : "var(--font-body)",
          fontStyle: serif ? "italic" : "normal",
          fontSize: serif ? 18 : 17.5,
          lineHeight: 1.72,
          color: "var(--ink-700)",
          textAlign: "left",
          margin: 0,
        }}
      />
    </div>
  );
}

/** A compact fact (canonization / patronage) — not narrated. */
function Fact({ kicker, text }: { kicker: string; text: string }) {
  return (
    <div style={{ flex: "1 1 180px", minWidth: 0 }}>
      <Kicker style={{ marginBottom: 8 }}>{kicker}</Kicker>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 16, lineHeight: 1.55, color: "var(--ink-700)" }}>{text}</div>
    </div>
  );
}

function Shimmer() {
  return (
    <div className="pw-shimmer" aria-hidden style={{ width: "100%", marginBottom: 30 }}>
      <div style={{ height: 11, width: 90, borderRadius: 6, background: "var(--stone-200)", marginBottom: 14 }} />
      <div style={{ height: 13, borderRadius: 6, background: "var(--stone-200)", marginBottom: 9 }} />
      <div style={{ height: 13, borderRadius: 6, background: "var(--stone-200)", marginBottom: 9 }} />
      <div style={{ height: 13, width: "70%", borderRadius: 6, background: "var(--stone-200)" }} />
    </div>
  );
}

export default function SaintsPage() {
  const [saint, setSaint] = useState<Saint>(FALLBACK);
  const [profile, setProfile] = useState<SaintProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    let alive = true;
    const date = localDateISO();
    fetch(`/api/saints?date=${date}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d) setSaint(d); })
      .catch(() => {});
    fetch(`/api/saint-profile?date=${date}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive) setProfile(d?.profile ?? null); })
      .catch(() => {})
      .finally(() => { if (alive) setLoadingProfile(false); });
    return () => { alive = false; };
  }, []);

  const isFeria = saint.name === "Feria";
  // The lead narration: the grounded summary if we have one, else the curated bio.
  const lifeText = (profile?.history || profile?.summary || saint.bio || "").trim();
  const contributions = profile?.contributions?.trim() || "";
  const feastEngagement = profile?.feastEngagement?.trim() || "";
  const canonization = profile?.canonization?.trim() || "";
  const patronage = profile?.patronage?.trim() || "";
  const sources = profile?.sources ?? [];

  // Narrate the story in order; each block reads when it is the active segment.
  const segments = useMemo<NarrationSegment[]>(() => {
    const segs: NarrationSegment[] = [];
    if (lifeText) segs.push({ id: "life", label: "The Life", text: `${saint.name}. ${lifeText}` });
    if (contributions) segs.push({ id: "contrib", label: "Legacy", text: contributions });
    if (feastEngagement) segs.push({ id: "feast", label: "Keeping the Feast", text: feastEngagement });
    if (saint.collect) segs.push({ id: "collect", label: "Collect", text: saint.collect });
    return segs;
  }, [saint, lifeText, contributions, feastEngagement]);

  const narration = useNarration({ segments });
  useRegisterNarration(narration, `Listen · ${saint.name}`, false, "splash-altar");
  const speaking = narration.status !== "idle";
  const nameWords = countWords(saint.name);
  const activeId = speaking ? narration.current?.id : undefined;

  const rankLabel = saint.rank === "feria" ? "Feria" : saint.rank.charAt(0).toUpperCase() + saint.rank.slice(1);
  const showFacts = Boolean(canonization || patronage);

  return (
    <div
      className="pw-saints-pad"
      style={{ maxWidth: 480, margin: "0 auto", padding: "32px 20px 64px", display: "flex", flexDirection: "column", alignItems: "center", gap: 0, position: "relative", overflow: "hidden" }}
    >
      {/* Decorative background watermark */}
      <div style={{ position: "absolute", top: -30, right: -40, pointerEvents: "none", zIndex: 0 }}>
        <Illustration name="splash-altar" size={360} invertOnDark opacity={0.35} />
      </div>

      {/* Saint name */}
      <div
        className="pw-reveal pw-saint-name"
        style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 40, color: "var(--ink)", letterSpacing: "-.02em", textAlign: "center", lineHeight: 1.08, marginBottom: 10, position: "relative", zIndex: 1 }}
      >
        {saint.name}
      </div>

      {/* Subtitle */}
      {saint.title && (
        <div style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: 16, color: "var(--stone-400)", textAlign: "center", lineHeight: 1.5, marginBottom: 16, position: "relative", zIndex: 1 }}>
          {saint.title}
        </div>
      )}

      {/* Season badge */}
      <div style={{ marginBottom: 28, position: "relative", zIndex: 1 }}>
        <SeasonBadge season={badgeSeason(saint.color)}>{rankLabel}</SeasonBadge>
      </div>

      {/* Voice player */}
      {segments.length > 0 && (
        <div style={{ width: "100%", marginBottom: 28, position: "relative", zIndex: 1 }}>
          <ListenButton narration={narration} label={`Listen to ${saint.name}`} />
        </div>
      )}

      {/* Fleuron divider */}
      <div style={{ marginBottom: 28, position: "relative", zIndex: 1 }}>
        <Fleuron width={220} />
      </div>

      {/* Life & history */}
      {lifeText && (
        <Section kicker="The Life" text={lifeText} dropcap
          active={activeId === "life"} wordIndex={narration.wordIndex} wordOffset={nameWords} />
      )}

      {/* Contributions */}
      {contributions && (
        <Section kicker="What they did" text={contributions}
          active={activeId === "contrib"} wordIndex={narration.wordIndex} />
      )}

      {/* Canonization + patronage */}
      {showFacts && (
        <div style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: 24, marginBottom: 30, position: "relative", zIndex: 1 }}>
          {canonization && <Fact kicker="Canonized" text={canonization} />}
          {patronage && patronage !== "—" && <Fact kicker="Patron of" text={patronage} />}
        </div>
      )}

      {/* Keeping the feast */}
      {feastEngagement && (
        <Section kicker="Keeping the Feast" text={feastEngagement}
          active={activeId === "feast"} wordIndex={narration.wordIndex} />
      )}

      {/* While the grounded profile is being researched */}
      {loadingProfile && !isFeria && !contributions && (
        <>
          <div style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: 14, color: "var(--stone-400)", marginBottom: 18, position: "relative", zIndex: 1 }}>
            Researching credible Catholic sources…
          </div>
          <Shimmer />
          <Shimmer />
        </>
      )}

      {/* Collect card */}
      {saint.collect && (
        <div style={{ width: "100%", background: "var(--gold-faint)", borderRadius: 14, padding: "24px 28px", boxShadow: "var(--shadow-sm)", position: "relative", zIndex: 1, marginBottom: sources.length ? 28 : 0 }}>
          <Kicker style={{ marginBottom: 12 }}>Collect</Kicker>
          <SpokenText
            as="p"
            text={saint.collect}
            active={activeId === "collect"}
            wordIndex={narration.wordIndex}
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 18, lineHeight: 1.65, color: "var(--ink-700)", margin: 0 }}
          />
        </div>
      )}

      {/* Sources — the citations the profile was grounded in */}
      {sources.length > 0 && (
        <div style={{ width: "100%", position: "relative", zIndex: 1 }}>
          <Kicker style={{ marginBottom: 12 }}>Sources</Kicker>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sources.slice(0, 6).map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink-700)", textDecoration: "none", lineHeight: 1.4 }}
              >
                <LucideIcon name="external-link" size={14} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
              </a>
            ))}
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: 12.5, color: "var(--stone-400)", marginTop: 14, lineHeight: 1.5 }}>
            Compiled with AI from the sources above. Verify before citing.
          </div>
        </div>
      )}
    </div>
  );
}
