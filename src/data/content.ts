export const READINGS = {
  first: {
    label: "First Reading",
    cite: "1 Kings 17 · 1–6",
    title: "Elijah by the Brook",
    body: "And Elijah the Thesbite, of the inhabitants of Galaad, said to Achab: As the Lord liveth, before whom I stand, there shall not be dew nor rain these years, but according to the words of my mouth. And the word of the Lord came to him, saying: Get thee hence, and go toward the east, and hide thyself by the torrent of Carith, which is over against the Jordan. And there thou shalt drink of the torrent: and I have commanded the ravens to feed thee there.",
  },
  psalm: {
    label: "Responsorial Psalm",
    cite: "Psalm 4 · 2–8",
    title: "In Peace I Will Lie Down",
    refrain: "Let the light of thy countenance, O Lord, be signed upon us.",
    body: "When I called upon him, the God of my justice heard me: when I was in distress, thou hast enlarged me. Have mercy on me, and hear my prayer. The Lord hath heard me when I cried unto him. In peace in the selfsame I will sleep, and I will rest: for thou, O Lord, singularly hast settled me in hope.",
  },
  gospel: {
    label: "Gospel",
    cite: "Matthew 5 · 1–12",
    title: "The Beatitudes",
    body: "And seeing the multitudes, he went up into a mountain, and when he was set down, his disciples came unto him. And opening his mouth, he taught them, saying: Blessed are the poor in spirit: for theirs is the kingdom of heaven. Blessed are the meek: for they shall possess the land. Blessed are they that mourn: for they shall be comforted. Blessed are they that hunger and thirst after justice: for they shall have their fill.",
  },
} as const;

export const MYSTERY_SETS = {
  Joyful: [
    ["The Annunciation", "The angel Gabriel greets Mary; she says yes to God. — Fruit: Humility"],
    ["The Visitation", "Mary visits Elizabeth, who calls her blessed. — Fruit: Love of neighbour"],
    ["The Nativity", "Christ is born in Bethlehem. — Fruit: Poverty of spirit"],
    ["The Presentation", "The child is offered in the Temple. — Fruit: Obedience"],
    ["Finding in the Temple", "Found among the teachers. — Fruit: Joy in seeking God"],
  ],
  Sorrowful: [
    ["The Agony in the Garden", "He prays in anguish: thy will be done. — Fruit: Sorrow for sin"],
    ["The Scourging at the Pillar", "He bears the lash for us. — Fruit: Purity"],
    ["The Crowning with Thorns", "Mocked as a king. — Fruit: Courage"],
    ["The Carrying of the Cross", "He bears the wood to Calvary. — Fruit: Patience"],
    ["The Crucifixion", "He dies for our salvation. — Fruit: Perseverance"],
  ],
  Glorious: [
    ["The Resurrection", "Christ rises from the dead. — Fruit: Faith"],
    ["The Ascension", "He ascends to the Father. — Fruit: Hope"],
    ["Descent of the Holy Spirit", "The Spirit descends at Pentecost. — Fruit: Love"],
    ["The Assumption", "Mary is taken up body and soul. — Fruit: Devotion to Mary"],
    ["Coronation of Mary", "She is crowned Queen of Heaven. — Fruit: Eternal happiness"],
  ],
  Luminous: [
    ["The Baptism of the Lord", "The Father proclaims his beloved Son. — Fruit: Openness to the Spirit"],
    ["The Wedding at Cana", "Water becomes wine at Mary's word. — Fruit: To Jesus through Mary"],
    ["Proclamation of the Kingdom", "Repent and believe the Gospel. — Fruit: Conversion"],
    ["The Transfiguration", "His glory shines on the mountain. — Fruit: Desire for holiness"],
    ["Institution of the Eucharist", "He gives his Body and Blood. — Fruit: Adoration"],
  ],
} as const;

export const ROSARY_PRAYERS = {
  signCross: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
  creed: "I believe in God, the Father almighty, Creator of heaven and earth; and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried. He descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from thence he shall come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
  our: "Our Father, who art in heaven, hallowed be thy name; thy kingdom come, thy will be done, on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
  hail: "Hail Mary, full of grace, the Lord is with thee; blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
  glory: "Glory be to the Father, and to the Son, and to the Holy Spirit: as it was in the beginning, is now, and ever shall be, world without end. Amen.",
  fatima: "O my Jesus, forgive us our sins, save us from the fires of hell; lead all souls to heaven, especially those in most need of thy mercy.",
  queen: "Hail, holy Queen, Mother of mercy, our life, our sweetness, and our hope. To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us; and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Pray for us, O holy Mother of God, that we may be made worthy of the promises of Christ. Amen.",
  closing: "O God, whose only-begotten Son, by his life, death, and resurrection, has purchased for us the rewards of eternal life: grant, we beseech thee, that meditating upon these mysteries of the most holy Rosary, we may imitate what they contain and obtain what they promise. Through the same Christ our Lord. Amen.",
} as const;

export const HOURS = [
  { name: "Office of Readings", en: "Matins · Vigils", time: "Any hour", lucide: "book-open" as const },
  { name: "Lauds", en: "Morning Prayer", time: "6:00", lucide: "sunrise" as const },
  { name: "Terce", en: "Mid-Morning", time: "9:00", lucide: "sun" as const },
  { name: "Sext", en: "Midday Prayer", time: "12:00", lucide: "sun" as const },
  { name: "None", en: "Mid-Afternoon", time: "15:00", lucide: "sun" as const },
  { name: "Vespers", en: "Evening Prayer", time: "18:00", lucide: "sunset" as const },
  { name: "Compline", en: "Night Prayer", time: "21:00", lucide: "moon" as const },
] as const;

export const WEEKDAY_SET = ["Glorious", "Joyful", "Sorrowful", "Glorious", "Luminous", "Sorrowful", "Joyful"] as const;

/** The hour of the Divine Office closest to the given time of day. */
export function currentHourName(date: Date = new Date()): typeof HOURS[number]["name"] {
  const h = date.getHours();
  if (h >= 5 && h < 8) return "Lauds";
  if (h >= 8 && h < 11) return "Terce";
  if (h >= 11 && h < 14) return "Sext";
  if (h >= 14 && h < 17) return "None";
  if (h >= 17 && h < 21) return "Vespers";
  return "Compline";
}

export const ROSARY_INTENTIONS = [
  "The Holy Souls",
  "My Family",
  "Peace in the World",
  "In Thanksgiving",
  "The Sick & Suffering",
  "A Personal Intention",
] as const;

export const DEVOTIONS = {
  angelus: {
    title: "The Angelus",
    sub: "Recited at noon",
    blocks: [
      { type: "versicle" as const, a: "\u2123.", text: "The Angel of the Lord declared unto Mary," },
      { type: "versicle" as const, a: "\u211F.", text: "And she conceived of the Holy Spirit." },
      { type: "body" as const, text: "Hail Mary, full of grace, the Lord is with thee; blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus." },
      { type: "versicle" as const, a: "\u2123.", text: "Behold the handmaid of the Lord." },
      { type: "versicle" as const, a: "\u211F.", text: "Be it done unto me according to thy word." },
      { type: "rule" as const },
      { type: "body" as const, text: "Pour forth, we beseech thee, O Lord, thy grace into our hearts; that we, to whom the Incarnation of Christ thy Son was made known by the message of an Angel, may by his Passion and Cross be brought to the glory of his Resurrection. Through the same Christ our Lord. Amen." },
    ],
  },
  mercy: {
    title: "Divine Mercy",
    sub: "The Chaplet \u00b7 at three o\u2019clock",
    blocks: [
      { type: "lead" as const, text: "Eternal Father, I offer thee the Body and Blood, Soul and Divinity of thy dearly beloved Son, our Lord Jesus Christ, in atonement for our sins and those of the whole world." },
      { type: "body" as const, text: "For the sake of his sorrowful Passion, have mercy on us and on the whole world." },
      { type: "rule" as const },
      { type: "versicle" as const, a: "\u2123.", text: "Holy God, Holy Mighty One, Holy Immortal One," },
      { type: "versicle" as const, a: "\u211F.", text: "have mercy on us and on the whole world." },
      { type: "body" as const, text: "Jesus, I trust in you." },
    ],
  },
  michael: {
    title: "St. Michael",
    sub: "Prayer for protection",
    blocks: [
      { type: "lead" as const, text: "Saint Michael the Archangel, defend us in battle. Be our protection against the wickedness and snares of the devil." },
      { type: "body" as const, text: "May God rebuke him, we humbly pray; and do thou, O Prince of the heavenly host, by the power of God, cast into hell Satan and all the evil spirits who prowl about the world seeking the ruin of souls. Amen." },
    ],
  },
  memorare: {
    title: "The Memorare",
    sub: "To Our Lady",
    blocks: [
      { type: "lead" as const, text: "Remember, O most gracious Virgin Mary, that never was it known that anyone who fled to thy protection, implored thy help, or sought thy intercession was left unaided." },
      { type: "body" as const, text: "Inspired by this confidence, I fly unto thee, O Virgin of virgins, my Mother; to thee do I come, before thee I stand, sinful and sorrowful. O Mother of the Word Incarnate, despise not my petitions, but in thy mercy hear and answer me. Amen." },
    ],
  },
} as const;
