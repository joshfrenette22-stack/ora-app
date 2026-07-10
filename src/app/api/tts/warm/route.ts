import { type NextRequest } from "next/server";
import { PRAYER_CATALOG } from "@/data/prayers";
import { DEFAULT_VOICE } from "@/lib/voices";
import { cloudTtsEnabled, synthesizeVoice } from "@/lib/tts";
import {
  audioCacheEnabled,
  audioCacheKey,
  listCachedKeys,
  writeCachedAudio,
} from "@/lib/audioCache";
import { adminAuthorized, adminUnauthorizedResponse } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Pre-generate ("warm") the static prayer catalogue in the given voices so the
// durable audio cache already holds them — every later play is then free. Each
// call processes a small batch (synthesis is slow + providers cap concurrency);
// call repeatedly until `remaining` reaches 0. Already-cached items are skipped,
// so re-running is safe.
//
//   GET /api/tts/warm?voices=ID1,ID2,ID3&rate=1&limit=4
//   GET /api/tts/warm?...&dryRun=1   → report counts, generate nothing
//
// Guard: requires BACKFILL_TOKEN (Authorization: Bearer … or ?token=).
// Disabled entirely when the token is not configured.

// Defaults to the app's default voice. Override with ?voices=ID1,ID2 — useful
// for pre-warming the paid Google tiers (Studio / Chirp3-HD); the free Neural2
// voices don't need it.
const DEFAULT_VOICES = [DEFAULT_VOICE];

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  if (!adminAuthorized(request)) return adminUnauthorizedResponse();
  if (!cloudTtsEnabled()) {
    return Response.json({ error: "TTS not configured" }, { status: 400 });
  }
  if (!audioCacheEnabled()) {
    return Response.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not configured — durable cache unavailable" },
      { status: 400 },
    );
  }

  const voiceList =
    params.get("voices")?.split(",").map((v) => v.trim()).filter(Boolean) ?? [];
  const voices = voiceList.length ? voiceList : DEFAULT_VOICES;
  const rate = Number(params.get("rate")) || 1;
  const limit = Math.min(12, Math.max(1, Number(params.get("limit")) || 4));
  const dryRun = params.has("dryRun");

  // Every prayer × every voice → one synthesis task.
  type Task = { id: string; voice: string; text: string; key: string };
  const tasks: Task[] = [];
  for (const p of PRAYER_CATALOG) {
    const text = p.text?.trim();
    if (!text) continue;
    for (const voice of voices) {
      tasks.push({ id: p.id, voice, text, key: audioCacheKey({ text, rate, voice }) });
    }
  }

  const cached = await listCachedKeys();
  const todo = tasks.filter((t) => !cached.has(t.key));

  const remainingChars = todo.reduce((n, t) => n + t.text.length, 0);

  if (dryRun) {
    return Response.json({
      dryRun: true,
      voices,
      rate,
      prayers: PRAYER_CATALOG.length,
      totalTasks: tasks.length,
      alreadyCached: tasks.length - todo.length,
      remaining: todo.length,
      remainingChars,
    });
  }

  const batch = todo.slice(0, limit);
  const results = await Promise.all(
    batch.map(async (t) => {
      const audio = await synthesizeVoice(t.text, { rate, voice: t.voice });
      if (!audio) return { id: t.id, voice: t.voice, ok: false as const };
      await writeCachedAudio(t.key, audio);
      return { id: t.id, voice: t.voice, ok: true as const, bytes: audio.length };
    }),
  );

  return Response.json({
    generated: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).map((r) => ({ id: r.id, voice: r.voice })),
    remaining: Math.max(0, todo.length - batch.length),
    voices,
    rate,
  });
}
