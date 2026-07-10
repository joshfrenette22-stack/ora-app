// TTS entry point. All curated voices are Google Cloud voices (the ElevenLabs
// backend was retired — see voices.ts); the route and the rest of the app only
// talk to this module, so a future second provider slots in here.

import { synthesize as googleSynthesize, googleTtsEnabled } from "./googleTts";

/** True when a cloud voice backend is configured. */
export function cloudTtsEnabled(): boolean {
  return googleTtsEnabled();
}

interface SynthOptions {
  rate?: number;
  voice?: string;
}

/** Synthesise text with the configured backend, or null when none is set up. */
export async function synthesizeVoice(text: string, { rate, voice }: SynthOptions = {}): Promise<Buffer | null> {
  if (!googleTtsEnabled()) return null;
  return googleSynthesize(text, { rate, voice });
}
