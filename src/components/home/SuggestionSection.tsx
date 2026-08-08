"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  StarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  HeartIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import { API_BASE_URL, resolveCoverSrc } from "@/lib/api";
import CoverImage from "@/lib/CoverImage";

interface SuggestedStory {
  id: string;
  title: string;
  slug: string;
  coverImage?: string | null;
  author: { id: string; name: string };
  views: number;
  likes: number;
  genre: string;
  suggestedAt?: string;
  message?: string | null;
  boostScore?: number;
  boostedAt?: string | null;
}

interface SuggestionSectionProps {
  /** Optional: number of stories to show for "Today's pool". Default 5. */
  poolLimit?: number;
  /** Optional: number of stories for "Top boost" leaderboard. Default 6. */
  leaderboardLimit?: number;
}

export default function SuggestionSection({
  poolLimit = 5,
  leaderboardLimit = 6,
}: SuggestionSectionProps) {
  const [pool, setPool] = useState<SuggestedStory[]>([]);
  const [leaderboard, setLeaderboard] = useState<SuggestedStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    const tasks: Promise<void>[] = [
      fetch(`${API_BASE_URL}/api/suggestions/pool`, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (Array.isArray(data?.stories)) setPool(data.stories.slice(0, poolLimit));
        })
        .catch(() => {}),
      fetch(`${API_BASE_URL}/api/suggestions/boost-leaderboard`, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (Array.isArray(data?.stories)) setLeaderboard(data.stories.slice(0, leaderboardLimit));
        })
        .catch(() => {}),
    ];
    Promise.all(tasks).finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [poolLimit, leaderboardLimit]);

  // Don't render the section if there are no suggestions AND no boosted stories
  // (only hide after we know the data, to avoid layout shift during loading).
  if (!loading && pool.length === 0 && leaderboard.length === 0) return null;

  return (
    <section className="border-b border-[#f0e6d0]/50 py-8">
      <div className="section-container space-y-8">
        {/* ── Today's Featured Pool ── */}
        <div>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div className="flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-amber-500" />
              <div>
                <h2 className="text-heading-md font-bold text-gray-900">Truyện đề cử hôm nay</h2>
                <p className="text-caption text-gray-500">
                  Những truyện được độc giả đề cử (50 xu/lượt)
                </p>
              </div>
            </div>
            <Link
              href="/suggest"
              className="text-body-sm font-medium text-primary-700 hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {Array.from({ length: poolLimit }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] rounded-xl bg-gray-200" />
                  <div className="mt-2 h-3 w-3/4 rounded bg-gray-200" />
                  <div className="mt-1 h-2 w-1/2 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : pool.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center">
              <StarIcon className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-body-sm text-gray-500">
                Hôm nay chưa có truyện đề cử nào.
              </p>
              <Link
                href="/suggest"
                className="mt-3 inline-block text-body-sm font-medium text-primary-700 hover:underline"
              >
                Là người đầu tiên đề cử →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {pool.map((story, index) => (
                <Link
                  key={story.id}
                  href={`/story/${story.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 shadow-sm transition-shadow group-hover:shadow-md">
                    <CoverImage
                      src={resolveCoverSrc(story as any)}
                      alt={story.title}
                      sizes="(max-width: 640px) 50vw, 180px"
                      priority={index < 3}
                      eager={index < 3}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {index < 3 && (
                      <div
                        className={`absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-caption font-bold text-white shadow ${
                          index === 0
                            ? "bg-amber-500"
                            : index === 1
                              ? "bg-gray-400"
                              : "bg-amber-700"
                        }`}
                      >
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <h3 className="mt-2.5 line-clamp-1 text-body-sm font-semibold text-gray-900 group-hover:text-primary-600">
                    {story.title}
                  </h3>
                  <p className="mt-0.5 line-clamp-1 text-caption text-gray-500">
                    {story.author?.name}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-gray-400">
                    <span className="flex items-center gap-0.5">
                      <EyeIcon className="h-3 w-3" />
                      {story.views?.toLocaleString?.() ?? 0}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <HeartIcon className="h-3 w-3" />
                      {story.likes?.toLocaleString?.() ?? 0}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Top Boosted Leaderboard ── */}
        {leaderboard.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <RocketLaunchIcon className="h-5 w-5 text-rose-500" />
              <div>
                <h2 className="text-heading-md font-bold text-gray-900">Top đề cử tăng tốc</h2>
                <p className="text-caption text-gray-500">
                  Truyện được boost nhiều nhất (50 xu/lượt boost)
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {leaderboard.map((story) => (
                <Link
                  key={story.id}
                  href={`/story/${story.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
                >
                  <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <CoverImage
                      src={resolveCoverSrc(story as any)}
                      alt={story.title}
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <ArrowTrendingUpIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
                      <h3 className="line-clamp-1 text-body-sm font-semibold text-gray-900 group-hover:text-primary-600">
                        {story.title}
                      </h3>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-caption text-gray-500">
                      {story.author?.name}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 font-bold text-rose-700">
                        🚀 ×{story.boostScore ?? 0}
                      </span>
                      <span className="flex items-center gap-0.5 text-gray-400">
                        <EyeIcon className="h-3 w-3" />
                        {story.views?.toLocaleString?.() ?? 0}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
