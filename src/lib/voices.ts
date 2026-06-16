// The voices offered in the in-app picker. Kept small and curated rather than
// exposing all ~40 Google voices. Shared by the picker UI and the TTS route
// (which validates the requested voice against this allowlist).

export type VoiceTier = "Neural2" | "Chirp3-HD" | "Studio";

export interface Voice {
  id: string; // Google voice name, e.g. "en-US-Neural2-D"
  short: string; // display identifier, e.g. "D" or "Charon"
  gender: "Male" | "Female";
  tier: VoiceTier;
  /** Covered by the generous free tier for typical use (Neural2). */
  free: boolean;
}

export const DEFAULT_VOICE = "en-US-Neural2-D";

export const VOICES: Voice[] = [
  // Neural2 — natural and free (1M characters/month).
  { id: "en-US-Neural2-D", short: "D", gender: "Male", tier: "Neural2", free: true },
  { id: "en-US-Neural2-J", short: "J", gender: "Male", tier: "Neural2", free: true },
  { id: "en-US-Neural2-A", short: "A", gender: "Male", tier: "Neural2", free: true },
  { id: "en-US-Neural2-C", short: "C", gender: "Female", tier: "Neural2", free: true },
  { id: "en-US-Neural2-F", short: "F", gender: "Female", tier: "Neural2", free: true },
  { id: "en-US-Neural2-H", short: "H", gender: "Female", tier: "Neural2", free: true },
  // Chirp 3: HD — the most lifelike, premium pricing.
  { id: "en-US-Chirp3-HD-Charon", short: "Charon", gender: "Male", tier: "Chirp3-HD", free: false },
  { id: "en-US-Chirp3-HD-Orus", short: "Orus", gender: "Male", tier: "Chirp3-HD", free: false },
  { id: "en-US-Chirp3-HD-Kore", short: "Kore", gender: "Female", tier: "Chirp3-HD", free: false },
  { id: "en-US-Chirp3-HD-Aoede", short: "Aoede", gender: "Female", tier: "Chirp3-HD", free: false },
  // Studio — narration-tuned; smaller free tier.
  { id: "en-US-Studio-Q", short: "Q", gender: "Male", tier: "Studio", free: false },
  { id: "en-US-Studio-O", short: "O", gender: "Female", tier: "Studio", free: false },
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
