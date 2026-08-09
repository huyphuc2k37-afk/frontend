const nextConfig = {
  async rewrites() {
    // Backend base URL — read from env or fall back to Railway default.
    // Both dev (localhost:5000) and prod (Railway) are supported without code
    // changes because browser-side calls go through the same-origin /api proxy.
    const backendBase = (process.env.NEXT_BACKEND_URL || "https://backend-production-1235.up.railway.app").replace(/\/+$/, "");
    return [
      // Proxy /api/* → backend so the frontend can use relative URLs without
      // a NEXT_PUBLIC_API_URL env var (and without CORS).
      {
        source: "/api/:path*",
        destination: `${backendBase}/api/:path*`,
      },
      // Proxy cover image requests to the backend server.
      // Dev: http://localhost:3001 (legacy local). Prod: backend host via env or Railway default.
      {
        source: "/storage/:path*",
        destination: process.env.NODE_ENV === "development"
          ? "http://localhost:3001/storage/:path*"
          : `${backendBase}/storage/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
      { source: "/library", destination: "/bookshelf", permanent: true },
    ];
  },
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

    // Hashed Next.js assets — safe to cache long-term in production.
    // The `production-ready` check uses ASSET_PREFIX/NODE_ENV so dev mode
    // always sets short max-age to avoid serving stale webpack chunks that
    // reference modules that have since been edited/hot-reloaded — the
    // classic "Cannot read properties of undefined (reading 'call')" bug.
    const isProd = process.env.NODE_ENV === "production";
    const nextStaticAssetHeaders = [
      {
        key: "Cache-Control",
        value: isProd
          ? "public, max-age=31536000, immutable"
          : "public, max-age=0, must-revalidate",
      },
      { key: "CDN-Cache-Control", value: isProd ? "max-age=31536000, immutable" : "no-store" },
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
    // Backend /api/stories/:id/cover returns SVG placeholder for stories that
    // haven't been migrated to Cloudinary yet. Allow SVG to avoid 400 errors
    // when Next.js Image optimizer hits these URLs.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
    // Local dev backend
    {
      protocol: "http",
      hostname: "localhost",
      port: "5000",
    },
    {
      protocol: "https",
      hostname: "backend-production-04113.up.railway.app",
    },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
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

module.exports = nextConfig;
