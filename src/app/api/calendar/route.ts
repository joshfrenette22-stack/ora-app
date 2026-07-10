import { type NextRequest } from "next/server";
import { liturgicalForDate, feastsForMonth } from "@/lib/calendar";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const now = new Date();
  const params = request.nextUrl.searchParams;
  const year = Math.min(Math.max(Number(params.get("year")) || now.getUTCFullYear(), 1970), 9999);
  const month = Math.min(Math.max(Number(params.get("month")) || now.getUTCMonth() + 1, 1), 12);

  const [feasts, mid] = await Promise.all([
    feastsForMonth(year, month),
    liturgicalForDate(new Date(Date.UTC(year, month - 1, 15))),
  ]);

  return Response.json({
    year,
    month,
    season: { season: mid.season, color: mid.color, label: mid.label },
    feasts,
  }, {
    // A month's feasts are fixed — cache hard at the edge.
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
