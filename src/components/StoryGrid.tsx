"use client";

import { useState, useCallback, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import StoryCard from "./StoryCard";
import { Skeleton } from "./ui/Skeleton";
import type { Story } from "@/types";
import { Button } from "./ui/Button";

interface StoryGridProps {
  initialStories: Story[];
  endpoint: string;
  queryParams?: Record<string, string | number | undefined>;
}

export function StoryGrid({ initialStories, endpoint, queryParams = {} }: StoryGridProps) {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialStories.length >= 12);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const next = page + 1;
      const params = new URLSearchParams();
      params.set("page", String(next));
      params.set("limit", "12");
      Object.entries(queryParams).forEach(([k, v]) => {
        if (v != null && v !== "") params.set(k, String(v));
      });
      const result = await apiFetch(`/api/stories?${params.toString()}`);
      const data = (await result.json()) as { stories?: Story[]; data?: Story[]; items?: Story[] };
      const items: Story[] = data.stories ?? data.data ?? data.items ?? [];
      if (items.length === 0) {
        setHasMore(false);
      } else {
        setStories((prev) => [...prev, ...items]);
        setPage(next);
        if (items.length < 12) setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, queryParams]);

  const { sentinelRef } = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: loadMore,
  });

  useEffect(() => {
    setStories(initialStories);
    setPage(1);
    setHasMore(initialStories.length >= 12);
  }, [endpoint, JSON.stringify(queryParams)]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {stories.map((story, i) => (
          <StoryCard key={story.id} story={story} />
        ))}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={`s-${i}`} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
      </div>
      {hasMore && <div ref={sentinelRef} className="h-10" aria-hidden="true" />}
      {!hasMore && stories.length > 0 && (
        <div className="py-8 text-center text-caption text-muted-foreground">
          Bạn đã xem hết truyện.
        </div>
      )}
      {!loading && stories.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          Không có truyện nào.
        </div>
      )}
    </div>
  );
}

interface InfiniteLoadMoreProps {
  onLoadMore: () => void;
  loading: boolean;
  hasMore: boolean;
}

export function InfiniteLoadMoreButton({ onLoadMore, loading, hasMore }: InfiniteLoadMoreProps) {
  if (!hasMore) return null;
  return (
    <div className="flex justify-center py-6">
      <Button variant="outline" onClick={onLoadMore} loading={loading}>
        Tải thêm
      </Button>
    </div>
  );
}
