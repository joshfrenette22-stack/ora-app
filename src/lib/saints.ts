// Saint / feast dataset, keyed by "M-D" (month-day, no zero padding).
//
// Sourced from the General Roman Calendar. Entries marked with `bio`/`collect`
// get a full saint-of-the-day page; the rest power the calendar grid.

import type { LitColor } from "./liturgical";

export type Rank = "solemnity" | "feast" | "memorial" | "feria";

export interface Saint {
  name: string;
  /** Short subtitle, e.g. "Deacon & Doctor · c. 306–373". */
  title?: string;
  color: LitColor;
  rank: Rank;
  /** Single letter / monogram for the halo crest. */
  monogram?: string;
  /** Hagiography paragraph. */
  bio?: string;
  /** Collect (opening prayer). */
  collect?: string;
}

// "M-D" → Saint. Month and day are 1-based and not zero-padded.
const SAINTS: Record<string, Saint> = {
  "1-1": { name: "Mary, Mother of God", color: "white", rank: "solemnity", monogram: "M" },
  "1-2": { name: "Sts. Basil & Gregory", color: "white", rank: "memorial", monogram: "B" },
  "1-28": { name: "St. Thomas Aquinas", color: "white", rank: "memorial", monogram: "T", title: "Priest & Doctor · 1225–1274", bio: "Dominican friar, theologian, and Doctor of the Church called the Angelic Doctor. His Summa Theologiae wedded faith and reason into a synthesis that has guided the Church for centuries.", collect: "O God, who made Saint Thomas Aquinas outstanding in his zeal for holiness and his study of sacred doctrine, grant us, we pray, that we may understand what he taught and imitate what he accomplished. Through Christ our Lord. Amen." },
  "3-19": { name: "St. Joseph", color: "white", rank: "solemnity", monogram: "J", title: "Spouse of the Blessed Virgin Mary" },
  "3-25": { name: "The Annunciation", color: "white", rank: "solemnity", monogram: "A" },
  "4-25": { name: "St. Mark, Evangelist", color: "red", rank: "feast", monogram: "M" },
  "5-1": { name: "St. Joseph the Worker", color: "white", rank: "memorial", monogram: "J" },
  "5-2": { name: "St. Athanasius", color: "white", rank: "memorial", monogram: "A", title: "Bishop & Doctor" },
  "5-3": { name: "Sts. Philip & James", color: "red", rank: "feast", monogram: "P" },
  "5-14": { name: "St. Matthias, Apostle", color: "red", rank: "feast", monogram: "M" },
  "5-31": { name: "The Visitation", color: "white", rank: "feast", monogram: "V" },
  "6-1": { name: "St. Justin, Martyr", color: "red", rank: "memorial", monogram: "J", title: "Martyr · c. 100–165", bio: "Philosopher and apologist who, after seeking truth among the schools of his day, found it in Christ. He defended the faith with reasoned argument and sealed his witness with martyrdom in Rome.", collect: "O God, who through the folly of the Cross wondrously taught Saint Justin the Martyr the surpassing knowledge of Jesus Christ, grant us, through his intercession, that, having rejected deception, we may become steadfast in the faith. Through Christ our Lord. Amen." },
  "6-5": { name: "St. Boniface", color: "red", rank: "memorial", monogram: "B", title: "Bishop & Martyr" },
  "6-9": {
    name: "St. Ephrem",
    color: "white",
    rank: "memorial",
    monogram: "E",
    title: "the Syrian · Deacon & Doctor · c. 306–373",
    bio: "Deacon, hymnographer, and Doctor of the Church, called the “Harp of the Holy Spirit.” His hymns and metrical homilies defended the faith against the heresies of his day and adorned the liturgy of the Syriac Church with a poetry that is still sung today. He is honoured as a teacher whose theology was sung rather than argued.",
    collect: "O God, who didst illumine thy Church with the learning and sanctity of the Deacon Saint Ephrem, grant that we, following his example, may ever seek thee above all things and delight in singing thy praises. Through our Lord Jesus Christ, thy Son, who liveth and reigneth with thee in the unity of the Holy Spirit, God, for ever and ever. Amen.",
  },
  "6-11": { name: "St. Barnabas, Apostle", color: "red", rank: "feast", monogram: "B", title: "Apostle", bio: "A Levite of Cyprus who sold his field for the early Church and stood surety for the newly converted Paul. Called a “son of encouragement,” he carried the Gospel to Antioch and beyond on the first missionary journeys.", collect: "O God, who decreed that Saint Barnabas, a man filled with faith and the Holy Spirit, should be set apart to convert the nations, grant that the Gospel of Christ, which he strenuously preached, may be faithfully proclaimed by word and by deed. Through Christ our Lord. Amen." },
  "6-13": { name: "St. Anthony of Padua", color: "white", rank: "memorial", monogram: "A", title: "Priest & Doctor · 1195–1231", bio: "Franciscan preacher of such power that crowds filled the squares to hear him. A Doctor of the Church, he is remembered as a finder of what is lost and a friend of the poor.", collect: "Almighty ever-living God, who gave Saint Anthony of Padua to your people as an outstanding preacher and an intercessor in their need, grant that, with his assistance, as we follow the teachings of the Christian life, we may know your help in every trial. Through Christ our Lord. Amen." },
  "6-19": { name: "Sacred Heart of Jesus", color: "white", rank: "solemnity", monogram: "✝" },
  "6-21": { name: "St. Aloysius Gonzaga", color: "white", rank: "memorial", monogram: "A", title: "Religious · 1568–1591" },
  "6-22": { name: "Sts. John Fisher & Thomas More", color: "red", rank: "memorial", monogram: "M", title: "Martyrs" },
  "6-24": { name: "Birth of St. John the Baptist", color: "white", rank: "solemnity", monogram: "J" },
  "6-27": { name: "St. Cyril of Alexandria", color: "white", rank: "memorial", monogram: "C", title: "Bishop & Doctor" },
  "6-28": { name: "St. Irenaeus", color: "red", rank: "memorial", monogram: "I", title: "Bishop, Martyr & Doctor" },
  "6-29": { name: "Sts. Peter & Paul", color: "red", rank: "solemnity", monogram: "P", title: "Apostles", bio: "The two pillars of the Roman Church: Peter the fisherman to whom the keys were given, and Paul the apostle to the nations. Both gave their lives for Christ in Rome and are honoured together on this solemnity.", collect: "O God, who on the Solemnity of the Apostles Peter and Paul give us the noble and holy joy of this day, grant, we pray, that your Church may in all things follow the teaching of those through whom she received the beginnings of right religion. Through Christ our Lord. Amen." },
  "7-3": { name: "St. Thomas, Apostle", color: "red", rank: "feast", monogram: "T" },
  "7-11": { name: "St. Benedict", color: "white", rank: "feast", monogram: "B", title: "Abbot · 480–547", bio: "Father of Western monasticism, whose Rule — ora et labora, pray and work — shaped the spiritual life of Europe for fifteen centuries. Patron of a continent he never set out to convert.", collect: "O God, who made the Abbot Saint Benedict an outstanding master in the school of divine service, grant, we pray, that, putting nothing before love of you, we may hasten with a loving heart in the way of your commands. Through Christ our Lord. Amen." },
  "7-22": { name: "St. Mary Magdalene", color: "white", rank: "feast", monogram: "M", title: "Apostle to the Apostles" },
  "7-25": { name: "St. James, Apostle", color: "red", rank: "feast", monogram: "J" },
  "7-26": { name: "Sts. Joachim & Anne", color: "white", rank: "memorial", monogram: "A" },
  "7-29": { name: "St. Martha", color: "white", rank: "memorial", monogram: "M" },
  "7-31": { name: "St. Ignatius of Loyola", color: "white", rank: "memorial", monogram: "I", title: "Priest · 1491–1556" },
  "8-15": { name: "The Assumption", color: "white", rank: "solemnity", monogram: "M" },
  "9-29": { name: "Sts. Michael, Gabriel & Raphael", color: "white", rank: "feast", monogram: "M" },
  "10-4": { name: "St. Francis of Assisi", color: "white", rank: "memorial", monogram: "F", title: "Deacon · 1181–1226", bio: "The Poor Man of Assisi who embraced Lady Poverty and rebuilt the Church by living the Gospel without gloss. Lover of all creation, he bore the wounds of Christ in his own body.", collect: "O God, by whose gift Saint Francis was conformed to Christ in poverty and humility, grant that, by walking in his footsteps, we may follow your Son and be bound to you in joyful charity. Through Christ our Lord. Amen." },
  "11-1": { name: "All Saints", color: "white", rank: "solemnity", monogram: "✦" },
  "11-2": { name: "All Souls", color: "violet", rank: "feast", monogram: "✝" },
  "12-8": { name: "The Immaculate Conception", color: "white", rank: "solemnity", monogram: "M" },
  "12-25": { name: "The Nativity of the Lord", color: "white", rank: "solemnity", monogram: "✝" },
};

export function saintKey(month: number, day: number): string {
  return `${month}-${day}`;
}

/** Every curated saint/feast with its calendar date — used to pre-generate the
 *  saint-of-the-day profiles ("pull all the pages"). */
export function allCuratedSaints(): { name: string; month: number; day: number }[] {
  return Object.entries(SAINTS).map(([key, s]) => {
    const [m, d] = key.split("-").map(Number);
    return { name: s.name, month: m, day: d };
  });
}

export const FERIA_BIO =
  "No obligatory memorial falls today. The Church keeps a feria — an ordinary weekday — on which the Mass and Office of the season are prayed. A fitting day to take up a votive Mass or a saint of personal devotion.";

/** Derive a single-letter crest from a celebration name. */
export function monogramFor(name: string): string {
  const core = name.replace(/^(Sts?\.|Bl\.|Saints?|Blessed|The)\s+/i, "").trim();
  return core.charAt(0).toUpperCase() || "✝";
}

/** Supplementary content (bio/collect/monogram/title) for a date, if curated. */
export function saintExtras(date: Date): Pick<Saint, "bio" | "collect" | "monogram" | "title"> {
  const found = SAINTS[saintKey(date.getUTCMonth() + 1, date.getUTCDate())];
  if (!found) return {};
  return { bio: found.bio, collect: found.collect, monogram: found.monogram, title: found.title };
}

/** Returns the saint/feast for a date, or a feria placeholder if none. */
export function saintForDate(date: Date): Saint {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const found = SAINTS[saintKey(month, day)];
  if (found) return found;
  return {
    name: "Feria",
    title: "Weekday in Ordinary Time",
    color: "green",
    rank: "feria",
    monogram: "✝",
    bio: FERIA_BIO,
  };
}

/** All feast entries for a given month, keyed "YYYY-M-D" for the calendar grid. */
export function feastsForMonth(year: number, month: number): Record<string, Saint> {
  const out: Record<string, Saint> = {};
  for (const [key, saint] of Object.entries(SAINTS)) {
    const [m, d] = key.split("-").map(Number);
    if (m === month) out[`${year}-${m}-${d}`] = saint;
  }
  return out;
}
