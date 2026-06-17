"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LucideIcon } from "./UI";
import { useVoice } from "./VoiceProvider";
import { wordStarts, wordIndexAtChar } from "@/lib/words";
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
    fetch("/api/tts?probe=1")
      .then((r) => {
        if (alive && r.status === 204) {
          engineRef.current = "google";
          setSupported(true);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
      stopSpeaking();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    };
  }, []);

  // Speak one segment through the active engine, falling back to the browser
  // voice if the cloud audio can't play.
  const playSegment = useCallback(
    (text: string, onEnd: () => void, onError: () => void) => {
      const starts = wordStarts(text);
      const wc = starts.length;
      if (engineRef.current === "google" && audioRef.current) {
        const a = audioRef.current;
        // Guard so this segment resolves exactly once even if the element
        // fires both `error` and a stale `ended`.
        let settled = false;
        const finish = () => { if (!settled) { settled = true; onEnd(); } };
        const fallback = () => {
          if (settled) return;
          settled = true;
          a.onended = null;
          a.onerror = null;
          // The browser voice highlights words via its own boundary events.
          if (!speak(text, { rate, onEnd, onError, onBoundary: (ci) => setWordIndex(wordIndexAtChar(starts, ci)) })) onError();
        };
        a.onended = finish;
        a.onerror = fallback;
        // Cloud audio has no word timings, so approximate the spoken word from
        // the playback fraction — even pacing across the segment's words.
        a.ontimeupdate = () => {
          if (a.duration > 0) {
            const f = a.currentTime / a.duration;
            setFrac(f);
            if (wc > 0) setWordIndex(Math.min(wc - 1, Math.floor(f * wc)));
          }
        };
        a.src = ttsUrl(text, rate, voice);
        a.play().catch(fallback);
        return;
      }
      if (!speak(text, { rate, onEnd, onError, onBoundary: (ci) => setWordIndex(wordIndexAtChar(starts, ci)) })) onError();
    },
    [rate, voice],
  );

  const playIndex = useCallback(
    (i: number) => {
      const list = segmentsRef.current;
      if (i < 0 || i >= list.length) return;
      const gen = ++genRef.current;
      setIndex(i);
      setFrac(0);
      setWordIndex(-1);
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
        () => { if (gen === genRef.current) setStatus("idle"); },
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
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    if (engineRef.current === "google") audioRef.current?.play().catch(() => {});
    else resumeSpeaking();
    setStatus("playing");
  }, []);

  const stop = useCallback(() => {
    genRef.current++;
    if (audioRef.current) audioRef.current.pause();
    stopSpeaking();
    setStatus("idle");
    setFrac(0);
    setWordIndex(-1);
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
    if (audioRef.current) audioRef.current.pause();
    stopSpeaking();
    setStatus("idle");
    const clamped = Math.max(0, Math.min(segmentsRef.current.length - 1, i));
    setIndex(clamped);
    setFrac(0);
    setWordIndex(-1);
    changeRef.current?.(clamped);
  }, []);

  const count = segments.length;
  const progress = count > 0 ? Math.min(1, (index + frac) / count) : 0;

  return {
    supported,
    status,
    index,
    count,
    progress,
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

function Waveform({ progress, dark, playing }: { progress: number; dark?: boolean; playing?: boolean }) {
  const rest = dark ? "rgba(239,230,214,0.12)" : "var(--stone-200)";
  const played = dark ? "var(--gold)" : "var(--gold-deep)";
  const activeColor = "var(--gold)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 1.5, height: 28 }}>
      {WAVE_HEIGHTS.map((h, i) => {
        const frac = i / (WAVE_BARS - 1);
        const isPlayed = frac <= progress;
        const isHead = playing && Math.abs(frac - progress) < 1 / WAVE_BARS;
        return (
          <span
            key={i}
            style={{
              flex: 1,
              minWidth: 1.5,
              maxWidth: 3.5,
              height: `${Math.round(h * 100)}%`,
              borderRadius: 1,
              background: isHead ? activeColor : isPlayed ? played : rest,
              opacity: isHead ? 1 : isPlayed ? 0.85 : 0.45,
              transition: "background .12s, opacity .12s",
              transform: playing && isHead ? "scaleY(1.18)" : undefined,
            }}
          />
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
        <LucideIcon name={playing ? "pause" : "play"} size={18} />
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
        <Waveform progress={narration.progress} dark={dark} playing={playing} />
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
