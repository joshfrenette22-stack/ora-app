"use client";

import { createContext, useContext, useCallback, useRef, useState, useEffect, type ReactNode } from "react";
import type { Narration } from "./PrayerPlayer";
import type { IllustrationKey } from "@/lib/illustrations";

interface NowPlaying {
  narration: Narration | null;
  title: string;
  dark: boolean;
  illustration?: IllustrationKey;
}

interface NowPlayingMeta { title: string; dark: boolean; illustration?: IllustrationKey }

interface NowPlayingCtx {
  /** Store a getter that returns the LIVE narration (avoids snapshot staleness). */
  register: (getter: () => Narration, title: string, dark?: boolean, illustration?: IllustrationKey) => void;
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

  const register = useCallback((getter: () => Narration, title: string, dark = false, illustration?: IllustrationKey) => {
    getterRef.current = getter;
    metaRef.current = { title, dark, illustration };
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
    return { narration: getter(), ...metaRef.current };
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
 */
export function useNowPlayingLive(): NowPlaying {
  const { get, subscribe } = useContext(Ctx);
  const [, bump] = useState(0);
  const rafRef = useRef(0);

  // Re-render when register/unregister happens.
  useEffect(() => subscribe(() => bump((n) => n + 1)), [subscribe]);

  // While playing, poll on animation frames so progress/wordIndex stay live.
  useEffect(() => {
    let active = true;
    function tick() {
      if (!active) return;
      const np = get();
      if (np.narration && np.narration.status !== "idle") {
        bump((n) => n + 1);
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    // Start polling
    rafRef.current = requestAnimationFrame(tick);
    return () => { active = false; cancelAnimationFrame(rafRef.current); };
  });

  return get();
}
