// Daily Mass readings.
//
// NOTE ON AUTHENTICITY: the authentic day-by-day Lectionary is a licensed text.
// This module serves a small pool of public-domain (Douay–Rheims) reading sets
// and selects one deterministically by date, so the API always returns coherent,
// stable content. Responses are flagged `representative: true` so the UI/clients
// can be honest that this is sample data, not the official daily lectionary.

export interface Reading {
  label: string;
  cite: string;
  title: string;
  body: string;
  refrain?: string;
  /** Internal: psalm refrain verse number, used to re-render the refrain in the chosen translation. */
  refrainVerse?: number;
}

export interface ReadingSet {
  first: Reading;
  psalm: Reading;
  gospel: Reading;
  /** Short reflection prompt per reading. */
  reflect: { first: string; psalm: string; gospel: string };
}

const SETS: ReadingSet[] = [
  {
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
    reflect: {
      first: "Where in your life do you feel God is calling you to trust him with your daily bread, as he provided for Elijah?",
      psalm: "How does resting in God's peace — “in peace I will sleep” — speak to a worry or burden you carry today?",
      gospel: "Which Beatitude speaks most directly to the condition of your heart right now? What would it look like to live it today?",
    },
  },
  {
    first: {
      label: "First Reading",
      cite: "Isaiah 55 · 1–3",
      title: "Come to the Waters",
      body: "All you that thirst, come to the waters: and you that have no money make haste, buy, and eat: come ye, buy wine and milk without money, and without any price. Why do you spend money for that which is not bread, and your labour for that which doth not satisfy you? Hearken diligently to me, and eat that which is good, and your soul shall be delighted in fatness.",
    },
    psalm: {
      label: "Responsorial Psalm",
      cite: "Psalm 23 · 1–4",
      title: "The Lord Is My Shepherd",
      refrain: "The Lord ruleth me: and I shall want nothing.",
      body: "The Lord ruleth me: and I shall want nothing. He hath set me in a place of pasture. He hath brought me up, on the water of refreshment: he hath converted my soul. He hath led me on the paths of justice, for his own name's sake. For though I should walk in the midst of the shadow of death, I will fear no evils, for thou art with me.",
    },
    gospel: {
      label: "Gospel",
      cite: "John 6 · 35–40",
      title: "The Bread of Life",
      body: "And Jesus said to them: I am the bread of life: he that cometh to me shall not hunger: and he that believeth in me shall never thirst. But I said unto you, that you also have seen me, and you believe not. All that the Father giveth to me shall come to me; and him that cometh to me, I will not cast out.",
    },
    reflect: {
      first: "What are you spending your labour on that does not satisfy? What would it mean to “come to the waters” today?",
      psalm: "Walking through your own valley, where have you sensed the Shepherd's presence beside you?",
      gospel: "Christ offers himself as bread that ends all hunger. What hunger do you bring to him today?",
    },
  },
  {
    first: {
      label: "First Reading",
      cite: "Genesis 12 · 1–4",
      title: "The Call of Abram",
      body: "And the Lord said to Abram: Go forth out of thy country, and from thy kindred, and out of thy father's house, and come into the land which I shall shew thee. And I will make of thee a great nation, and I will bless thee, and magnify thy name, and thou shalt be blessed. And Abram went out as the Lord had commanded him.",
    },
    psalm: {
      label: "Responsorial Psalm",
      cite: "Psalm 33 · 4–22",
      title: "Let Thy Mercy Be Upon Us",
      refrain: "Let thy mercy, O Lord, be upon us, as we have hoped in thee.",
      body: "For the word of the Lord is right, and all his works are done with faithfulness. He loveth mercy and judgment; the earth is full of the mercy of the Lord. Behold the eyes of the Lord are on them that fear him: and on them that hope in his mercy. Our soul waiteth for the Lord: for he is our helper and protector.",
    },
    gospel: {
      label: "Gospel",
      cite: "Matthew 9 · 9–13",
      title: "The Call of Matthew",
      body: "Jesus saw a man sitting in the custom house, named Matthew; and he saith to him: Follow me. And he rose up and followed him. And it came to pass as he was sitting at meat in the house, behold many publicans and sinners came, and sat down with Jesus and his disciples. I came not to call the just, but sinners.",
    },
    reflect: {
      first: "Abram went out not knowing where. Where is God asking you to step out in trust, without the whole map?",
      psalm: "What does it look like for your soul to “wait for the Lord” in a season of uncertainty?",
      gospel: "Christ called Matthew straight from his desk. What ordinary place might Christ be calling you from today?",
    },
  },
];

/** Day-of-year for deterministic selection. */
function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  return Math.floor((date.getTime() - start) / 86_400_000);
}

export interface DailyReadings {
  date: string;
  /** true = public-domain fallback selection; false = authentic scraped readings. */
  representative: boolean;
  source: string;
  first: Reading;
  psalm: Reading;
  /** Present on Sundays and solemnities. */
  second?: Reading;
  gospel: Reading;
  reflect: { first: string; psalm: string; second?: string; gospel: string };
}

export function readingsForDate(date: Date): DailyReadings {
  const set = SETS[dayOfYear(date) % SETS.length];
  return {
    ...set,
    date: date.toISOString().slice(0, 10),
    representative: true,
    source: "Representative Douay–Rheims selection — not the official daily Lectionary.",
  };
}
