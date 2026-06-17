// Builds src/data/office.ts — a prayable Liturgy of the Hours assembled entirely
// from public-domain texts. Psalms and the Gospel canticles are pulled from the
// bundled Douay–Rheims (src/data/dra.json); the hymns are J.M. Neale's
// public-domain translations of the traditional Latin office hymns; the ordinary
// (versicles, readings, responsories, intercessions, collects) is traditional.
//
// This is a fuller, fixed devotional form of each hour — hymn, psalmody, reading,
// responsory, gospel canticle, intercessions, the Lord's Prayer, and collect —
// not the date-varying 4-week ICEL psalter (that text is licensed).
// Run: node scripts/build-office.mjs

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
const OPEN_LIPS = "O Lord, open thou my lips, and my mouth shall declare thy praise.";

const OUR_FATHER =
  "Our Father, who art in heaven, hallowed be thy name; thy kingdom come, thy will be done, on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.";

const TE_DEUM =
  "We praise thee, O God: we acknowledge thee to be the Lord. All the earth doth worship thee, the Father everlasting. To thee all Angels cry aloud, the Heavens and all the Powers therein. To thee Cherubim and Seraphim continually do cry: Holy, Holy, Holy, Lord God of Sabaoth; Heaven and earth are full of the majesty of thy glory. The glorious company of the Apostles praise thee. The goodly fellowship of the Prophets praise thee. The noble army of Martyrs praise thee. The holy Church throughout all the world doth acknowledge thee: the Father, of an infinite majesty; thine adorable, true, and only Son; also the Holy Ghost, the Comforter. Thou art the King of Glory, O Christ. Thou art the everlasting Son of the Father. When thou tookest upon thee to deliver man, thou didst not abhor the Virgin's womb. When thou hadst overcome the sharpness of death, thou didst open the kingdom of heaven to all believers. We therefore pray thee, help thy servants, whom thou hast redeemed with thy precious blood. O Lord, save thy people, and bless thine heritage. Govern them, and lift them up for ever. Day by day we magnify thee; and we worship thy name, ever world without end. O Lord, in thee have I trusted: let me never be confounded.";

const SALVE =
  "Hail, holy Queen, Mother of mercy, our life, our sweetness, and our hope. To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us; and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.";

// Hymns — J.M. Neale's public-domain translations of the traditional office
// hymns. Verse lines are separated by " / ".
const HYMN = {
  readings:
    "O Trinity of blessed Light, / O Unity of princely might, / The fiery sun now goes his way; / Shed thou within our hearts thy ray. / To thee our morning song of praise, / To thee our evening prayer we raise; / Thy glory suppliant we adore / For ever and for evermore. / All laud to God the Father be, / All praise, eternal Son, to thee, / All glory, as is ever meet, / To God the Holy Paraclete. Amen.",
  lauds:
    "Now that the daylight fills the sky, / We lift our hearts to God on high, / That he, in all we do or say, / Would keep us free from harm to-day: / May he restrain our tongues from strife, / And shield from anger's din our life, / And guard with watchful care our eyes / From earth's absorbing vanities. / All laud to God the Father be, / All praise, eternal Son, to thee, / All glory, as is ever meet, / To God the Holy Paraclete. Amen.",
  terce:
    "Come, Holy Ghost, who ever One / Reignest with Father and with Son, / It is the hour, our souls possess / With thy full flood of holiness. / Let flesh and heart and lips and mind / Sound forth our witness to mankind; / And love light up our mortal frame, / Till others catch the living flame. / Almighty Father, hear our cry / Through Jesus Christ our Lord most high, / Who with the Holy Ghost and thee / Doth live and reign eternally. Amen.",
  sext:
    "O God of truth, O Lord of might, / Who orderest time and change aright, / And send'st the early morning ray, / And light'st the glow of perfect day: / Extinguish thou each sinful fire, / And banish every ill desire; / And while thou keep'st the body whole, / Shed forth thy peace upon the soul. / Almighty Father, hear our cry / Through Jesus Christ our Lord most high, / Who with the Holy Ghost and thee / Doth live and reign eternally. Amen.",
  none:
    "O God, unchangeable and true, / Of all the Light and Life the source, / The day with smiling beams renew, / And lead it through its destined course: / And grant that when the world is dim, / And life's last hour is drawing nigh, / We, gazing on thy light, may pass / Beyond the grave, and never die. / Almighty Father, hear our cry / Through Jesus Christ our Lord most high, / Who with the Holy Ghost and thee / Doth live and reign eternally. Amen.",
  vespers:
    "O blest Creator of the light, / Who mak'st the day with radiance bright, / And o'er the forming world didst call / The light from chaos first of all: / Whose wisdom joined in meet array / The morn and eve, and named them Day: / Night comes with all its darkling fears; / Regard thy people's prayers and tears. / All-holy Father, hear our cry / Through Jesus Christ our Lord most high, / Who with the Holy Ghost and thee / Doth live and reign eternally. Amen.",
  compline:
    "Before the ending of the day, / Creator of the world, we pray / That with thy wonted favour thou / Wouldst be our guard and keeper now. / From all ill dreams defend our eyes, / From nightly fears and fantasies; / Tread under foot our ghostly foe, / That no pollution we may know. / O Father, that we ask be done, / Through Jesus Christ thine only Son, / Who, with the Holy Ghost and thee, / Doth live and reign eternally. Amen.",
};

const INTERCESSIONS_LAUDS =
  "Blessed be Christ, who brings us to the light of a new day; with hearts made glad let us call upon him: Lord, guide our hearts and hands this day. / For your holy Church throughout the world, that you keep her in your truth and peace. / You have brought us safely to this morning: let us walk this day without sin. / All that we are and all that we do, let it give you glory. / Be near to the suffering, the lonely, and the dying, and bring the wanderer home. / Lord, guide our hearts and hands this day.";

const INTERCESSIONS_VESPERS =
  "Let us give thanks to Christ, the unfading Light, and humbly pray: Lord, hear us, and have mercy. / For your holy Church, that you gather and keep her in your peace. / For all who govern the nations, that they serve the common good with justice. / For the sick, the sorrowing, and the dying, that you comfort and heal them. / For ourselves, that the evening of our lives may be without reproach. / For all the faithful departed, that you grant them light and rest. / Lord, hear us, and have mercy.";

const CFG = {
  "Office of Readings": {
    open: OPEN_DEFAULT,
    hymn: HYMN.readings,
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
    open: OPEN_LIPS,
    hymn: HYMN.lauds,
    psalms: [
      { label: "Psalm 63", ref: "Psalm 63 · 1–8", antiphon: "O God, my God, to thee do I watch at the break of day.", book: "Psalm", ch: 63, a: 1, b: 8 },
      { label: "Psalm 100", ref: "Psalm 100", antiphon: "Serve the Lord with gladness; come before him with joyful song.", book: "Psalm", ch: 100, a: 2, b: 5 },
    ],
    reading: { ref: "Romans 13 · 12", text: "The night is passed, and the day is at hand. Let us therefore cast off the works of darkness, and put on the armour of light." },
    responsory: "I will bless the Lord at all times; his praise shall be ever in my mouth.",
    canticle: { label: "The Benedictus", sub: "Canticle of Zechariah", ref: "Luke 1 · 68–79", antiphon: "Blessed be the Lord, the God of Israel, for he hath visited and wrought the redemption of his people.", book: "Luke", ch: 1, a: 68, b: 79 },
    intercessions: INTERCESSIONS_LAUDS,
    ourFather: true,
    prayer: "Almighty God, who hast brought us to the beginning of this day: defend us in the same by thy mighty power, that this day we may fall into no sin, but that all our doings may be ordered by thy governance, to do always that which is righteous in thy sight. Through Christ our Lord. Amen.",
  },
  Terce: {
    open: OPEN_DEFAULT,
    hymn: HYMN.terce,
    psalms: [
      { label: "Psalm 67", ref: "Psalm 67", antiphon: "May God have mercy on us, and bless us.", book: "Psalm", ch: 67, a: 2, b: 7 },
      { label: "Psalm 8", ref: "Psalm 8", antiphon: "O Lord, our Lord, how admirable is thy name in all the earth!", book: "Psalm", ch: 8, a: 2, b: 9 },
    ],
    reading: { ref: "Acts 2 · 4", text: "And they were all filled with the Holy Spirit, and they began to speak the wonderful works of God." },
    responsory: "Come, Holy Spirit, fill the hearts of thy faithful, and kindle in them the fire of thy love.",
    prayer: "O Lord, pour forth thy Spirit upon us at this third hour, as thou didst pour him upon the apostles in tongues of fire; that we, made fervent in thy love, may confess thee before all the world. Through Christ our Lord. Amen.",
  },
  Sext: {
    open: OPEN_DEFAULT,
    hymn: HYMN.sext,
    psalms: [
      { label: "Psalm 121", ref: "Psalm 121", antiphon: "My help is from the Lord, who made heaven and earth.", book: "Psalm", ch: 122, a: 1, b: 8 },
      { label: "Psalm 122", ref: "Psalm 122", antiphon: "I rejoiced when they said to me: Let us go to the house of the Lord.", book: "Psalm", ch: 123, a: 1, b: 5 },
    ],
    reading: { ref: "2 Corinthians 6 · 2", text: "Behold, now is the acceptable time; behold, now is the day of salvation." },
    responsory: "The Lord is my light and my salvation; whom shall I fear?",
    prayer: "O God, who at the sixth hour didst stretch out thine arms upon the Cross for the salvation of the world: kindle in us at this midday the fire of thy charity, that all our works may be pleasing unto thee. Through Christ our Lord. Amen.",
  },
  None: {
    open: OPEN_DEFAULT,
    hymn: HYMN.none,
    psalms: [
      { label: "Psalm 125", ref: "Psalm 125", antiphon: "They that trust in the Lord shall be as Mount Sion, which cannot be moved.", book: "Psalm", ch: 126, a: 1, b: 6 },
      { label: "Psalm 130", ref: "Psalm 130 · De Profundis", antiphon: "Out of the depths I have cried to thee, O Lord.", book: "Psalm", ch: 131, a: 1, b: 8 },
    ],
    reading: { ref: "Colossians 3 · 17", text: "All whatsoever you do in word or in work, do all in the name of the Lord Jesus Christ, giving thanks to God and the Father by him." },
    responsory: "My soul yearns and pines for the courts of the Lord.",
    prayer: "O God, who at the ninth hour didst will that thy Son should taste death for us all: grant that, as the day declines, our hearts may turn ever more wholly unto thee, who livest and reignest, world without end. Amen.",
  },
  Vespers: {
    open: OPEN_DEFAULT,
    hymn: HYMN.vespers,
    psalms: [
      { label: "Psalm 113", ref: "Psalm 113", antiphon: "Praise the Lord, ye servants of the Lord; blessed be the name of the Lord.", book: "Psalm", ch: 113, a: 1, b: 9 },
      { label: "Psalm 117", ref: "Psalm 117", antiphon: "O praise the Lord, all ye nations; for his mercy is confirmed upon us.", book: "Psalm", ch: 117, a: 1, b: 2 },
    ],
    reading: { ref: "2 Corinthians 1 · 3–4", text: "Blessed be the God and Father of our Lord Jesus Christ, the Father of mercies, and the God of all comfort, who comforteth us in all our tribulation." },
    responsory: "Let my prayer come like incense before thee, the lifting up of my hands like the evening sacrifice.",
    canticle: { label: "The Magnificat", sub: "Canticle of Mary", ref: "Luke 1 · 46–55", antiphon: "My soul doth magnify the Lord, and my spirit hath rejoiced in God my Saviour.", book: "Luke", ch: 1, a: 46, b: 55 },
    intercessions: INTERCESSIONS_VESPERS,
    ourFather: true,
    prayer: "Lighten our darkness, we beseech thee, O Lord; and by thy great mercy defend us from all perils and dangers of this night. Through Christ our Lord. Amen.",
  },
  Compline: {
    open: OPEN_DEFAULT,
    hymn: HYMN.compline,
    psalms: [
      { label: "Psalm 4", ref: "Psalm 4", antiphon: "Have mercy on me, O Lord, and hear my prayer.", book: "Psalm", ch: 4, a: 2, b: 9 },
      { label: "Psalm 91", ref: "Psalm 91 · 1–11", antiphon: "He that dwelleth in the aid of the Most High shall abide under the protection of the God of heaven.", book: "Psalm", ch: 91, a: 1, b: 11 },
    ],
    reading: { ref: "1 Peter 5 · 8–9", text: "Be sober and watch: because your adversary the devil, as a roaring lion, goeth about seeking whom he may devour: whom resist ye, strong in faith." },
    responsory: "Into thy hands, O Lord, I commend my spirit.",
    canticle: { label: "The Nunc Dimittis", sub: "Canticle of Simeon", ref: "Luke 2 · 29–32", antiphon: "Protect us, Lord, as we stay awake; watch over us as we sleep, that awake we may keep watch with Christ, and asleep rest in his peace.", book: "Luke", ch: 2, a: 29, b: 32 },
    prayer: "Visit, we beseech thee, O Lord, this dwelling, and drive far from it all snares of the enemy; let thy holy angels dwell herein to preserve us in peace, and let thy blessing be upon us always. Through Christ our Lord. Amen.",
    marian: { label: "Antiphon to Our Lady", sub: "Salve Regina", text: SALVE },
  },
};

const DISMISSAL = "Let us bless the Lord. Thanks be to God.";

function build(name, cfg) {
  const parts = [];
  parts.push({ type: "versicle", text: cfg.open });
  parts.push({ type: "versicle", text: GLORY });
  if (cfg.hymn) parts.push({ type: "hymn", label: "Hymn", text: cfg.hymn.replace(/ \/ /g, "\n") });
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
  if (cfg.intercessions) parts.push({ type: "intercession", label: "Intercessions", text: cfg.intercessions.replace(/ \/ /g, "\n") });
  if (cfg.ourFather) parts.push({ type: "prayer", label: "The Lord's Prayer", text: OUR_FATHER });
  parts.push({ type: "prayer", label: "Concluding Prayer", text: cfg.prayer });
  if (cfg.marian) parts.push({ type: "canticle", label: cfg.marian.label, sub: cfg.marian.sub, text: cfg.marian.text });
  parts.push({ type: "versicle", text: DISMISSAL });
  return parts;
}

const OFFICE = {};
for (const [name, cfg] of Object.entries(CFG)) OFFICE[name] = build(name, cfg);

const header = `// AUTO-GENERATED by scripts/build-office.mjs — do not edit by hand.
// A prayable Liturgy of the Hours from public-domain texts (Douay–Rheims psalms
// and canticles, Neale's hymn translations, and the traditional ordinary). Not
// the licensed ICEL psalter.

export type OfficePartType = "versicle" | "hymn" | "psalm" | "canticle" | "reading" | "responsory" | "intercession" | "prayer";

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
