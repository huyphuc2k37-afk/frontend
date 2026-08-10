"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL } from "@/lib/api";

interface Recommendation {
  id: string;
  title: string;
  slug: string;
  coverImage?: string | null;
  coverUrl?: string | null;
  genre?: string;
  views?: number;
  likes?: number;
  /** Số chương — được enrich từ backend /api/recommendations/home */
  chapterCount?: number;
  author?: { id: string; name: string };
  score?: number;
}

interface Props {
  title: string;
  /** Tag slug (e.g., "dam-my") — used to derive /the-loai/<slug> link */
  tagSlug: string;
  stories: Recommendation[];
}

/**
 * Render 1 row trên trang chủ kiểu "Hot {title}" — 6-8 cards ngang.
 */
export default function HotByGenreSection({ title, tagSlug, stories }: Props) {
  if (stories.length === 0) return null;
  const display = stories.slice(0, 8);

  return (
    <section className="border-b border-gray-100 bg-white py-8 sm:py-10">
      <div className="section-container">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-heading-md font-bold text-gray-900 sm:text-heading-lg">
              Hot {title}
            </h2>
          </div>
          <Link
            href={`/the-loai/${tagSlug}`}
            className="text-body-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            Xem thêm →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {display.map((story) => (
            <Link
              key={story.id}
              href={`/truyen/${story.slug}`}
              className="group block"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={story.coverUrl || story.coverImage || ""}
                  alt={story.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <h3 className="mt-2 line-clamp-2 text-body-sm font-medium text-gray-900 group-hover:text-primary-600">
                {story.title}
              </h3>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-500">
                <span title="Lượt xem">
                  {(story.views || 0).toLocaleString("vi-VN")} lượt xem
                </span>
                {typeof story.chapterCount === "number" && (
                  <span
                    className="inline-flex items-center gap-0.5"
                    title="Số chương"
                  >
                    <BookOpenIcon className="h-3 w-3" />
                    {story.chapterCount.toLocaleString("vi-VN")}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

interface HotByGenreMapProps {
  /** Map label → stories; render mỗi entry là 1 row */
  hotByGenre: Record<string, Recommendation[]>;
  /** Map label → tagSlug (for "Xem thêm" link) */
  labelToSlug: Record<string, string>;
}

/**
 * Render nhiều HotByGenreSection liên tiếp — dùng cho payload từ /api/recommendations/home.
 */
export function HotByGenreRows({ hotByGenre, labelToSlug }: HotByGenreMapProps) {
  return (
    <>
      {Object.entries(hotByGenre).map(([label, stories]) =>
        stories.length > 0 ? (
          <HotByGenreSection
            key={label}
            title={label}
            tagSlug={labelToSlug[label] || ""}
            stories={stories}
          />
        ) : null
      )}
    </>
  );
}
