"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TrophyIcon,
  EyeIcon,
  HeartIcon,
  BookOpenIcon,
  StarIcon,
  UserIcon,
  FireIcon,
  CurrencyDollarIcon,
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

// Time period options
const timePeriods = [
  { key: "weekly", label: "Tuần" },
  { key: "monthly", label: "Tháng" },
  { key: "all-time", label: "Mọi thời gian" },
];

// Type options
const typeOptions = [
  { key: "stories", label: "Truyện", icon: BookOpenIcon },
  { key: "authors", label: "Tác giả", icon: UserIcon },
  { key: "readers", label: "Độc giả", icon: HeartIcon },
];

// Story interfaces
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
  monthlyViews?: number | null;
  weeklyViews?: number | null;
  chapterCount?: number;
  coverUrl?: string | null;
  author: { id: string; name: string; image: string | null };
}

// Author interfaces
interface RankedAuthor {
  id: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  totalViews: number;
  totalLikes: number;
  storyCount: number;
  weeklyEarnings?: number;
  monthlyEarnings?: number;
  totalEarnings?: number;
}

// Reader interfaces
interface RankedReader {
  id: string;
  name: string;
  image: string | null;
  coinsSpent: number;
  booksRead: number;
}

// Response types
interface StoriesRankingResponse {
  stories: RankedStory[];
  year?: number;
  month?: number;
  weekStart?: string;
}

interface AuthorsRankingResponse {
  authors: RankedAuthor[];
  year?: number;
  month?: number;
  weekStart?: string;
}

interface ReadersRankingResponse {
  readers: RankedReader[];
  year?: number;
  month?: number;
  weekStart?: string;
}

const rankColors = [
  "bg-gradient-to-br from-yellow-400 to-yellow-600",
  "bg-gradient-to-br from-gray-300 to-gray-500",
  "bg-gradient-to-br from-amber-600 to-amber-800",
];

const rankBadgeColors = [
  "text-yellow-500",
  "text-gray-400",
  "text-amber-700",
];

function StoryRankCard({
  story,
  rank,
}: {
  story: RankedStory;
  rank: number;
}) {
  const displayViews = story.weeklyViews ?? story.monthlyViews ?? story.views;
  const isTop3 = rank <= 3;

  return (
    <Link
      href={`/truyen/${story.slug}`}
      className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card transition-all hover:shadow-card-hover"
    >
      {/* Rank badge */}
      <div className="flex w-12 flex-shrink-0 items-center justify-center">
        {isTop3 ? (
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full">
            <TrophyIcon className={`h-10 w-10 ${rankBadgeColors[rank - 1]}`} />
            <span className="absolute inset-0 flex items-center justify-center text-caption font-bold text-white drop-shadow-md">
              {rank}
            </span>
          </div>
        ) : (
          <span className="text-heading-md font-bold text-gray-300">{rank}</span>
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
            <span key={g} className="rounded-full bg-primary-100 px-2 py-0.5 text-caption text-primary-700">
              {g}
            </span>
          ))}
          <span className="flex items-center gap-1 text-caption text-gray-400">
            <BookOpenIcon className="h-3 w-3" />
            {story.chapterCount ?? 0}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex-shrink-0 text-right">
        <div className="flex items-center gap-1.5 text-body-sm font-semibold text-gray-900">
          <EyeIcon className="h-4 w-4 text-primary-500" />
          {displayViews.toLocaleString()}
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
  );
}

function AuthorRankCard({
  author,
  rank,
}: {
  author: RankedAuthor;
  rank: number;
}) {
  const isTop3 = rank <= 3;

  return (
    <Link
      href={`/author/${author.id}`}
      className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card transition-all hover:shadow-card-hover"
    >
      {/* Rank badge */}
      <div className="flex w-12 flex-shrink-0 items-center justify-center">
        {isTop3 ? (
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full">
            <TrophyIcon className={`h-10 w-10 ${rankBadgeColors[rank - 1]}`} />
            <span className="absolute inset-0 flex items-center justify-center text-caption font-bold text-white drop-shadow-md">
              {rank}
            </span>
          </div>
        ) : (
          <span className="text-heading-md font-bold text-gray-300">{rank}</span>
        )}
      </div>

      {/* Avatar */}
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
        {author.image ? (
          <Image
            src={author.image}
            alt={author.name || "Tác giả"}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-100">
            <UserIcon className="h-7 w-7 text-primary-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-body-md font-semibold text-gray-900 line-clamp-1">
          {author.name || "Tác giả ẩn danh"}
        </h3>
        <p className="mt-0.5 text-caption text-gray-500">
          {author.storyCount} truyện
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1 text-caption text-gray-400">
            <EyeIcon className="h-3 w-3" />
            {author.totalViews.toLocaleString()} lượt đọc
          </span>
          <span className="flex items-center gap-1 text-caption text-gray-400">
            <HeartIcon className="h-3 w-3" />
            {author.totalLikes.toLocaleString()} lượt thích
          </span>
        </div>
      </div>

      {/* Earnings */}
      <div className="flex-shrink-0 text-right">
        <div className="flex items-center gap-1.5 text-body-sm font-semibold text-green-600">
          <CurrencyDollarIcon className="h-4 w-4" />
          {((author.weeklyEarnings ?? author.monthlyEarnings ?? author.totalEarnings ?? 0) / 1000).toFixed(1)}K xu
        </div>
      </div>
    </Link>
  );
}

function ReaderRankCard({
  reader,
  rank,
}: {
  reader: RankedReader;
  rank: number;
}) {
  const isTop3 = rank <= 3;

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card transition-all hover:shadow-card-hover">
      {/* Rank badge */}
      <div className="flex w-12 flex-shrink-0 items-center justify-center">
        {isTop3 ? (
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full">
            <TrophyIcon className={`h-10 w-10 ${rankBadgeColors[rank - 1]}`} />
            <span className="absolute inset-0 flex items-center justify-center text-caption font-bold text-white drop-shadow-md">
              {rank}
            </span>
          </div>
        ) : (
          <span className="text-heading-md font-bold text-gray-300">{rank}</span>
        )}
      </div>

      {/* Avatar */}
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
        {reader.image ? (
          <Image
            src={reader.image}
            alt={reader.name}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-red-100">
            <UserIcon className="h-7 w-7 text-red-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-body-md font-semibold text-gray-900 line-clamp-1">
          {reader.name}
        </h3>
        <p className="mt-0.5 text-caption text-gray-500">
          {reader.booksRead} truyện đã đọc
        </p>
      </div>

      {/* Coins spent */}
      <div className="flex-shrink-0 text-right">
        <div className="flex items-center gap-1.5 text-body-sm font-semibold text-primary-600">
          <CurrencyDollarIcon className="h-4 w-4" />
          {reader.coinsSpent.toLocaleString()} xu
        </div>
        <span className="mt-1 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-caption text-primary-700">
          Hỗ trợ tác giả
        </span>
      </div>
    </div>
  );
}

export default function RankingsPage() {
  const [timePeriod, setTimePeriod] = useState("monthly");
  const [rankingType, setRankingType] = useState("stories");

  // Build API URL based on selections
  const apiUrl = useMemo(() => {
    if (rankingType === "stories") {
      return `/api/ranking/stories/${timePeriod}`;
    } else if (rankingType === "authors") {
      return `/api/ranking/authors/${timePeriod}`;
    } else {
      return `/api/ranking/readers/${timePeriod}`;
    }
  }, [timePeriod, rankingType]);

  const cacheKey = useMemo(
    () => `rankings:${timePeriod}:${rankingType}`,
    [timePeriod, rankingType],
  );

  const { data, loading, error } = useCachedFetch<StoriesRankingResponse | AuthorsRankingResponse | ReadersRankingResponse>(
    cacheKey,
    apiUrl,
    undefined,
    { revalidateMs: 0, revalidateOnFocus: false, revalidateOnVisibility: false },
  );

  const reload = useCallback(() => {
    invalidateCacheKey(cacheKey);
  }, [cacheKey]);

  // Get time period label
  const getTimePeriodLabel = () => {
    const now = new Date();
    if (timePeriod === "weekly") {
      return "Tuần này";
    } else if (timePeriod === "monthly") {
      return `${VIETNAMESE_MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    }
    return "Mọi thời gian";
  };

  // Get items based on type
  const getItems = () => {
    if (!data) return [];
    if (rankingType === "stories") {
      return (data as StoriesRankingResponse).stories || [];
    } else if (rankingType === "authors") {
      return (data as AuthorsRankingResponse).authors || [];
    }
    return (data as ReadersRankingResponse).readers || [];
  };

  const items = getItems();
  const isEmpty = !loading && !error && items.length === 0;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="section-container py-8">

          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3">
              <TrophyIcon className="h-10 w-10 text-yellow-500" />
              <h1 className="text-display-md font-bold text-gray-900">
                Bảng xếp hạng
              </h1>
            </div>
            <p className="mt-3 text-body-md text-gray-500">
              Top truyện, tác giả và độc giả xuất sắc nhất — cập nhật theo thời gian thực
            </p>
          </div>

          {/* Time Period Tabs */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex gap-1 rounded-2xl bg-gray-100 p-1.5">
              {timePeriods.map((period) => (
                <button
                  key={period.key}
                  onClick={() => setTimePeriod(period.key)}
                  className={`rounded-xl px-6 py-2.5 text-body-sm font-medium transition-all ${
                    timePeriod === period.key
                      ? "bg-white text-primary-600 shadow-md"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type Tabs */}
          <div className="mt-4 flex justify-center">
            <div className="inline-flex gap-2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm">
              {typeOptions.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setRankingType(type.key)}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-body-sm font-medium transition-all ${
                    rankingType === type.key
                      ? "bg-primary-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Period Indicator */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <FireIcon className="h-5 w-5 text-orange-500" />
            <span className="text-body-sm font-medium text-gray-600">
              {getTimePeriodLabel()}
            </span>
          </div>

          {/* Ranking List */}
          {loading ? (
            <div className="mt-12 flex justify-center">
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
          ) : isEmpty ? (
            <div className="mt-8">
              <EmptyState
                title="Chưa có dữ liệu xếp hạng"
                description="Bảng xếp hạng sẽ cập nhật khi có đủ dữ liệu từ cộng đồng."
              />
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {items.map((item: RankedStory | RankedAuthor | RankedReader, index: number) => {
                const rank = index + 1;

                if (rankingType === "stories") {
                  return (
                    <StoryRankCard
                      key={(item as RankedStory).id}
                      story={item as RankedStory}
                      rank={rank}
                    />
                  );
                } else if (rankingType === "authors") {
                  return (
                    <AuthorRankCard
                      key={(item as RankedAuthor).id}
                      author={item as RankedAuthor}
                      rank={rank}
                    />
                  );
                } else {
                  return (
                    <ReaderRankCard
                      key={(item as RankedReader).id}
                      reader={item as RankedReader}
                      rank={rank}
                    />
                  );
                }
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
