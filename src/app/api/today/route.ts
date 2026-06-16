import { type NextRequest } from "next/server";
import { parseDate, liturgicalDay, badgeSeason } from "@/lib/liturgical";
import { saintForDate } from "@/lib/saints";
import { readingsForDate } from "@/lib/readings";

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
  const lit = liturgicalDay(date);
  const saint = saintForDate(date);
  const readings = readingsForDate(date);
  const verse = VERSES[date.getUTCDate() % VERSES.length];

  return Response.json({
    date: lit.date,
    liturgical: { ...lit, badgeSeason: badgeSeason(lit.color) },
    verse,
    saint: { name: saint.name, title: saint.title ?? null, rank: saint.rank, monogram: saint.monogram ?? "✝", color: saint.color },
    readings: {
      first: { cite: readings.first.cite, title: readings.first.title },
      psalm: { cite: readings.psalm.cite, title: readings.psalm.title },
      gospel: { cite: readings.gospel.cite, title: readings.gospel.title },
      representative: readings.representative,
    },
  });
}
