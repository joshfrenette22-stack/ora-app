/* Prayer Warrior service worker — offline support.
 *
 * Registered as /sw.js?v=<build id> (see ServiceWorkerManager), so every
 * deploy is a byte-different registration URL: the browser installs the new
 * worker, `activate` below drops the previous build's caches, and the
 * UpdateChecker's unregister+reload flow stays in charge of hard refreshes.
 *
 * Strategy:
 *   - hashed build assets, fonts, art  → cache-first (immutable by design)
 *   - content APIs (readings, saints…) → stale-while-revalidate (date-keyed;
 *     yesterday's copy is still a usable prayer book with no signal)
 *   - page navigations                 → network-first, cache fallback
 *   - TTS audio & version checks      → untouched (range requests / freshness)
 */

const VERSION = new URL(self.location.href).searchParams.get("v") || "dev";
const CACHE = `pw-sw-${VERSION}`;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("pw-sw-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  const refresh = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => hit);
  return hit || refresh;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(request);
    // Any cached page beats the browser's offline error page.
    if (hit) return hit;
    if (request.mode === "navigate") {
      const home = await cache.match("/");
      if (home) return home;
    }
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Freshness-critical or streaming endpoints stay off the cache entirely.
  if (url.pathname === "/api/version") return;
  if (url.pathname.startsWith("/api/tts")) return;

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/illustrations/") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/rosary/") ||
    url.pathname.startsWith("/icon/") ||
    request.destination === "font" ||
    request.destination === "image"
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
  }
});
