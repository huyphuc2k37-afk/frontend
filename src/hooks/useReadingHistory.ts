"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "vstory:reading-history";
const MAX_ENTRIES = 50;

export interface ReadingHistoryEntry {
  storyId: string;
  title: string;
  slug: string;
  genre: string;
  timestamp: number;
}

interface UseReadingHistoryReturn {
  /** Sorted newest-first list of recently read stories. */
  history: ReadingHistoryEntry[];
  /** Most recent genre string (primary genre of the last read story). */
  lastGenre: string | null;
  /** Top genres weighted by recency (most recent entry counts the most). */
  topGenres: string[];
  /** True once hydrated from localStorage. */
  hydrated: boolean;
  /** Append a story to history (newest first, dedup by storyId). */
  addEntry: (entry: Omit<ReadingHistoryEntry, "timestamp">) => void;
  /** Clear everything. */
  clear: () => void;
}

/**
 * Tracks reading history for anonymous users (logged-in users get theirs
 * server-side via /api/read-history). Stored in localStorage so it survives
 * page reloads.
 *
 * Used by the personalized/hot-by-category recommendation panel on homepage.
 */
export function useReadingHistory(): UseReadingHistoryReturn {
  const [history, setHistory] = useState<ReadingHistoryEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ReadingHistoryEntry[];
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch {
      // Corrupted JSON — start fresh
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((next: ReadingHistoryEntry[]) => {
    setHistory(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, MAX_ENTRIES)));
    } catch {
      // Storage full / unavailable — silent ignore
    }
  }, []);

  const addEntry = useCallback(
    (entry: Omit<ReadingHistoryEntry, "timestamp">) => {
      setHistory((prev) => {
        const filtered = prev.filter((h) => h.storyId !== entry.storyId);
        const next: ReadingHistoryEntry[] = [
          { ...entry, timestamp: Date.now() },
          ...filtered,
        ].slice(0, MAX_ENTRIES);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  const clear = useCallback(() => {
    persist([]);
  }, [persist]);

  const lastGenre = history[0]?.genre.split(",")[0]?.trim() || null;

  // Top genres with recency weighting (newer entries count more).
  // Weight = MAX - i, so first entry gets MAX, second gets MAX-1, ...
  const topGenres = (() => {
    const score: Record<string, number> = {};
    for (let i = 0; i < history.length; i++) {
      const genres = history[i].genre.split(",").map((g) => g.trim()).filter(Boolean);
      const weight = Math.max(1, MAX_ENTRIES - i);
      for (const g of genres) {
        score[g] = (score[g] || 0) + weight;
      }
    }
    return Object.entries(score)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([g]) => g);
  })();

  return { history, lastGenre, topGenres, hydrated, addEntry, clear };
}
