import { type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { parseDate } from "@/lib/liturgical";
import { liturgicalForDate } from "@/lib/calendar";
import { saintForDate, saintExtras } from "@/lib/saints";

export const dynamic = "force-dynamic";

interface Item { label: string; text: string }
interface TodayInChurch { items: Item[]; source: "ai" | "calendar" }

// One AI call per calendar date is enough — cache the result in memory.
const cache = new Map<string, TodayInChurch>();

const MODEL = "claude-opus-4-8";

function fallback(monthDay: string, feast: string, season: string, bio?: string): TodayInChurch {
  const items: Item[] = [];
  items.push({
    label: "Today the Church keeps",
    text: bio ? `${feast}. ${bio}` : `${feast}. The faithful are invited to keep this day in prayer.`,
  });
  items.push({
    label: "The season",
    text: `It is ${season}. The Mass and Office of the season are prayed, ordering the day to Christ.`,
  });
  void monthDay;
  return { items, source: "calendar" };
}

export async function GET(request: NextRequest) {
  const date = parseDate(request.nextUrl.searchParams.get("date"));
  const key = date.toISOString().slice(0, 10);

  const cached = cache.get(key);
  if (cached) return Response.json(cached);

  const lit = await liturgicalForDate(date);
  const saint = saintForDate(date);
  const extras = saintExtras(date);
  const feast = lit.rank === "feria" ? "a weekday (feria)" : lit.name;
  const monthDay = date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const season = lit.label;

  // No key configured → honest, data-driven briefing (no AI).
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(fallback(monthDay, lit.rank === "feria" ? `${saint.name}` : lit.name, season, extras.bio));
  }

  try {
    const client = new Anthropic();
    const system =
      "You are a reverent, historically careful Catholic almanac. Produce a short 'Today in the Church' briefing of exactly three items. " +
      "Item 1 — the saint or feast the Church keeps today (2–3 sentences on who they were / what it commemorates). " +
      "Item 2 — one notable event in the history of the Church that occurred on this calendar date, including the year (only if you are confident it is accurate; otherwise give a second saint or a tradition tied to this date). " +
      "Item 3 — a brief spiritual note for the day. " +
      "Be accurate and do not invent feast days, events, or dates. Each item's `text` is 2–3 sentences; `label` is 2–4 words. " +
      "Respond with ONLY a JSON object of the form {\"items\":[{\"label\":\"...\",\"text\":\"...\"}, ...]} — no markdown, no prose, no code fences.";
    const user = `Today is ${monthDay}. The Church's calendar today: ${feast}${lit.rank !== "feria" ? "" : ` in ${season}`}.`;

    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      system,
      messages: [{ role: "user", content: user }],
    });

    const textBlock = resp.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "";
    const json = raw.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
    const parsed = JSON.parse(json) as { items?: Item[] };
    const items = (parsed.items ?? [])
      .filter((it) => it && typeof it.label === "string" && typeof it.text === "string")
      .slice(0, 3);

    if (items.length === 0) throw new Error("no items");

    const result: TodayInChurch = { items, source: "ai" };
    cache.set(key, result);
    return Response.json(result);
  } catch {
    // Any failure (no network, refusal, bad JSON) degrades to the calendar briefing.
    return Response.json(fallback(monthDay, lit.rank === "feria" ? `${saint.name}` : lit.name, season, extras.bio));
  }
}
