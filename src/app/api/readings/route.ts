import { type NextRequest } from "next/server";
import { parseDate, DAY_CACHE_HEADERS } from "@/lib/liturgical";
import { liturgicalForDate } from "@/lib/calendar";
import { getDailyReadings } from "@/lib/usccb";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const date = parseDate(request.nextUrl.searchParams.get("date"));
  const [readings, lit] = await Promise.all([getDailyReadings(date), liturgicalForDate(date)]);
  return Response.json(
    { ...readings, liturgical: { season: lit.season, label: lit.label, color: lit.color } },
    // The fallback sample set shouldn't stick in the CDN for a day.
    { headers: readings.representative ? undefined : DAY_CACHE_HEADERS },
  );
}
