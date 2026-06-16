"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LucideIcon } from "./UI";
import { useVoice } from "./VoiceProvider";
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
  rate,
  loop = false,
  onSegmentChange,
  onComplete,
}: UseNarrationOptions): Narration {
  // Optimistic: render controls on the server and at hydration (matching markup),
  // then downgrade after mount only if the browser truly lacks speech support.
  const [supported, setSupported] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [index, setIndex] = useState(0);
  const { voice } = useVoice();

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
          if (!speak(text, { rate, onEnd, onError })) onError();
        };
        a.onended = finish;
        a.onerror = fallback;
        a.src = ttsUrl(text, rate, voice);
        a.play().catch(fallback);
        return;
      }
      if (!speak(text, { rate, onEnd, onError })) onError();
    },
    [rate, voice],
  );

  const playIndex = useCallback(
    (i: number) => {
      const list = segmentsRef.current;
      if (i < 0 || i >= list.length) return;
      const gen = ++genRef.current;
      setIndex(i);
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
    changeRef.current?.(clamped);
  }, []);

  return {
    supported,
    status,
    index,
    count: segments.length,
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

  const fg = dark ? "var(--gold-bright)" : "var(--gold-deep)";
  const subtle = dark ? "rgba(236,227,204,0.55)" : "var(--stone-400)";
  const border = dark ? "1px solid rgba(216,188,118,.22)" : "1px solid var(--stone-200)";
  const surface = dark ? "rgba(216,188,118,0.08)" : "var(--bone-raised)";
  const playing = status === "playing";

  const ctrlStyle = (primary = false): React.CSSProperties => ({
    width: primary ? 46 : 38,
    height: primary ? 46 : 38,
    borderRadius: "50%",
    border: primary ? "none" : border,
    background: primary ? "var(--gilt)" : surface,
    color: primary ? "#2A2008" : fg,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        borderRadius: 14,
        border,
        background: surface,
        boxShadow: dark ? "none" : "var(--shadow-sm)",
      }}
    >
      <button onClick={narration.prev} aria-label="Previous" style={ctrlStyle()} disabled={index === 0}>
        <LucideIcon name="skip-back" size={16} />
      </button>
      <button onClick={narration.toggle} aria-label={playing ? "Pause" : "Play"} style={ctrlStyle(true)}>
        <LucideIcon name={playing ? "pause" : "play"} size={20} />
      </button>
      <button onClick={narration.next} aria-label="Next" style={ctrlStyle()} disabled={index >= count - 1}>
        <LucideIcon name="skip-forward" size={16} />
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 11,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: fg,
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {current?.label ?? title ?? "Listen"}
        </div>
        {/* Segment progress bar */}
        <div style={{ display: "flex", gap: 3, marginTop: 7 }}>
          {Array.from({ length: count }).map((_, i) => (
            <span
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: i <= index ? "var(--gold)" : dark ? "rgba(216,188,118,0.2)" : "var(--stone-200)",
                transition: "background .2s",
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 12,
          letterSpacing: ".08em",
          color: subtle,
          flexShrink: 0,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {index + 1} / {count}
      </div>
    </div>
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
