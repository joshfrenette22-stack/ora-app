import { type NextRequest } from "next/server";
import { synthesizeVoice, cloudTtsEnabled } from "@/lib/tts";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  // Capability probe — the client checks this once to choose its audio engine.
  if (params.has("probe")) {
    return new Response(null, { status: cloudTtsEnabled() ? 204 : 503 });
  }

  if (!cloudTtsEnabled()) return new Response("TTS not configured", { status: 503 });

  const text = params.get("text")?.trim();
  if (!text) return new Response("Missing text", { status: 400 });
  // Cap length: long readings are split into chunks server-side (see googleTts),
  // but we still guard against abuse.
  if (text.length > 15000) return new Response("Text too long", { status: 413 });
  const rate = Number(params.get("rate")) || undefined;
  const voice = params.get("voice") ?? undefined;

  const audio = await synthesizeVoice(text, { rate, voice });
  if (!audio) return new Response("Synthesis failed", { status: 502 });

  return new Response(new Uint8Array(audio), {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      // The text is the cache key (it's in the URL), and a passage never changes,
      // so cache forever — repeated prayers cost one synthesis, then come from cache.
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
