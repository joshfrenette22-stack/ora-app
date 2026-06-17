// Thin wrapper around the Web Speech API (SpeechSynthesis).
//
// Free, offline, no API keys. Everything degrades gracefully to a no-op when the
// browser lacks support, so callers never need to feature-detect themselves.

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Pick a calm English voice, preferring higher-quality / non-default ones. */
export function pickVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const en = voices.filter((v) => v.lang.startsWith("en"));
  const pool = en.length ? en : voices;
  // Prefer named "natural"/"google"/"daniel" style voices when present.
  const preferred = pool.find((v) => /natural|google|daniel|serena|samantha/i.test(v.name));
  return preferred ?? pool[0];
}

/**
 * Ensure the voice list is loaded. In some browsers `getVoices()` is empty until
 * the async `voiceschanged` event fires; this resolves once voices are ready.
 */
export function ensureVoices(): Promise<void> {
  return new Promise((resolve) => {
    if (!isSpeechSupported()) return resolve();
    if (window.speechSynthesis.getVoices().length) return resolve();
    const handler = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      resolve();
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    // Safety timeout — never hang if the event doesn't fire.
    setTimeout(resolve, 1000);
  });
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
  onError?: () => void;
  /** Fires as each word is spoken, with the character offset into `text`. */
  onBoundary?: (charIndex: number) => void;
}

/** Speak a single utterance. Returns false if speech is unavailable. */
export function speak(text: string, opts: SpeakOptions = {}): boolean {
  if (!isSpeechSupported() || !text.trim()) return false;
  const synth = window.speechSynthesis;
  synth.cancel(); // clear anything queued/stuck
  const u = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) u.voice = voice;
  u.rate = opts.rate ?? 0.92; // slightly slower — reverent pacing
  u.pitch = opts.pitch ?? 1;
  u.lang = voice?.lang ?? "en-US";
  if (opts.onEnd) u.onend = () => opts.onEnd!();
  if (opts.onError) u.onerror = () => opts.onError!();
  if (opts.onBoundary) {
    u.onboundary = (e: SpeechSynthesisEvent) => {
      // Highlight on word boundaries (some engines also fire sentence ones).
      if (e.name === "word" || e.name === undefined) opts.onBoundary!(e.charIndex);
    };
  }
  synth.speak(u);
  return true;
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}

export function pauseSpeaking(): void {
  if (isSpeechSupported()) window.speechSynthesis.pause();
}

export function resumeSpeaking(): void {
  if (isSpeechSupported()) window.speechSynthesis.resume();
}
