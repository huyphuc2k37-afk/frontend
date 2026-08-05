"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  SparklesIcon,
  ClockIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { useRef } from "react";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import { CardSkeleton } from "@/components/LoadingState";
import RecommendedStories from "@/components/RecommendedStories";
import PersonalizedSection from "@/components/home/PersonalizedSection";
import { API_BASE_URL } from "@/lib/api";
import { useSession } from "next-auth/react";
import StoryCard, { ApiStory } from "@/components/home/StoryCard";
import FeaturedSection from "@/components/home/FeaturedSection";
import StoriesTabSection from "@/components/home/StoriesTabSection";
import HotRankingSection from "@/components/home/HotRankingSection";
import GenreSection from "@/components/home/GenreSection";
import { HotByGenreRows } from "@/components/home/HotByGenreSection";

interface HomePageProps {
  initialStories?: ApiStory[];
  initialFeaturedStories?: ApiStory[];
}

export default function HomePage({
  initialStories = [],
  initialFeaturedStories = [],
}: HomePageProps) {
  const { data: session } = useSession();
  const [allStories, setAllStories] = useState<ApiStory[]>(initialStories);
  const [featuredStories, setFeaturedStories] = useState<ApiStory[]>(initialFeaturedStories);
  const [loading, setLoading] = useState(initialStories.length === 0);
  const [fetchError, setFetchError] = useState(false);

  const [rankingStories, setRankingStories] = useState<ApiStory[]>([]);
  const [translatedStories, setTranslatedStories] = useState<ApiStory[]>([]);
  const [hotByGenre, setHotByGenre] = useState<Record<string, ApiStory[]>>({});

  const fetchStories = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const r = await fetch(`${API_BASE_URL}/api/stories?limit=14`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      if (data?.stories?.length) {
        setAllStories(data.stories);
        setLoading(false);
        return;
      }
    } catch {
      /* handled below */
    }
    setLoading(false);
    setFetchError(true);
  }, []);

  useEffect(() => {
    if (initialStories.length > 0) return;
    fetchStories();
  }, [fetchStories, initialStories.length]);

  // Parallel fetch (ranking + translated). Featured already from SSR.
  useEffect(() => {
    const controller = new AbortController();
    const tasks: Promise<void>[] = [];

    if (initialFeaturedStories.length === 0) {
      tasks.push(
        fetch(`${API_BASE_URL}/api/stories?featured=true&limit=5`, {
          cache: "no-store",
          signal: controller.signal,
        })
          .then((r) => r.json())
          .then((data) => {
            if (Array.isArray(data?.stories)) setFeaturedStories(data.stories);
          })
          .catch(() => {})
      );
    }

    tasks.push(
      fetch(`${API_BASE_URL}/api/ranking?sort=views&limit=12`, {
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setRankingStories(data);
          else if (Array.isArray(data?.stories)) setRankingStories(data.stories);
        })
        .catch(() => {})
    );

    tasks.push(
      fetch(`${API_BASE_URL}/api/stories?story_origin=translated&sort=updatedAt&limit=10`, {
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data?.stories)) setTranslatedStories(data.stories);
        })
        .catch(() => {})
    );

    // Fetch 5 hot-by-genre rows from the combined /home endpoint
    tasks.push(
      fetch(`${API_BASE_URL}/api/recommendations/home?limit=8`, {
        signal: controller.signal,
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.hotByGenre) setHotByGenre(data.hotByGenre);
        })
        .catch(() => {})
    );

    Promise.all(tasks);
    return () => controller.abort();
  }, [initialFeaturedStories.length]);

  const hotStories = useMemo(
    () =>
      rankingStories.length > 0
        ? rankingStories
        : [...allStories].sort((a, b) => b.views - a.views),
    [rankingStories, allStories]
  );
  const featuredDisplay = useMemo(
    () => (featuredStories.length > 0 ? featuredStories : hotStories.slice(0, 5)),
    [featuredStories, hotStories]
  );
  const completedStories = useMemo(
    () => allStories.filter((s) => s.status === "completed"),
    [allStories]
  );

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen">
        {loading && (
          <div className="section-container py-10" style={{ minHeight: "1600px" }}>
            <div className="mb-6 h-6 w-48 animate-pulse rounded bg-gray-200" />
            <CardSkeleton count={7} />
          </div>
        )}

        {!loading && allStories.length === 0 && (
          <div className="section-container py-20">
            <EmptyState
              title={fetchError ? "Không thể tải dữ liệu" : "Chưa có truyện nào"}
              description={
                fetchError
                  ? "Máy chủ đang khởi động. Bấm Thử lại để tải lại danh sách truyện."
                  : "Hãy quay lại sau khi tác giả đăng truyện mới nhé!"
              }
              action={
                fetchError
                  ? { label: "Thử lại", onClick: () => fetchStories() }
                  : { label: "Khám phá truyện", href: "/explore" }
              }
            />
          </div>
        )}

        {!loading && allStories.length > 0 && (
          <>
            <FeaturedSection stories={featuredDisplay} />

            {/* Genre explorer — placed prominently right after Featured */}
            <GenreSection />

            <StoriesTabSection initialStories={allStories} />

            {translatedStories.length > 0 && (
              <TranslatedCarousel stories={translatedStories} />
            )}

            {completedStories.length > 0 && <CompletedSection stories={completedStories} />}

            <HotRankingSection stories={hotStories} />

            {/* 5 hot-by-genre rows (Đam mỹ, Ngôn tình, Trinh thám, Kinh dị, Thanh xuân vườn trường) */}
            <HotByGenreRows
              hotByGenre={hotByGenre}
              labelToSlug={{
                "Đam mỹ": "dam-my",
                "Ngôn tình": "ngon-tinh",
                "Trinh thám": "trinh-tham",
                "Kinh dị": "kinh-di",
                "Thanh xuân vườn trường": "hoc-duong",
              }}
            />

            {/* A2: Personalized "Có thể bạn sẽ thích" — adapts to logged-in / anonymous history */}
            <PersonalizedSection allStories={allStories} />

            {session && (
              <section className="py-8">
                <div className="section-container">
                  <RecommendedStories
                    type="personalized"
                    title="Đề cử cho bạn"
                    limit={10}
                    excludeIds={allStories.map((s) => s.id)}
                  />
                </div>
              </section>
            )}
          </>
        )}

        <section className="py-8">
          <div className="section-container">
            <div className="rounded-2xl bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 px-6 py-10 text-center text-white sm:px-12">
              <SparklesIcon className="mx-auto h-8 w-8 text-white/80" />
              <h2 className="mt-3 text-heading-lg font-bold">Khám phá truyện hay mỗi ngày</h2>
              <p className="mx-auto mt-2 max-w-md text-body-md text-white/80">
                Khám phá hàng nghìn truyện hay của tác giả Việt trên VStory. Đọc miễn phí, theo dõi truyện
                yêu thích và cập nhật chương mới mỗi ngày.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-body-sm font-semibold text-orange-700 shadow-md transition-all hover:shadow-lg"
                >
                  Khám phá ngay
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-body-sm font-semibold text-white transition-all hover:bg-white/10"
                >
                  Tìm hiểu thêm
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

/* Small inline sub-components kept here so HomePage is the single source of truth */

function TranslatedCarousel({ stories }: { stories: ApiStory[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };
  return (
    <section className="py-8">
      <div className="section-container">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-primary-500" />
            <h2 className="text-heading-md font-bold text-gray-900">Truyện dịch mới cập nhật</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="rounded-full border border-[#f0e6d0] bg-white/50 p-1.5 text-gray-600 transition-colors hover:bg-white/80 hover:text-gray-700"
              aria-label="Trước"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="rounded-full border border-[#f0e6d0] bg-white/50 p-1.5 text-gray-600 transition-colors hover:bg-white/80 hover:text-gray-700"
              aria-label="Tiếp"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="hide-scrollbar -mx-2 flex gap-4 overflow-x-auto px-2 snap-x"
        >
          {stories.map((story, i) => (
            <div key={story.id} className="w-[160px] flex-shrink-0 snap-start sm:w-[180px]">
              <StoryCard story={story} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CompletedSection({ stories }: { stories: ApiStory[] }) {
  return (
    <section className="py-8">
      <div className="section-container">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5 text-emerald-500" />
            <h2 className="text-heading-md font-bold text-gray-900">Truyện hoàn thành</h2>
          </div>
          <Link
            href="/explore?status=completed"
            className="flex items-center gap-1 text-body-sm font-medium text-primary-700 hover:underline"
          >
            Xem tất cả
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {stories.map((story, i) => (
            <StoryCard key={story.id} story={story} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
