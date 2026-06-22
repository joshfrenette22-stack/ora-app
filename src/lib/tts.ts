// Provider-agnostic TTS entry point. Picks the backend (Google or ElevenLabs)
// for the requested voice and returns MP3 bytes. The route and the rest of the
// app only talk to this.

import { synthesize as googleSynthesize, googleTtsEnabled } from "./googleTts";
import { synthesizeEleven, elevenLabsEnabled } from "./elevenLabs";
import { voiceProvider } from "./voices";

/** True when any cloud voice backend is configured. */
export function cloudTtsEnabled(): boolean {
  return googleTtsEnabled() || elevenLabsEnabled();
}

interface SynthOptions {
  rate?: number;
  voice?: string;
}

/** Synthesise text with the backend that owns the requested voice. Falls back to
 *  whichever provider is configured if the chosen one is unavailable. */
export async function synthesizeVoice(text: string, { rate, voice }: SynthOptions = {}): Promise<Buffer | null> {
  const provider = voice ? voiceProvider(voice) : googleTtsEnabled() ? "google" : "elevenlabs";

  if (provider === "elevenlabs" && elevenLabsEnabled() && voice) {
    return synthesizeEleven(text, { rate, voiceId: voice });
  }
  if (googleTtsEnabled()) return googleSynthesize(text, { rate, voice });
  if (elevenLabsEnabled() && voice) return synthesizeEleven(text, { rate, voiceId: voice });
  return null;
}
