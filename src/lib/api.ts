// Base URL of the backend API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Fingerprint import (lazy loaded to avoid SSR issues)
let getDeviceFingerprint: () => Promise<string> = async () => "";
if (typeof window !== "undefined") {
  import("./fingerprint").then((module) => {
    getDeviceFingerprint = module.getDeviceFingerprint;
  });
}

/** Placeholder cover (1x1 gray SVG) used when backend doesn't return a coverUrl. */
export const PLACEHOLDER_COVER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' fill='%23e7e5e4'%3E%3Crect width='300' height='400'/%3E%3C/svg%3E";

/**
 * Resolve the cover image source for a story.
 *
 * If the backend returned a `coverUrl` (CDN/Cloudinary/Supabase), use it.
 * Otherwise (cover rejected, story not approved, or cover missing), return the
 * placeholder directly — DO NOT fall back to the /api/stories/:id/cover endpoint
 * because that endpoint returns 403 for rejected covers, which would log console
 * errors on every page that lists stories with rejected covers.
 *
 * Stories from the backend always carry `coverUrl` (the /api/stories/:id/cover
 * endpoint URL) when the cover is visible and `null` when it is not. We never
 * build a URL here because we need the backend to make the allow/deny decision
 * (coverVisible flag + coverApprovalStatus).
 */
export function resolveCoverSrc(
  story: { id: string; coverUrl?: string | null; coverVisible?: boolean; updatedAt?: string },
): string {
  if (story.coverUrl) return story.coverUrl;
  return PLACEHOLDER_COVER;
}

/** Backwards-compat helper: same as resolveCoverSrc but always returns a string. */
export function coverSrcOrPlaceholder(story: { id: string; coverUrl?: string | null; updatedAt?: string }): string {
  return resolveCoverSrc(story);
}

// ─── Fetch options ────────────────────────────────────────────
export interface ApiFetchOptions extends RequestInit {
  /** Request timeout in ms. Default 15s. */
  timeoutMs?: number;
  /** Number of retry attempts for idempotent failures (5xx, network). Default 0. */
  retries?: number;
  /** Backoff base in ms (doubled each retry). Default 300. */
  retryBackoffMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15_000;

/** In-flight request map for client-side dedup. Keyed by full URL + serialized body. */
const inflight = new Map<string, Promise<Response>>();

function dedupKey(url: string, init: RequestInit): string {
  const method = (init.method || "GET").toUpperCase();
  // Only dedupe safe/idempotent methods to avoid surprising side-effects.
  if (method !== "GET" && method !== "HEAD") return "";
  return method + " " + url + " " + (init.body ? String(init.body) : "");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryable(res: Response | null, err: unknown): boolean {
  if (err) return true; // network/abort/timeout
  if (!res) return true;
  if (res.status >= 500 && res.status < 600) return true;
  if (res.status === 429) return true;
  return false;
}

/**
 * Core fetch with timeout + retry + client-side dedup.
 * Used by apiFetch and authFetch — not exported directly.
 */
async function fetchWithResilience(url: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, retries = 0, retryBackoffMs = 300, ...init } = options;

  const key = dedupKey(url, init);
  if (key) {
    const existing = inflight.get(key);
    if (existing) return existing;
  }

  const promise = (async () => {
    let lastErr: unknown = null;
    let lastRes: Response | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { ...init, signal: controller.signal });
        clearTimeout(timer);
        lastRes = res;
        lastErr = null;
        if (isRetryable(res, null) && attempt < retries) {
          // Drain body so connection can be reused
          try { await res.arrayBuffer(); } catch {}
          await sleep(retryBackoffMs * Math.pow(2, attempt));
          continue;
        }
        return res;
      } catch (err) {
        clearTimeout(timer);
        lastErr = err;
        lastRes = null;
        if (attempt < retries) {
          await sleep(retryBackoffMs * Math.pow(2, attempt));
          continue;
        }
        throw err;
      }
    }
    // Should never reach here, but keep TS happy.
    if (lastErr) throw lastErr;
    return lastRes as Response;
  })();

  if (key) {
    inflight.set(key, promise);
    promise.finally(() => inflight.delete(key));
  }
  return promise;
}

/**
 * Helper for making authenticated API calls to the backend.
 *
 * - GET/HEAD requests are automatically deduplicated across simultaneous callers
 *   (e.g. Header + ProfilePage both call /api/wallet — only 1 network request).
 * - Adds a default 15s timeout via AbortController.
 * - Optionally retries idempotent failures (network/5xx/429) with exponential backoff.
 */
export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }
  return fetchWithResilience(url, { ...options, headers });
}

/**
 * Authenticated fetch — includes JWT token from session.
 * Same dedup/timeout/retry behavior as apiFetch.
 */
export async function authFetch(path: string, token: string, options: ApiFetchOptions = {}): Promise<Response> {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string> || {}),
  };
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }
  return fetchWithResilience(url, { ...options, headers });
}

// ─── View count token ───────────────────────────────────────────────────────

const VIEW_TOKEN_SECRET = process.env.NEXT_PUBLIC_VIEW_TOKEN_SECRET || "";

export interface ViewTokenResult {
  token: string | null;
  fingerprint: string | null;
}

/**
 * Generate a short-lived HMAC-SHA256 token for view-count requests.
 * The backend verifies this token to prevent IP-spoofing attacks on the
 * X-Count-View header. Token expires after 60 seconds.
 *
 * Also generates a device fingerprint for enhanced anti-bot detection.
 */
export async function generateViewToken(storyId: string): Promise<ViewTokenResult> {
  if (!VIEW_TOKEN_SECRET) return { token: null, fingerprint: null };

  try {
    const [clientIP, fingerprint] = await Promise.all([
      fetch("/api/client-ip", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => d.ip)
        .catch(() => "unknown"),
      getDeviceFingerprint(),
    ]);

    const ts = Math.floor(Date.now() / 1000);
    const payload = `${storyId}:${clientIP}:${ts}`;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(VIEW_TOKEN_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
    const tokenB64 = btoa(`${payload}`);

    return {
      token: `${sigB64}.${tokenB64}`,
      fingerprint,
    };
  } catch {
    return { token: null, fingerprint: null };
  }
}

/**
 * @deprecated Use generateViewToken instead which returns both token and fingerprint
 */
export async function generateViewTokenLegacy(storyId: string): Promise<string | null> {
  const result = await generateViewToken(storyId);
  return result.token;
}
