/** The Chaplet of the Holy Face — given to Sister Mary of St. Peter (a Discalced
 *  Carmelite of Tours, 19th c.); the Archconfraternity was approved by Pope
 *  Leo XIII in 1884. It honours the five senses of Our Lord, the thirty years of
 *  His private life and the three of His public life, prayed in reparation for
 *  blasphemy. The physical chaplet has five groups of one large + six small beads.
 *
 *  The whole chaplet is flattened to an ordered list of single-screen steps so
 *  the page can step through it interactively or read it aloud — the same shape
 *  as the Rosary. Each line's text, joined, is exactly what is read aloud. */

export interface HFLine { a?: string; text: string }

export interface HFStep {
  group: string;       // section id — for the bead tracker and the jump list
  kicker: string;      // small label above the title
  title: string;       // large heading
  beadLabel: string;   // gold label above the prayer ("" hides it)
  large: boolean;      // a large bead (diamond) vs a small bead / plain step (circle)
  lines: HFLine[];     // shown on screen
  speech: string;      // read aloud (the lines, joined)
}

const SIGN = "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.";
const GLORY_V = "Glory be to the Father, and to the Son, and to the Holy Ghost.";
const GLORY_R = "As it was in the beginning, is now, and ever shall be, world without end. Amen.";
const MERCY = " My Jesus, mercy.";
const ARISE_V = "Arise, O Lord, and let Thine enemies be scattered.";
const ARISE_R = "And let those that hate Thee fly before Thy Face.";

function mk(group: string, kicker: string, title: string, beadLabel: string, lines: HFLine[], large = false): HFStep {
  return { group, kicker, title, beadLabel, large, lines, speech: lines.map((l) => l.text).join(" ") };
}

const SENSES = ["touch", "hearing", "sight", "smell", "taste"] as const;
const SENSE_TITLE: Record<string, string> = {
  touch: "Sense of Touch", hearing: "Sense of Hearing", sight: "Sense of Sight",
  smell: "Sense of Smell", taste: "Sense of Taste",
};
const ORDINALS = ["First", "Second", "Third", "Fourth", "Fifth"];

function ariseStep(group: string, title: string, n: number, of: number): HFStep {
  return mk(group, "Combating the Enemies of God", title, `Small Bead · ${n} of ${of}`, [
    { a: "℣.", text: ARISE_V },
    { a: "℟.", text: ARISE_R },
  ]);
}

export const HOLY_FACE_STEPS: HFStep[] = (() => {
  const steps: HFStep[] = [];

  // Opening
  steps.push(mk("open", "The Holy Face", "The Sign of the Cross", "On the Crucifix", [{ text: SIGN }]));
  steps.push(mk("open", "The Holy Face", "O God, Come to My Assistance", "", [
    { a: "℣.", text: "O God, come to my assistance." },
    { a: "℟.", text: "O Lord, make haste to help me." },
    { a: "℣.", text: GLORY_V },
    { a: "℟.", text: GLORY_R },
  ]));

  // The five senses — each: one large bead, then six small beads
  SENSES.forEach((sense, i) => {
    const g = `sense-${sense}`;
    const title = SENSE_TITLE[sense];
    steps.push(mk(g, "In Honor of the Five Senses", title, `${ORDINALS[i]} Large Bead`, [
      { text: `In honor of His sense of ${sense}:` },
      { a: "℣.", text: GLORY_V },
      { a: "℟.", text: GLORY_R + MERCY },
    ], true));
    for (let n = 1; n <= 6; n++) steps.push(ariseStep(g, title, n, 6));
  });

  // Centre large bead — the three years of His public life, then three small beads
  steps.push(mk("center", "The Public Life of Our Lord", "Three Years of Public Life", "Center Large Bead", [
    { text: "In honor of the three years of His public life:" },
    { a: "℣.", text: GLORY_V },
    { a: "℟.", text: GLORY_R + MERCY },
  ], true));
  for (let n = 1; n <= 3; n++) steps.push(ariseStep("center", "Three Years of Public Life", n, 3));

  // Seven Sorrows of Our Lady — seven Glory Be
  for (let n = 1; n <= 7; n++) {
    steps.push(mk("sorrows", "In Honor of the Seven Sorrows of Our Lady", "The Seven Sorrows of Our Lady", `${n} of 7`, [
      { a: "℣.", text: GLORY_V },
      { a: "℟.", text: GLORY_R },
    ]));
  }

  // Seven Last Words of Our Lord — seven Glory Be
  for (let n = 1; n <= 7; n++) {
    steps.push(mk("words", "In Honor of the Seven Last Words", "The Seven Last Words of Our Lord", `${n} of 7`, [
      { a: "℣.", text: GLORY_V },
      { a: "℟.", text: GLORY_R },
    ]));
  }

  // On the medal
  steps.push(mk("medal", "On the Medal", "Look Upon the Face of Thy Christ", "", [
    { a: "℣.", text: "O God, our Protector, look down upon us." },
    { a: "℟.", text: "And cast Thine eyes upon the Face of Thy Christ." },
  ]));

  // Concluding prayers
  steps.push(mk("conclude", "Concluding Prayers", "Concluding Prayer", "", [
    { text: "Eternal Father, I offer Thee the Cross of Our Lord Jesus Christ and all the other instruments of His Holy Passion, that Thou may put division in the camp of Thine enemies, for as Thy beloved Son has said, “a kingdom divided against itself shall fall.”" },
    { text: "May the thrice-Holy Name of God overthrow all their plans!" },
    { text: "May the Name of the Living God split them up by disagreements!" },
    { text: "May the terrible Name of the God of Eternity stamp out all their godlessness!" },
    { text: "Lord, I do not desire the death of the sinner, but I want him to be converted and to live. “Father, forgive them, for they know not what they do.”" },
  ]));
  steps.push(mk("conclude", "Concluding Prayers", "The Golden Arrow", "", [
    { text: "May the most holy, most sacred, most adorable, most incomprehensible and unutterable Name of God be always praised, blessed, loved, adored and glorified in heaven, on earth and in the hells, by all the creatures of God and by the Sacred Heart of our Lord Jesus Christ in the Most Holy Sacrament of the Altar. Amen." },
  ]));
  steps.push(mk("conclude", "The Holy Face", "The Sign of the Cross", "To Conclude", [{ text: SIGN }]));

  return steps;
})();

export interface HFSection { id: string; label: string; index: number }

const SECTION_LABEL: Record<string, string> = {
  open: "Opening",
  "sense-touch": "Sense of Touch", "sense-hearing": "Sense of Hearing", "sense-sight": "Sense of Sight",
  "sense-smell": "Sense of Smell", "sense-taste": "Sense of Taste",
  center: "Public Life", sorrows: "Seven Sorrows", words: "Seven Last Words",
  medal: "On the Medal", conclude: "Concluding Prayers",
};

/** First step index of each section, for the jump list. */
export const HOLY_FACE_SECTIONS: HFSection[] = (() => {
  const out: HFSection[] = [];
  const seen = new Set<string>();
  HOLY_FACE_STEPS.forEach((s, i) => {
    if (seen.has(s.group)) return;
    seen.add(s.group);
    out.push({ id: s.group, label: SECTION_LABEL[s.group] ?? s.group, index: i });
  });
  return out;
})();
