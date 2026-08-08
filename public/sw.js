// Minimal no-op service worker.
//
// Why this exists: ServiceWorkerRegistrar registers "/sw.js" unconditionally
// in production. Previously no /sw.js file existed, which caused a 404 on
// every page load and left a corrupted SW entry in the browser. This file
// is intentionally empty of caching logic — we don't want a buggy SW to
// intercept /api/* calls and serve stale data while the backend is being
// recovered. We can layer in real caching later once the API is stable.
//
// Install / activate / fetch: do nothing but claim clients so the previous
// broken SW (if any) gets replaced.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
