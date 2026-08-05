"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import { BookOpenIcon, EyeIcon, FireIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { resolveCoverSrc } from "@/lib/api";
import type { ApiStory } from "@/components/home/StoryCard";

interface HotRankingStory extends ApiStory {
  chapterCount?: number;
}

interface HotRankingSectionProps {
  stories: HotRankingStory[];
}

const PLACEHOLDER_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' fill='%23e5e7eb'%3E%3Crect width='300' height='400'/%3E%3C/svg%3E";

const MiniCover = memo(function MiniCover({ src, alt }: { src?: string | null; alt: string }) {
  const initialSrc = src || PLACEHOLDER_FALLBACK;
  const [imgSrc, setImgSrc] = useState(initialSrc);
  return (
    <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        onError={() => setImgSrc(PLACEHOLDER_FALLBACK)}
      />
    </div>
  );
});

function formatViews(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString();
}

export default function HotRankingSection({ stories }: HotRankingSectionProps) {
  const top6 = stories.slice(0, 6);
  if (top6.length === 0) return null;

  return (
    <section className="py-8">
      <div className="section-container">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FireIcon className="h-5 w-5 text-orange-500" />
            <h2 className="text-heading-md font-bold text-gray-900">Truyện hot & Bảng xếp hạng</h2>
          </div>
          <Link
            href="/ranking"
            className="flex items-center gap-1 text-body-sm font-medium text-primary-700 hover:underline"
          >
            Xem đầy đủ
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {top6.map((story, i) => {
            const displayViews = story.monthlyViews ?? story.views;
            return (
              <Link
                key={story.id}
                href={`/story/${story.slug}`}
                className="flex items-center gap-3 rounded-xl border border-white/50 bg-white/80 p-3 transition-all hover:bg-white hover:shadow-sm"
              >
                <span
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-caption font-bold ${
                    i === 0
                      ? "bg-amber-100 text-amber-600"
                      : i === 1
                      ? "bg-gray-100 text-gray-500"
                      : i === 2
                      ? "bg-orange-100 text-orange-600"
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  {i + 1}
                </span>
                <MiniCover src={resolveCoverSrc(story)} alt={story.title} />
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-1 text-body-sm font-semibold text-gray-900">{story.title}</h3>
                  <p className="text-caption text-gray-500">{story.author?.name}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-500">
                    <span className="flex items-center gap-0.5" title="Lượt xem">
                      <EyeIcon className="h-3 w-3" />
                      {formatViews(displayViews)}
                    </span>
                    <span
                      className="rounded bg-gray-100 px-1 py-0.5 text-[10px] font-medium text-gray-600"
                      title="Số chương"
                    >
                      {story.genre?.split(",")[0]?.trim() || story.genre}
                    </span>
                    {typeof story.chapterCount === "number" && (
                      <span className="flex items-center gap-0.5 text-[11px] text-gray-500" title="Số chương">
                        <BookOpenIcon className="h-3 w-3" />
                        {story.chapterCount.toLocaleString("vi-VN")}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
