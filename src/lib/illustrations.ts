/** Typed illustration registry — the single source of truth for all art assets.
 *  Reference by key; never import raw paths. A bad key is a compile error. */

export type IllustrationKey =
  | "app-icon-crucifix"
  | "splash-altar"
  | "section-daily-mass"
  | "section-hours"
  | "section-rosary"
  | "section-devotions"
  | "mystery-joyful"
  | "mystery-sorrowful"
  | "mystery-glorious"
  | "mystery-luminous"
  | "hours-office-readings"
  | "hours-lauds"
  | "hours-terce"
  | "hours-sext"
  | "hours-none"
  | "hours-vespers"
  | "hours-compline"
  | "devotion-angelus"
  | "devotion-divine-mercy"
  | "devotion-st-michael"
  | "devotion-memorare"
  | "today-greeting-band"
  | "today-daily-readings"
  | "today-daily-readings-alt"
  | "today-hero-verse-ornament"
  | "og-share";

export interface IllustrationEntry {
  src: string;
  alt: string;
  defaultWidth: number;
  defaultHeight: number;
}

export const ILLUSTRATIONS: Record<IllustrationKey, IllustrationEntry> = {
  "app-icon-crucifix": {
    src: "/illustrations/app-icon-crucifix.webp",
    alt: "Crucifix",
    defaultWidth: 512,
    defaultHeight: 512,
  },
  "splash-altar": {
    src: "/illustrations/splash-altar.webp",
    alt: "Holy Spirit descending over an altar",
    defaultWidth: 800,
    defaultHeight: 800,
  },
  "section-daily-mass": {
    src: "/illustrations/section-daily-mass.webp",
    alt: "Chalice and host",
    defaultWidth: 400,
    defaultHeight: 400,
  },
  "section-hours": {
    src: "/illustrations/section-hours.webp",
    alt: "Liturgy of the Hours",
    defaultWidth: 400,
    defaultHeight: 400,
  },
  "section-rosary": {
    src: "/illustrations/section-rosary.webp",
    alt: "Praying hands with rosary",
    defaultWidth: 400,
    defaultHeight: 400,
  },
  "section-devotions": {
    src: "/illustrations/section-devotions.webp",
    alt: "Hands in prayer",
    defaultWidth: 400,
    defaultHeight: 400,
  },
  "mystery-joyful": {
    src: "/illustrations/mystery-joyful.webp",
    alt: "The Nativity",
    defaultWidth: 600,
    defaultHeight: 600,
  },
  "mystery-sorrowful": {
    src: "/illustrations/mystery-sorrowful.webp",
    alt: "The Crucifixion",
    defaultWidth: 600,
    defaultHeight: 600,
  },
  "mystery-glorious": {
    src: "/illustrations/mystery-glorious.webp",
    alt: "The Resurrection",
    defaultWidth: 600,
    defaultHeight: 600,
  },
  "mystery-luminous": {
    src: "/illustrations/mystery-luminous.webp",
    alt: "The Baptism of the Lord",
    defaultWidth: 600,
    defaultHeight: 600,
  },
  "hours-office-readings": {
    src: "/illustrations/hours-office-readings.webp",
    alt: "Office of Readings",
    defaultWidth: 400,
    defaultHeight: 400,
  },
  "hours-lauds": {
    src: "/illustrations/hours-lauds.webp",
    alt: "Dawn breaking",
    defaultWidth: 400,
    defaultHeight: 400,
  },
  "hours-terce": {
    src: "/illustrations/hours-terce.webp",
    alt: "Mid-morning sun",
    defaultWidth: 400,
    defaultHeight: 400,
  },
  "hours-sext": {
    src: "/illustrations/hours-sext.webp",
    alt: "Midday sun",
    defaultWidth: 400,
    defaultHeight: 400,
  },
  "hours-none": {
    src: "/illustrations/hours-none.webp",
    alt: "Afternoon light",
    defaultWidth: 400,
    defaultHeight: 400,
  },
  "hours-vespers": {
    src: "/illustrations/hours-vespers.webp",
    alt: "Sunset",
    defaultWidth: 400,
    defaultHeight: 400,
  },
  "hours-compline": {
    src: "/illustrations/hours-compline.webp",
    alt: "Night sky",
    defaultWidth: 400,
    defaultHeight: 400,
  },
  "devotion-angelus": {
    src: "/illustrations/devotion-angelus.webp",
    alt: "The Annunciation",
    defaultWidth: 500,
    defaultHeight: 500,
  },
  "devotion-divine-mercy": {
    src: "/illustrations/devotion-divine-mercy.webp",
    alt: "Divine Mercy",
    defaultWidth: 500,
    defaultHeight: 500,
  },
  "devotion-st-michael": {
    src: "/illustrations/devotion-st-michael.webp",
    alt: "St. Michael the Archangel",
    defaultWidth: 500,
    defaultHeight: 500,
  },
  "devotion-memorare": {
    src: "/illustrations/devotion-memorare.webp",
    alt: "Our Lady",
    defaultWidth: 500,
    defaultHeight: 500,
  },
  "today-greeting-band": {
    src: "/illustrations/today-greeting-band.webp",
    alt: "",
    defaultWidth: 800,
    defaultHeight: 200,
  },
  "today-daily-readings": {
    src: "/illustrations/today-daily-readings.webp",
    alt: "",
    defaultWidth: 400,
    defaultHeight: 400,
  },
  "today-daily-readings-alt": {
    src: "/illustrations/today-daily-readings-alt.webp",
    alt: "",
    defaultWidth: 400,
    defaultHeight: 400,
  },
  "today-hero-verse-ornament": {
    src: "/illustrations/today-hero-verse-ornament.webp",
    alt: "",
    defaultWidth: 400,
    defaultHeight: 400,
  },
  "og-share": {
    src: "/illustrations/og-share.webp",
    alt: "ORA Prayer Warrior",
    defaultWidth: 1200,
    defaultHeight: 630,
  },
};

/** Map Rosary mystery set names to illustration keys */
export const MYSTERY_ART: Record<string, IllustrationKey> = {
  Joyful: "mystery-joyful",
  Sorrowful: "mystery-sorrowful",
  Glorious: "mystery-glorious",
  Luminous: "mystery-luminous",
};

/** Map canonical hour names to illustration keys */
export const HOUR_ART: Record<string, IllustrationKey> = {
  "Office of Readings": "hours-office-readings",
  Lauds: "hours-lauds",
  Terce: "hours-terce",
  Sext: "hours-sext",
  None: "hours-none",
  Vespers: "hours-vespers",
  Compline: "hours-compline",
};

/** Map devotion keys to illustration keys */
export const DEVOTION_ART: Record<string, IllustrationKey> = {
  angelus: "devotion-angelus",
  mercy: "devotion-divine-mercy",
  michael: "devotion-st-michael",
  memorare: "devotion-memorare",
};
