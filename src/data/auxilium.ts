// The daily prayers of the Auxilium Christianorum — the association of the
// faithful founded under the patronage of Mary, Help of Christians, for
// protection in spiritual combat. Text supplied verbatim by the maintainer
// from the association's handbook so the wording stays exact.

export type AuxBlock =
  | { type: "heading"; text: string }
  | { type: "versicle"; a: string; text: string }
  | { type: "lead"; text: string }
  | { type: "body"; text: string }
  | { type: "petition"; text: string; response: string }
  | { type: "rule" };

export interface AuxSection {
  id: string;
  title: string;
  sub?: string;
  blocks: AuxBlock[];
}

// ── Offered every day ───────────────────────────────────────────────────────
export const AUX_DAILY: AuxSection = {
  id: "daily",
  title: "Prayers Offered Every Day",
  blocks: [
    { type: "versicle", a: "℣.", text: "Our help is in the name of the Lord." },
    { type: "versicle", a: "℟.", text: "Who made heaven and earth." },
    { type: "rule" },
    { type: "lead", text: "Most gracious Virgin Mary, thou who wouldst crush the head of the serpent, protect us from the vengeance of the evil one. We offer our prayers, supplications, sufferings and good works to thee so that thou may purify them, sanctify them and present them to thy Son as a perfect offering. May this offering be given so that the demons that influence or seek to influence the members of the Auxilium Christianorum do not know the source of their expulsion and blindness. Blind them so that they know not our good works. Blind them so that they know not on whom to take vengeance. Blind them so that they may receive the just sentence for their works. Cover us with the Precious Blood of thy Son so that we may enjoy the protection which flows from His Passion and Death. Amen." },
    { type: "rule" },
    { type: "body", text: "Saint Michael, the Archangel, defend us in battle. Be our protection against the wickedness and snares of the devil. May God rebuke him, we humbly pray; and do thou, O Prince of the heavenly host, by the power of God cast into hell satan and all the evil spirits who prowl throughout the world seeking the ruin of souls. Amen." },
    { type: "rule" },
    { type: "body", text: "Angel of God, my Guardian dear, to whom God’s love commits me here, ever this day be at my side, to light and guard, to rule and guide. Amen." },
    { type: "rule" },
    { type: "body", text: "Our Father, who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen." },
    { type: "body", text: "Hail Mary, full of grace. The Lord is with thee. Blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen." },
    { type: "body", text: "Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen." },
  ],
};

// ── Litany of the Most Precious Blood ───────────────────────────────────────
export const AUX_LITANY: AuxSection = {
  id: "litany",
  title: "Litany of the Most Precious Blood",
  sub: "of our Lord Jesus Christ",
  blocks: [
    { type: "petition", text: "Lord have mercy.", response: "Lord have mercy." },
    { type: "petition", text: "Christ have mercy.", response: "Christ have mercy." },
    { type: "petition", text: "Lord have mercy.", response: "Lord have mercy." },
    { type: "petition", text: "Christ hear us.", response: "Christ graciously hear us." },
    { type: "petition", text: "God the Father of Heaven,", response: "have mercy on us." },
    { type: "petition", text: "God the Son, Redeemer of the World,", response: "have mercy on us." },
    { type: "petition", text: "God the Holy Spirit,", response: "have mercy on us." },
    { type: "petition", text: "Holy Trinity, One God,", response: "have mercy on us." },
    { type: "petition", text: "Blood of Christ, only-begotten Son of the Eternal Father,", response: "save us." },
    { type: "petition", text: "Blood of Christ, Incarnate Word of God,", response: "save us." },
    { type: "petition", text: "Blood of Christ, of the New and Eternal Testament,", response: "save us." },
    { type: "petition", text: "Blood of Christ, falling upon the earth in the Agony,", response: "save us." },
    { type: "petition", text: "Blood of Christ, shed profusely in the Scourging,", response: "save us." },
    { type: "petition", text: "Blood of Christ, flowing forth in the Crowning with Thorns,", response: "save us." },
    { type: "petition", text: "Blood of Christ, poured out on the Cross,", response: "save us." },
    { type: "petition", text: "Blood of Christ, price of our salvation,", response: "save us." },
    { type: "petition", text: "Blood of Christ, without which there is no forgiveness,", response: "save us." },
    { type: "petition", text: "Blood of Christ, Eucharistic drink and refreshment of souls,", response: "save us." },
    { type: "petition", text: "Blood of Christ, stream of mercy,", response: "save us." },
    { type: "petition", text: "Blood of Christ, victor over demons,", response: "save us." },
    { type: "petition", text: "Blood of Christ, courage of Martyrs,", response: "save us." },
    { type: "petition", text: "Blood of Christ, strength of Confessors,", response: "save us." },
    { type: "petition", text: "Blood of Christ, bringing forth Virgins,", response: "save us." },
    { type: "petition", text: "Blood of Christ, help of those in peril,", response: "save us." },
    { type: "petition", text: "Blood of Christ, relief of the burdened,", response: "save us." },
    { type: "petition", text: "Blood of Christ, solace in sorrow,", response: "save us." },
    { type: "petition", text: "Blood of Christ, hope of the penitent,", response: "save us." },
    { type: "petition", text: "Blood of Christ, consolation of the dying,", response: "save us." },
    { type: "petition", text: "Blood of Christ, peace and tenderness of hearts,", response: "save us." },
    { type: "petition", text: "Blood of Christ, pledge of eternal life,", response: "save us." },
    { type: "petition", text: "Blood of Christ, freeing souls from purgatory,", response: "save us." },
    { type: "petition", text: "Blood of Christ, most worthy of all glory and honor,", response: "save us." },
    { type: "petition", text: "Lamb of God, Who takest away the sins of the world,", response: "spare us, O Lord." },
    { type: "petition", text: "Lamb of God, Who takest away the sins of the world,", response: "graciously hear us, O Lord." },
    { type: "petition", text: "Lamb of God, Who takest away the sins of the world,", response: "have mercy on us." },
    { type: "rule" },
    { type: "versicle", a: "℣.", text: "Thou hast redeemed us with Thy Blood, O Lord." },
    { type: "versicle", a: "℟.", text: "And made of us a kingdom for our God." },
    { type: "rule" },
    { type: "body", text: "Let us pray. Almighty, and everlasting God, Who hast appointed Thine only-begotten Son to be the Redeemer of the world, and hast been pleased to be reconciled unto us by His Blood, grant us, we beseech Thee, so to venerate with solemn worship the price of our salvation, that the power thereof may here on earth keep us from all things hurtful, and the fruit of the same may gladden us for ever hereafter in heaven. Through the same Christ our Lord. Amen." },
  ],
};

// ── Particular days (Sunday = 0 … Saturday = 6) ─────────────────────────────
export const AUX_DAYS: { day: string; title: string; sub?: string; blocks: AuxBlock[] }[] = [
  {
    day: "Sunday",
    title: "On Sundays",
    blocks: [
      { type: "lead", text: "O Glorious Queen of Heaven and Earth, Virgin Most Powerful, thou who hast the power to crush the head of the ancient serpent with thy heel, come and exercise this power flowing from the grace of thine Immaculate Conception. Shield us under the mantle of thy purity and love, draw us into the sweet abode of thy heart and annihilate and render impotent the forces bent on destroying us. Come Most Sovereign Mistress of the Holy Angels and Mistress of the Most Holy Rosary, thou who from the very beginning hast received from God the power and the mission to crush the head of satan. Send forth thy holy legions, we humbly beseech thee, that under thy command and by thy power they may pursue the evil spirits, counter them on every side, resist their bold attacks and drive them far from us, harming no one on the way, binding them to the foot of the Cross to be judged and sentenced by Jesus Christ Thy Son and to be disposed of by Him as He wills." },
      { type: "body", text: "Saint Joseph, Patron of the Universal Church, come to our aid in this grave battle against the forces of darkness, repel the attacks of the devil and free the members of the Auxilium Christianorum, and those for whom the priests of the Auxilium Christianorum pray, from the strongholds of the enemy." },
      { type: "body", text: "Saint Michael, summon the entire heavenly court to engage their forces in this fierce battle against the powers of hell. Come O Prince of Heaven with thy mighty sword and thrust into hell satan and all the other evil spirits. O Guardian Angels, guide and protect us. Amen." },
    ],
  },
  {
    day: "Monday",
    title: "On Mondays",
    blocks: [
      { type: "lead", text: "In Thy name, Lord Jesus Christ, we pray that Thou cover us, our families, and all of our possessions with Thy love and Thy Most Precious Blood and surround us with Thy Heavenly Angels, Saints and the mantle of Our Blessed Mother. Amen." },
    ],
  },
  {
    day: "Tuesday",
    title: "On Tuesdays",
    blocks: [
      { type: "lead", text: "Lord Jesus Christ, we beg Thee for the grace to remain guarded beneath the protective mantle of Mary, surrounded by the holy briar from which was taken the Holy Crown of Thorns, and saturated with Thy Precious Blood in the power of the Holy Spirit, with our Guardian Angels, for the greater glory of the Father. Amen." },
    ],
  },
  {
    day: "Wednesday",
    title: "On Wednesdays",
    blocks: [
      { type: "lead", text: "In the Name of Jesus Christ, Our Lord and God, we ask Thee to render all spirits impotent, paralyzed and ineffective in attempting to take revenge against anyone of the members of the Auxilium Christianorum, our families, friends, communities, those who pray for us and their family members, or anyone associated with us and for whom the priests of the Auxilium Christianorum pray. We ask Thee to bind all evil spirits, all powers in the air, the water, the ground, the fire, under ground, or wherever they exercise their powers, any satanic forces in nature and any and all emissaries of the satanic headquarters. We ask Thee to bind by Thy Precious Blood all of the attributes, aspects and characteristics, interactions, communications and deceitful games of the evil spirits. We ask Thee to break any and all bonds, ties and attachments in the Name of the Father, and of the Son and of the Holy Spirit. Amen." },
    ],
  },
  {
    day: "Thursday",
    title: "On Thursdays",
    blocks: [
      { type: "lead", text: "My Lord, Thou art all powerful, Thou art God, Thou art our Father. We beg Thee through the intercession and help of the Archangels Saints Michael, Raphael, and Gabriel for the deliverance of our brothers and sisters who are enslaved by the evil one. All Saints of Heaven, come to our aid." },
      { type: "petition", text: "From anxiety, sadness and obsessions,", response: "we implore Thee, deliver us, O Lord." },
      { type: "petition", text: "From hatred, fornication, and envy,", response: "we implore Thee, deliver us, O Lord." },
      { type: "petition", text: "From thoughts of jealousy, rage, and death,", response: "we implore Thee, deliver us, O Lord." },
      { type: "petition", text: "From every thought of suicide and abortion,", response: "we implore Thee, deliver us, O Lord." },
      { type: "petition", text: "From every form of sinful sexuality,", response: "we implore Thee, deliver us, O Lord." },
      { type: "petition", text: "From every division in our family, and every harmful friendship,", response: "we implore Thee, deliver us, O Lord." },
      { type: "petition", text: "From every sort of spell, malefice, witchcraft, and every form of the occult,", response: "we implore Thee, deliver us, O Lord." },
      { type: "body", text: "Thou who said, “Peace I leave with you, my peace I give unto you.” Grant that, through the intercession of the Virgin Mary, we may be liberated from every demonic influence and enjoy Thy peace always. In the Name of Christ, our Lord. Amen." },
    ],
  },
  {
    day: "Friday",
    title: "On Fridays",
    sub: "Litany of Humility",
    blocks: [
      { type: "body", text: "O Jesus, meek and humble of heart, hear me." },
      { type: "petition", text: "From the desire of being esteemed,", response: "deliver me, Jesus." },
      { type: "petition", text: "From the desire of being loved,", response: "deliver me, Jesus." },
      { type: "petition", text: "From the desire of being extolled,", response: "deliver me, Jesus." },
      { type: "petition", text: "From the desire of being honored,", response: "deliver me, Jesus." },
      { type: "petition", text: "From the desire of being praised,", response: "deliver me, Jesus." },
      { type: "petition", text: "From the desire of being preferred to others,", response: "deliver me, Jesus." },
      { type: "petition", text: "From the desire of being consulted,", response: "deliver me, Jesus." },
      { type: "petition", text: "From the desire of being approved,", response: "deliver me, Jesus." },
      { type: "petition", text: "From the fear of being humiliated,", response: "deliver me, Jesus." },
      { type: "petition", text: "From the fear of being despised,", response: "deliver me, Jesus." },
      { type: "petition", text: "From the fear of suffering rebukes,", response: "deliver me, Jesus." },
      { type: "petition", text: "From the fear of being calumniated,", response: "deliver me, Jesus." },
      { type: "petition", text: "From the fear of being forgotten,", response: "deliver me, Jesus." },
      { type: "petition", text: "From the fear of being ridiculed,", response: "deliver me, Jesus." },
      { type: "petition", text: "From the fear of being wronged,", response: "deliver me, Jesus." },
      { type: "petition", text: "From the fear of being suspected,", response: "deliver me, Jesus." },
      { type: "petition", text: "That others may be loved more than I,", response: "Jesus, grant me the grace to desire it." },
      { type: "petition", text: "That others may be esteemed more than I,", response: "Jesus, grant me the grace to desire it." },
      { type: "petition", text: "That in the opinion of the world, others may increase and I may decrease,", response: "Jesus, grant me the grace to desire it." },
      { type: "petition", text: "That others may be chosen and I set aside,", response: "Jesus, grant me the grace to desire it." },
      { type: "petition", text: "That others may be praised and I unnoticed,", response: "Jesus, grant me the grace to desire it." },
      { type: "petition", text: "That others may be preferred to me in everything,", response: "Jesus, grant me the grace to desire it." },
      { type: "petition", text: "That others may become holier than I, provided that I become as holy as I should,", response: "Jesus, grant me the grace to desire it." },
    ],
  },
  {
    day: "Saturday",
    title: "On Saturdays",
    blocks: [
      { type: "lead", text: "O God and Father of our Lord Jesus Christ, we call upon Thy holy Name and humbly beseech Thy clemency, that, through the intercession of the ever immaculate Virgin, our Mother Mary, and of the glorious Archangel Saint Michael, thou wouldst vouchsafe to help us against satan and all the other unclean spirits that are prowling about the world to the great peril of the human race and the loss of souls. Amen." },
    ],
  },
];

// ── Concluding prayer for each day ──────────────────────────────────────────
export const AUX_CONCLUDING: AuxSection = {
  id: "concluding",
  title: "Concluding Prayer for Each Day",
  blocks: [
    { type: "lead", text: "August Queen of the Heavens, heavenly Sovereign of the Angels, Thou who from the beginning hast received from God the power and the mission to crush the head of satan, we humbly beseech Thee to send thy holy legions, so that under Thy command and through Thy power, they may pursue the demons and combat them everywhere, suppress their boldness, and drive them back into the abyss. O good and tender Mother, Thou wilt always be our love and hope! O Divine Mother, send Thy Holy Angels to defend us and to drive far away from us the cruel enemy. Holy Angels and Archangels, defend us, guard us. Amen." },
    { type: "rule" },
    { type: "petition", text: "Most Sacred Heart of Jesus,", response: "have mercy on us." },
    { type: "petition", text: "Mary, Help of Christians,", response: "pray for us." },
    { type: "petition", text: "Virgin Most Powerful,", response: "pray for us." },
    { type: "petition", text: "Saint Joseph,", response: "pray for us." },
    { type: "petition", text: "Saint Michael the Archangel,", response: "pray for us." },
    { type: "petition", text: "All You Holy Angels,", response: "pray for us." },
    { type: "body", text: "In the name of the Father, the Son and the Holy Spirit. Amen." },
  ],
};
