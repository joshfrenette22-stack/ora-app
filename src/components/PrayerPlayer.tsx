"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LucideIcon } from "./UI";
import { useVoice } from "./VoiceProvider";
import { wordStarts, wordIndexAtChar, countWords } from "@/lib/words";
import {
  ensureVoices,
  isSpeechSupported,
  pauseSpeaking,
  resumeSpeaking,
  speak,
  stopSpeaking,
} from "@/lib/speech";

export interface NarrationSegment {
  id: string;
  /** Optional short label shown in the player ("Gospel", "Hail Mary 3"). */
  label?: string;
  text: string;
}

/** Cloud-TTS audio URL for a segment. The text + voice form the cache key, so
 *  identical passages (every "Hail Mary") are synthesised once per voice and
 *  then served from cache. */
function ttsUrl(text: string, rate?: number, voice?: string): string {
  const params = new URLSearchParams({ text });
  if (rate && rate > 0) params.set("rate", String(rate));
  if (voice) params.set("voice", voice);
  return `/api/tts?${params.toString()}`;
}

type Status = "idle" | "playing" | "paused";

export interface UseNarrationOptions {
  segments: NarrationSegment[];
  rate?: number;
  loop?: boolean;
  onSegmentChange?: (index: number) => void;
  onComplete?: () => void;
}

export interface Narration {
  supported: boolean;
  status: Status;
  index: number;
  count: number;
  /** Overall playback position 0–1 across all segments (for the waveform). */
  progress: number;
  /** Estimated total length of the whole narration, in seconds. */
  duration: number;
  /** Estimated elapsed time, in seconds (0 → duration as it plays). */
  elapsed: number;
  /** True from pressing play until audio/speech actually begins. */
  loading: boolean;
  /** Live animated level 0–1 (device voice, which has no analysable stream). */
  getLevel: () => number;
  /** Decoded amplitude shape of the current cloud segment (0–1 per bar), or null. */
  peaks: number[] | null;
  /** Playback fraction within the current segment (0–1) — fills the waveform. */
  segProgress: number;
  /** Index of the word being spoken within the current segment (−1 if none). */
  wordIndex: number;
  current: NarrationSegment | undefined;
  play: (from?: number) => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (i: number) => void;
  stop: () => void;
  /** Cancel any speech and jump to an index without speaking (idle). */
  reset: (i?: number) => void;
}

/**
 * Plays a linear list of segments aloud, auto-advancing through them. A
 * generation counter guards against the spurious `onend` that fires when we
 * cancel an utterance, so manual skips never trigger a double-advance.
 */
export function useNarration({
  segments,
  rate: rateOption,
  loop = false,
  onSegmentChange,
  onComplete,
}: UseNarrationOptions): Narration {
  // Optimistic: render controls on the server and at hydration (matching markup),
  // then downgrade after mount only if the browser truly lacks speech support.
  const [supported, setSupported] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [index, setIndex] = useState(0);
  const [frac, setFrac] = useState(0); // playback fraction within the current segment
  const [wordIndex, setWordIndex] = useState(-1); // word being spoken within the segment
  const [loading, setLoading] = useState(false); // play pressed → audio actually started
  const { voice, speed } = useVoice();
  // The chosen reading speed wins; a page may still pass an explicit rate.
  const rate = rateOption ?? speed;

  const genRef = useRef(0);
  const segmentsRef = useRef(segments);
  const changeRef = useRef(onSegmentChange);
  const completeRef = useRef(onComplete);
  // Holds the latest playIndex so onEnd can recurse without a render-time self-reference.
  const playNextRef = useRef<(i: number) => void>(() => {});
  // Audio engine: "google" = human cloud voice (when configured), else the
  // browser's Web Speech API.
  const engineRef = useRef<"browser" | "google">("browser");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // AudioContext is used only to DECODE the cloud audio into a real waveform
  // (precomputed peaks). We deliberately do NOT route the <audio> element through
  // a MediaElementSource analyser — on iOS Safari that feeds the analyser silence
  // (and can mute the element), which is why the live wave read flat.
  const audioCtxRef = useRef<AudioContext | null>(null);
  // The current cloud segment's real amplitude shape (0–1 per bar), or null.
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const peaksGenRef = useRef(0);
  // Whether speech/audio is currently producing sound (drives the animated
  // fallback level for the browser voice, which has no analysable stream).
  const soundingRef = useRef(false);
  // Resolves once we know which engine to use (prevents the first segment
  // falling back to the browser voice while the cloud probe is in-flight).
  const engineReadyRef = useRef<Promise<void>>(Promise.resolve());
  // Whether the probe has settled. Once it has, we start playback synchronously
  // inside the click handler — iOS Safari silently drops speech/audio that is
  // started from a deferred promise callback (it loses the user-gesture).
  const engineResolvedRef = useRef(false);

  // Keep mutable refs in sync via effects (writing refs during render is disallowed).
  useEffect(() => { segmentsRef.current = segments; }, [segments]);
  useEffect(() => { changeRef.current = onSegmentChange; }, [onSegmentChange]);
  useEffect(() => { completeRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    // Capability detection runs on the client only, after mount, to avoid a
    // hydration mismatch between the server and the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(isSpeechSupported());
    ensureVoices();
    audioRef.current = typeof Audio !== "undefined" ? new Audio() : null;
    let alive = true;
    // Prefer the cloud voice when the server reports it's configured.
    engineReadyRef.current = fetch("/api/tts?probe=1")
      .then((r) => {
        if (alive && r.status === 204) {
          engineRef.current = "google";
          setSupported(true);
        }
      })
      .catch(() => {})
      .finally(() => { engineResolvedRef.current = true; });
    return () => {
      alive = false;
      stopSpeaking();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    };
  }, []);

  // Track an estimation interval for browser speech progress.
  const estimateRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clearEstimate = useCallback(() => {
    if (estimateRef.current) { clearInterval(estimateRef.current); estimateRef.current = null; }
  }, []);

  // Core segment player — separated so playSegment can await the engine probe.
  const startSegmentRef = useRef<(text: string, onEnd: () => void, onError: () => void) => void>(() => {});

  // Fetch + decode a cloud-audio segment into a real waveform shape (one peak
  // per bar). Runs off the playback path — decodeAudioData is reliable on iOS,
  // unlike a live MediaElementSource analyser. The audio itself keeps playing
  // straight from the <audio> element.
  const NUM_PEAKS = 96;
  const decodePeaks = useCallback((url: string, gen: number) => {
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) return;
        audioCtxRef.current = new Ctx();
      }
      const ctx = audioCtxRef.current;
      fetch(url)
        .then((r) => r.arrayBuffer())
        .then((buf) => ctx.decodeAudioData(buf))
        .then((audio) => {
          if (gen !== peaksGenRef.current) return; // superseded
          const ch = audio.getChannelData(0);
          const bucket = Math.floor(ch.length / NUM_PEAKS) || 1;
          const out: number[] = [];
          let max = 0.0001;
          for (let i = 0; i < NUM_PEAKS; i++) {
            let sum = 0;
            const start = i * bucket;
            for (let j = 0; j < bucket && start + j < ch.length; j++) {
              const v = ch[start + j];
              sum += v * v;
            }
            const rms = Math.sqrt(sum / bucket);
            out.push(rms);
            if (rms > max) max = rms;
          }
          // Normalise so the loudest moment ≈ 1, with a gentle floor.
          const norm = out.map((v) => Math.max(0.06, Math.min(1, (v / max) ** 0.85)));
          if (gen === peaksGenRef.current) setPeaks(norm);
        })
        .catch(() => {});
    } catch {
      /* best-effort — falls back to the animated wave */
    }
  }, []);

  // Speak one segment through the active engine, falling back to the browser
  // voice if the cloud audio can't play.
  const playSegment = useCallback(
    (text: string, onEnd: () => void, onError: () => void) => {
      clearEstimate();
      // Stop any previous playback before starting the new segment.
      stopSpeaking();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.onended = null; audioRef.current.onerror = null; audioRef.current.ontimeupdate = null; }

      // Once the probe has settled, start synchronously so the call stays inside
      // the user gesture (iOS requirement). Only the very first play — before the
      // probe resolves — needs to wait, and that path may need a second tap.
      if (engineResolvedRef.current) {
        startSegmentRef.current(text, onEnd, onError);
      } else {
        engineReadyRef.current.then(() => startSegmentRef.current(text, onEnd, onError));
      }
    },
    [clearEstimate],
  );

  const startSegment = useCallback(
    (text: string, onEnd: () => void, onError: () => void) => {
      const starts = wordStarts(text);
      const wc = starts.length;

      // Shared handler: when a boundary event fires (browser speech), update
      // both wordIndex AND frac so the waveform tracks progress.
      let boundaryFired = false;
      const onBoundary = (ci: number) => {
        boundaryFired = true;
        setLoading(false);
        soundingRef.current = true;
        const wi = wordIndexAtChar(starts, ci);
        setWordIndex(wi);
        if (wc > 0) setFrac(Math.min(1, (wi + 1) / wc));
      };

      if (engineRef.current === "google" && audioRef.current) {
        const a = audioRef.current;
        const url = ttsUrl(text, rate, voice);
        // New segment → drop the old waveform and decode the real one.
        const gen = ++peaksGenRef.current;
        setPeaks(null);
        decodePeaks(url, gen);
        let settled = false;
        const finish = () => { if (!settled) { settled = true; soundingRef.current = false; onEnd(); } };
        const fallback = () => {
          if (settled) return;
          settled = true;
          a.onended = null;
          a.onerror = null;
          // Cloud audio failed — invalidate its decode and animate the device voice.
          peaksGenRef.current++;
          setPeaks(null);
          if (!speak(text, { rate, onStart: () => { setLoading(false); soundingRef.current = true; }, onEnd, onError, onBoundary })) onError();
        };
        a.onplaying = () => { setLoading(false); soundingRef.current = true; };
        a.onended = finish;
        a.onerror = fallback;
        a.ontimeupdate = () => {
          if (a.duration > 0) {
            setLoading(false);
            const f = a.currentTime / a.duration;
            setFrac(f);
            if (wc > 0) setWordIndex(Math.min(wc - 1, Math.floor(f * wc)));
          }
        };
        a.src = url;
        a.play().catch(fallback);
        return;
      }

      // Browser speech — set up a timer-based fallback that estimates progress
      // in case the browser doesn't fire boundary events (common on mobile).
      const effectiveRate = rate ?? 0.92;
      // ~160 WPM base rate, scaled by speech rate
      const estimatedDurationMs = wc > 0 ? (wc / (160 * effectiveRate / 60)) * 1000 : 5000;
      const startTime = Date.now();
      estimateRef.current = setInterval(() => {
        if (boundaryFired) return; // real events are flowing — don't interfere
        const elapsed = Date.now() - startTime;
        const f = Math.min(0.98, elapsed / estimatedDurationMs);
        setFrac(f);
        if (wc > 0) setWordIndex(Math.min(wc - 1, Math.floor(f * wc)));
      }, 120);

      const wrappedStart = () => { setLoading(false); soundingRef.current = true; };
      const wrappedEnd = () => { clearEstimate(); soundingRef.current = false; setFrac(1); onEnd(); };
      const wrappedError = () => { clearEstimate(); soundingRef.current = false; setLoading(false); onError(); };

      if (!speak(text, { rate, onStart: wrappedStart, onEnd: wrappedEnd, onError: wrappedError, onBoundary })) {
        clearEstimate();
        setLoading(false);
        onError();
      }
    },
    [rate, voice, clearEstimate, decodePeaks],
  );

  useEffect(() => { startSegmentRef.current = startSegment; }, [startSegment]);

  // Clean up estimation timer on unmount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => clearEstimate, [clearEstimate]);

  const playIndex = useCallback(
    (i: number) => {
      const list = segmentsRef.current;
      if (i < 0 || i >= list.length) return;
      const gen = ++genRef.current;
      setIndex(i);
      setFrac(0);
      setWordIndex(-1);
      setLoading(true);
      soundingRef.current = false;
      changeRef.current?.(i);
      setStatus("playing");
      // Warm the next segment's audio so auto-advance is gapless.
      if (engineRef.current === "google" && i + 1 < list.length) {
        void fetch(ttsUrl(list[i + 1].text, rate, voice)).catch(() => {});
      }
      playSegment(
        list[i].text,
        () => {
          if (gen !== genRef.current) return; // superseded by a manual action
          const nextIdx = i + 1;
          if (nextIdx < segmentsRef.current.length) playNextRef.current(nextIdx);
          else if (loop) playNextRef.current(0);
          else { setStatus("idle"); completeRef.current?.(); }
        },
        () => { if (gen === genRef.current) { setStatus("idle"); setLoading(false); } },
      );
    },
    [rate, loop, voice, playSegment],
  );

  useEffect(() => { playNextRef.current = playIndex; }, [playIndex]);

  // Re-speak the current segment at the new speed when it changes mid-prayer.
  const statusRef = useRef(status);
  const indexRef = useRef(index);
  const speedRef = useRef(speed);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { indexRef.current = index; }, [index]);
  useEffect(() => {
    if (speedRef.current === speed) return;
    speedRef.current = speed;
    if (statusRef.current === "playing") playIndex(indexRef.current);
  }, [speed, playIndex]);

  const play = useCallback((from?: number) => playIndex(from ?? index), [playIndex, index]);

  const pause = useCallback(() => {
    if (engineRef.current === "google") audioRef.current?.pause();
    else pauseSpeaking();
    soundingRef.current = false;
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    if (engineRef.current === "google") audioRef.current?.play().catch(() => {});
    else resumeSpeaking();
    soundingRef.current = true;
    setStatus("playing");
  }, []);

  const stop = useCallback(() => {
    genRef.current++;
    clearEstimate();
    if (audioRef.current) audioRef.current.pause();
    stopSpeaking();
    soundingRef.current = false;
    setStatus("idle");
    setFrac(0);
    setWordIndex(-1);
    setLoading(false);
  }, [clearEstimate]);

  // Animated level (0–1) for the device/Siri voice, which gives no audio stream
  // to analyse. The cloud voice instead renders its decoded waveform (`peaks`).
  const getLevel = useCallback(() => {
    if (statusRef.current === "playing") {
      const t = performance.now() / 1000;
      const v = 0.45 + 0.3 * Math.sin(t * 8.5) + 0.22 * Math.sin(t * 5.1) + 0.16 * Math.sin(t * 13.3);
      return Math.max(0.12, Math.min(1, v));
    }
    return 0;
  }, []);

  const toggle = useCallback(() => {
    if (status === "playing") pause();
    else if (status === "paused") resume();
    else playIndex(index);
  }, [status, pause, resume, playIndex, index]);

  const seek = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(segmentsRef.current.length - 1, i));
      if (status === "idle") {
        genRef.current++;
        setIndex(clamped);
        setFrac(0);
        setWordIndex(-1);
        changeRef.current?.(clamped);
      } else {
        playIndex(clamped);
      }
    },
    [status, playIndex],
  );

  const next = useCallback(() => seek(index + 1), [seek, index]);
  const prev = useCallback(() => seek(index - 1), [seek, index]);

  const reset = useCallback((i = 0) => {
    genRef.current++;
    clearEstimate();
    if (audioRef.current) audioRef.current.pause();
    stopSpeaking();
    soundingRef.current = false;
    setStatus("idle");
    const clamped = Math.max(0, Math.min(segmentsRef.current.length - 1, i));
    setIndex(clamped);
    setFrac(0);
    setWordIndex(-1);
    setLoading(false);
    changeRef.current?.(clamped);
  }, [clearEstimate]);

  const count = segments.length;
  const progress = count > 0 ? Math.min(1, (index + frac) / count) : 0;

  // Estimated total length from word count at the current speaking rate
  // (~160 wpm × rate). Used for the player's running timestamp.
  const totalWords = useMemo(
    () => segments.reduce((n, s) => n + countWords(s.text), 0),
    [segments],
  );
  const wordsPerSec = (160 * (rate || 1)) / 60;
  const duration = totalWords > 0 && wordsPerSec > 0 ? totalWords / wordsPerSec : 0;
  const elapsed = duration * progress;

  return {
    supported,
    status,
    index,
    count,
    progress,
    duration,
    elapsed,
    loading,
    getLevel,
    peaks,
    segProgress: frac,
    wordIndex,
    current: segments[index],
    play,
    pause,
    resume,
    toggle,
    next,
    prev,
    seek,
    stop,
    reset,
  };
}

// ── Waveform "voice track" ────────────────────────────────────────────────────

const WAVE_BARS = 64;
function seededRand(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}
const WAVE_HEIGHTS = Array.from({ length: WAVE_BARS }, (_, i) => {
  const t = i / (WAVE_BARS - 1);
  const env = Math.sin(Math.PI * t) ** 0.6;
  const n1 = seededRand(i * 3 + 7) * 0.5;
  const n2 = seededRand(i * 7 + 13) * 0.3;
  const n3 = seededRand(i * 11 + 31) * 0.2;
  const spike = seededRand(i * 17 + 5) > 0.82 ? 0.3 : 0;
  const raw = 0.22 + env * (n1 + n2 + n3 + spike);
  return Math.max(0.08, Math.min(1, raw));
});

/**
 * A live scrolling waveform: each frame the current audio level is pushed onto a
 * ring buffer and the whole buffer scrolls left, so the bars read like a real
 * waveform playing — tall where the speaker is loud, short in the pauses. When
 * idle it shows a calm static shape.
 */
function useScrollingWave(bars: number, playing: boolean, getLevel?: () => number, idle?: number[]): number[] {
  const [buf, setBuf] = useState<number[]>(() => new Array(bars).fill(0));
  useEffect(() => {
    if (!playing || !getLevel) return;
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      if (t - last > 45) {
        last = t;
        // Push the newest sample on the right and scroll the rest left.
        setBuf((prev) => {
          const base = prev.length === bars ? prev.slice(1) : new Array(Math.max(0, bars - 1)).fill(0);
          base.push(getLevel());
          return base;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, getLevel, bars]);
  return playing ? buf : (idle ?? buf);
}

/** Map a source array of amplitudes to exactly `n` bars (nearest sample). */
function resampleBars(src: number[], n: number): number[] {
  if (src.length === n) return src;
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(src[Math.floor((i * src.length) / n)] ?? 0);
  return out;
}

function Waveform({
  dark, playing, getLevel, peaks, segProgress = 0,
}: { dark?: boolean; playing?: boolean; getLevel?: () => number; peaks?: number[] | null; segProgress?: number }) {
  const rest = dark ? "rgba(239,230,214,0.18)" : "var(--stone-300)";
  const live = dark ? "var(--gold)" : "var(--gold-deep)";
  const usePeaks = !!(peaks && peaks.length);
  // Real cloud waveform (static shape, fills as it plays) when decoded; otherwise
  // the animated scrolling level for the device voice.
  const scroll = useScrollingWave(WAVE_BARS, !!playing && !usePeaks, getLevel, WAVE_HEIGHTS.map((h) => h * 0.5));
  const bars = usePeaks ? resampleBars(peaks!, WAVE_BARS) : scroll;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 1.5, height: 28 }}>
      {bars.map((lv, i) => {
        const h = Math.max(0.06, Math.min(1, lv));
        let bg: string;
        let op: number;
        if (usePeaks) {
          const played = i / WAVE_BARS <= segProgress;
          bg = played ? live : rest;
          op = played ? 0.95 : 0.4;
        } else {
          const recency = i / (WAVE_BARS - 1);
          bg = playing ? live : rest;
          op = playing ? 0.45 + 0.55 * recency : 0.4;
        }
        return (
          <span key={i} style={{ flex: 1, minWidth: 1.5, maxWidth: 3.5, height: `${Math.round(h * 100)}%`, borderRadius: 1, background: bg, opacity: op }} />
        );
      })}
    </div>
  );
}

// ── Player bar UI ─────────────────────────────────────────────────────────────

export function PlayerBar({
  narration,
  dark = false,
  title,
}: {
  narration: Narration;
  dark?: boolean;
  title?: string;
}) {
  const { supported, status, index, count, current } = narration;
  const { speed, setSpeed } = useVoice();
  const SPEEDS = [0.75, 1, 1.25, 1.5];
  const cycleSpeed = () => {
    const i = SPEEDS.indexOf(speed);
    setSpeed(SPEEDS[(i + 1) % SPEEDS.length] ?? 1);
  };
  const speedLabel = `${Number.isInteger(speed) ? speed : speed.toString().replace(/0+$/, "")}×`;

  if (!supported) {
    return (
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: dark ? "rgba(236,227,204,0.55)" : "var(--stone-400)",
          fontStyle: "italic",
        }}
      >
        Voice narration isn’t available in this browser.
      </div>
    );
  }

  const fg = dark ? "var(--gold-bright)" : "var(--ink)";
  const accent = dark ? "var(--gold)" : "var(--gold-deep)";
  const subtle = dark ? "rgba(236,227,204,0.45)" : "var(--stone-400)";
  const border = dark ? "1px solid rgba(239,230,214,.12)" : "1px solid var(--stone-200)";
  const surface = dark ? "rgba(239,230,214,0.05)" : "var(--bone-raised)";
  const playing = status === "playing";

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 14px",
      borderRadius: 16,
      border,
      background: surface,
      boxShadow: dark ? "none" : "var(--shadow-sm)",
    }}>
      {/* Play/pause */}
      <button
        onClick={narration.toggle}
        aria-label={playing ? "Pause" : "Play"}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "none",
          background: dark ? "rgba(239,230,214,0.12)" : "var(--gold-faint)",
          color: accent,
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        {narration.loading
          ? <span style={{ animation: "oraSpin 1s linear infinite", display: "grid", placeItems: "center" }}><LucideIcon name="loader" size={18} /></span>
          : <LucideIcon name={playing ? "pause" : "play"} size={18} />}
      </button>

      {/* Waveform + label */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 4,
        }}>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: 12.5,
            fontWeight: 600,
            color: fg,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1,
          }}>
            {current?.label ?? title ?? "Listen"}
          </div>
          {count > 1 && (
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: 10.5,
              color: subtle,
              flexShrink: 0,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
            }}>
              {index + 1}/{count}
            </div>
          )}
        </div>
        <Waveform dark={dark} playing={playing} getLevel={narration.getLevel} peaks={narration.peaks} segProgress={narration.segProgress} />
      </div>

      {/* Skip controls */}
      {count > 1 && (
        <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
          <button
            onClick={narration.prev}
            aria-label="Previous"
            disabled={index === 0}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "none",
              background: "transparent",
              color: index === 0 ? (dark ? "rgba(239,230,214,0.15)" : "var(--stone-300)") : (dark ? "rgba(239,230,214,0.5)" : "var(--ink-500)"),
              cursor: index === 0 ? "default" : "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            <LucideIcon name="skip-back" size={14} />
          </button>
          <button
            onClick={narration.next}
            aria-label="Next"
            disabled={index >= count - 1}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "none",
              background: "transparent",
              color: index >= count - 1 ? (dark ? "rgba(239,230,214,0.15)" : "var(--stone-300)") : (dark ? "rgba(239,230,214,0.5)" : "var(--ink-500)"),
              cursor: index >= count - 1 ? "default" : "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            <LucideIcon name="skip-forward" size={14} />
          </button>
        </div>
      )}

      {/* Speed */}
      <button
        onClick={cycleSpeed}
        aria-label={`Reading speed ${speedLabel}`}
        title="Reading speed"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".02em",
          color: accent,
          flexShrink: 0,
          cursor: "pointer",
          border: "none",
          background: dark ? "rgba(239,230,214,0.08)" : "var(--gold-faint)",
          borderRadius: 999,
          padding: "5px 10px",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {speedLabel}
      </button>
    </div>
  );
}

// ── Follow-along text ─────────────────────────────────────────────────────────

/**
 * Renders `text` word-by-word and highlights the one currently being spoken,
 * scrolling it into view so the reader can follow along. `wordOffset` accounts
 * for any words spoken before this text within the same segment (e.g. a title or
 * antiphon read aloud ahead of the body).
 */
export function SpokenText({
  text,
  active,
  wordIndex,
  wordOffset = 0,
  dark = false,
  as: Tag = "p",
  className,
  style,
  autoScroll = true,
}: {
  text: string;
  active: boolean;
  wordIndex: number;
  wordOffset?: number;
  dark?: boolean;
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
  autoScroll?: boolean;
}) {
  const tokens = useMemo(() => text.split(/(\s+)/), [text]);
  const activeRef = useRef<HTMLSpanElement | null>(null);
  const local = active ? wordIndex - wordOffset : -1;

  useEffect(() => {
    if (!active || local < 0 || !autoScroll) return;
    const el = activeRef.current;
    if (!el) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [local, active, autoScroll]);

  const hi: React.CSSProperties = dark
    ? { background: "rgba(239,230,214,0.24)", color: "#FFF8ED", fontWeight: 600 }
    : { background: "rgba(210,107,67,0.20)", color: "var(--gold-deep)", fontWeight: 600 };

  let wi = -1;
  return (
    <Tag className={className} style={style}>
      {tokens.map((tok, i) => {
        if (tok === "" || /^\s+$/.test(tok)) return tok;
        wi++;
        const on = wi === local;
        return (
          <span
            key={i}
            ref={on ? activeRef : undefined}
            style={on
              ? { ...hi, borderRadius: 4, padding: "0.05em 0.14em", margin: "0 -0.14em", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", transition: "background .1s ease, color .1s ease" }
              : undefined}
          >
            {tok}
          </span>
        );
      })}
    </Tag>
  );
}

/** Convenience: hook + bar wired together for linear content. */
export function PrayerPlayer({
  segments,
  rate,
  dark = false,
  title,
}: {
  segments: NarrationSegment[];
  rate?: number;
  dark?: boolean;
  title?: string;
}) {
  const narration = useNarration({ segments, rate });
  return <PlayerBar narration={narration} dark={dark} title={title} />;
}

// ── Floating mini-player (Spotify-style, above bottom nav) ────────────────────

import { useNowPlaying, useNowPlayingLive } from "./NowPlayingProvider";
import type { IllustrationKey } from "@/lib/illustrations";

/** Pages call this to register their narration for the floating player. */
export function useRegisterNarration(narration: Narration, title: string, dark = false, illustration?: IllustrationKey) {
  const { register, unregister } = useNowPlaying();
  // Keep a mutable ref so the getter always returns the latest narration
  // without needing to re-register on every render.
  const narrationRef = useRef(narration);
  useEffect(() => { narrationRef.current = narration; });
  const getterRef = useRef(() => narrationRef.current);
  useEffect(() => {
    register(getterRef.current, title, dark, illustration);
    return () => unregister(getterRef.current);
  }, [register, unregister, title, dark, illustration]);
}

/** A "Listen to X" button that pages render instead of an inline PlayerBar. */
export function ListenButton({
  narration,
  label = "Listen",
  dark = false,
}: {
  narration: Narration;
  label?: string;
  dark?: boolean;
}) {
  const { speed, setSpeed } = useVoice();
  const SPEEDS = [0.75, 1, 1.25, 1.5];
  const cycleSpeed = () => {
    const i = SPEEDS.indexOf(speed);
    setSpeed(SPEEDS[(i + 1) % SPEEDS.length] ?? 1);
  };
  const speedLabel = `${Number.isInteger(speed) ? speed : speed.toString().replace(/0+$/, "")}×`;
  const active = narration.status !== "idle";
  const accent = dark ? "var(--gold)" : "var(--gold-deep)";

  // Loading: true between pressing play and audio/speech actually starting.
  const loading = narration.loading;

  if (!narration.supported) return null;

  const handleClick = () => {
    if (active) narration.toggle();
    else narration.play(0);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 24px 12px 18px",
          borderRadius: 14,
          border: "none",
          background: active
            ? (dark ? "rgba(239,230,214,0.14)" : "var(--gold-faint)")
            : (dark ? "var(--gilt)" : "var(--gilt)"),
          color: active ? accent : "#FFF8ED",
          cursor: loading ? "wait" : "pointer",
          fontFamily: "var(--font-display)",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: ".01em",
          transition: "transform .12s, box-shadow .12s",
          boxShadow: active ? "none" : (dark ? "0 4px 16px rgba(200,90,44,0.35)" : "var(--shadow-gold)"),
          opacity: loading ? 0.8 : 1,
        }}
      >
        <span style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: active ? accent : "rgba(255,255,255,0.2)",
          color: active ? "#fff" : "inherit",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}>
          {loading ? (
            <span style={{ animation: "oraSpin 1s linear infinite", display: "grid", placeItems: "center" }}>
              <LucideIcon name="loader" size={14} />
            </span>
          ) : (
            <LucideIcon name={narration.status === "playing" ? "pause" : "play"} size={14} />
          )}
        </span>
        {loading ? "Loading..." : active ? (narration.status === "playing" ? "Pause" : "Resume") : label}
      </button>
      {active && (
        <button
          onClick={narration.stop}
          aria-label="Stop"
          style={{
            width: 36, height: 36, borderRadius: "50%", border: "none",
            background: dark ? "rgba(239,230,214,0.08)" : "var(--stone-100)",
            color: dark ? "rgba(239,230,214,0.5)" : "var(--stone-400)",
            cursor: "pointer", display: "grid", placeItems: "center",
          }}
        >
          <LucideIcon name="x" size={15} />
        </button>
      )}
      <button
        onClick={cycleSpeed}
        aria-label={`Speed ${speedLabel}`}
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 11.5,
          fontWeight: 700,
          color: dark ? "var(--gold)" : "var(--gold-deep)",
          cursor: "pointer",
          border: dark ? "1px solid rgba(239,230,214,0.12)" : "1px solid var(--stone-200)",
          background: dark ? "rgba(239,230,214,0.06)" : "var(--bone-raised)",
          borderRadius: 999,
          padding: "7px 12px",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {speedLabel}
      </button>
    </div>
  );
}

/** Rendered in AppShell — floating player above bottom nav with waveform. */
export function FloatingPlayer() {
  const { narration, title, illustration } = useNowPlayingLive();
  const [expanded, setExpanded] = useState(false);

  // Close full-screen when playback stops (must use effect, not during render).
  const idle = !narration || narration.status === "idle";
  useEffect(() => { if (idle) setExpanded(false); }, [idle]);

  if (idle) return null;

  const { status, index, count } = narration;
  const accent = "var(--gold-deep)";
  const playing = status === "playing";

  if (expanded) {
    return <FullScreenPlayer narration={narration} title={title} illustration={illustration} onCollapse={() => setExpanded(false)} />;
  }

  return (
    <div
      className="pw-floating-player"
      onClick={() => setExpanded(true)}
      style={{
        position: "fixed",
        left: 8,
        right: 8,
        bottom: "calc(68px + env(safe-area-inset-bottom, 0px))",
        zIndex: 45,
        borderRadius: 16,
        background: "var(--bone-raised)",
        border: "1px solid var(--stone-200)",
        boxShadow: "0 -4px 24px rgba(45,30,18,0.12), 0 2px 8px rgba(45,30,18,0.08)",
        cursor: "pointer",
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
      }}>
        {/* Play/pause */}
        <button
          onClick={(e) => { e.stopPropagation(); narration.toggle(); }}
          aria-label={playing ? "Pause" : "Play"}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: "none",
            background: "var(--gold-faint)",
            color: accent,
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          {narration.loading
            ? <span style={{ animation: "oraSpin 1s linear infinite", display: "grid", placeItems: "center" }}><LucideIcon name="loader" size={16} /></span>
            : <LucideIcon name={playing ? "pause" : "play"} size={16} />}
        </button>

        {/* Waveform + label */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 4,
          }}>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--ink)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1,
            }}>
              {narration.current?.label ?? title}
            </div>
            {count > 1 && (
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: 10,
                color: "var(--stone-400)",
                flexShrink: 0,
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}>
                {index + 1}/{count}
              </div>
            )}
          </div>
          <Waveform playing={playing} getLevel={narration.getLevel} peaks={narration.peaks} segProgress={narration.segProgress} />
        </div>

        {/* Skip */}
        {count > 1 && (
          <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
            <button
              onClick={(e) => { e.stopPropagation(); narration.prev(); }}
              disabled={index === 0}
              aria-label="Previous"
              style={{
                width: 28, height: 28, borderRadius: "50%", border: "none",
                background: "transparent", cursor: index === 0 ? "default" : "pointer",
                color: index === 0 ? "var(--stone-300)" : "var(--ink-500)",
                display: "grid", placeItems: "center",
              }}
            >
              <LucideIcon name="skip-back" size={13} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); narration.next(); }}
              disabled={index >= count - 1}
              aria-label="Next"
              style={{
                width: 28, height: 28, borderRadius: "50%", border: "none",
                background: "transparent", cursor: index >= count - 1 ? "default" : "pointer",
                color: index >= count - 1 ? "var(--stone-300)" : "var(--ink-500)",
                display: "grid", placeItems: "center",
              }}
            >
              <LucideIcon name="skip-forward" size={13} />
            </button>
          </div>
        )}

        {/* Stop */}
        <button
          onClick={(e) => { e.stopPropagation(); narration.stop(); }}
          aria-label="Stop"
          style={{
            width: 28, height: 28, borderRadius: "50%", border: "none",
            background: "transparent", cursor: "pointer",
            color: "var(--stone-400)",
            display: "grid", placeItems: "center",
            flexShrink: 0,
          }}
        >
          <LucideIcon name="x" size={15} />
        </button>
      </div>
    </div>
  );
}

// ── Full-screen "Now Playing" view ────────────────────────────────────────────

import { Illustration } from "./Illustration";
import { Cross, Fleuron } from "./Sacred";

/** Seconds → m:ss (clamped at 0). */
function fmtTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const FS_WAVE_BARS = 80;
const FS_WAVE_HEIGHTS = Array.from({ length: FS_WAVE_BARS }, (_, i) => {
  const t = i / (FS_WAVE_BARS - 1);
  const env = Math.sin(Math.PI * t) ** 0.5;
  const n1 = seededRand(i * 3 + 7) * 0.5;
  const n2 = seededRand(i * 7 + 13) * 0.3;
  const n3 = seededRand(i * 11 + 31) * 0.2;
  const spike = seededRand(i * 17 + 5) > 0.82 ? 0.3 : 0;
  const raw = 0.18 + env * (n1 + n2 + n3 + spike);
  return Math.max(0.06, Math.min(1, raw));
});

function FullScreenWaveform({
  playing, getLevel, peaks, segProgress = 0,
}: { playing: boolean; getLevel?: () => number; peaks?: number[] | null; segProgress?: number }) {
  const usePeaks = !!(peaks && peaks.length);
  const scroll = useScrollingWave(FS_WAVE_BARS, playing && !usePeaks, getLevel, FS_WAVE_HEIGHTS.map((h) => h * 0.5));
  const bars = usePeaks ? resampleBars(peaks!, FS_WAVE_BARS) : scroll;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 48, padding: "0 4px" }}>
      {bars.map((lv, i) => {
        const h = Math.max(0.06, Math.min(1, lv));
        let op: number;
        if (usePeaks) {
          op = i / FS_WAVE_BARS <= segProgress ? 0.95 : 0.32;
        } else {
          op = playing ? 0.4 + 0.6 * (i / (FS_WAVE_BARS - 1)) : 0.4;
        }
        return (
          <span
            key={i}
            style={{
              flex: 1,
              minWidth: 2,
              maxWidth: 4,
              height: `${Math.round(h * 100)}%`,
              borderRadius: 1.5,
              background: "var(--gold)",
              opacity: op,
            }}
          />
        );
      })}
    </div>
  );
}

function FullScreenPlayer({
  narration,
  title,
  illustration,
  onCollapse,
}: {
  narration: Narration;
  title: string;
  illustration?: IllustrationKey;
  onCollapse: () => void;
}) {
  const { speed, setSpeed } = useVoice();
  const SPEEDS = [0.75, 1, 1.25, 1.5];
  const cycleSpeed = () => {
    const i = SPEEDS.indexOf(speed);
    setSpeed(SPEEDS[(i + 1) % SPEEDS.length] ?? 1);
  };
  const speedLabel = `${Number.isInteger(speed) ? speed : speed.toString().replace(/0+$/, "")}×`;

  const { status, index, count, current } = narration;
  const playing = status === "playing";

  return (
    <div
      className="pw-fullscreen-player"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--surface-ink, #1A130D)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Background ambient illustration */}
      {illustration && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          pointerEvents: "none",
          zIndex: 0,
        }}>
          <Illustration
            name={illustration}
            size={420}
            invertOnDark
            opacity={0.08}
            feather
          />
        </div>
      )}

      {/* Top bar: chevron-down + title + speed */}
      <div style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "env(safe-area-inset-top, 16px) 20px 0",
        paddingTop: "max(env(safe-area-inset-top, 16px), 16px)",
        position: "relative",
        zIndex: 1,
      }}>
        <button
          onClick={onCollapse}
          aria-label="Collapse player"
          style={{
            width: 44, height: 44, borderRadius: "50%", border: "none",
            background: "transparent", cursor: "pointer",
            color: "rgba(239,230,214,0.6)",
            display: "grid", placeItems: "center",
          }}
        >
          <LucideIcon name="chevron-down" size={24} />
        </button>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: ".04em",
          color: "rgba(239,230,214,0.5)",
          textAlign: "center",
        }}>
          NOW PLAYING
        </div>
        <button
          onClick={cycleSpeed}
          aria-label={`Speed ${speedLabel}`}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--gold)",
            cursor: "pointer",
            border: "1px solid rgba(239,230,214,0.12)",
            background: "rgba(239,230,214,0.06)",
            borderRadius: 999,
            padding: "7px 14px",
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {speedLabel}
        </button>
      </div>

      {/* Central artwork area */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        width: "100%",
        maxWidth: 400,
        padding: "0 32px",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Illustration card */}
        <div style={{
          width: "100%",
          aspectRatio: "1",
          maxWidth: 320,
          borderRadius: 20,
          background: "rgba(239,230,214,0.04)",
          border: "1px solid rgba(239,230,214,0.08)",
          display: "grid",
          placeItems: "center",
          marginBottom: 36,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}>
          {illustration ? (
            <Illustration
              name={illustration}
              size={260}
              invertOnDark
              opacity={0.55}
              feather={false}
            />
          ) : (
            <Cross size={100} style={{ color: "rgba(239,230,214,0.15)" }} />
          )}
        </div>

        {/* Title + segment label */}
        <div style={{ textAlign: "center", width: "100%", marginBottom: 8 }}>
          <div style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 500,
            fontSize: 26,
            color: "var(--gold-bright, #EFE6D6)",
            letterSpacing: "-.01em",
            lineHeight: 1.2,
            marginBottom: 6,
          }}>
            {title}
          </div>
          {current?.label && current.label !== title && (
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              color: "rgba(239,230,214,0.5)",
              lineHeight: 1.4,
            }}>
              {current.label}
            </div>
          )}
          {count > 1 && (
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: 11,
              color: "rgba(239,230,214,0.35)",
              marginTop: 6,
              fontVariantNumeric: "tabular-nums",
            }}>
              {index + 1} of {count}
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div style={{
        width: "100%",
        maxWidth: 400,
        padding: "0 32px",
        paddingBottom: "max(env(safe-area-inset-bottom, 24px), 32px)",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Waveform progress */}
        <div style={{ marginBottom: 8 }}>
          <FullScreenWaveform playing={playing} getLevel={narration.getLevel} peaks={narration.peaks} segProgress={narration.segProgress} />
        </div>

        {/* Running timestamp: elapsed (left) → total length (right) */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          fontFamily: "var(--font-display)",
          fontSize: 12,
          fontVariantNumeric: "tabular-nums",
          color: "rgba(239,230,214,0.55)",
          letterSpacing: ".02em",
        }}>
          <span>{fmtTime(narration.elapsed)}</span>
          <span>{fmtTime(narration.duration)}</span>
        </div>

        {/* Playback controls */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
        }}>
          {/* Previous */}
          <button
            onClick={() => narration.prev()}
            disabled={index === 0}
            aria-label="Previous"
            style={{
              width: 44, height: 44, borderRadius: "50%", border: "none",
              background: "transparent", cursor: index === 0 ? "default" : "pointer",
              color: index === 0 ? "rgba(239,230,214,0.15)" : "rgba(239,230,214,0.6)",
              display: "grid", placeItems: "center",
            }}
          >
            <LucideIcon name="skip-back" size={22} />
          </button>

          {/* Play/Pause — large central button */}
          <button
            onClick={() => narration.toggle()}
            aria-label={playing ? "Pause" : "Play"}
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              border: "none",
              background: "var(--gold-bright, #EFE6D6)",
              color: "var(--surface-ink, #1A130D)",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}
          >
            {narration.loading
              ? <span style={{ animation: "oraSpin 1s linear infinite", display: "grid", placeItems: "center" }}><LucideIcon name="loader" size={26} /></span>
              : <LucideIcon name={playing ? "pause" : "play"} size={28} />}
          </button>

          {/* Next */}
          <button
            onClick={() => narration.next()}
            disabled={index >= count - 1}
            aria-label="Next"
            style={{
              width: 44, height: 44, borderRadius: "50%", border: "none",
              background: "transparent", cursor: index >= count - 1 ? "default" : "pointer",
              color: index >= count - 1 ? "rgba(239,230,214,0.15)" : "rgba(239,230,214,0.6)",
              display: "grid", placeItems: "center",
            }}
          >
            <LucideIcon name="skip-forward" size={22} />
          </button>
        </div>

        {/* Stop button below controls */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <button
            onClick={() => { narration.stop(); onCollapse(); }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 22px",
              borderRadius: 999,
              border: "1px solid rgba(239,230,214,0.12)",
              background: "rgba(239,230,214,0.06)",
              color: "rgba(239,230,214,0.5)",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: ".02em",
            }}
          >
            <LucideIcon name="square" size={12} />
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
