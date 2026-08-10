"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { EyeIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL, resolveCoverSrc } from "@/lib/api";
import { isTranslatedStory } from "@/lib/storyOrigin";
import CoverImage from "@/lib/CoverImage";

export interface ApiStory {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  featuredSlot?: number | null;
  genre: string;
  storyOrigin?: string;
  originalTitle?: string | null;
  originalAuthor?: string | null;
  originalLanguage?: string | null;
  translatorName?: string | null;
  status: string;
  views: number;
  likes: number;
  updatedAt: string;
  coverUrl?: string | null;
  author: { id: string; name: string; image: string | null };
  _count: { chapters: number; bookmarks: number };
  monthlyViews?: number | null;
}

interface StoryCardProps {
  story: ApiStory;
  index?: number;
}

/** Compact cover story card (used in grids + carousels). */
const StoryCard = memo(function StoryCard({ story, index = 99 }: StoryCardProps) {
  const fallbackUrl = useMemo(
    () => `${API_BASE_URL}/api/stories/${story.id}/cover?v=${encodeURIComponent(story.updatedAt || "2")}`,
    [story.id, story.updatedAt]
  );
  const coverSrc = useMemo(() => resolveCoverSrc(story), [story]);
  const translated = useMemo(() => isTranslatedStory(story), [story]);
  const primaryGenre = story.genre?.split(",")[0]?.trim() || "Đang cập nhật";
  const chapterCount = story._count?.chapters || 0;
  const statusLabel =
    story.status === "completed" ? "Hoàn thành" : story.status === "paused" ? "Tạm ngưng" : "Đang viết";

  return (
    <Link href={`/truyen/${story.slug}`} className="group block">
      <div>
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 shadow-sm transition-shadow group-hover:shadow-md">
          <CoverImage
            src={coverSrc}
            alt={story.title}
            sizes="(max-width: 640px) 50vw, 180px"
            priority={index < 3}
            eager={index < 3}
            fallbackUrl={fallbackUrl}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {story.status === "completed" && (
            <span className="absolute left-2 top-2 rounded-md bg-emerald-700 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              Full
            </span>
          )}
          {translated && (
            <span className="absolute right-2 top-2 rounded-md bg-sky-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              Dịch
            </span>
          )}
        </div>
        <h3 className="mt-2.5 line-clamp-1 text-body-sm font-semibold text-gray-900 transition-colors group-hover:text-primary-600">
          {story.title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-caption text-gray-500">{story.author?.name}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
            {primaryGenre}
          </span>
          {translated && (
            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
              Truyện dịch
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              story.status === "completed"
                ? "bg-emerald-50 text-emerald-700"
                : story.status === "paused"
                ? "bg-amber-50 text-amber-700"
                : "bg-sky-50 text-sky-700"
            }`}
          >
            {statusLabel}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1">
            <EyeIcon className="h-3.5 w-3.5" />
            {story.views >= 1000 ? `${(story.views / 1000).toFixed(1)}K` : story.views}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpenIcon className="h-3.5 w-3.5" />
            {chapterCount} chương
          </span>
        </div>
      </div>
    </Link>
  );
});

export default StoryCard;
