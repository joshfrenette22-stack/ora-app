// Durable, provider-agnostic audio cache backed by Supabase Storage.
//
// Without it (no SUPABASE_SERVICE_ROLE_KEY) the TTS route behaves exactly as
// before — it synthesises on demand and leans on the CDN cache. With it, each
// unique (voice, rate, text) is synthesised ONCE, stored permanently, and served
// from storage on every later request — so repeated prayers ("Hail Mary", the
// rosary, devotions) never re-spend provider credits, even across deploys.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { synthesizeVoice } from "./tts";

const BUCKET = "tts-cache";

let client: SupabaseClient | null | undefined;
function service(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return client;
}

/** True when the durable cache is configured (service-role key present). */
export function audioCacheEnabled(): boolean {
  return service() !== null;
}

interface CacheKeyInput { text: string; rate?: number; voice?: string }

/** Stable key for a synthesis request. MUST match between the live route and the
 *  warm job, or pre-generated audio won't be hit at playback time. Mirrors the
 *  request the client makes: voice + rate (omitted when 0/absent) + trimmed text. */
export function audioCacheKey({ text, rate, voice }: CacheKeyInput): string {
  const norm = `${voice ?? ""}|${rate && rate > 0 ? rate : ""}|${text.trim()}`;
  return createHash("sha256").update(norm).digest("hex");
}

const objectPath = (key: string) => `${key}.mp3`;

/** Return stored audio for a key, or null if absent / cache unconfigured. */
export async function readCachedAudio(key: string): Promise<Buffer | null> {
  const svc = service();
  if (!svc) return null;
  try {
    const { data, error } = await svc.storage.from(BUCKET).download(objectPath(key));
    if (error || !data) return null;
    const buf = Buffer.from(await data.arrayBuffer());
    return buf.length ? buf : null;
  } catch {
    return null;
  }
}

/** Persist audio for a key (best-effort; upsert so re-runs are harmless). */
export async function writeCachedAudio(key: string, audio: Buffer): Promise<void> {
  const svc = service();
  if (!svc) return;
  try {
    await svc.storage.from(BUCKET).upload(objectPath(key), audio, {
      contentType: "audio/mpeg",
      upsert: true,
      cacheControl: "31536000",
    });
  } catch {
    /* best-effort cache write */
  }
}

/** Set of cached keys currently in the bucket, for idempotent pre-warming. */
export async function listCachedKeys(): Promise<Set<string>> {
  const svc = service();
  const out = new Set<string>();
  if (!svc) return out;
  try {
    const { data } = await svc.storage.from(BUCKET).list("", { limit: 1000 });
    for (const f of data ?? []) {
      if (f.name.endsWith(".mp3")) out.add(f.name.slice(0, -4));
    }
  } catch { /* ignore */ }
  return out;
}

/** Cache-aware synthesis: serve stored audio if present, else synthesise once
 *  and store it. Falls back to plain synthesis when the cache is unconfigured. */
export async function synthesizeCached(text: string, opts: { rate?: number; voice?: string }): Promise<Buffer | null> {
  if (!audioCacheEnabled()) return synthesizeVoice(text, opts);
  const key = audioCacheKey({ text, rate: opts.rate, voice: opts.voice });
  const hit = await readCachedAudio(key);
  if (hit) return hit;
  const audio = await synthesizeVoice(text, opts);
  if (audio) await writeCachedAudio(key, audio);
  return audio;
}
