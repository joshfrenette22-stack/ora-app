// ElevenLabs Text-to-Speech (server-side only).
//
// SETUP: set ELEVENLABS_API_KEY to a key from https://elevenlabs.io/. Voices are
// declared in voices.ts with provider "elevenlabs" and an ElevenLabs voice_id as
// their `id`. Like the Google backend, responses are cached hard (immutable), so
// repeated passages ("Hail Mary", antiphons) are synthesised once per voice.

const ENDPOINT = "https://api.elevenlabs.io/v1/text-to-speech";
// Low-latency, cost-efficient model; still very natural for narration.
const MODEL = process.env.ELEVENLABS_MODEL || "eleven_turbo_v2_5";
const OUTPUT_FORMAT = "mp3_44100_128";

export function elevenLabsEnabled(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

interface ElevenOptions {
  /** Speed multiplier from the app (1 = normal). Clamped to ElevenLabs' range. */
  rate?: number;
  /** ElevenLabs voice_id. */
  voiceId: string;
}

// ElevenLabs accepts long inputs, but we split at sentence boundaries so a full
// reading is synthesised in parallel chunks and stitched together (MP3 frames
// are independently decodable, so raw concatenation yields a valid file).
const MAX_CHUNK = 2500;

function splitIntoChunks(text: string, max: number): string[] {
  if (text.length <= max) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > max) {
    let cut = -1;
    for (let i = max; i > max * 0.4; i--) {
      if (".?!".includes(remaining[i - 1]) && (i >= remaining.length || /\s/.test(remaining[i]))) { cut = i; break; }
    }
    if (cut === -1) for (let i = max; i > max * 0.4; i--) { if (/\s/.test(remaining[i])) { cut = i; break; } }
    if (cut === -1) cut = max;
    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

async function synthChunk(text: string, voiceId: string, speed: number): Promise<Buffer | null> {
  const key = process.env.ELEVENLABS_API_KEY!;
  try {
    const res = await fetch(`${ENDPOINT}/${encodeURIComponent(voiceId)}?output_format=${OUTPUT_FORMAT}`, {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: MODEL,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0,
          use_speaker_boost: true,
          speed,
        },
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[elevenlabs] HTTP ${res.status} voice=${voiceId} model=${MODEL} body=${body.slice(0, 500)}`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length ? buf : null;
  } catch (err) {
    console.error(`[elevenlabs] fetch threw voice=${voiceId}:`, err);
    return null;
  }
}

/** Synthesise text to MP3 bytes via ElevenLabs, or null if unavailable/failed. */
export async function synthesizeEleven(text: string, { rate, voiceId }: ElevenOptions): Promise<Buffer | null> {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error("[elevenlabs] ELEVENLABS_API_KEY is not set in this environment");
    return null;
  }
  if (!voiceId || !text.trim()) return null;
  // ElevenLabs supports speeds 0.7–1.2; map the app's rate into that band.
  const speed = Math.min(1.2, Math.max(0.7, rate && rate > 0 ? rate : 1));

  const chunks = splitIntoChunks(text, MAX_CHUNK);
  if (chunks.length === 1) return synthChunk(chunks[0], voiceId, speed);

  const buffers = await Promise.all(chunks.map((c) => synthChunk(c, voiceId, speed)));
  if (buffers.some((b) => !b)) return null;
  return Buffer.concat(buffers as Buffer[]);
}
