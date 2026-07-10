// The voices offered in the in-app picker. Kept small and curated rather than
// exposing all ~40 Google voices. Shared by the picker UI and the TTS route
// (which validates the requested voice against this allowlist).

export type VoiceTier = "Neural2" | "Chirp3-HD" | "Studio";

export interface Voice {
  id: string; // Google voice name, e.g. "en-US-Neural2-D"
  short: string; // display identifier, e.g. "D" or "Charon"
  /** Distinct display name shown in the pickers. */
  name: string;
  gender: "Male" | "Female";
  tier: VoiceTier;
  /** Short character descriptor shown in the picker. */
  desc: string;
  /** Covered by the generous free tier for typical use (Neural2). */
  free: boolean;
}

export const DEFAULT_VOICE = "en-US-Neural2-D";

export const VOICES: Voice[] = [
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

export const VOICE_TIERS: VoiceTier[] = ["Neural2", "Chirp3-HD", "Studio"];

export const TIER_NOTE: Record<VoiceTier, string> = {
  "Neural2": "Natural & free",
  "Chirp3-HD": "Most lifelike · premium",
  "Studio": "Narration · premium",
};

export function isValidVoice(id: string): boolean {
  return VOICES.some((v) => v.id === id);
}

/** The display name for a voice id (falls back to a generic label). */
export function voiceName(id: string): string {
  return VOICES.find((v) => v.id === id)?.name ?? "Voice";
}
