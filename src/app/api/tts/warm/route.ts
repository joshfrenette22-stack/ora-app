import { type NextRequest } from "next/server";
import { PRAYER_CATALOG } from "@/data/prayers";
import { PRACTICE_LOVE, blockSpeech } from "@/data/practiceLove";
import { DEFAULT_VOICE } from "@/lib/voices";
import { cloudTtsEnabled, synthesizeVoice } from "@/lib/tts";
import {
  audioCacheEnabled,
  audioCacheKey,
  listCachedKeys,
  writeCachedAudio,
} from "@/lib/audioCache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Pre-generate ("warm") static narration into the durable audio cache so the
// free-tier synthesis quota is spent once, not on every play. Prayers and the
// long-form audiobook use the exact same mechanism — each unique (voice, rate,
// text) is synthesised once and stored permanently. Each call processes a small
// batch (synthesis is slow + providers cap concurrency); call repeatedly until
// `remaining` reaches 0. Already-cached items are skipped, so re-running is safe.
//
//   GET /api/tts/warm?voices=ID1,ID2,ID3&rate=1&limit=4
//   GET /api/tts/warm?content=book   → warm the audiobook instead of prayers
//   GET /api/tts/warm?content=all    → warm both
//   GET /api/tts/warm?...&dryRun=1   → report counts/credits, generate nothing
//
// The audiobook ("The Practice of the Love of Jesus Christ") is ~294k characters
// across 355 paragraphs — well within the free 1M-chars/month tier when warmed
// once. Its segments are keyed to match exactly what the reader page requests
// (default voice + rate 1), so a warmed book plays instantly from cache.
//
// Guard: if BACKFILL_TOKEN is set, require a matching ?token=.

// Defaults to the app's default voice. Override with ?voices=ID1,ID2 — useful
// for pre-warming the paid Google tiers (Studio / Chirp3-HD); the free Neural2
// voices don't need it.
const DEFAULT_VOICES = [DEFAULT_VOICE];

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const token = process.env.BACKFILL_TOKEN;
  if (token && params.get("token") !== token) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
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
  // Which narration to warm: prayers (default), the audiobook, or both.
  const content = (params.get("content") ?? "prayers").toLowerCase();
  const wantPrayers = content === "prayers" || content === "all";
  const wantBook = content === "book" || content === "all";

  // One synthesis task per (passage × voice). The key MUST match the request the
  // player makes at playback time, or the warmed audio won't be hit.
  type Task = { id: string; voice: string; text: string; key: string };
  const tasks: Task[] = [];
  if (wantPrayers) {
    for (const p of PRAYER_CATALOG) {
      const text = p.text?.trim();
      if (!text) continue;
      for (const voice of voices) {
        tasks.push({ id: p.id, voice, text, key: audioCacheKey({ text, rate, voice }) });
      }
    }
  }
  if (wantBook) {
    // Each narrated block is one player segment (see chapterSegments); warm them
    // paragraph-by-paragraph so the whole book fits under the per-request cap.
    for (const chapter of PRACTICE_LOVE.chapters) {
      chapter.blocks.forEach((block, i) => {
        const text = blockSpeech(block)?.trim();
        if (!text) return;
        const id = `${PRACTICE_LOVE.slug}-${chapter.id}-${i}`;
        for (const voice of voices) {
          tasks.push({ id, voice, text, key: audioCacheKey({ text, rate, voice }) });
        }
      });
    }
  }

  const cached = await listCachedKeys();
  const todo = tasks.filter((t) => !cached.has(t.key));

  const remainingChars = todo.reduce((n, t) => n + t.text.length, 0);
  const estCreditsTurbo = Math.round(remainingChars * 0.5); // Turbo v2.5 = 0.5 cr/char

  if (dryRun) {
    return Response.json({
      dryRun: true,
      content,
      voices,
      rate,
      prayers: wantPrayers ? PRAYER_CATALOG.length : 0,
      bookSegments: wantBook ? tasks.filter((t) => t.id.startsWith(`${PRACTICE_LOVE.slug}-`)).length / voices.length : 0,
      totalTasks: tasks.length,
      alreadyCached: tasks.length - todo.length,
      remaining: todo.length,
      remainingChars,
      estCreditsTurbo,
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
    content,
    generated: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).map((r) => ({ id: r.id, voice: r.voice })),
    remaining: Math.max(0, todo.length - batch.length),
    voices,
    rate,
  });
}
