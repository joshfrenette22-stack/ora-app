import { type NextRequest } from "next/server";
import { parseDate, badgeSeason } from "@/lib/liturgical";
import { liturgicalForDate } from "@/lib/calendar";
import { saintExtras, monogramFor } from "@/lib/saints";
import { getDailyReadings } from "@/lib/usccb";

export const dynamic = "force-dynamic";

// A small pool of armour-of-God / prayer-warrior verses for the daily hero.
const VERSES = [
  { text: "Put on the full armour of God, that you may be able to stand against the wiles of the devil.", cite: "Ephesians 6 · 11" },
  { text: "Watch ye, stand fast in the faith, do manfully, and be strengthened.", cite: "1 Corinthians 16 · 13" },
  { text: "The Lord is my light and my salvation, whom shall I fear?", cite: "Psalm 27 · 1" },
  { text: "Be nothing solicitous; but in every thing, by prayer let your petitions be made known to God.", cite: "Philippians 4 · 6" },
  { text: "They that hope in the Lord shall renew their strength; they shall take wings as eagles.", cite: "Isaiah 40 · 31" },
];

export async function GET(request: NextRequest) {
  const date = parseDate(request.nextUrl.searchParams.get("date"));
  const [lit, readings] = await Promise.all([liturgicalForDate(date), getDailyReadings(date)]);
  const extras = saintExtras(date);
  const verse = VERSES[date.getUTCDate() % VERSES.length];

  const isFeria = lit.rank === "feria";
  const saintName = isFeria ? "Feria" : lit.name;

  return Response.json({
    date: lit.date,
    liturgical: { season: lit.season, color: lit.color, label: lit.label, name: lit.name, rank: lit.rank, badgeSeason: badgeSeason(lit.color) },
    verse,
    saint: {
      name: saintName,
      title: extras.title ?? null,
      rank: lit.rank,
      monogram: extras.monogram ?? monogramFor(saintName),
      color: lit.color,
    },
    readings: {
      first: { cite: readings.first.cite, title: readings.first.title },
      psalm: { cite: readings.psalm.cite, title: readings.psalm.title },
      ...(readings.second ? { second: { cite: readings.second.cite, title: readings.second.title } } : {}),
      gospel: { cite: readings.gospel.cite, title: readings.gospel.title },
      representative: readings.representative,
      source: readings.source,
    },
  });
}
