// Confession preparation — a traditional examination of conscience by the Ten
// Commandments, a step-by-step guide to making a good confession, and the Act of
// Contrition. All texts are traditional / public-domain.

export interface ExamenSection {
  /** Short id used for the persisted checklist. */
  id: string;
  commandment: string;
  /** The commandment itself, briefly. */
  summary: string;
  questions: string[];
}

export const EXAMINATION: ExamenSection[] = [
  {
    id: "c1",
    commandment: "First Commandment",
    summary: "I am the Lord your God; you shall not have strange gods before me.",
    questions: [
      "Have I doubted or denied the truths God has revealed, or refused to believe them?",
      "Have I put my trust in superstition, horoscopes, fortune-telling, or the occult?",
      "Have I neglected prayer, or loved someone or something more than God?",
      "Have I despaired of God's mercy, or presumed upon it?",
      "Have I been ashamed to profess my faith, or denied it before others?",
    ],
  },
  {
    id: "c2",
    commandment: "Second Commandment",
    summary: "You shall not take the name of the Lord your God in vain.",
    questions: [
      "Have I used the name of God, Jesus, Mary, or the saints irreverently or in anger?",
      "Have I cursed, blasphemed, or sworn a false or careless oath?",
      "Have I broken a vow or promise made to God?",
    ],
  },
  {
    id: "c3",
    commandment: "Third Commandment",
    summary: "Remember to keep holy the Lord's Day.",
    questions: [
      "Have I missed Mass on a Sunday or holy day of obligation through my own fault?",
      "Have I come late, left early, or been deliberately distracted at Mass without good reason?",
      "Have I done unnecessary work that kept me from rest and worship on the Lord's Day?",
    ],
  },
  {
    id: "c4",
    commandment: "Fourth Commandment",
    summary: "Honor your father and your mother.",
    questions: [
      "Have I disobeyed or disrespected my parents or lawful superiors?",
      "Have I neglected my duties to my family, or failed to care for those who depend on me?",
      "As a parent, have I neglected the religious upbringing and good example owed to my children?",
    ],
  },
  {
    id: "c5",
    commandment: "Fifth Commandment",
    summary: "You shall not kill.",
    questions: [
      "Have I harmed anyone in body or soul, or nursed anger, hatred, or a desire for revenge?",
      "Have I procured, advised, or supported an abortion or any taking of innocent life?",
      "Have I harmed my own health through abuse of alcohol, drugs, or other excess?",
      "Have I led others into sin by my words or example? Have I refused to forgive?",
    ],
  },
  {
    id: "c6",
    commandment: "Sixth & Ninth Commandments",
    summary: "You shall not commit adultery, nor covet your neighbor's spouse.",
    questions: [
      "Have I been unchaste in thought, word, or action, alone or with others?",
      "Have I viewed pornography or entertained impure desires or fantasies?",
      "Have I been unfaithful in marriage, or sinned against the dignity of marriage?",
      "Have I dressed or acted immodestly, or treated others as objects?",
    ],
  },
  {
    id: "c7",
    commandment: "Seventh & Tenth Commandments",
    summary: "You shall not steal, nor covet your neighbor's goods.",
    questions: [
      "Have I stolen, cheated, or damaged what belongs to another? Have I made restitution?",
      "Have I been greedy, envious, or overly attached to money and possessions?",
      "Have I been honest in my work and dealings, and paid just debts and wages?",
      "Have I been generous to the poor and those in need according to my means?",
    ],
  },
  {
    id: "c8",
    commandment: "Eighth Commandment",
    summary: "You shall not bear false witness against your neighbor.",
    questions: [
      "Have I lied, exaggerated, or deceived to protect myself or harm another?",
      "Have I gossiped, slandered, or damaged anyone's good name?",
      "Have I judged others rashly, betrayed a confidence, or failed to repair harm I caused?",
    ],
  },
  {
    id: "c9",
    commandment: "Precepts of the Church",
    summary: "The duties the Church asks of every Catholic.",
    questions: [
      "Have I received Holy Communion while conscious of grave sin, without confession?",
      "Have I kept the days of fasting and abstinence?",
      "Have I gone to confession at least once a year and received Communion in the Easter season?",
      "Have I helped to provide for the needs of the Church?",
    ],
  },
];

export interface ConfessionStep {
  title: string;
  text: string;
}

export const CONFESSION_STEPS: ConfessionStep[] = [
  { title: "Examine your conscience", text: "Quietly call to mind the sins you have committed since your last confession, using the examination below. Ask the Holy Spirit to help you see yourself truthfully." },
  { title: "Be truly sorry", text: "Make an act of sorrow for your sins — above all because they offend God, who is all good — and firmly resolve, with his grace, to sin no more and to avoid the near occasions of sin." },
  { title: "Greet the priest", text: "After the priest welcomes you, make the Sign of the Cross and say: “Bless me, Father, for I have sinned. It has been [time] since my last confession. These are my sins…”" },
  { title: "Confess your sins", text: "Tell your sins simply and honestly. For grave (mortal) sins, mention the kind and, as far as you can, the number of times. Then say, “For these and all the sins of my life, I am sorry.”" },
  { title: "Listen and receive your penance", text: "Listen to the priest's counsel and accept the penance he gives you." },
  { title: "Pray the Act of Contrition", text: "When the priest asks, pray the Act of Contrition from your heart." },
  { title: "Receive absolution", text: "The priest extends his hand and absolves you. As he does, the mercy of God washes your soul clean. Thanks be to God." },
  { title: "Do your penance", text: "Soon after, complete the penance the priest gave you, and give thanks to God for the gift of his forgiveness." },
];

export const ACT_OF_CONTRITION =
  "O my God, I am heartily sorry for having offended thee, and I detest all my sins because of thy just punishments, but most of all because they offend thee, my God, who art all good and deserving of all my love. I firmly resolve, with the help of thy grace, to sin no more and to avoid the near occasions of sin. Amen.";
