// Google Cloud Text-to-Speech (server-side only).
//
// SETUP: set GOOGLE_TTS_API_KEY to an API key from a Google Cloud project with
// the "Cloud Text-to-Speech API" enabled. Optionally set GOOGLE_TTS_VOICE to
// override the default voice. Without the key this is disabled and the player
// falls back to the browser's built-in voice.
//
// Cost: Neural2 voices include 1,000,000 free characters per month. Because the
// audio responses are cached hard (immutable), repeated text — every "Hail
// Mary", every antiphon — is synthesised once and then served from cache.

import { DEFAULT_VOICE, isValidVoice } from "./voices";

const ENDPOINT = "https://texttospeech.googleapis.com/v1/text:synthesize";
const LANGUAGE = "en-US";

export function googleTtsEnabled(): boolean {
  return Boolean(process.env.GOOGLE_TTS_API_KEY);
}

interface SynthOptions {
  rate?: number;
  /** Requested voice from the client — validated against the allowlist. */
  voice?: string;
}

// Google TTS accepts at most 5 000 characters per request. We split longer
// texts at sentence boundaries so that a full daily reading (which can be
// 6 000–10 000 chars) is synthesised as several chunks and then concatenated
// into a single MP3 stream. MP3 frames are independently decodable, so raw
// concatenation produces a valid file.
const MAX_CHUNK = 4800; // leave a small margin under the 5 000 API limit

function splitIntoChunks(text: string, max: number): string[] {
  if (text.length <= max) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > max) {
    // Try to split at a sentence boundary (. ? ! followed by space)
    let cut = -1;
    for (let i = max; i > max * 0.4; i--) {
      if (".?!".includes(remaining[i - 1]) && (i >= remaining.length || /\s/.test(remaining[i]))) {
        cut = i;
        break;
      }
    }
    // Fall back to splitting at a space
    if (cut === -1) {
      for (let i = max; i > max * 0.4; i--) {
        if (/\s/.test(remaining[i])) { cut = i; break; }
      }
    }
    // Last resort: hard cut
    if (cut === -1) cut = max;
    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

/** Synthesise a single chunk (must be ≤ 5 000 chars). */
async function synthesizeChunk(text: string, voiceName: string, rate?: number): Promise<Buffer | null> {
  const key = process.env.GOOGLE_TTS_API_KEY!;
  try {
    const res = await fetch(`${ENDPOINT}?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: LANGUAGE, name: voiceName },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: rate && rate > 0 ? rate : 0.94,
        },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.audioContent) return null;
    return Buffer.from(data.audioContent, "base64");
  } catch {
    return null;
  }
}

/** Synthesise text to MP3 audio bytes, or null if unavailable / failed.
 *  Long texts are automatically split into chunks and stitched together. */
export async function synthesize(text: string, { rate, voice: requested }: SynthOptions = {}): Promise<Buffer | null> {
  const key = process.env.GOOGLE_TTS_API_KEY;
  if (!key || !text.trim()) return null;

  const voiceName =
    requested && isValidVoice(requested)
      ? requested
      : process.env.GOOGLE_TTS_VOICE || DEFAULT_VOICE;

  const chunks = splitIntoChunks(text, MAX_CHUNK);
  if (chunks.length === 1) return synthesizeChunk(chunks[0], voiceName, rate);

  const buffers = await Promise.all(chunks.map((c) => synthesizeChunk(c, voiceName, rate)));
  if (buffers.some((b) => !b)) return null;
  return Buffer.concat(buffers as Buffer[]);
}
