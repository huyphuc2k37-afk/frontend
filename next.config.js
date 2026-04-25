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

    // HTML pages — avoid CDN caching to prevent stale chunk-hash HTML after deploys
    const htmlNoCdnCacheHeaders = [
      {
        key: "Cache-Control",
        value: "public, max-age=0, must-revalidate",
      },
      { key: "CDN-Cache-Control", value: "no-store" },
    ];

    // Hashed Next.js assets — safe to cache long-term
    const nextStaticAssetHeaders = [
      {
        key: "Cache-Control",
        value: "public, max-age=31536000, immutable",
      },
      { key: "CDN-Cache-Control", value: "max-age=31536000, immutable" },
    ];

    // NOTE: Avoid caching HTML at the CDN. Any cached HTML can reference old hashed chunks
    // that no longer exist after a new deploy, causing ChunkLoadError.

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
      // Public pages — do NOT CDN-cache HTML (prevents stale chunk hashes)
      { source: "/:path*", headers: htmlNoCdnCacheHeaders },
      // Next.js hashed assets (override the catch-all)
      { source: "/_next/static/:path*", headers: nextStaticAssetHeaders },
      // Next image optimizer responses — cache briefly (override the catch-all)
      {
        source: "/_next/image",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600" },
          { key: "CDN-Cache-Control", value: "max-age=3600" },
        ],
      },
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
    // Netlify's Next.js runtime can return 402 for the built-in image optimizer
    // (/_next/image) depending on plan/quota. Covers are remote images, so we
    // prefer serving them directly rather than through the optimizer.
    unoptimized: process.env.NETLIFY === "true",
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
