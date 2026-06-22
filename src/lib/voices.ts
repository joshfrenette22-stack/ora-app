// The voices offered in the in-app picker. Kept small and curated rather than
// exposing all ~40 Google voices. Shared by the picker UI and the TTS route
// (which validates the requested voice against this allowlist).

export type VoiceTier = "ElevenLabs" | "Neural2" | "Chirp3-HD" | "Studio";

export type VoiceProvider = "google" | "elevenlabs";

export interface Voice {
  id: string; // provider voice id: Google name "en-US-Neural2-D" or an ElevenLabs voice_id
  short: string; // display identifier, e.g. "D" or "Charon"
  /** Distinct display name shown in the pickers. */
  name: string;
  gender: "Male" | "Female";
  tier: VoiceTier;
  /** Short character descriptor shown in the picker. */
  desc: string;
  /** Covered by the generous free tier for typical use (Neural2). */
  free: boolean;
  /** TTS backend. Omitted = Google (the original provider). */
  provider?: VoiceProvider;
}

export const DEFAULT_VOICE = "JBFqnCBsd6RMkjVDRZzb";

export const VOICES: Voice[] = [
  // ElevenLabs — most natural; premium (uses ElevenLabs credits). These are
  // ElevenLabs' stock "default" voice_ids, present in every account.
  { id: "JBFqnCBsd6RMkjVDRZzb", short: "George", name: "Francis", gender: "Male", tier: "ElevenLabs", desc: "Warm & reverent", free: false, provider: "elevenlabs" },
  { id: "nPczCjzI2devNBz1zQrb", short: "Brian", name: "Thomas", gender: "Male", tier: "ElevenLabs", desc: "Deep & resonant", free: false, provider: "elevenlabs" },
  { id: "onwK4e9ZLuTAKqWW03F9", short: "Daniel", name: "Ignatius", gender: "Male", tier: "ElevenLabs", desc: "Calm & steady", free: false, provider: "elevenlabs" },
  { id: "EXAVITQu4vr4xnSDxMaL", short: "Sarah", name: "Teresa", gender: "Female", tier: "ElevenLabs", desc: "Soft & warm", free: false, provider: "elevenlabs" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", short: "Alice", name: "Agnes", gender: "Female", tier: "ElevenLabs", desc: "Clear & gentle", free: false, provider: "elevenlabs" },
  { id: "XrExE9yKIg1WjnnlVkGX", short: "Matilda", name: "Rose", gender: "Female", tier: "ElevenLabs", desc: "Bright & graceful", free: false, provider: "elevenlabs" },
  // Neural2 — natural and free (1M characters/month).
  { id: "en-US-Neural2-D", short: "D", name: "Gabriel", gender: "Male", tier: "Neural2", desc: "Calm & clear", free: true },
  { id: "en-US-Neural2-J", short: "J", name: "Raphael", gender: "Male", tier: "Neural2", desc: "Deep & steady", free: true },
  { id: "en-US-Neural2-A", short: "A", name: "Michael", gender: "Male", tier: "Neural2", desc: "Bright & even", free: true },
  { id: "en-US-Neural2-C", short: "C", name: "Thérèse", gender: "Female", tier: "Neural2", desc: "Warm & gentle", free: true },
  { id: "en-US-Neural2-F", short: "F", name: "Cecilia", gender: "Female", tier: "Neural2", desc: "Soft & clear", free: true },
  { id: "en-US-Neural2-H", short: "H", name: "Bernadette", gender: "Female", tier: "Neural2", desc: "Light & graceful", free: true },
  // Chirp 3: HD — the most lifelike, premium pricing.
  { id: "en-US-Chirp3-HD-Charon", short: "Charon", name: "Augustine", gender: "Male", tier: "Chirp3-HD", desc: "Rich & lifelike", free: false },
  { id: "en-US-Chirp3-HD-Orus", short: "Orus", name: "Benedict", gender: "Male", tier: "Chirp3-HD", desc: "Bold & lifelike", free: false },
  { id: "en-US-Chirp3-HD-Kore", short: "Kore", name: "Catherine", gender: "Female", tier: "Chirp3-HD", desc: "Expressive & lifelike", free: false },
  { id: "en-US-Chirp3-HD-Aoede", short: "Aoede", name: "Clare", gender: "Female", tier: "Chirp3-HD", desc: "Lyrical & lifelike", free: false },
  // Studio — narration-tuned; smaller free tier.
  { id: "en-US-Studio-Q", short: "Q", name: "Jerome", gender: "Male", tier: "Studio", desc: "Studio narration", free: false },
  { id: "en-US-Studio-O", short: "O", name: "Monica", gender: "Female", tier: "Studio", desc: "Studio narration", free: false },
];

export const VOICE_TIERS: VoiceTier[] = ["ElevenLabs", "Neural2", "Chirp3-HD", "Studio"];

export const TIER_NOTE: Record<VoiceTier, string> = {
  "ElevenLabs": "Most natural · ElevenLabs",
  "Neural2": "Natural & free",
  "Chirp3-HD": "Most lifelike · premium",
  "Studio": "Narration · premium",
};

export function isValidVoice(id: string): boolean {
  return VOICES.some((v) => v.id === id);
}

/** Which TTS backend serves a given voice id (defaults to Google). */
export function voiceProvider(id: string): VoiceProvider {
  return VOICES.find((v) => v.id === id)?.provider ?? "google";
}

/** The display name for a voice id (falls back to a generic label). */
export function voiceName(id: string): string {
  return VOICES.find((v) => v.id === id)?.name ?? "Voice";
}
