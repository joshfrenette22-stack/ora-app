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
 * Hook for the FloatingPlayer / MediaSessionManager — re-renders when the
 * playback state meaningfully changes (status, segment, loading, artwork,
 * ~1 s elapsed-time ticks).
 *
 * It deliberately does NOT re-render per animation frame: the waveform reads
 * its position imperatively via getPlayFrac()/envelope inside its own rAF
 * loop, so consumers only need coarse updates. (An earlier version bumped
 * every frame, re-rendering two full component trees at 60 fps.)
 */
export function useNowPlayingLive(): NowPlaying {
  const { get, subscribe } = useContext(Ctx);
  const [, bump] = useState(0);
  const [version, setVersion] = useState(0);

  // Re-render (and restart polling) when register/unregister happens.
  useEffect(() => subscribe(() => setVersion((n) => n + 1)), [subscribe]);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let lastKey = "";

    function tick() {
      if (!active) return;
      const np = get();
      const n = np.narration;
      const key = n
        ? [
            n.status, n.index, n.count, n.loading,
            n.current?.label ?? "", np.title, np.imageSrc ?? "",
            n.envelope ? n.envelope.length : 0,
            Math.floor(n.elapsed), // keeps the full-screen timestamp ticking
          ].join("|")
        : "none";
      if (key !== lastKey) {
        lastKey = key;
        bump((x) => x + 1);
      }
      const playing = !!n && n.status !== "idle";
      timer = setTimeout(tick, playing ? 150 : 500);
    }
    tick();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [get, version]);

  return get();
}
