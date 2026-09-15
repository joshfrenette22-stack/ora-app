/** The Chaplet of Divine Mercy — given to St. Faustina Kowalska (Diary 476,
 *  1935) and prayed especially at the three o'clock hour, the Hour of Great
 *  Mercy. It is prayed on ordinary rosary beads: opening prayers on the
 *  crucifix and first three beads, then five decades of one large bead
 *  ("Eternal Father…") and ten small beads ("For the sake of his sorrowful
 *  Passion…"), closing with the thrice-repeated Trisagion.
 *
 *  The whole chaplet is flattened to an ordered list of single-screen steps so
 *  the page can step through it interactively or read it aloud — the same shape
 *  as the Rosary and the Chaplet of the Holy Face. Each line's text, joined,
 *  is exactly what is read aloud. */

import { ROSARY_PRAYERS } from "./content";
import { countWords } from "@/lib/words";

export interface DMLine { a?: string; text: string }

export interface DMStep {
  group: string;       // section id — for the bead tracker and the jump list
  kicker: string;      // small label above the title
  title: string;       // large heading
  beadLabel: string;   // gold label above the prayer ("" hides it)
  large: boolean;      // a large bead (diamond) vs a small bead / plain step (circle)
  lines: DMLine[];     // shown on screen
  speech: string;      // read aloud (a spoken announcement, then the lines, joined)
  speechOffset: number; // words spoken before the first line begins (for highlight sync)
}

const SIGN = ROSARY_PRAYERS.signCross;

const EXPIRED =
  "Thou didst expire, O Jesus, but the source of life gushed forth for souls, and an ocean of mercy opened up for the whole world. O Fount of Life, unfathomable Divine Mercy, envelop the whole world and empty thyself out upon us.";
const BLOOD_WATER =
  "O Blood and Water, which gushed forth from the Heart of Jesus as a fount of mercy for us, I trust in you.";
const ETERNAL_FATHER =
  "Eternal Father, I offer thee the Body and Blood, Soul and Divinity of thy dearly beloved Son, our Lord Jesus Christ, in atonement for our sins and those of the whole world.";
const PASSION =
  "For the sake of his sorrowful Passion, have mercy on us and on the whole world.";
const TRISAGION_V = "Holy God, Holy Mighty One, Holy Immortal One,";
const TRISAGION_R = "have mercy on us and on the whole world.";
const ETERNAL_GOD =
  "Eternal God, in whom mercy is endless and the treasury of compassion inexhaustible, look kindly upon us and increase thy mercy in us, that in difficult moments we might not despair nor become despondent, but with great confidence submit ourselves to thy holy will, which is love and mercy itself. Amen.";
const TRUST = "Jesus, I trust in you.";

function mk(group: string, kicker: string, title: string, beadLabel: string, lines: DMLine[], large = false, announce = ""): DMStep {
  const spoken = lines.map((l) => l.text).join(" ");
  return {
    group, kicker, title, beadLabel, large, lines,
    speech: announce ? `${announce} ${spoken}` : spoken,
    speechOffset: announce ? countWords(announce) : 0,
  };
}

const ORDINALS = ["First", "Second", "Third", "Fourth", "Fifth"];

export const DIVINE_MERCY_STEPS: DMStep[] = (() => {
  const steps: DMStep[] = [];

  // Opening — on the crucifix and the first three beads
  steps.push(mk("open", "The Chaplet of Divine Mercy", "The Sign of the Cross", "On the Crucifix", [{ text: SIGN }]));
  steps.push(mk("open", "Opening Prayer", "Thou Didst Expire, O Jesus", "", [{ text: EXPIRED }]));
  for (let n = 1; n <= 3; n++) {
    steps.push(mk("open", "Opening Prayer", "O Blood and Water", `Said Thrice · ${n} of 3`, [{ text: BLOOD_WATER }]));
  }
  steps.push(mk("open", "On the First Three Beads", "Our Father", "First Bead", [{ text: ROSARY_PRAYERS.our }]));
  steps.push(mk("open", "On the First Three Beads", "Hail Mary", "Second Bead", [{ text: ROSARY_PRAYERS.hail }]));
  steps.push(mk("open", "On the First Three Beads", "The Apostles' Creed", "Third Bead", [{ text: ROSARY_PRAYERS.creed }]));

  // The five decades — each: one large bead, then ten small beads. Like the
  // Rosary's mystery announcements, each decade is announced aloud before the
  // large-bead prayer.
  ORDINALS.forEach((ord, i) => {
    const g = `decade-${i + 1}`;
    const kicker = `The ${ord} Decade`;
    steps.push(mk(g, kicker, "Eternal Father", "Large Bead", [{ text: ETERNAL_FATHER }], true, `The ${ord} Decade.`));
    for (let n = 1; n <= 10; n++) {
      steps.push(mk(g, kicker, "For the Sake of His Sorrowful Passion", `Small Bead · ${n} of 10`, [{ text: PASSION }]));
    }
  });

  // Conclusion — the Trisagion, said thrice
  for (let n = 1; n <= 3; n++) {
    steps.push(mk("conclude", "Concluding Prayers · Said Thrice", "Holy God", `${n} of 3`, [
      { a: "℣.", text: TRISAGION_V },
      { a: "℟.", text: TRISAGION_R },
    ]));
  }
  steps.push(mk("conclude", "Concluding Prayers", "Eternal God", "", [{ text: ETERNAL_GOD }]));
  steps.push(mk("conclude", "Concluding Prayers", "Jesus, I Trust in You", "Said Thrice", [
    { text: TRUST }, { text: TRUST }, { text: TRUST },
  ]));
  steps.push(mk("conclude", "The Chaplet of Divine Mercy", "The Sign of the Cross", "To Conclude", [{ text: SIGN }]));

  return steps;
})();

export interface DMSection { id: string; label: string; index: number }

const SECTION_LABEL: Record<string, string> = {
  open: "Opening Prayers",
  "decade-1": "First Decade", "decade-2": "Second Decade", "decade-3": "Third Decade",
  "decade-4": "Fourth Decade", "decade-5": "Fifth Decade",
  conclude: "Concluding Prayers",
};

/** First step index of each section, for the jump list. */
export const DIVINE_MERCY_SECTIONS: DMSection[] = (() => {
  const out: DMSection[] = [];
  const seen = new Set<string>();
  DIVINE_MERCY_STEPS.forEach((s, i) => {
    if (seen.has(s.group)) return;
    seen.add(s.group);
    out.push({ id: s.group, label: SECTION_LABEL[s.group] ?? s.group, index: i });
  });
  return out;
})();

/** The whole chaplet as one spoken text — for the playlist catalogue. */
export function divineMercyChapletText(): string {
  return DIVINE_MERCY_STEPS.map((s) => s.speech).join(" ");
}
