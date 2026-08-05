"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { SparklesIcon, FireIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL } from "@/lib/api";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import StoryCard, { ApiStory } from "@/components/home/StoryCard";

interface PersonalizedSectionProps {
  allStories: ApiStory[];
}

/**
 * Homepage section that adapts based on the viewer's reading history:
 *
 * - Logged-in user  → server-side personalized recs (auth/userId)
 * - Anonymous + has local history → "Hot theo thể loại bạn đọc" (top genre)
 * - Anonymous + no history   → "Hot theo thể loại" picks the top genre from
 *                              the overall story list (most popular genre)
 *
 * Renders nothing if the fetch fails or there is no data.
 */
export default function PersonalizedSection({ allStories }: PersonalizedSectionProps) {
  const { data: session, status } = useSession();
  const { history, topGenres, lastGenre, hydrated } = useReadingHistory();
  const [stories, setStories] = useState<ApiStory[]>([]);
  const [loading, setLoading] = useState(false);

  const excludeIds = useMemo(() => allStories.map((s) => s.id), [allStories]);

  // Pick the target genre based on history or fall back to most popular genre.
  const fallbackGenre = useMemo(() => {
    const genreCount: Record<string, number> = {};
    for (const s of allStories) {
      const primary = s.genre?.split(",")[0]?.trim();
      if (primary) genreCount[primary] = (genreCount[primary] || 0) + 1;
    }
    const sorted = Object.entries(genreCount).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || null;
  }, [allStories]);

  const targetGenre = session
    ? topGenres[0] || lastGenre
    : topGenres[0] || lastGenre || fallbackGenre;

  // Map label tiếng Việt → tag slug đã có trong DB để query chính xác.
  // Trùng khớp với TARGET_HOT_GENRES trong backend/src/lib/recommendationEngine.ts.
  const TARGET_GENRE_LABEL_TO_SLUG: Record<string, string> = {
    "Đam mỹ": "dam-my",
    "Ngôn tình": "ngon-tinh",
    "Trinh thám": "trinh-tham",
    "Kinh dị": "kinh-di",
    "Học đường": "hoc-duong",
    "Thanh xuân vườn trường": "hoc-duong",
  };

  const targetSlug = targetGenre
    ? TARGET_GENRE_LABEL_TO_SLUG[targetGenre] ||
      targetGenre.toLowerCase().replace(/\s+/g, "-")
    : null;

  useEffect(() => {
    if (status === "loading" || !hydrated) return;
    if (!targetSlug) return;

    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        // Logged-in: use personalized with a category hint (server-side profile aware)
        // Anonymous: use hot-by-category (public, cached)
        const params = new URLSearchParams();
        if (session) {
          params.set("type", "personalized");
        } else {
          params.set("type", "hotByCategory");
          params.set("category", targetSlug);
        }
        params.set("limit", "12");
        if (excludeIds.length > 0) params.set("exclude", excludeIds.join(","));

        const url = `${API_BASE_URL}/api/recommendations?${params}`;
        const r = await fetch(url);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (cancelled) return;

        const recs = (data.recommendations || []) as Array<{
          id: string;
          title: string;
          slug: string;
          coverImage: string | null;
          genre: string;
          views: number;
          likes: number;
          author: { id: string; name: string; image: string | null };
          reason: string;
          score: number;
          updatedAt?: string;
        }>;

        // Map recommendation shape → ApiStory so StoryCard renders
        const storyShape: ApiStory[] = recs.map((rec) => ({
          id: rec.id,
          title: rec.title,
          slug: rec.slug,
          description: null,
          genre: rec.genre,
          status: "ongoing",
          views: rec.views,
          likes: rec.likes,
          updatedAt: rec.updatedAt || new Date().toISOString(),
          coverUrl: rec.coverImage,
          author: { id: rec.author.id, name: rec.author.name, image: null },
          _count: { chapters: 0, bookmarks: 0 },
        }));
        setStories(storyShape);
      } catch {
        if (!cancelled) setStories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [session, status, hydrated, targetSlug, excludeIds]);

  const hasHistory = history.length > 0;
  const title = hasHistory
    ? `Có thể bạn sẽ thích${targetGenre ? ` — ${targetGenre}` : ""}`
    : targetGenre
      ? `Hot theo thể loại — ${targetGenre}`
      : "Có thể bạn sẽ thích";
  const Icon = hasHistory ? SparklesIcon : FireIcon;

  // Don't render anything until we have meaningful input
  if (!hydrated) return null;
  if (!loading && stories.length === 0) return null;

  return (
    <section className="py-8">
      <div className="section-container">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary-500" />
            <h2 className="text-heading-md font-bold text-gray-900">{title}</h2>
            {hasHistory && (
              <span className="ml-2 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700">
                Dựa trên lịch sử đọc
              </span>
            )}
          </div>
          <Link
            href={targetSlug ? `/the-loai/${encodeURIComponent(targetSlug)}` : "/the-loai"}
            className="flex items-center gap-1 text-body-sm font-medium text-primary-700 hover:underline"
          >
            Xem thêm
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] rounded-xl bg-gray-200" />
                <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-1 h-3 w-1/2 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {stories.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
