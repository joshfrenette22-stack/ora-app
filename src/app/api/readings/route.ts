import { type NextRequest } from "next/server";
import { parseDate, liturgicalDay } from "@/lib/liturgical";
import { readingsForDate } from "@/lib/readings";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const date = parseDate(request.nextUrl.searchParams.get("date"));
  const readings = readingsForDate(date);
  const lit = liturgicalDay(date);
  return Response.json({ ...readings, liturgical: { season: lit.season, label: lit.label, color: lit.color } });
}
