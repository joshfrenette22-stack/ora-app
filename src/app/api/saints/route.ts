import { type NextRequest } from "next/server";
import { parseDate } from "@/lib/liturgical";
import { liturgicalForDate } from "@/lib/calendar";
import { saintExtras, monogramFor, FERIA_BIO } from "@/lib/saints";

export const dynamic = "force-dynamic";

// Map romcal title keys to readable subtitles when we have no curated title.
const TITLE_WORDS: Record<string, string> = {
  DOCTOR_OF_THE_CHURCH: "Doctor of the Church",
  MARTYR: "Martyr",
  APOSTLE: "Apostle",
  EVANGELIST: "Evangelist",
  BISHOP: "Bishop",
  POPE: "Pope",
  VIRGIN: "Virgin",
  RELIGIOUS: "Religious",
};

export async function GET(request: NextRequest) {
  const date = parseDate(request.nextUrl.searchParams.get("date"));
  const lit = await liturgicalForDate(date);
  const extras = saintExtras(date);

  const isFeria = lit.rank === "feria";
  const name = isFeria ? "Feria" : lit.name;
  const titleFromRomcal = lit.titles.map((t) => TITLE_WORDS[t]).filter(Boolean).join(" · ") || null;

  return Response.json({
    date: lit.date,
    name,
    title: extras.title ?? (isFeria ? "Weekday in Ordinary Time" : titleFromRomcal),
    color: lit.color,
    rank: lit.rank,
    monogram: extras.monogram ?? monogramFor(name),
    bio: extras.bio ?? (isFeria ? FERIA_BIO : undefined),
    collect: extras.collect,
  });
}
