"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TrophyIcon,
  EyeIcon,
  HeartIcon,
  BookOpenIcon,
  StarIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import { Spinner } from "@/components/LoadingState";
import { resolveCoverSrc } from "@/lib/api";
import { useCachedFetch, invalidateCacheKey } from "@/lib/useCachedFetch";

const VIETNAMESE_MONTHS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

interface RankedStory {
  id: string;
  title: string;
  slug: string;
  updatedAt?: string;
  genre: string;
  status: string;
  views: number;
  likes: number;
  averageRating: number;
  ratingCount: number;
  monthlyViews: number | null;
  coverUrl?: string | null;
  author: { id: string; name: string; image: string | null };
  _count: { chapters: number };
}

interface RankingResponse {
  stories: RankedStory[];
  year: number;
  month: number;
}

const tabs = [
  { key: "views", label: "Lượt đọc", icon: EyeIcon },
  { key: "likes", label: "Yêu thích", icon: HeartIcon },
  { key: "rating", label: "Đánh giá", icon: StarIcon },
  { key: "updated", label: "Mới cập nhật", icon: ClockIcon },
];

const rankColors = ["text-yellow-500", "text-gray-400", "text-amber-700"];

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState("views");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  // Cache key includes the active tab and month so each combination shares
  // 1 network request across the page lifetime, AND so React 18 strict-mode
  // double-mounting does not fire two fetches.
  const cacheKey = useMemo(
    () => `ranking:${activeTab}:${year}:${month}`,
    [activeTab, year, month],
  );
  const { data, loading, mutate } = useCachedFetch<RankingResponse>(
    cacheKey,
    `/api/ranking?sort=${activeTab}&limit=20&year=${year}&month=${month}`,
    undefined,
    { revalidateMs: 0, revalidateOnFocus: false, revalidateOnVisibility: false },
  );

  const stories = data?.stories ?? [];
  const error = !data && !loading;

  const prevMonth = useCallback(() => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }, [month]);

  const nextMonth = useCallback(() => {
    const now = new Date();
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
    if (!isCurrentMonth) {
      if (month === 12) { setMonth(1); setYear((y) => y + 1); }
      else setMonth((m) => m + 1);
    }
  }, [year, month]);

  // Expose a stable reload action (used by EmptyState).
  const reload = useCallback(() => {
    invalidateCacheKey(cacheKey);
    mutate();
  }, [cacheKey, mutate]);

  const isCurrentMonth = () => {
    const now = new Date();
    return year === now.getFullYear() && month === now.getMonth() + 1;
  };

  const monthLabel = `${VIETNAMESE_MONTHS[month - 1]} ${year}`;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="section-container py-8">

          {/* Header */}
          <div>
            <div className="flex items-center gap-3">
              <TrophyIcon className="h-8 w-8 text-yellow-500" />
              <h1 className="text-display-sm font-bold text-gray-900">
                Bảng xếp hạng
              </h1>
            </div>
            <p className="mt-2 text-body-md text-gray-500">
              Những tác phẩm được yêu thích nhất trên VStory — xếp theo tháng
            </p>
          </div>

          {/* Month selector — only for "Lượt đọc" tab */}
          {activeTab === "views" && (
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-[#f0e6d0] bg-white px-5 py-3 shadow-sm">
              <span className="text-body-sm font-medium text-gray-600">
                Xếp hạng theo lượt đọc:
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={prevMonth}
                  className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                  aria-label="Tháng trước"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <span className="min-w-[130px] text-center text-body-sm font-semibold text-gray-800">
                  {monthLabel}
                </span>
                <button
                  onClick={nextMonth}
                  disabled={isCurrentMonth()}
                  className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Tháng sau"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mt-6 flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-body-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-primary-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Ranking list */}
          {loading ? (
            <div className="mt-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="mt-8">
              <EmptyState
                title="Không thể tải bảng xếp hạng"
                description="Máy chủ đang bận. Vui lòng thử lại trong giây lát."
                action={{ label: "Tải lại", onClick: reload }}
              />
            </div>
          ) : stories.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title="Chưa có dữ liệu xếp hạng"
                description="Bảng xếp hạng sẽ cập nhật khi có lượt đọc từ cộng đồng."
              />
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {stories.map((story, index) => {
                // Show monthly views for "views" tab, total views for others
                const displayViews = activeTab === "views"
                  ? (story.monthlyViews ?? 0)
                  : story.views;

                return (
                  <div key={story.id}>
                    <Link
                      href={`/truyen/${story.slug}`}
                      className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card transition-all hover:shadow-card-hover"
                    >
                      {/* Rank number */}
                      <div className="flex w-12 flex-shrink-0 items-center justify-center">
                        {index < 3 ? (
                          <div className="relative">
                            <TrophyIcon className={`h-8 w-8 ${rankColors[index]}`} />
                            <span className="absolute inset-0 flex items-center justify-center text-caption font-bold text-gray-800">
                              {index + 1}
                            </span>
                          </div>
                        ) : (
                          <span className="text-heading-md font-bold text-gray-300">
                            {index + 1}
                          </span>
                        )}
                      </div>

                      {/* Cover */}
                      <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={resolveCoverSrc(story)}
                          alt={story.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-body-md font-semibold text-gray-900 line-clamp-1">
                          {story.title}
                        </h3>
                        <p className="mt-0.5 text-caption text-gray-500">
                          {story.author.name}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3">
                          {story.genre?.split(",").map((g: string) => g.trim()).filter(Boolean).slice(0, 2).map((g: string) => (
                            <span key={g} className="rounded-full bg-primary-100 px-2 py-0.5 text-caption text-primary-700">{g}</span>
                          ))}
                          <span className="flex items-center gap-1 text-caption text-gray-400">
                            <BookOpenIcon className="h-3 w-3" />
                            {/* chapterCount is a flat number on /api/ranking; _count.chapters would be on Prisma include. Use the one we have. */}
                            {(story as any).chapterCount ?? (story as any)._count?.chapters ?? 0}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex-shrink-0 text-right">
                        <div className="flex items-center gap-1.5 text-body-sm font-semibold text-gray-900">
                          {activeTab === "views" ? (
                            <>
                              <EyeIcon className="h-4 w-4 text-primary-500" />
                              {displayViews.toLocaleString()}
                              {isCurrentMonth() && (
                                <span className="text-caption font-normal text-primary-500">tháng này</span>
                              )}
                            </>
                          ) : activeTab === "likes" ? (
                            <>
                              <HeartIcon className="h-4 w-4 text-red-500" />
                              {story.likes.toLocaleString()}
                            </>
                          ) : activeTab === "rating" ? (
                            <>
                              <StarIcon className="h-4 w-4 text-yellow-500" />
                              {story.averageRating}/5
                              <span className="text-caption font-normal text-gray-400">({story.ratingCount})</span>
                            </>
                          ) : (
                            <>
                              <ClockIcon className="h-4 w-4 text-blue-500" />
                              {story.updatedAt ? new Date(story.updatedAt).toLocaleDateString("vi-VN") : "-"}
                            </>
                          )}
                        </div>
                        <span
                          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-caption font-medium ${
                            story.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {story.status === "completed" ? "Hoàn thành" : "Đang ra"}
                        </span>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
