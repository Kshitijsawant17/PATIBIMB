/*
 * PRATIBIMB service worker.
 *
 * Goal: after one successful visit the whole app shell works offline, because
 * a first-time user in a Tier-2/3 town often has patchy connectivity.
 *
 * Strategy
 *   navigation  -> network first, fall back to the cached page, then /offline
 *   static      -> cache first (hashed filenames never go stale)
 *   other       -> network, falling back to cache
 *
 * Analysis itself is local, so there is no API traffic to handle.
 */

const CACHE_VERSION = "pratibimb-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;

/** Routes worth having offline before the user has visited them. */
const PRECACHE_ROUTES = ["/", "/investigate"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const pageCache = await caches.open(PAGE_CACHE);
      // Individually, so one failure cannot abort the whole install.
      await Promise.all(
        PRECACHE_ROUTES.map(async (route) => {
          try {
            const response = await fetch(route, { cache: "reload" });
            if (response.ok) await pageCache.put(route, response);
          } catch {
            /* offline during install: runtime caching will fill this later */
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("pratibimb-") && !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

/** Cache every successful same-origin GET so a later visit works offline. */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstPage(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(PAGE_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;

    const shell = await caches.match("/", { ignoreSearch: true });
    if (shell) return shell;

    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never let a stale worker pin the manifest, worker, or an icon.
  if (url.pathname === "/sw.js" || url.pathname === "/manifest.webmanifest") return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:css|js|woff2?|png|svg|ico|webmanifest)$/.test(url.pathname)
  ) {
    event.respondWith(
      cacheFirst(request).catch(
        () =>
          new Response("Offline", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          })
      )
    );
  }
});

// Lets the page trigger an immediate update after a deploy.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
