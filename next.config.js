const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    // Cache API responses — NetworkFirst ensures fresh data (coverUrl etc.)
    {
      urlPattern: /\/api\/(stories|ranking|authors)/,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        networkTimeoutSeconds: 8,
        expiration: { maxEntries: 100, maxAgeSeconds: 300 },
      },
    },
    // Cache chapter content for offline reading
    {
      urlPattern: /\/api\/chapters\/.+/,
      handler: "CacheFirst",
      options: {
        cacheName: "chapter-cache",
        expiration: { maxEntries: 200, maxAgeSeconds: 86400 * 7 }, // 7 days
      },
    },
    // Cache cover images from backend (fallback path)
    {
      urlPattern: /\/api\/stories\/.+\/cover/,
      handler: "CacheFirst",
      options: {
        cacheName: "cover-cache",
        cacheableResponse: { statuses: [200] },
        expiration: { maxEntries: 300, maxAgeSeconds: 86400 * 7 },
      },
    },
    // Cache cover images from Supabase CDN (direct path)
    {
      urlPattern: /ydmkavspdccylpnskfsg\.supabase\.co\/storage\/.+/,
      handler: "CacheFirst",
      options: {
        cacheName: "supabase-cover-cache",
        cacheableResponse: { statuses: [200] },
        expiration: { maxEntries: 300, maxAgeSeconds: 86400 * 30 },
      },
    },
    // Cache static assets — StaleWhileRevalidate ensures new deploys work
    {
      urlPattern: /\/_next\/static\/.*/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-cache",
        expiration: { maxEntries: 200, maxAgeSeconds: 86400 * 30 },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const noIndexHeaders = [
      {
        key: "X-Robots-Tag",
        value: "noindex, nofollow, nosnippet, noarchive",
      },
    ];

    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ];

    // Long-lived cache for static info pages (saves Function Invocations)
    const staticCacheHeaders = [
      {
        key: "Cache-Control",
        value: "public, max-age=86400, stale-while-revalidate=604800",
      },
      { key: "CDN-Cache-Control", value: "max-age=86400" },
    ];

    // Cloudflare-friendly cache for ISR public pages
    // Cloudflare respects CDN-Cache-Control for edge caching
    const isrCacheHeaders = [
      {
        key: "CDN-Cache-Control",
        value: "max-age=3600, stale-while-revalidate=86400",
      },
    ];

    // Long ISR pages (story, chapter, author, genre)
    const longIsrCacheHeaders = [
      {
        key: "CDN-Cache-Control",
        value: "max-age=14400, stale-while-revalidate=86400",
      },
    ];

    // Auth pages — never cache
    const noCacheHeaders = [
      {
        key: "Cache-Control",
        value: "private, no-cache, no-store, must-revalidate",
      },
      { key: "CDN-Cache-Control", value: "no-store" },
    ];

    return [
      // Global security headers for all routes
      { source: "/:path*", headers: securityHeaders },
      // Homepage ISR — Cloudflare caches 1h, stale-while-revalidate 1 day
      { source: "/", headers: isrCacheHeaders },
      // Public ISR pages — Cloudflare caches 4h, stale-while-revalidate 1 day
      { source: "/story/:slug*", headers: longIsrCacheHeaders },
      { source: "/the-loai/:slug*", headers: longIsrCacheHeaders },
      { source: "/author/:authorId((?!register).)*", headers: longIsrCacheHeaders },
      // Static explore/ranking — Cloudflare caches
      { source: "/explore", headers: isrCacheHeaders },
      { source: "/ranking", headers: isrCacheHeaders },
      // Static pages — cache in CDN for 1 day, stale-while-revalidate 7 days
      { source: "/about", headers: staticCacheHeaders },
      { source: "/terms", headers: staticCacheHeaders },
      { source: "/privacy", headers: staticCacheHeaders },
      { source: "/author-policy", headers: staticCacheHeaders },
      { source: "/contact", headers: staticCacheHeaders },
      // Auth pages — NEVER cache in CDN (private user data)
      { source: "/profile", headers: [...noIndexHeaders, ...noCacheHeaders] },
      { source: "/wallet", headers: [...noIndexHeaders, ...noCacheHeaders] },
      { source: "/bookshelf", headers: [...noIndexHeaders, ...noCacheHeaders] },
      { source: "/quests", headers: [...noIndexHeaders, ...noCacheHeaders] },
      { source: "/admin/:path*", headers: [...noIndexHeaders, ...noCacheHeaders] },
      { source: "/mod/:path*", headers: [...noIndexHeaders, ...noCacheHeaders] },
      { source: "/write/:path*", headers: [...noIndexHeaders, ...noCacheHeaders] },
      // noindex for login/register
      { source: "/login", headers: noIndexHeaders },
      { source: "/register", headers: noIndexHeaders },
      { source: "/author/register", headers: noIndexHeaders },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "backend-4nfb.onrender.com",
      },
      {
        protocol: "https",
        hostname: "ydmkavspdccylpnskfsg.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

module.exports = withPWA(nextConfig);
