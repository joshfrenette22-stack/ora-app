// Builds src/data/office.ts — a prayable Liturgy of the Hours assembled entirely
// from public-domain texts. Psalms and the Gospel canticles are pulled from the
// bundled Douay–Rheims (src/data/dra.json); the ordinary (versicles, readings,
// responsories, collects, dismissals) are traditional public-domain texts.
//
// This is a fixed, devotional "ordinary" of each hour — not the date-varying
// 4-week ICEL psalter (that text is licensed). Run: node scripts/build-office.mjs

import { readFileSync, writeFileSync } from "node:fs";

const dra = JSON.parse(readFileSync(new URL("../src/data/dra.json", import.meta.url), "utf8"));

function passage(book, ch, a, b) {
  const chapter = dra[book]?.[String(ch)] ?? {};
  const out = [];
  for (let v = a; v <= b; v++) if (chapter[String(v)]) out.push(chapter[String(v)]);
  return out.join(" ");
}

const GLORY =
  "Glory be to the Father, and to the Son, and to the Holy Spirit: as it was in the beginning, is now, and ever shall be, world without end. Amen.";
const OPEN_DEFAULT = "O God, come to my assistance. O Lord, make haste to help me.";

const TE_DEUM =
  "We praise thee, O God: we acknowledge thee to be the Lord. All the earth doth worship thee, the Father everlasting. To thee all Angels cry aloud, the Heavens and all the Powers therein. To thee Cherubim and Seraphim continually do cry: Holy, Holy, Holy, Lord God of Sabaoth; Heaven and earth are full of the majesty of thy glory. The glorious company of the Apostles praise thee. The goodly fellowship of the Prophets praise thee. The noble army of Martyrs praise thee. The holy Church throughout all the world doth acknowledge thee: the Father, of an infinite majesty; thine adorable, true, and only Son; also the Holy Ghost, the Comforter. Thou art the King of Glory, O Christ. Thou art the everlasting Son of the Father. When thou tookest upon thee to deliver man, thou didst not abhor the Virgin's womb. When thou hadst overcome the sharpness of death, thou didst open the kingdom of heaven to all believers. We therefore pray thee, help thy servants, whom thou hast redeemed with thy precious blood. O Lord, save thy people, and bless thine heritage. Govern them, and lift them up for ever. Day by day we magnify thee; and we worship thy name, ever world without end. O Lord, in thee have I trusted: let me never be confounded.";

const CFG = {
  "Office of Readings": {
    open: "O Lord, open thou my lips, and my mouth shall declare thy praise.",
    psalms: [
      { label: "Invitatory · Psalm 95", ref: "Psalm 95", antiphon: "Come, let us worship the Lord, the great King above all gods.", book: "Psalm", ch: 95, a: 1, b: 7 },
      { label: "Psalm 1", ref: "Psalm 1", antiphon: "Blessed is the man whose delight is in the law of the Lord.", book: "Psalm", ch: 1, a: 1, b: 6 },
      { label: "Psalm 103", ref: "Psalm 103 · 1–5", antiphon: "Bless the Lord, O my soul, and forget not all his benefits.", book: "Psalm", ch: 103, a: 1, b: 5 },
    ],
    readingLabel: "First Reading",
    reading: { ref: "Romans 8 · 28–32", text: "We know that to them that love God all things work together unto good, to such as, according to his purpose, are called to be saints. For whom he foreknew, he also predestinated to be made conformable to the image of his Son, that he might be the firstborn amongst many brethren. What shall we then say to these things? If God be for us, who is against us? He that spared not even his own Son, but delivered him up for us all, how hath he not also, with him, given us all things?" },
    responsory: "If God be for us, who is against us? In him who loved us we are more than conquerors.",
    reading2: { label: "Second Reading", ref: "From the Confessions of Saint Augustine", text: "Great art thou, O Lord, and greatly to be praised; great is thy power, and of thy wisdom there is no end. And man, being a part of thy creation, desires to praise thee. Thou awakest us to delight in thy praise; for thou madest us for thyself, and our heart is restless, until it rest in thee. Grant me, Lord, to know and understand which is first, to call on thee, or to praise thee; and, again, to know thee, or to call on thee." },
    responsory2: "Thou madest us for thyself, O Lord, and our heart is restless until it rest in thee.",
    canticle: { label: "Te Deum", sub: "A Hymn of Praise", text: TE_DEUM },
    prayer: "O God, who hast taught the hearts of thy faithful people by sending to them the light of thy Holy Spirit: grant us by the same Spirit to have a right judgment in all things, and evermore to rejoice in his holy comfort. Through Christ our Lord. Amen.",
  },
  Lauds: {
    open: "O Lord, open thou my lips, and my mouth shall declare thy praise.",
    psalms: [
      { label: "Psalm 63", ref: "Psalm 63 · 1–8", antiphon: "O God, my God, to thee do I watch at the break of day.", book: "Psalm", ch: 63, a: 1, b: 8 },
    ],
    reading: { ref: "Romans 13 · 12", text: "The night is passed, and the day is at hand. Let us therefore cast off the works of darkness, and put on the armour of light." },
    responsory: "I will bless the Lord at all times; his praise shall be ever in my mouth.",
    canticle: { label: "The Benedictus", sub: "Canticle of Zechariah", ref: "Luke 1 · 68–79", antiphon: "Blessed be the Lord, the God of Israel, for he hath visited and wrought the redemption of his people.", book: "Luke", ch: 1, a: 68, b: 79 },
    prayer: "Almighty God, who hast brought us to the beginning of this day: defend us in the same by thy mighty power, that this day we may fall into no sin, but that all our doings may be ordered by thy governance, to do always that which is righteous in thy sight. Through Christ our Lord. Amen.",
  },
  Terce: {
    open: OPEN_DEFAULT,
    psalms: [
      { label: "Psalm 67", ref: "Psalm 67 · 1–7", antiphon: "May God have mercy on us, and bless us.", book: "Psalm", ch: 67, a: 1, b: 7 },
    ],
    reading: { ref: "Acts 2 · 4", text: "And they were all filled with the Holy Spirit, and they began to speak the wonderful works of God." },
    responsory: "Come, Holy Spirit, fill the hearts of thy faithful, and kindle in them the fire of thy love.",
    prayer: "O Lord, pour forth thy Spirit upon us at this third hour, as thou didst pour him upon the apostles in tongues of fire; that we, made fervent in thy love, may confess thee before all the world. Through Christ our Lord. Amen.",
  },
  Sext: {
    open: OPEN_DEFAULT,
    psalms: [
      { label: "Psalm 121", ref: "Psalm 121 · 1–8", antiphon: "My help is from the Lord, who made heaven and earth.", book: "Psalm", ch: 121, a: 1, b: 8 },
    ],
    reading: { ref: "2 Corinthians 6 · 2", text: "Behold, now is the acceptable time; behold, now is the day of salvation." },
    responsory: "The Lord is my light and my salvation; whom shall I fear?",
    prayer: "O God, who at the sixth hour didst stretch out thine arms upon the Cross for the salvation of the world: kindle in us at this midday the fire of thy charity, that all our works may be pleasing unto thee. Through Christ our Lord. Amen.",
  },
  None: {
    open: OPEN_DEFAULT,
    psalms: [
      { label: "Psalm 126", ref: "Psalm 126 · 1–6", antiphon: "They that sow in tears shall reap in joy.", book: "Psalm", ch: 126, a: 1, b: 6 },
    ],
    reading: { ref: "Colossians 3 · 17", text: "All whatsoever you do in word or in work, do all in the name of the Lord Jesus Christ, giving thanks to God and the Father by him." },
    responsory: "My soul yearns and pines for the courts of the Lord.",
    prayer: "O God, who at the ninth hour didst will that thy Son should taste death for us all: grant that, as the day declines, our hearts may turn ever more wholly unto thee, who livest and reignest, world without end. Amen.",
  },
  Vespers: {
    open: OPEN_DEFAULT,
    psalms: [
      { label: "Psalm 141", ref: "Psalm 141 · 1–5", antiphon: "Let my prayer be directed as incense in thy sight, O Lord.", book: "Psalm", ch: 141, a: 1, b: 5 },
    ],
    reading: { ref: "2 Corinthians 1 · 3–4", text: "Blessed be the God and Father of our Lord Jesus Christ, the Father of mercies, and the God of all comfort, who comforteth us in all our tribulation." },
    responsory: "Let my prayer come like incense before thee, the lifting up of my hands like the evening sacrifice.",
    canticle: { label: "The Magnificat", sub: "Canticle of Mary", ref: "Luke 1 · 46–55", antiphon: "My soul doth magnify the Lord, and my spirit hath rejoiced in God my Saviour.", book: "Luke", ch: 1, a: 46, b: 55 },
    prayer: "Lighten our darkness, we beseech thee, O Lord; and by thy great mercy defend us from all perils and dangers of this night. Through Christ our Lord. Amen.",
  },
  Compline: {
    open: OPEN_DEFAULT,
    psalms: [
      { label: "Psalm 91", ref: "Psalm 91 · 1–11", antiphon: "He that dwelleth in the aid of the Most High shall abide under the protection of the God of heaven.", book: "Psalm", ch: 91, a: 1, b: 11 },
    ],
    reading: { ref: "1 Peter 5 · 8–9", text: "Be sober and watch: because your adversary the devil, as a roaring lion, goeth about seeking whom he may devour: whom resist ye, strong in faith." },
    responsory: "Into thy hands, O Lord, I commend my spirit.",
    canticle: { label: "The Nunc Dimittis", sub: "Canticle of Simeon", ref: "Luke 2 · 29–32", antiphon: "Protect us, Lord, as we stay awake; watch over us as we sleep, that awake we may keep watch with Christ, and asleep rest in his peace.", book: "Luke", ch: 2, a: 29, b: 32 },
    prayer: "Visit, we beseech thee, O Lord, this dwelling, and drive far from it all snares of the enemy; let thy holy angels dwell herein to preserve us in peace, and let thy blessing be upon us always. Through Christ our Lord. Amen.",
  },
};

const DISMISSAL = "Let us bless the Lord. Thanks be to God.";

function build(name, cfg) {
  const parts = [];
  parts.push({ type: "versicle", text: cfg.open });
  parts.push({ type: "versicle", text: GLORY });
  for (const p of cfg.psalms) {
    parts.push({ type: "psalm", label: p.label, ref: p.ref, antiphon: p.antiphon, text: passage(p.book, p.ch, p.a, p.b) });
  }
  parts.push({ type: "reading", label: cfg.readingLabel ?? "Reading", ref: cfg.reading.ref, text: cfg.reading.text });
  parts.push({ type: "responsory", label: "Responsory", text: cfg.responsory });
  if (cfg.reading2) {
    parts.push({ type: "reading", label: cfg.reading2.label ?? "Second Reading", ref: cfg.reading2.ref, text: cfg.reading2.text });
    if (cfg.responsory2) parts.push({ type: "responsory", label: "Responsory", text: cfg.responsory2 });
  }
  if (cfg.canticle) {
    const c = cfg.canticle;
    // A canticle is either pulled from the DRA (book/ch) or supplied literally (Te Deum).
    parts.push({ type: "canticle", label: c.label, sub: c.sub, ref: c.ref, antiphon: c.antiphon, text: c.text ?? passage(c.book, c.ch, c.a, c.b) });
  }
  parts.push({ type: "prayer", label: "Concluding Prayer", text: cfg.prayer });
  parts.push({ type: "versicle", text: DISMISSAL });
  return parts;
}

const OFFICE = {};
for (const [name, cfg] of Object.entries(CFG)) OFFICE[name] = build(name, cfg);

const header = `// AUTO-GENERATED by scripts/build-office.mjs — do not edit by hand.
// A prayable Liturgy of the Hours from public-domain texts (Douay–Rheims psalms
// and canticles + the traditional ordinary). Not the licensed ICEL psalter.

export type OfficePartType = "versicle" | "psalm" | "canticle" | "reading" | "responsory" | "prayer";

export interface OfficePart {
  type: OfficePartType;
  label?: string;
  sub?: string;
  ref?: string;
  antiphon?: string;
  text: string;
}

export const OFFICE: Record<string, OfficePart[]> = ${JSON.stringify(OFFICE, null, 2)};
`;

writeFileSync(new URL("../src/data/office.ts", import.meta.url), header);
const total = Object.values(OFFICE).reduce((n, p) => n + p.length, 0);
console.log(`Wrote src/data/office.ts — ${Object.keys(OFFICE).length} hours, ${total} parts`);
