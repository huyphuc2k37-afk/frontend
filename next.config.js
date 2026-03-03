const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    // Cache API responses for story listing / ranking
    {
      urlPattern: /\/api\/(stories|ranking|authors)/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "api-cache",
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
    // Cache cover images (network-first behavior to avoid stale 403/404 after moderation changes)
    {
      urlPattern: /\/api\/stories\/.+\/cover/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "cover-cache",
        cacheableResponse: { statuses: [200] },
        expiration: { maxEntries: 300, maxAgeSeconds: 86400 * 7 }, // 7 days
      },
    },
    // Cache static assets
    {
      urlPattern: /\/_next\/static\/.*/,
      handler: "CacheFirst",
      options: {
        cacheName: "static-cache",
        expiration: { maxEntries: 200, maxAgeSeconds: 86400 * 365 },
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

    return [
      // Global security headers for all routes
      { source: "/:path*", headers: securityHeaders },
      // noindex for private / auth pages
      { source: "/login", headers: noIndexHeaders },
      { source: "/register", headers: noIndexHeaders },
      { source: "/author/register", headers: noIndexHeaders },
      { source: "/profile", headers: noIndexHeaders },
      { source: "/wallet", headers: noIndexHeaders },
      { source: "/bookshelf", headers: noIndexHeaders },
      { source: "/quests", headers: noIndexHeaders },
      { source: "/admin/:path*", headers: noIndexHeaders },
      { source: "/mod/:path*", headers: noIndexHeaders },
      { source: "/write/:path*", headers: noIndexHeaders },
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
