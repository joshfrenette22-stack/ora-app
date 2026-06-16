import { type NextRequest } from "next/server";
import { liturgicalForDate, feastsForMonth } from "@/lib/calendar";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const now = new Date();
  const params = request.nextUrl.searchParams;
  const year = Number(params.get("year")) || now.getUTCFullYear();
  const month = Number(params.get("month")) || now.getUTCMonth() + 1;

  const [feasts, mid] = await Promise.all([
    feastsForMonth(year, month),
    liturgicalForDate(new Date(Date.UTC(year, month - 1, 15))),
  ]);

  return Response.json({
    year,
    month,
    season: { season: mid.season, color: mid.color, label: mid.label },
    feasts,
  });
}
