/** Master catalogue of prayers available for the playlist builder.
 *  Each entry has a stable `id`, a display `title`, the full `text`,
 *  an optional `category` for the picker UI, and an optional illustration. */

import { ROSARY_PRAYERS, DEVOTIONS } from "./content";
import type { IllustrationKey } from "@/lib/illustrations";

export interface Prayer {
  id: string;
  title: string;
  /** Short subtitle shown under the title in the picker. */
  sub?: string;
  text: string;
  category: string;
  lucide?: string;
  illustration?: IllustrationKey;
}

function devotionText(key: keyof typeof DEVOTIONS): string {
  return DEVOTIONS[key].blocks
    .filter((b): b is Exclude<typeof b, { type: "rule" }> => b.type !== "rule")
    .map((b) => b.text)
    .join(" ");
}

export const PRAYER_CATALOG: Prayer[] = [
  // ── Core prayers ──────────────────────────────────────────────────────────
  {
    id: "sign-cross",
    title: "Sign of the Cross",
    text: ROSARY_PRAYERS.signCross,
    category: "Core",
    lucide: "plus",
  },
  {
    id: "our-father",
    title: "Our Father",
    sub: "The Lord's Prayer",
    text: ROSARY_PRAYERS.our,
    category: "Core",
    lucide: "heart",
  },
  {
    id: "hail-mary",
    title: "Hail Mary",
    text: ROSARY_PRAYERS.hail,
    category: "Core",
    lucide: "star",
  },
  {
    id: "glory-be",
    title: "Glory Be",
    text: ROSARY_PRAYERS.glory,
    category: "Core",
    lucide: "sparkles",
  },
  {
    id: "apostles-creed",
    title: "Apostles' Creed",
    sub: "Credo",
    text: ROSARY_PRAYERS.creed,
    category: "Core",
    lucide: "book-open",
  },
  {
    id: "hail-holy-queen",
    title: "Hail Holy Queen",
    sub: "Salve Regina",
    text: ROSARY_PRAYERS.queen,
    category: "Core",
    lucide: "crown",
  },

  // ── Devotions ─────────────────────────────────────────────────────────────
  {
    id: "angelus",
    title: "The Angelus",
    sub: "Recited at noon",
    text: devotionText("angelus"),
    category: "Devotion",
    lucide: "bell",
    illustration: "devotion-angelus",
  },
  {
    id: "divine-mercy",
    title: "Divine Mercy Chaplet",
    sub: "At three o'clock",
    text: devotionText("mercy"),
    category: "Devotion",
    lucide: "heart",
    illustration: "devotion-divine-mercy",
  },
  {
    id: "st-michael",
    title: "Prayer to St. Michael",
    sub: "For protection",
    text: devotionText("michael"),
    category: "Devotion",
    lucide: "shield",
    illustration: "devotion-st-michael",
  },
  {
    id: "memorare",
    title: "The Memorare",
    sub: "To Our Lady",
    text: devotionText("memorare"),
    category: "Devotion",
    lucide: "flower",
    illustration: "devotion-memorare",
  },

  // ── Additional prayers ────────────────────────────────────────────────────
  {
    id: "act-contrition",
    title: "Act of Contrition",
    text: "O my God, I am heartily sorry for having offended thee, and I detest all my sins because of thy just punishments, but most of all because they offend thee, my God, who art all-good and deserving of all my love. I firmly resolve, with the help of thy grace, to sin no more and to avoid the near occasions of sin. Amen.",
    category: "Acts",
    lucide: "heart",
  },
  {
    id: "act-faith",
    title: "Act of Faith",
    text: "O my God, I firmly believe that thou art one God in three divine Persons: Father, Son, and Holy Spirit. I believe that thy divine Son became man and died for our sins, and that he will come to judge the living and the dead. I believe these and all the truths which the holy Catholic Church teaches, because thou hast revealed them, who canst neither deceive nor be deceived. Amen.",
    category: "Acts",
    lucide: "book-open",
  },
  {
    id: "act-hope",
    title: "Act of Hope",
    text: "O my God, relying on thy infinite goodness and promises, I hope to obtain pardon of my sins, the help of thy grace, and life everlasting, through the merits of Jesus Christ, my Lord and Redeemer. Amen.",
    category: "Acts",
    lucide: "anchor",
  },
  {
    id: "act-love",
    title: "Act of Love",
    text: "O my God, I love thee above all things, with my whole heart and soul, because thou art all-good and worthy of all love. I love my neighbour as myself for the love of thee. I forgive all who have injured me and ask pardon of all whom I have injured. Amen.",
    category: "Acts",
    lucide: "heart",
  },
  {
    id: "guardian-angel",
    title: "Prayer to Guardian Angel",
    text: "Angel of God, my guardian dear, to whom God's love commits me here, ever this day be at my side, to light and guard, to rule and guide. Amen.",
    category: "Devotion",
    lucide: "feather",
  },
  {
    id: "morning-offering",
    title: "Morning Offering",
    sub: "Apostleship of Prayer",
    text: "O Jesus, through the Immaculate Heart of Mary, I offer thee my prayers, works, joys, and sufferings of this day for all the intentions of thy Sacred Heart, in union with the holy Sacrifice of the Mass throughout the world, in reparation for my sins, for the intentions of all our associates, and in particular for the intention recommended this month by the Holy Father. Amen.",
    category: "Daily",
    lucide: "sunrise",
  },
  {
    id: "grace-before",
    title: "Grace Before Meals",
    text: "Bless us, O Lord, and these thy gifts, which we are about to receive from thy bounty, through Christ our Lord. Amen.",
    category: "Daily",
    lucide: "utensils",
  },
  {
    id: "grace-after",
    title: "Grace After Meals",
    text: "We give thee thanks, almighty God, for all thy benefits, who livest and reignest, world without end. And may the souls of the faithful departed, through the mercy of God, rest in peace. Amen.",
    category: "Daily",
    lucide: "utensils",
  },
  {
    id: "anima-christi",
    title: "Anima Christi",
    sub: "Soul of Christ",
    text: "Soul of Christ, sanctify me. Body of Christ, save me. Blood of Christ, inebriate me. Water from the side of Christ, wash me. Passion of Christ, strengthen me. O good Jesus, hear me. Within thy wounds, hide me. Permit me not to be separated from thee. From the wicked foe, defend me. At the hour of my death, call me and bid me come to thee, that with thy saints I may praise thee for ever and ever. Amen.",
    category: "Eucharistic",
    lucide: "wine",
  },
  {
    id: "spiritual-communion",
    title: "Spiritual Communion",
    text: "My Jesus, I believe that thou art present in the most holy Sacrament. I love thee above all things, and I desire to receive thee into my soul. Since I cannot at this moment receive thee sacramentally, come at least spiritually into my heart. I embrace thee as if thou wert already there and unite myself wholly to thee. Never permit me to be separated from thee. Amen.",
    category: "Eucharistic",
    lucide: "wine",
  },
  {
    id: "fatima-prayer",
    title: "Fatima Prayer",
    sub: "O My Jesus",
    text: ROSARY_PRAYERS.fatima,
    category: "Core",
    lucide: "flame",
  },
  {
    id: "eternal-rest",
    title: "Eternal Rest",
    sub: "For the Faithful Departed",
    text: "Eternal rest grant unto them, O Lord, and let perpetual light shine upon them. May the souls of all the faithful departed, through the mercy of God, rest in peace. Amen.",
    category: "Daily",
    lucide: "candle",
  },
  {
    id: "te-deum",
    title: "Te Deum",
    sub: "Hymn of Praise",
    text: "We praise thee, O God: we acknowledge thee to be the Lord. All the earth doth worship thee, the Father everlasting. To thee all Angels cry aloud, the Heavens and all the Powers therein. To thee Cherubim and Seraphim continually do cry: Holy, Holy, Holy, Lord God of Hosts. Heaven and earth are full of the majesty of thy glory. The glorious company of the Apostles praise thee. The goodly fellowship of the Prophets praise thee. The noble army of Martyrs praise thee.",
    category: "Hymn",
    lucide: "music",
  },
  {
    id: "sub-tuum",
    title: "Sub Tuum Praesidium",
    sub: "We fly to thy patronage",
    text: "We fly to thy patronage, O holy Mother of God. Despise not our petitions in our necessities, but deliver us always from all dangers, O glorious and blessed Virgin. Amen.",
    category: "Marian",
    lucide: "flower",
  },
  {
    id: "magnificat",
    title: "The Magnificat",
    sub: "Canticle of Mary",
    text: "My soul doth magnify the Lord, and my spirit hath rejoiced in God my Saviour. For he hath regarded the lowliness of his handmaiden; for behold, from henceforth all generations shall call me blessed. For he that is mighty hath magnified me, and holy is his name. And his mercy is on them that fear him throughout all generations. He hath showed strength with his arm; he hath scattered the proud in the imagination of their hearts. He hath put down the mighty from their seat, and hath exalted the humble and meek. He hath filled the hungry with good things, and the rich he hath sent empty away. He hath holpen his servant Israel, in remembrance of his mercy; as he promised to our forefathers, Abraham and his seed, for ever. Amen.",
    category: "Marian",
    lucide: "flower",
  },
];

export const CATEGORIES = [...new Set(PRAYER_CATALOG.map((p) => p.category))];
