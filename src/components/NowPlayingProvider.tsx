"use client";

import { createContext, useContext, useCallback, useRef, useSyncExternalStore, type ReactNode } from "react";
import type { Narration } from "./PrayerPlayer";

interface NowPlaying {
  narration: Narration | null;
  title: string;
  dark: boolean;
}

type Listener = () => void;

// Simple external store so the floating player re-renders when narration changes.
function createNowPlayingStore() {
  let state: NowPlaying = { narration: null, title: "", dark: false };
  const listeners = new Set<Listener>();

  return {
    getSnapshot: () => state,
    subscribe: (l: Listener) => { listeners.add(l); return () => listeners.delete(l); },
    set: (next: NowPlaying) => { state = next; listeners.forEach((l) => l()); },
  };
}

const storeRef = { current: createNowPlayingStore() };

interface NowPlayingCtx {
  register: (narration: Narration, title: string, dark?: boolean) => void;
  unregister: (narration: Narration) => void;
}

const Ctx = createContext<NowPlayingCtx>({
  register: () => {},
  unregister: () => {},
});

export function NowPlayingProvider({ children }: { children: ReactNode }) {
  const currentRef = useRef<Narration | null>(null);

  const register = useCallback((narration: Narration, title: string, dark = false) => {
    currentRef.current = narration;
    storeRef.current.set({ narration, title, dark });
  }, []);

  const unregister = useCallback((narration: Narration) => {
    if (currentRef.current === narration) {
      currentRef.current = null;
      storeRef.current.set({ narration: null, title: "", dark: false });
    }
  }, []);

  return <Ctx.Provider value={{ register, unregister }}>{children}</Ctx.Provider>;
}

/** Pages call this to register their narration with the floating player. */
export function useNowPlaying() {
  return useContext(Ctx);
}

/** The floating player reads this to get the current narration. */
export function useNowPlayingState(): NowPlaying {
  const store = storeRef.current;
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
