/** The Auxilium Christianorum ("Help of Christians") daily prayers — the rule of
 *  prayer of the confraternity founded by exorcists for spiritual protection.
 *
 *  Structure (all from the public devotion):
 *    1. AUXILIUM_DAILY      — prayers offered every day, ending with the
 *                             Litany of the Most Precious Blood.
 *    2. AUXILIUM_PROPERS    — a proper prayer for each weekday (0 = Sunday …
 *                             6 = Saturday, matching `Date.getDay()`).
 *    3. AUXILIUM_CONCLUDING — the concluding prayer said every day.
 *
 *  Blocks reuse the same vocabulary as the Devotions (`versicle` / `lead` /
 *  `body` / `rule`) plus `heading` (section labels) and `petition` (a litany
 *  line: an invocation answered by a fixed response). */

export type AuxBlock =
  | { type: "rule" }
  | { type: "heading"; text: string }
  | { type: "versicle"; a: string; text: string }
  | { type: "petition"; text: string; r: string }
  | { type: "lead"; text: string }
  | { type: "body"; text: string };

// Litany of the Most Precious Blood — the "save us" invocations.
const BLOOD_OF_CHRIST: string[] = [
  "Blood of Christ, only-begotten Son of the Eternal Father,",
  "Blood of Christ, Incarnate Word of God,",
  "Blood of Christ, of the New and Eternal Testament,",
  "Blood of Christ, falling upon the earth in the Agony,",
  "Blood of Christ, shed profusely in the Scourging,",
  "Blood of Christ, flowing forth in the Crowning with Thorns,",
  "Blood of Christ, poured out on the Cross,",
  "Blood of Christ, price of our salvation,",
  "Blood of Christ, without which there is no forgiveness,",
  "Blood of Christ, Eucharistic drink and refreshment of souls,",
  "Blood of Christ, stream of mercy,",
  "Blood of Christ, victor over demons,",
  "Blood of Christ, courage of Martyrs,",
  "Blood of Christ, strength of Confessors,",
  "Blood of Christ, bringing forth Virgins,",
  "Blood of Christ, help of those in peril,",
  "Blood of Christ, relief of the burdened,",
  "Blood of Christ, solace in sorrow,",
  "Blood of Christ, hope of the penitent,",
  "Blood of Christ, consolation of the dying,",
  "Blood of Christ, peace and tenderness of hearts,",
  "Blood of Christ, pledge of eternal life,",
  "Blood of Christ, freeing souls from purgatory,",
  "Blood of Christ, most worthy of all glory and honor,",
];

export const AUXILIUM_DAILY: AuxBlock[] = [
  { type: "versicle", a: "℣.", text: "Our help is in the name of the Lord." },
  { type: "versicle", a: "℟.", text: "Who made heaven and earth." },
  { type: "rule" },
  {
    type: "lead",
    text:
      "Most gracious Virgin Mary, thou who wouldst crush the head of the serpent, protect us from the vengeance of the evil one. We offer our prayers, supplications, sufferings and good works to thee so that thou may purify them, sanctify them and present them to thy Son as a perfect offering. May this offering be given so that the demons that influence or seek to influence the members of the Auxilium Christianorum do not know the source of their expulsion and blindness. Blind them so that they know not our good works. Blind them so that they know not on whom to take vengeance. Blind them so that they may receive the just sentence for their works. Cover us with the Precious Blood of thy Son so that we may enjoy the protection which flows from His Passion and Death. Amen.",
  },
  {
    type: "body",
    text:
      "Saint Michael, the Archangel, defend us in battle. Be our protection against the wickedness and snares of the devil. May God rebuke him, we humbly pray; and do thou, O Prince of the heavenly host, by the power of God cast into hell satan and all the evil spirits who prowl throughout the world seeking the ruin of souls. Amen.",
  },
  {
    type: "body",
    text:
      "Angel of God, my Guardian dear, to whom God's love commits me here, ever this day be at my side, to light and guard, to rule and guide. Amen.",
  },
  {
    type: "body",
    text:
      "Our Father, Who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
  },
  {
    type: "body",
    text:
      "Hail Mary, full of grace. The Lord is with thee. Blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
  },
  {
    type: "body",
    text:
      "Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen.",
  },
  { type: "rule" },
  { type: "heading", text: "Litany of the Most Precious Blood" },
  { type: "petition", text: "Lord have mercy.", r: "Lord have mercy." },
  { type: "petition", text: "Christ have mercy.", r: "Christ have mercy." },
  { type: "petition", text: "Lord have mercy.", r: "Lord have mercy." },
  { type: "petition", text: "Christ hear us.", r: "Christ graciously hear us." },
  { type: "petition", text: "God the Father of Heaven,", r: "have mercy on us." },
  { type: "petition", text: "God the Son, Redeemer of the World,", r: "have mercy on us." },
  { type: "petition", text: "God the Holy Spirit,", r: "have mercy on us." },
  { type: "petition", text: "Holy Trinity, One God,", r: "have mercy on us." },
  ...BLOOD_OF_CHRIST.map((text): AuxBlock => ({ type: "petition", text, r: "save us." })),
  { type: "petition", text: "Lamb of God, Who takest away the sins of the world,", r: "spare us, O Lord." },
  { type: "petition", text: "Lamb of God, Who takest away the sins of the world,", r: "graciously hear us, O Lord." },
  { type: "petition", text: "Lamb of God, Who takest away the sins of the world,", r: "have mercy on us." },
  { type: "versicle", a: "℣.", text: "Thou hast redeemed us with Thy Blood, O Lord." },
  { type: "versicle", a: "℟.", text: "And made of us a kingdom for our God." },
  {
    type: "body",
    text:
      "Let us pray. Almighty, and everlasting God, Who hast appointed Thine only-begotten Son to be the Redeemer of the world, and hast been pleased to be reconciled unto us by His Blood, grant us, we beseech Thee, so to venerate with solemn worship the price of our salvation, that the power thereof may here on earth keep us from all things hurtful, and the fruit of the same may gladden us for ever hereafter in heaven. Through the same Christ our Lord. Amen.",
  },
];

export interface AuxiliumProper {
  /** Full weekday name, e.g. "Thursday". */
  day: string;
  /** A one-line summary of the day's proper, for cards and pickers. */
  summary: string;
  blocks: AuxBlock[];
}

// Litany of Humility — the two response groups (Friday).
const HUMILITY_DELIVER: string[] = [
  "From the desire of being esteemed,",
  "From the desire of being loved,",
  "From the desire of being extolled,",
  "From the desire of being honored,",
  "From the desire of being praised,",
  "From the desire of being preferred to others,",
  "From the desire of being consulted,",
  "From the desire of being approved,",
  "From the fear of being humiliated,",
  "From the fear of being despised,",
  "From the fear of suffering rebukes,",
  "From the fear of being calumniated,",
  "From the fear of being forgotten,",
  "From the fear of being ridiculed,",
  "From the fear of being wronged,",
  "From the fear of being suspected,",
];
const HUMILITY_DESIRE: string[] = [
  "That others may be loved more than I,",
  "That others may be esteemed more than I,",
  "That in the opinion of the world, others may increase and I may decrease,",
  "That others may be chosen and I set aside,",
  "That others may be praised and I unnoticed,",
  "That others may be preferred to me in everything,",
  "That others may become holier than I, provided that I become as holy as I should,",
];

// Thursday deliverance litany.
const DELIVER_US: string[] = [
  "From anxiety, sadness and obsessions,",
  "From hatred, fornication, and envy,",
  "From thoughts of jealousy, rage, and death,",
  "From every thought of suicide and abortion,",
  "From every form of sinful sexuality,",
  "From every division in our family, and every harmful friendship,",
  "From every sort of spell, malefice, witchcraft, and every form of the occult,",
];

export const AUXILIUM_PROPERS: Record<number, AuxiliumProper> = {
  0: {
    day: "Sunday",
    summary: "To the Glorious Queen of Heaven, with St. Joseph & St. Michael",
    blocks: [
      { type: "heading", text: "On Sundays" },
      {
        type: "lead",
        text:
          "O Glorious Queen of Heaven and Earth, Virgin Most Powerful, thou who hast the power to crush the head of the ancient serpent with thy heel, come and exercise this power flowing from the grace of thine Immaculate Conception. Shield us under the mantle of thy purity and love, draw us into the sweet abode of thy heart and annihilate and render impotent the forces bent on destroying us. Come Most Sovereign Mistress of the Holy Angels and Mistress of the Most Holy Rosary, thou who from the very beginning hast received from God the power and the mission to crush the head of satan. Send forth thy holy legions, we humbly beseech thee, that under thy command and by thy power they may pursue the evil spirits, counter them on every side, resist their bold attacks and drive them far from us, harming no one on the way, binding them to the foot of the Cross to be judged and sentenced by Jesus Christ Thy Son and to be disposed of by Him as He wills.",
      },
      {
        type: "body",
        text:
          "Saint Joseph, Patron of the Universal Church, come to our aid in this grave battle against the forces of darkness, repel the attacks of the devil and free the members of the Auxilium Christianorum, and those for whom the priests of the Auxilium Christianorum pray, from the strongholds of the enemy.",
      },
      {
        type: "body",
        text:
          "Saint Michael, summon the entire heavenly court to engage their forces in this fierce battle against the powers of hell. Come O Prince of Heaven with thy mighty sword and thrust into hell satan and all the other evil spirits. O Guardian Angels, guide and protect us. Amen.",
      },
    ],
  },
  1: {
    day: "Monday",
    summary: "For the covering of the Most Precious Blood",
    blocks: [
      { type: "heading", text: "On Mondays" },
      {
        type: "lead",
        text:
          "In Thy name, Lord Jesus Christ, we pray that Thou cover us, our families, and all of our possessions with Thy love and Thy Most Precious Blood and surround us with Thy Heavenly Angels, Saints and the mantle of Our Blessed Mother. Amen.",
      },
    ],
  },
  2: {
    day: "Tuesday",
    summary: "For protection beneath the mantle of Mary",
    blocks: [
      { type: "heading", text: "On Tuesdays" },
      {
        type: "lead",
        text:
          "Lord Jesus Christ, we beg Thee for the grace to remain guarded beneath the protective mantle of Mary, surrounded by the holy briar from which was taken the Holy Crown of Thorns, and saturated with Thy Precious Blood in the power of the Holy Spirit, with our Guardian Angels, for the greater glory of the Father. Amen.",
      },
    ],
  },
  3: {
    day: "Wednesday",
    summary: "To bind the evil spirits by the Precious Blood",
    blocks: [
      { type: "heading", text: "On Wednesdays" },
      {
        type: "lead",
        text:
          "In the Name of Jesus Christ, Our Lord and God, we ask Thee to render all spirits impotent, paralyzed and ineffective in attempting to take revenge against anyone of the members of the Auxilium Christianorum, our families, friends, communities, those who pray for us and their family members, or anyone associated with us and for whom the priests of the Auxilium Christianorum pray. We ask Thee to bind all evil spirits, all powers in the air, the water, the ground, the fire, under ground, or wherever they exercise their powers, any satanic forces in nature and any and all emissaries of the satanic headquarters. We ask Thee to bind by Thy Precious Blood all of the attributes, aspects and characteristics, interactions, communications and deceitful games of the evil spirits. We ask Thee to break any and all bonds, ties and attachments in the Name of the Father, and of the Son and of the Holy Spirit. Amen.",
      },
    ],
  },
  4: {
    day: "Thursday",
    summary: "For deliverance, with the Archangels & all Saints",
    blocks: [
      { type: "heading", text: "On Thursdays" },
      {
        type: "lead",
        text:
          "My Lord, Thou art all powerful, Thou art God, Thou art our Father. We beg Thee through the intercession and help of the Archangels Saints Michael, Raphael, and Gabriel for the deliverance of our brothers and sisters who are enslaved by the evil one. All Saints of Heaven, come to our aid.",
      },
      ...DELIVER_US.map((text): AuxBlock => ({ type: "petition", text, r: "we implore Thee, deliver us, O Lord." })),
      {
        type: "body",
        text:
          "Thou who said, “Peace I leave with you, my peace I give unto you.” Grant that, through the intercession of the Virgin Mary, we may be liberated from every demonic influence and enjoy Thy peace always. In the Name of Christ, our Lord. Amen.",
      },
    ],
  },
  5: {
    day: "Friday",
    summary: "The Litany of Humility",
    blocks: [
      { type: "heading", text: "On Fridays" },
      { type: "heading", text: "Litany of Humility" },
      { type: "lead", text: "O Jesus, meek and humble of heart, hear me." },
      ...HUMILITY_DELIVER.map((text): AuxBlock => ({ type: "petition", text, r: "deliver me, Jesus." })),
      ...HUMILITY_DESIRE.map((text): AuxBlock => ({ type: "petition", text, r: "Jesus, grant me the grace to desire it." })),
    ],
  },
  6: {
    day: "Saturday",
    summary: "To God the Father, with Mary & St. Michael",
    blocks: [
      { type: "heading", text: "On Saturdays" },
      {
        type: "lead",
        text:
          "O God and Father of our Lord Jesus Christ, we call upon Thy holy Name and humbly beseech Thy clemency, that, through the intercession of the ever immaculate Virgin, our Mother Mary, and of the glorious Archangel Saint Michael, thou wouldst vouchsafe to help us against satan and all the other unclean spirits that are prowling about the world to the great peril of the human race and the loss of souls. Amen.",
      },
    ],
  },
};

export const AUXILIUM_CONCLUDING: AuxBlock[] = [
  { type: "heading", text: "Concluding Prayer for Each Day" },
  {
    type: "lead",
    text:
      "August Queen of the Heavens, heavenly Sovereign of the Angels, Thou who from the beginning hast received from God the power and the mission to crush the head of satan, we humbly beseech Thee to send thy holy legions, so that under Thy command and through Thy power, they may pursue the demons and combat them everywhere, suppress their boldness, and drive them back into the abyss. O good and tender Mother, Thou wilt always be our love and hope! O Divine Mother, send Thy Holy Angels to defend us and to drive far away from us the cruel enemy. Holy Angels and Archangels, defend us, guard us. Amen.",
  },
  { type: "petition", text: "Most Sacred Heart of Jesus,", r: "have mercy on us." },
  { type: "petition", text: "Mary, Help of Christians,", r: "pray for us." },
  { type: "petition", text: "Virgin Most Powerful,", r: "pray for us." },
  { type: "petition", text: "Saint Joseph,", r: "pray for us." },
  { type: "petition", text: "Saint Michael the Archangel,", r: "pray for us." },
  { type: "petition", text: "All You Holy Angels,", r: "pray for us." },
  { type: "body", text: "In the name of the Father, the Son and the Holy Spirit. Amen." },
];

/** The proper prayer for a given weekday (0 = Sunday … 6 = Saturday). */
export function auxiliumProperForDay(day: number): AuxiliumProper {
  return AUXILIUM_PROPERS[day] ?? AUXILIUM_PROPERS[0];
}

/** The spoken form of a block, or null for non-narrated blocks (rule, heading). */
export function auxBlockSpeech(b: AuxBlock): string | null {
  if (b.type === "rule" || b.type === "heading") return null;
  if (b.type === "petition") return `${b.text} ${b.r}`;
  return b.text;
}
