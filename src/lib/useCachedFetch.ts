"use client";

import { useEffect, useSyncExternalStore, useCallback, useRef } from "react";
import { authFetch, apiFetch, ApiFetchOptions } from "./api";

/**
 * Tiny client-side cache + SWR-lite hook.
 *
 * - Multiple components calling useCachedFetch with the same key share 1 network request
 *   and re-render together when the data updates.
 * - Re-fetches on mount, on focus/visibility, and on a configurable interval.
 * - Returns a stable `mutate()` to optimistically update or force revalidate.
 *
 * Use for read-only authenticated endpoints (wallet balance, notifications, profile)
 * where data may change server-side and a few seconds of staleness is acceptable.
 */

interface CacheEntry<T> {
  data: T | undefined;
  error: unknown;
  loading: boolean;
  fetchedAt: number;
  promise?: Promise<void>;
  listeners: Set<() => void>;
}

const store = new Map<string, CacheEntry<unknown>>();

function getEntry<T>(key: string): CacheEntry<T> {
  let e = store.get(key) as CacheEntry<T> | undefined;
  if (!e) {
    e = { data: undefined, error: undefined, loading: false, fetchedAt: 0, listeners: new Set() };
    store.set(key, e as CacheEntry<unknown>);
  }
  return e;
}

function notify(e: CacheEntry<unknown>) {
  e.listeners.forEach((l) => l());
}

function subscribe<T>(key: string, listener: () => void): () => void {
  const e = getEntry<T>(key);
  e.listeners.add(listener);
  return () => {
    e.listeners.delete(listener);
  };
}

function getSnapshot<T>(key: string): CacheEntry<T> {
  return getEntry<T>(key);
}

// IMPORTANT: getServerSnapshot must return a stable reference (same object on
// every call). Returning a fresh literal here triggers React's
// "getServerSnapshot should be cached to avoid an infinite loop" warning AND
// produces repeated rerenders during SSR. Use a single empty entry.
const SERVER_SNAPSHOT: CacheEntry<unknown> = {
  data: undefined,
  error: undefined,
  loading: false,
  fetchedAt: 0,
  listeners: new Set(),
};
function getServerSnapshot<T>(): CacheEntry<T> {
  return SERVER_SNAPSHOT as CacheEntry<T>;
}

async function runFetch<T>(
  key: string,
  url: string,
  token: string | undefined,
  options: ApiFetchOptions | undefined,
  e: CacheEntry<T>,
): Promise<void> {
  e.loading = true;
  e.error = undefined;
  notify(e);
  try {
    const res = token
      ? await authFetch(url, token, options)
      : await apiFetch(url, options);
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${errBody.slice(0, 200)}`);
    }
    const data = (await res.json()) as T;
    e.data = data;
    e.error = undefined;
    e.fetchedAt = Date.now();
  } catch (err) {
    e.error = err;
  } finally {
    e.loading = false;
    e.promise = undefined;
    notify(e);
  }
}

export interface UseCachedFetchOptions extends ApiFetchOptions {
  /** Auto revalidate interval in ms. 0 = disabled. Default 0. */
  revalidateMs?: number;
  /** Re-fetch when window regains focus. Default true. */
  revalidateOnFocus?: boolean;
  /** Re-fetch when tab becomes visible. Default true. */
  revalidateOnVisibility?: boolean;
  /** Skip the initial fetch (e.g. when auth is not ready). Default false. */
  skip?: boolean;
}

export interface UseCachedFetchResult<T> {
  data: T | undefined;
  error: unknown;
  loading: boolean;
  fetchedAt: number;
  /** Force revalidate. */
  mutate: () => void;
}

/**
 * Shared cache fetch.
 *
 * @param key Unique key for this resource (e.g. "wallet:balance:user@x.com").
 *            Components with the same key share 1 request and re-render together.
 * @param url Full URL or path passed to apiFetch/authFetch.
 * @param token Optional auth token. Pass undefined for public endpoints.
 * @param options Fetch + revalidation options.
 */
export function useCachedFetch<T = unknown>(
  key: string,
  url: string,
  token?: string,
  options: UseCachedFetchOptions = {},
): UseCachedFetchResult<T> {
  const {
    revalidateMs = 0,
    revalidateOnFocus = true,
    revalidateOnVisibility = true,
    skip = false,
    ...fetchOptions
  } = options;

  const entry = useSyncExternalStore(
    (l) => subscribe<T>(key, l),
    () => getSnapshot<T>(key),
    () => getServerSnapshot<T>(),
  );

  // Mutable ref holding the latest mutate function so that the interval/timer
  // callbacks always call the CURRENT version without needing to re-run effects.
  const mutateRef = useRef<() => void>(() => {});
  mutateRef.current = useCallback(() => {
    const e = getEntry<T>(key);
    if (e.promise) return; // already in-flight
    e.promise = runFetch<T>(key, url, token, fetchOptions, e);
  }, [key, url, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Initial fetch + dependency-change refetch ──────────────────────
  useEffect(() => {
    if (skip) return;
    const e = getEntry<T>(key);
    if (!e.promise && e.data === undefined) {
      e.promise = runFetch<T>(key, url, token, fetchOptions, e);
    }
  }, [key, url, token, skip]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Polling (recursive setTimeout — avoids stale-closure bugs) ────
  // Using setInterval causes `isStale` in the callback to always capture the
  // value from the FIRST interval tick. setTimeout loop re-evaluates fresh on
  // every tick instead.
  useEffect(() => {
    if (skip || revalidateMs <= 0) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      timer = setTimeout(() => {
        if (cancelled) return;
        const e = getEntry<T>(key);
        const isStale = Date.now() - e.fetchedAt > revalidateMs;
        if (isStale) {
          mutateRef.current();
        }
        schedule(); // always reschedule
      }, revalidateMs);
    };

    schedule();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [key, url, token, revalidateMs, skip]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Focus + visibility listeners ───────────────────────────────────
  useEffect(() => {
    if (skip) return;
    const onFocus = () => { if (revalidateOnFocus) mutateRef.current(); };
    const onVisibility = () => { if (revalidateOnVisibility && document.visibilityState === "visible") mutateRef.current(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [revalidateOnFocus, revalidateOnVisibility, skip]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stable `mutate` ref. We MUST return the same function reference across
  // renders; otherwise consumers that put `mutate` in a useMemo/useEffect
  // dep array (e.g. UserProfileContext) get a fresh ref each render and
  // cause an infinite re-render loop — which freezes the UI for minutes.
  const mutate = useCallback(() => mutateRef.current(), []);

  return {
    data: entry.data,
    error: entry.error,
    loading: entry.loading && entry.data === undefined,
    fetchedAt: entry.fetchedAt,
    mutate,
  };
}

/** Manually invalidate a key (e.g. after a mutation so next access refetches). */
export function invalidateCacheKey(key: string): void {
  const e = store.get(key);
  if (e) {
    e.fetchedAt = 0;
    e.promise = undefined;
    notify(e);
  }
}
