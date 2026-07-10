"use client";

import { useEffect } from "react";

// Registers the offline service worker (public/sw.js). The registration URL
// carries the build id, so a new deploy is a byte-different worker: it
// installs, activates, and clears the previous build's caches. The
// UpdateChecker's "unregister + reload" update flow still works — after its
// reload this simply registers the new worker again. Renders nothing.
export function ServiceWorkerManager() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;
    const v = process.env.NEXT_PUBLIC_BUILD_ID || "dev";
    navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(v)}`).catch(() => {
      /* registration is best-effort — the app works fine without offline */
    });
  }, []);

  return null;
}
