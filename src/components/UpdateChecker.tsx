"use client";

import { useEffect } from "react";

// The build this client was served from.
const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID;
// Guards against a reload loop if a refresh somehow fails to pick up the new build.
const RELOAD_KEY = "pw-update-target";

/**
 * Detects when a newer version has been deployed and refreshes the app so the
 * user always gets the latest — no manual "Refresh app" needed. It checks when
 * the app is (re)opened and every few minutes, and refreshes only when nothing
 * is playing, so it never interrupts a prayer. Renders nothing.
 */
export function UpdateChecker() {
  useEffect(() => {
    if (!BUILD_ID) return;
    let pending: string | null = null;
    let stopped = false;

    const isPlaying = () => {
      try {
        return "mediaSession" in navigator && navigator.mediaSession.playbackState === "playing";
      } catch {
        return false;
      }
    };

    async function doReload(targetId: string) {
      try { sessionStorage.setItem(RELOAD_KEY, targetId); } catch { /* ignore */ }
      // Best-effort: drop any service worker / caches.
      try {
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } catch { /* ignore */ }
      // A unique URL forces iOS to fetch the latest shell instead of the cache.
      const url = new URL(window.location.href);
      url.searchParams.set("_v", String(Date.now()));
      window.location.replace(url.toString());
    }

    async function check() {
      if (stopped) return;
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { id?: string };
        const id = data?.id;
        if (!id || id === BUILD_ID) { pending = null; return; }
        // A newer version is live. Avoid looping if we've already tried it.
        let last: string | null = null;
        try { last = sessionStorage.getItem(RELOAD_KEY); } catch { /* ignore */ }
        if (last === id) return;
        if (document.visibilityState === "visible" && !isPlaying()) doReload(id);
        else pending = id; // refresh at a calmer moment
      } catch {
        /* offline or transient — try again later */
      }
    }

    const onVisible = () => {
      if (document.hidden) return;
      if (pending && !isPlaying()) { doReload(pending); return; }
      check();
    };

    const initial = setTimeout(check, 4000);
    const interval = setInterval(check, 5 * 60 * 1000);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      stopped = true;
      clearTimeout(initial);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  return null;
}
