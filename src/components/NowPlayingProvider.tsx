"use client";

import { createContext, useContext, useCallback, useRef, useState, useEffect, type ReactNode } from "react";
import type { Narration } from "./PrayerPlayer";
import type { IllustrationKey } from "@/lib/illustrations";

interface NowPlaying {
  narration: Narration | null;
  title: string;
  dark: boolean;
  illustration?: IllustrationKey;
  /** Live image path that overrides the illustration card (e.g. rosary slides). */
  imageSrc?: string | null;
}

interface NowPlayingMeta { title: string; dark: boolean; illustration?: IllustrationKey; getImageSrc?: () => string | null }

interface NowPlayingCtx {
  /** Store a getter that returns the LIVE narration (avoids snapshot staleness). */
  register: (getter: () => Narration, title: string, dark?: boolean, illustration?: IllustrationKey, getImageSrc?: () => string | null) => void;
  unregister: (getter: () => Narration) => void;
  /** Read current live narration + metadata. */
  get: () => NowPlaying;
  /** Subscribe to structural changes (register/unregister). */
  subscribe: (l: () => void) => () => void;
}

const Ctx = createContext<NowPlayingCtx>({
  register: () => {},
  unregister: () => {},
  get: () => ({ narration: null, title: "", dark: false }),
  subscribe: () => () => {},
});

export function NowPlayingProvider({ children }: { children: ReactNode }) {
  const getterRef = useRef<(() => Narration) | null>(null);
  const metaRef = useRef<NowPlayingMeta>({ title: "", dark: false });
  const listenersRef = useRef(new Set<() => void>());

  const notify = useCallback(() => { listenersRef.current.forEach((l) => l()); }, []);

  const register = useCallback((getter: () => Narration, title: string, dark = false, illustration?: IllustrationKey, getImageSrc?: () => string | null) => {
    getterRef.current = getter;
    metaRef.current = { title, dark, illustration, getImageSrc };
    notify();
  }, [notify]);

  const unregister = useCallback((getter: () => Narration) => {
    if (getterRef.current === getter) {
      getterRef.current = null;
      notify();
    }
  }, [notify]);

  const get = useCallback((): NowPlaying => {
    const getter = getterRef.current;
    if (!getter) return { narration: null, title: "", dark: false };
    const { getImageSrc, ...rest } = metaRef.current;
    return { narration: getter(), ...rest, imageSrc: getImageSrc?.() };
  }, []);

  const subscribe = useCallback((l: () => void) => {
    listenersRef.current.add(l);
    return () => listenersRef.current.delete(l);
  }, []);

  return <Ctx.Provider value={{ register, unregister, get, subscribe }}>{children}</Ctx.Provider>;
}

export function useNowPlaying() {
  return useContext(Ctx);
}

/**
 * Hook for the FloatingPlayer — re-renders on every animation frame while
 * audio is playing so the waveform tracks progress in real time.
 *
 * When idle it polls at a slower cadence (every 500 ms) so it can detect
 * when playback begins. When playing it polls every animation frame.
 */
export function useNowPlayingLive(): NowPlaying {
  const { get, subscribe } = useContext(Ctx);
  const [, bump] = useState(0);

  // Re-render when register/unregister happens.
  useEffect(() => subscribe(() => bump((n) => n + 1)), [subscribe]);

  // Continuous polling — fast while playing, slow while idle.
  useEffect(() => {
    let active = true;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    function tick() {
      if (!active) return;
      const np = get();
      const playing = np.narration && np.narration.status !== "idle";
      bump((n) => n + 1);
      if (playing) {
        // Full-speed polling for waveform progress.
        raf = requestAnimationFrame(tick);
      } else {
        // Slow poll to detect when playback starts.
        timer = setTimeout(tick, 500);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [get]);

  return get();
}
