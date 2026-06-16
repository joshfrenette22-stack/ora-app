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

/** Synthesise text to MP3 audio bytes, or null if unavailable / failed. */
export async function synthesize(text: string, { rate, voice: requested }: SynthOptions = {}): Promise<Buffer | null> {
  const key = process.env.GOOGLE_TTS_API_KEY;
  if (!key || !text.trim()) return null;

  // User-chosen voice must be on the allowlist; otherwise the admin default.
  const voice =
    requested && isValidVoice(requested)
      ? requested
      : process.env.GOOGLE_TTS_VOICE || DEFAULT_VOICE;
  try {
    const res = await fetch(`${ENDPOINT}?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: LANGUAGE, name: voice },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: rate && rate > 0 ? rate : 0.94, // reverent pacing
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
