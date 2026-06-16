import { type NextRequest } from "next/server";
import { parseDate } from "@/lib/liturgical";
import { saintForDate } from "@/lib/saints";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const date = parseDate(request.nextUrl.searchParams.get("date"));
  const saint = saintForDate(date);
  return Response.json({ date: date.toISOString().slice(0, 10), ...saint });
}
