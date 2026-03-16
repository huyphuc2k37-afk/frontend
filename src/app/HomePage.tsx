"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  EyeIcon,
  StarIcon,
  FireIcon,
  SparklesIcon,
  BookOpenIcon,
  ClockIcon,
  FunnelIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import Header from "@/components/Header";
import AdsterraNativeBanner from "@/components/ads/AdsterraNativeBanner";
import { API_BASE_URL } from "@/lib/api";

interface ApiStory {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  featuredSlot?: number | null;
  genre: string;
  status: string;
  views: number;
  likes: number;
  updatedAt: string;
  coverUrl?: string | null;
  author: { id: string; name: string; image: string | null };
  _count: { chapters: number; bookmarks: number };
}

const PLACEHOLDER_COVER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' fill='%23e5e7eb'%3E%3Crect width='300' height='400'/%3E%3C/svg%3E";

/* ── Story Card (simple — cover + title + author) ── */
function SimpleCard({ story, index }: { story: ApiStory; index: number }) {
  const fallbackUrl = `${API_BASE_URL}/api/stories/${story.id}/cover?v=${encodeURIComponent(story.updatedAt || "2")}`;
  const coverUrl = story.coverUrl || fallbackUrl;
  const [coverSrc, setCoverSrc] = useState(coverUrl);
  const primaryGenre = story.genre?.split(",")[0]?.trim() || "Đang cập nhật";
  const chapterCount = story._count?.chapters || 0;
  const statusLabel = story.status === "completed"
    ? "Hoàn thành"
    : story.status === "paused"
    ? "Tạm ngưng"
    : "Đang viết";

  return (
    <Link href={`/story/${story.slug}`} className="group block">
      <div>
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 shadow-sm transition-shadow group-hover:shadow-md">
          <Image
            src={coverSrc}
            alt={story.title}
            fill
            priority={index < 6}
            sizes="(max-width: 640px) 50vw, 180px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setCoverSrc(PLACEHOLDER_COVER)}
          />
          {/* Status badge */}
          {story.status === "completed" && (
            <span className="absolute left-2 top-2 rounded-md bg-emerald-700 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              Full
            </span>
          )}
        </div>
        <h3 className="mt-2.5 line-clamp-1 text-body-sm font-semibold text-gray-900 transition-colors group-hover:text-primary-600">
          {story.title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-caption text-gray-500">
          {story.author?.name}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
            {primaryGenre}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${story.status === "completed" ? "bg-emerald-50 text-emerald-700" : story.status === "paused" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"}`}>
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
}

/* ── Horizontal Carousel ── */
function StoryCarousel({ title, stories, icon: Icon }: { title: string; stories: ApiStory[]; icon: React.ElementType }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <section className="py-8">
      <div className="section-container">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary-500" />
            <h2 className="text-heading-md font-bold text-gray-900">{title}</h2>
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
          className="hide-scrollbar -mx-2 flex min-h-[240px] gap-4 overflow-x-auto px-2 snap-x sm:min-h-[280px]"
        >
          {stories.map((story, i) => (
            <div key={story.id} className="w-[160px] flex-shrink-0 snap-start sm:w-[180px]">
              <SimpleCard story={story} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniCover({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
      <Image
        src={imgSrc}
        alt={alt}
        fill
        sizes="40px"
        className="object-cover"
        onError={() => setImgSrc(PLACEHOLDER_COVER)}
      />
    </div>
  );
}

/* ── Tab options ── */
type Tab = "recent" | "new" | "recommended" | "all";

/* ── Genre groups for the "Tất cả truyện" filter ── */
const homeGenreGroups = [
  { label: "Tình cảm", genres: ["Ngôn tình", "Đam mỹ", "Bách hợp", "LGBT+"] },
  { label: "Giả tưởng", genres: ["Xuyên không", "Tu tiên", "Huyền huyễn", "Trọng sinh"] },
  { label: "Bối cảnh", genres: ["Học đường", "Cổ đại", "Hiện đại", "Mạt thế"] },
  { label: "Đặc sắc", genres: ["Kinh dị", "Khoa học viễn tưởng", "Light novel", "Fanfic"] },
  { label: "Phong cách", genres: ["Ngọt ngào", "Ngược tâm", "Chữa lành", "ABO"] },
];

const allHomeGenres = homeGenreGroups.flatMap((g) => g.genres);

const sortOptions = [
  { value: "updatedAt", label: "Mới cập nhật" },
  { value: "new", label: "Mới đăng" },
  { value: "views", label: "Lượt xem" },
  { value: "likes", label: "Yêu thích" },
];

export default function HomePage({ initialStories = [], initialFeaturedStories = [] }: { initialStories?: ApiStory[]; initialFeaturedStories?: ApiStory[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("recent");
  const [allStories, setAllStories] = useState<ApiStory[]>(initialStories);
  const [featuredStories, setFeaturedStories] = useState<ApiStory[]>(initialFeaturedStories);
  const [featuredActiveIndex, setFeaturedActiveIndex] = useState(0);
  const [loading, setLoading] = useState(initialStories.length === 0);
  const [fetchError, setFetchError] = useState(false);
  const featuredScrollRef = useRef<HTMLDivElement>(null);

  // Real ranking data from /api/ranking
  const [rankingStories, setRankingStories] = useState<ApiStory[]>([]);

  // "Tất cả truyện" tab state
  const [allTabGenre, setAllTabGenre] = useState<string | null>(null);
  const [allTabSort, setAllTabSort] = useState("updatedAt");
  const [allTabStories, setAllTabStories] = useState<ApiStory[]>([]);
  const [allTabLoading, setAllTabLoading] = useState(false);
  const [allTabPage, setAllTabPage] = useState(1);
  const [allTabTotal, setAllTabTotal] = useState(0);
  const ALL_TAB_LIMIT = 18;

  const fetchStories = useCallback(async (retries = 3) => {
    setLoading(true);
    setFetchError(false);
    for (let i = 0; i < retries; i++) {
      try {
        const r = await fetch(`${API_BASE_URL}/api/stories?limit=14`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (data?.stories?.length) {
          setAllStories(data.stories);
          setLoading(false);
          return;
        }
        // API returned ok but no stories — don't retry
        break;
      } catch {
        // Wait before retrying (handles Render cold start ~30s)
        if (i < retries - 1) await new Promise((ok) => setTimeout(ok, 3000));
      }
    }
    setLoading(false);
    setFetchError(true);
  }, []);

  useEffect(() => {
    // Skip fetch if SSR already provided stories
    if (initialStories.length > 0) return;
    fetchStories();
  }, [fetchStories, initialStories.length]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_BASE_URL}/api/stories?featured=true&limit=5`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.stories)) setFeaturedStories(data.stories);
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  useEffect(() => {
    setFeaturedActiveIndex(0);
  }, [featuredStories.length]);

  useEffect(() => {
    const container = featuredScrollRef.current;
    if (!container || featuredStories.length === 0) return;

    const updateActiveCard = () => {
      const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-featured-card='true']"));
      if (cards.length === 0) return;

      const containerCenter = container.scrollLeft + container.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - containerCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setFeaturedActiveIndex(closestIndex);
    };

    updateActiveCard();
    container.addEventListener("scroll", updateActiveCard, { passive: true });

    return () => {
      container.removeEventListener("scroll", updateActiveCard);
    };
  }, [featuredStories]);

  // Fetch real ranking from dedicated API
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/ranking?sort=views&limit=12`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setRankingStories(data);
      })
      .catch(() => {});
  }, []);

  // Fetch stories for "Tất cả truyện" tab
  const fetchAllTabStories = useCallback(async (genre: string | null, sort: string, page: number) => {
    setAllTabLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(ALL_TAB_LIMIT), page: String(page), sort });
      if (genre) params.set("genre", genre);
      const res = await fetch(`${API_BASE_URL}/api/stories?${params}`);
      const data = await res.json();
      if (data?.stories) {
        setAllTabStories(data.stories);
        setAllTabTotal(data.pagination?.total || 0);
      }
    } catch {}
    setAllTabLoading(false);
  }, []);

  // When switching to "all" tab or changing genre/sort/page, fetch
  useEffect(() => {
    if (activeTab === "all") {
      fetchAllTabStories(allTabGenre, allTabSort, allTabPage);
    }
  }, [activeTab, allTabGenre, allTabSort, allTabPage, fetchAllTabStories]);

  const handleGenreChange = (genre: string | null) => {
    setAllTabGenre(genre);
    setAllTabPage(1);
  };

  const handleSortChange = (sort: string) => {
    setAllTabSort(sort);
    setAllTabPage(1);
  };

  const allTabTotalPages = Math.ceil(allTabTotal / ALL_TAB_LIMIT);

  const tabs: { id: Tab; label: string }[] = [
    { id: "recent", label: "Vừa cập nhật" },
    { id: "new", label: "Tác phẩm mới" },
    { id: "recommended", label: "Đề xuất" },
    { id: "all", label: "Tất cả truyện" },
  ];

  const tabStories = useMemo(() => {
    switch (activeTab) {
      case "recent":
        return [...allStories].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      case "new":
        return [...allStories].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ).reverse();
      case "recommended":
        return [...allStories].sort((a, b) => b.views - a.views);
      default:
        return allStories;
    }
  }, [activeTab, allStories]);

  // Use real ranking data if available, fall back to local sort
  const hotStories = useMemo(
    () => rankingStories.length > 0 ? rankingStories : [...allStories].sort((a, b) => b.views - a.views),
    [rankingStories, allStories]
  );
  const featuredDisplayStories = useMemo(() => {
    if (featuredStories.length > 0) return featuredStories;
    return hotStories.slice(0, 5);
  }, [featuredStories, hotStories]);
  const completedStories = useMemo(() => allStories.filter((s) => s.status === "completed"), [allStories]);

  return (
    <>
      <Header />

      <main className="min-h-screen">
        {loading && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        )}

        {!loading && allStories.length === 0 && (
          <div className="section-container py-20 text-center">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-body-lg text-gray-500">
              {fetchError ? "Không thể tải dữ liệu. Máy chủ đang khởi động, vui lòng thử lại." : "Chưa có truyện nào. Hãy quay lại sau!"}
            </p>
            {fetchError && (
              <button
                onClick={() => fetchStories()}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-2.5 text-body-sm font-medium text-white shadow-sm transition-all hover:bg-primary-600 hover:shadow-md"
              >
                Thử lại
              </button>
            )}
          </div>
        )}

        {!loading && allStories.length > 0 && (<>
        {featuredDisplayStories.length > 0 && (
        <section className="border-b border-[#f0e6d0]/50 py-6">
          <div className="section-container">
            <div className="mb-5 flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-amber-500" />
              <h2 className="text-heading-md font-bold text-gray-900">Nổi bật hôm nay</h2>
            </div>
            <div className="-mx-4 md:hidden">
              <div
                ref={featuredScrollRef}
                className="flex gap-3 overflow-x-auto px-4 pb-4 pt-1 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {featuredDisplayStories.map((story, i) => (
                  <div key={story.id} data-featured-card="true" className="w-[40vw] min-w-[40vw] max-w-[160px] snap-start">
                    <SimpleCard story={story} index={i} />
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden grid-cols-2 gap-4 md:grid md:grid-cols-3 lg:grid-cols-5">
              {featuredDisplayStories.map((story, i) => (
                <SimpleCard key={story.id} story={story} index={i} />
              ))}
            </div>
          </div>
        </section>
        )}

        {/* ── Tabs section ── */}
        <section className="border-b border-[#f0e6d0]/50">
          <div className="section-container">
            {/* Tab bar */}
            <div className="flex gap-6 pt-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative pb-3 text-body-md font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-primary-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-primary-500 transition-all"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tab content grid ── */}
        {activeTab !== "all" ? (
        <section className="py-8">
          <div className="section-container">
            <div
              className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7"
            >
              {tabStories.map((story, i) => (
                <SimpleCard key={story.id} story={story} index={i} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full border border-[#f0e6d0] bg-white/60 px-6 py-2.5 text-body-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-white/80 hover:shadow-md"
              >
                Xem thêm
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
        ) : (
        /* ── "Tất cả truyện" tab content with genre filter + sort + pagination ── */
        <section className="py-6">
          <div className="section-container">
            {/* Genre filter pills */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <FunnelIcon className="h-4 w-4 text-gray-400" />
                <span className="text-body-sm font-semibold text-gray-600">Thể loại:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleGenreChange(null)}
                  className={`rounded-full px-3.5 py-1.5 text-caption font-medium transition-all ${
                    allTabGenre === null
                      ? "bg-primary-500 text-white shadow-sm"
                      : "bg-white/70 text-gray-600 border border-[#f0e6d0] hover:bg-white hover:shadow-sm"
                  }`}
                >
                  Tất cả
                </button>
                {allHomeGenres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleGenreChange(genre)}
                    className={`rounded-full px-3.5 py-1.5 text-caption font-medium transition-all ${
                      allTabGenre === genre
                        ? "bg-primary-500 text-white shadow-sm"
                        : "bg-white/70 text-gray-600 border border-[#f0e6d0] hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort options */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListBulletIcon className="h-4 w-4 text-gray-400" />
                <span className="text-body-sm font-semibold text-gray-600">Sắp xếp:</span>
                <div className="flex gap-1.5 ml-1">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSortChange(opt.value)}
                      className={`rounded-lg px-3 py-1 text-caption font-medium transition-all ${
                        allTabSort === opt.value
                          ? "bg-primary-50 text-primary-600 border border-primary-200"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {allTabTotal > 0 && (
                <span className="text-caption text-gray-400">{allTabTotal.toLocaleString()} truyện</span>
              )}
            </div>

            {/* Stories grid */}
            {allTabLoading ? (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
              </div>
            ) : allTabStories.length === 0 ? (
              <div className="py-16 text-center">
                <BookOpenIcon className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 text-body-sm text-gray-400">
                  {allTabGenre ? `Chưa có truyện thể loại "${allTabGenre}"` : "Không tìm thấy truyện"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                {allTabStories.map((story, i) => (
                  <SimpleCard key={story.id} story={story} index={i} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {allTabTotalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  disabled={allTabPage <= 1}
                  onClick={() => setAllTabPage(allTabPage - 1)}
                  className="rounded-full border border-[#f0e6d0] bg-white/60 px-4 py-2 text-caption font-medium text-gray-600 hover:bg-white/80 disabled:opacity-40"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                {/* Page numbers */}
                {Array.from({ length: Math.min(allTabTotalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (allTabTotalPages <= 7) {
                    pageNum = i + 1;
                  } else if (allTabPage <= 4) {
                    pageNum = i + 1;
                  } else if (allTabPage >= allTabTotalPages - 3) {
                    pageNum = allTabTotalPages - 6 + i;
                  } else {
                    pageNum = allTabPage - 3 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setAllTabPage(pageNum)}
                      className={`h-8 w-8 rounded-full text-caption font-medium transition-all ${
                        allTabPage === pageNum
                          ? "bg-primary-500 text-white shadow-sm"
                          : "text-gray-500 hover:bg-white/80"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  disabled={allTabPage >= allTabTotalPages}
                  onClick={() => setAllTabPage(allTabPage + 1)}
                  className="rounded-full border border-[#f0e6d0] bg-white/60 px-4 py-2 text-caption font-medium text-gray-600 hover:bg-white/80 disabled:opacity-40"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </section>
        )}

        {/* ── Truyện hot carousel ── */}
        <div>
          <StoryCarousel title="Truyện Hot" stories={hotStories} icon={FireIcon} />
        </div>

        {/* ── Ad: between hot & completed ── */}
        <div className="section-container py-4">
          <AdsterraNativeBanner />
        </div>

        {/* ── Hoàn thành ── */}
        {completedStories.length > 0 && (
          <section className="py-8">
            <div className="section-container">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpenIcon className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-heading-md font-bold text-gray-900">
                    Truyện hoàn thành
                  </h2>
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
                {completedStories.map((story, i) => (
                  <SimpleCard key={story.id} story={story} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Ranking preview ── */}
        <section className="py-8">
          <div className="section-container">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StarIcon className="h-5 w-5 text-amber-500" />
                <h2 className="text-heading-md font-bold text-gray-900">
                  Bảng xếp hạng
                </h2>
              </div>
              <Link
                href="/ranking"
                className="flex items-center gap-1 text-body-sm font-medium text-primary-700 hover:underline"
              >
                Xem đầy đủ
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {hotStories.slice(0, 6).map((story, i) => (
                <div key={story.id}>
                  <Link
                    href={`/story/${story.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-white/50 bg-white/80 p-3 transition-all hover:bg-white hover:shadow-sm"
                  >
                    {/* Rank */}
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

                    {/* Cover mini */}
                    <MiniCover
                      src={story.coverUrl || `${API_BASE_URL}/api/stories/${story.id}/cover?v=${encodeURIComponent(story.updatedAt || "2")}`}
                      alt={story.title}
                    />

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-1 text-body-sm font-semibold text-gray-900">
                        {story.title}
                      </h3>
                      <p className="text-caption text-gray-500">{story.author?.name}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-500">
                        <span className="flex items-center gap-0.5">
                          <EyeIcon className="h-3 w-3" />
                          {(story.views / 1000).toFixed(1)}K
                        </span>
                        <span className="rounded bg-gray-100 px-1 py-0.5 text-[10px] font-medium text-gray-600">
                          {story.genre?.split(",")[0]?.trim() || story.genre}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA banner ── */}
        </>)}

        {/* ── Ad before CTA ── */}
        <div className="section-container py-4">
          <AdsterraNativeBanner />
        </div>

        <section className="py-12">
          <div className="section-container">
            <div className="rounded-2xl bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 px-6 py-10 text-center text-white sm:px-12">
              <SparklesIcon className="mx-auto h-8 w-8 text-white/80" />
              <h2 className="mt-3 text-heading-lg font-bold">Khám phá truyện hay mỗi ngày</h2>
              <p className="mx-auto mt-2 max-w-md text-body-md text-white/80">
                Khám phá hàng nghìn truyện hay của tác giả Việt trên VStory. Đọc miễn phí, theo dõi truyện yêu thích và cập nhật chương mới mỗi ngày.
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
