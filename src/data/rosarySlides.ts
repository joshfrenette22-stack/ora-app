// AUTO-GENERATED slide data for the Rosary slideshow.
// 183 frames extracted from the original DVD slideshows (Joyful / Sorrowful /
// Glorious). Luminous has no source slides and is intentionally omitted.
//
// Mapping to the rosary narration beads (see src/app/rosary/page.tsx):
//   bead 0       -> announcement card (shown during the mystery intro + Our Father)
//   bead 1..10   -> the ten Hail Mary paintings
//   bead 11      -> fruit-of-the-mystery card (shown during Glory Be + Fatima)
// So each mystery has exactly 12 images, matching TOTAL_BEADS.

export type SlideSetKey = "Joyful" | "Sorrowful" | "Glorious";

export interface RosaryMysterySlides {
  name: string;
  fruit: string;
  /** Shown on bead 0 (announcement + Our Father). */
  announcement: string;
  /** Ten images, one per Hail Mary (beads 1..10). */
  hailMarys: string[];
  /** Shown on bead 11 (Glory Be + Fatima). */
  fruitCard: string;
}

export interface RosarySlideSet {
  /** Overall set title card. */
  titleCard: string;
  /** Five mysteries, in order. */
  mysteries: RosaryMysterySlides[];
}

export const ROSARY_SLIDES: Record<SlideSetKey, RosarySlideSet> = {
  "Joyful": {
    "titleCard": "/rosary/joyful/joyful_001.webp",
    "mysteries": [
      {
        "name": "The Annunciation",
        "fruit": "Submission of our will to the Will of God",
        "announcement": "/rosary/joyful/joyful_002.webp",
        "hailMarys": [
          "/rosary/joyful/joyful_003.webp",
          "/rosary/joyful/joyful_004.webp",
          "/rosary/joyful/joyful_005.webp",
          "/rosary/joyful/joyful_006.webp",
          "/rosary/joyful/joyful_007.webp",
          "/rosary/joyful/joyful_008.webp",
          "/rosary/joyful/joyful_009.webp",
          "/rosary/joyful/joyful_010.webp",
          "/rosary/joyful/joyful_011.webp",
          "/rosary/joyful/joyful_012.webp"
        ],
        "fruitCard": "/rosary/joyful/joyful_013.webp"
      },
      {
        "name": "The Visitation",
        "fruit": "Charity towards our neighbour",
        "announcement": "/rosary/joyful/joyful_014.webp",
        "hailMarys": [
          "/rosary/joyful/joyful_015.webp",
          "/rosary/joyful/joyful_016.webp",
          "/rosary/joyful/joyful_017.webp",
          "/rosary/joyful/joyful_018.webp",
          "/rosary/joyful/joyful_019.webp",
          "/rosary/joyful/joyful_020.webp",
          "/rosary/joyful/joyful_021.webp",
          "/rosary/joyful/joyful_022.webp",
          "/rosary/joyful/joyful_023.webp",
          "/rosary/joyful/joyful_024.webp"
        ],
        "fruitCard": "/rosary/joyful/joyful_025.webp"
      },
      {
        "name": "The Birth of Our Saviour",
        "fruit": "Glory to God in the highest; peace on earth to men of good will",
        "announcement": "/rosary/joyful/joyful_026.webp",
        "hailMarys": [
          "/rosary/joyful/joyful_027.webp",
          "/rosary/joyful/joyful_028.webp",
          "/rosary/joyful/joyful_029.webp",
          "/rosary/joyful/joyful_030.webp",
          "/rosary/joyful/joyful_031.webp",
          "/rosary/joyful/joyful_032.webp",
          "/rosary/joyful/joyful_033.webp",
          "/rosary/joyful/joyful_034.webp",
          "/rosary/joyful/joyful_035.webp",
          "/rosary/joyful/joyful_036.webp"
        ],
        "fruitCard": "/rosary/joyful/joyful_037.webp"
      },
      {
        "name": "The Presentation in the Temple",
        "fruit": "Obedience to the Laws of the Church",
        "announcement": "/rosary/joyful/joyful_038.webp",
        "hailMarys": [
          "/rosary/joyful/joyful_039.webp",
          "/rosary/joyful/joyful_040.webp",
          "/rosary/joyful/joyful_041.webp",
          "/rosary/joyful/joyful_042.webp",
          "/rosary/joyful/joyful_043.webp",
          "/rosary/joyful/joyful_044.webp",
          "/rosary/joyful/joyful_045.webp",
          "/rosary/joyful/joyful_046.webp",
          "/rosary/joyful/joyful_047.webp",
          "/rosary/joyful/joyful_048.webp"
        ],
        "fruitCard": "/rosary/joyful/joyful_049.webp"
      },
      {
        "name": "Finding of the Child Jesus in the Temple",
        "fruit": "Fidelity to our Christian Duty",
        "announcement": "/rosary/joyful/joyful_050.webp",
        "hailMarys": [
          "/rosary/joyful/joyful_051.webp",
          "/rosary/joyful/joyful_052.webp",
          "/rosary/joyful/joyful_053.webp",
          "/rosary/joyful/joyful_054.webp",
          "/rosary/joyful/joyful_055.webp",
          "/rosary/joyful/joyful_056.webp",
          "/rosary/joyful/joyful_057.webp",
          "/rosary/joyful/joyful_058.webp",
          "/rosary/joyful/joyful_059.webp",
          "/rosary/joyful/joyful_060.webp"
        ],
        "fruitCard": "/rosary/joyful/joyful_061.webp"
      }
    ]
  },
  "Sorrowful": {
    "titleCard": "/rosary/sorrowful/sorrowful_001.webp",
    "mysteries": [
      {
        "name": "The Agony in the Garden",
        "fruit": "Let us hate sin",
        "announcement": "/rosary/sorrowful/sorrowful_002.webp",
        "hailMarys": [
          "/rosary/sorrowful/sorrowful_003.webp",
          "/rosary/sorrowful/sorrowful_004.webp",
          "/rosary/sorrowful/sorrowful_005.webp",
          "/rosary/sorrowful/sorrowful_006.webp",
          "/rosary/sorrowful/sorrowful_007.webp",
          "/rosary/sorrowful/sorrowful_008.webp",
          "/rosary/sorrowful/sorrowful_009.webp",
          "/rosary/sorrowful/sorrowful_010.webp",
          "/rosary/sorrowful/sorrowful_011.webp",
          "/rosary/sorrowful/sorrowful_012.webp"
        ],
        "fruitCard": "/rosary/sorrowful/sorrowful_013.webp"
      },
      {
        "name": "The Scourging at the Pillar",
        "fruit": "Let us be willing to suffer a little with Jesus",
        "announcement": "/rosary/sorrowful/sorrowful_014.webp",
        "hailMarys": [
          "/rosary/sorrowful/sorrowful_015.webp",
          "/rosary/sorrowful/sorrowful_016.webp",
          "/rosary/sorrowful/sorrowful_017.webp",
          "/rosary/sorrowful/sorrowful_018.webp",
          "/rosary/sorrowful/sorrowful_019.webp",
          "/rosary/sorrowful/sorrowful_020.webp",
          "/rosary/sorrowful/sorrowful_021.webp",
          "/rosary/sorrowful/sorrowful_022.webp",
          "/rosary/sorrowful/sorrowful_023.webp",
          "/rosary/sorrowful/sorrowful_024.webp"
        ],
        "fruitCard": "/rosary/sorrowful/sorrowful_025.webp"
      },
      {
        "name": "The Crowning with Thorns",
        "fruit": "Let us humble our pride",
        "announcement": "/rosary/sorrowful/sorrowful_026.webp",
        "hailMarys": [
          "/rosary/sorrowful/sorrowful_027.webp",
          "/rosary/sorrowful/sorrowful_028.webp",
          "/rosary/sorrowful/sorrowful_029.webp",
          "/rosary/sorrowful/sorrowful_030.webp",
          "/rosary/sorrowful/sorrowful_031.webp",
          "/rosary/sorrowful/sorrowful_032.webp",
          "/rosary/sorrowful/sorrowful_033.webp",
          "/rosary/sorrowful/sorrowful_034.webp",
          "/rosary/sorrowful/sorrowful_035.webp",
          "/rosary/sorrowful/sorrowful_036.webp"
        ],
        "fruitCard": "/rosary/sorrowful/sorrowful_037.webp"
      },
      {
        "name": "The Carrying of the Cross",
        "fruit": "Let us be patient and carry the little crosses of every day",
        "announcement": "/rosary/sorrowful/sorrowful_038.webp",
        "hailMarys": [
          "/rosary/sorrowful/sorrowful_039.webp",
          "/rosary/sorrowful/sorrowful_040.webp",
          "/rosary/sorrowful/sorrowful_041.webp",
          "/rosary/sorrowful/sorrowful_042.webp",
          "/rosary/sorrowful/sorrowful_043.webp",
          "/rosary/sorrowful/sorrowful_044.webp",
          "/rosary/sorrowful/sorrowful_045.webp",
          "/rosary/sorrowful/sorrowful_046.webp",
          "/rosary/sorrowful/sorrowful_047.webp",
          "/rosary/sorrowful/sorrowful_048.webp"
        ],
        "fruitCard": "/rosary/sorrowful/sorrowful_049.webp"
      },
      {
        "name": "The Crucifixion",
        "fruit": "O Jesus, forgive us our sins, save us from the fire of hell, bring us all to heaven",
        "announcement": "/rosary/sorrowful/sorrowful_050.webp",
        "hailMarys": [
          "/rosary/sorrowful/sorrowful_051.webp",
          "/rosary/sorrowful/sorrowful_052.webp",
          "/rosary/sorrowful/sorrowful_053.webp",
          "/rosary/sorrowful/sorrowful_054.webp",
          "/rosary/sorrowful/sorrowful_055.webp",
          "/rosary/sorrowful/sorrowful_056.webp",
          "/rosary/sorrowful/sorrowful_057.webp",
          "/rosary/sorrowful/sorrowful_058.webp",
          "/rosary/sorrowful/sorrowful_059.webp",
          "/rosary/sorrowful/sorrowful_060.webp"
        ],
        "fruitCard": "/rosary/sorrowful/sorrowful_061.webp"
      }
    ]
  },
  "Glorious": {
    "titleCard": "/rosary/glorious/glorious_001.webp",
    "mysteries": [
      {
        "name": "The Resurrection",
        "fruit": "Let us rise from sin",
        "announcement": "/rosary/glorious/glorious_002.webp",
        "hailMarys": [
          "/rosary/glorious/glorious_003.webp",
          "/rosary/glorious/glorious_004.webp",
          "/rosary/glorious/glorious_005.webp",
          "/rosary/glorious/glorious_006.webp",
          "/rosary/glorious/glorious_007.webp",
          "/rosary/glorious/glorious_008.webp",
          "/rosary/glorious/glorious_009.webp",
          "/rosary/glorious/glorious_010.webp",
          "/rosary/glorious/glorious_011.webp",
          "/rosary/glorious/glorious_012.webp"
        ],
        "fruitCard": "/rosary/glorious/glorious_013.webp"
      },
      {
        "name": "The Ascension",
        "fruit": "Let us have an ardent desire for Paradise",
        "announcement": "/rosary/glorious/glorious_014.webp",
        "hailMarys": [
          "/rosary/glorious/glorious_015.webp",
          "/rosary/glorious/glorious_016.webp",
          "/rosary/glorious/glorious_017.webp",
          "/rosary/glorious/glorious_018.webp",
          "/rosary/glorious/glorious_019.webp",
          "/rosary/glorious/glorious_020.webp",
          "/rosary/glorious/glorious_021.webp",
          "/rosary/glorious/glorious_022.webp",
          "/rosary/glorious/glorious_023.webp",
          "/rosary/glorious/glorious_024.webp"
        ],
        "fruitCard": "/rosary/glorious/glorious_025.webp"
      },
      {
        "name": "The Descent of the Holy Spirit",
        "fruit": "Let us be faithful to the Holy Church",
        "announcement": "/rosary/glorious/glorious_026.webp",
        "hailMarys": [
          "/rosary/glorious/glorious_027.webp",
          "/rosary/glorious/glorious_028.webp",
          "/rosary/glorious/glorious_029.webp",
          "/rosary/glorious/glorious_030.webp",
          "/rosary/glorious/glorious_031.webp",
          "/rosary/glorious/glorious_032.webp",
          "/rosary/glorious/glorious_033.webp",
          "/rosary/glorious/glorious_034.webp",
          "/rosary/glorious/glorious_035.webp",
          "/rosary/glorious/glorious_036.webp"
        ],
        "fruitCard": "/rosary/glorious/glorious_037.webp"
      },
      {
        "name": "The Assumption",
        "fruit": "Let us be devout to Mary",
        "announcement": "/rosary/glorious/glorious_038.webp",
        "hailMarys": [
          "/rosary/glorious/glorious_039.webp",
          "/rosary/glorious/glorious_040.webp",
          "/rosary/glorious/glorious_041.webp",
          "/rosary/glorious/glorious_042.webp",
          "/rosary/glorious/glorious_043.webp",
          "/rosary/glorious/glorious_044.webp",
          "/rosary/glorious/glorious_045.webp",
          "/rosary/glorious/glorious_046.webp",
          "/rosary/glorious/glorious_047.webp",
          "/rosary/glorious/glorious_048.webp"
        ],
        "fruitCard": "/rosary/glorious/glorious_049.webp"
      },
      {
        "name": "The Coronation of Mary",
        "fruit": "Let us persevere to the end",
        "announcement": "/rosary/glorious/glorious_050.webp",
        "hailMarys": [
          "/rosary/glorious/glorious_051.webp",
          "/rosary/glorious/glorious_052.webp",
          "/rosary/glorious/glorious_053.webp",
          "/rosary/glorious/glorious_054.webp",
          "/rosary/glorious/glorious_055.webp",
          "/rosary/glorious/glorious_056.webp",
          "/rosary/glorious/glorious_057.webp",
          "/rosary/glorious/glorious_058.webp",
          "/rosary/glorious/glorious_059.webp",
          "/rosary/glorious/glorious_060.webp"
        ],
        "fruitCard": "/rosary/glorious/glorious_061.webp"
      }
    ]
  }
};

/** Sets that actually have slide art (Luminous does not). */
export function hasSlides(set: string): set is SlideSetKey {
  return set === "Joyful" || set === "Sorrowful" || set === "Glorious";
}

/**
 * The slide image for a given mystery + bead, or null when there's no art for
 * this set (e.g. Luminous) — callers should fall back to the existing
 * MYSTERY_ART illustration in that case.
 *
 * @param set        "Joyful" | "Sorrowful" | "Glorious" | "Luminous" | ...
 * @param mysteryIdx 0..4
 * @param bead       0 = announcement, 1..10 = Hail Mary, 11 = fruit card
 */
export function rosarySlide(set: string, mysteryIdx: number, bead: number): string | null {
  if (!hasSlides(set)) return null;
  const m = ROSARY_SLIDES[set].mysteries[mysteryIdx];
  if (!m) return null;
  if (bead <= 0) return m.announcement;
  if (bead >= 1 && bead <= 10) return m.hailMarys[bead - 1];
  return m.fruitCard;
}
