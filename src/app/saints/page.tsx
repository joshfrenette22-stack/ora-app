"use client";

import { HaloRays, Fleuron } from "@/components/Sacred";
import { SeasonBadge, Kicker } from "@/components/UI";

export default function SaintsPage() {
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
      {/* HaloRays monogram */}
      <div style={{ position: "relative", width: 150, height: 150, display: "grid", placeItems: "center", marginBottom: 24 }}>
        <HaloRays
          size={150}
          style={{ color: "var(--gold)", position: "absolute", inset: 0 }}
        />
        <span
          style={{
            fontFamily: "var(--font-ornament)",
            fontSize: 48,
            fontWeight: 400,
            color: "var(--gold-deep)",
            lineHeight: 1,
            position: "relative",
            zIndex: 1,
            userSelect: "none",
          }}
        >
          E
        </span>
      </div>

      {/* Saint name */}
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 38,
          color: "var(--ink)",
          textTransform: "uppercase",
          letterSpacing: ".06em",
          textAlign: "center",
          lineHeight: 1.1,
          marginBottom: 10,
        }}
      >
        St. Ephrem
      </div>

      {/* Subtitle */}
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
        the Syrian &middot; Deacon &amp; Doctor &middot; c.&thinsp;306&ndash;373
      </div>

      {/* Season badge */}
      <div style={{ marginBottom: 28 }}>
        <SeasonBadge season="gold">Memorial · White</SeasonBadge>
      </div>

      {/* Fleuron divider */}
      <div style={{ marginBottom: 28 }}>
        <Fleuron width={220} />
      </div>

      {/* Hagiography paragraph with drop cap */}
      <p
        className="pw-dropcap"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 18,
          lineHeight: 1.72,
          color: "var(--ink-700)",
          textAlign: "left",
          margin: "0 0 32px",
          width: "100%",
        }}
      >
        Deacon, hymnographer, and Doctor of the Church, called the &ldquo;Harp of the Holy Spirit.&rdquo; His hymns and metrical homilies defended the faith against the heresies of his day and adorned the liturgy of the Syriac Church with a poetry that is still sung today. He is honoured as a teacher whose theology was sung rather than argued.
      </p>

      {/* Collect card */}
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
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
            fontSize: 16.5,
            lineHeight: 1.7,
            color: "var(--ink-700)",
            margin: 0,
          }}
        >
          O God, who didst illumine thy Church with the learning and sanctity of the Deacon Saint Ephrem, grant that we, following his example, may ever seek thee above all things and delight in singing thy praises. Through our Lord Jesus Christ, thy Son, who liveth and reigneth with thee in the unity of the Holy Spirit, God, for ever and ever. Amen.
        </p>
      </div>
    </div>
  );
}
