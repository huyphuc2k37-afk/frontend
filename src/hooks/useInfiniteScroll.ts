"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
  threshold?: number;
}

export function useInfiniteScroll({
  loading,
  hasMore,
  onLoadMore,
  rootMargin = "200px",
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const tryLoadMore = useCallback(() => {
    if (!loadingRef.current && hasMoreRef.current) {
      onLoadMore();
    }
  }, [onLoadMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) tryLoadMore();
      },
      { rootMargin, threshold: 0 }
    );
    observerRef.current.observe(node);

    return () => observerRef.current?.disconnect();
  }, [tryLoadMore, rootMargin]);

  return { sentinelRef };
}
