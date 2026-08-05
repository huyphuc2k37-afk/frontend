"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import { API_BASE_URL } from "@/lib/api";
import StoryCard, { ApiStory } from "@/components/home/StoryCard";
import EmptyState from "@/components/EmptyState";
import { CardSkeleton } from "@/components/LoadingState";

type Tab = "recent" | "all";

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
const ALL_TAB_LIMIT = 18;

interface StoriesTabSectionProps {
  initialStories: ApiStory[];
}

export default function StoriesTabSection({ initialStories }: StoriesTabSectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>("recent");
  const [allTabGenre, setAllTabGenre] = useState<string | null>(null);
  const [allTabSort, setAllTabSort] = useState("updatedAt");
  const [allTabStories, setAllTabStories] = useState<ApiStory[]>([]);
  const [allTabLoading, setAllTabLoading] = useState(false);
  const [allTabPage, setAllTabPage] = useState(1);
  const [allTabTotal, setAllTabTotal] = useState(0);

  const fetchAllTabStories = useCallback(async (genre: string | null, sort: string, page: number) => {
    setAllTabLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(ALL_TAB_LIMIT),
        page: String(page),
        sort,
      });
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

  const recentStories = useMemo(
    () =>
      [...initialStories].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [initialStories]
  );

  const allTabTotalPages = Math.ceil(allTabTotal / ALL_TAB_LIMIT);

  return (
    <section className="border-b border-[#f0e6d0]/50">
      <div className="section-container">
        <div className="flex gap-6 pt-4">
          {[
            { id: "recent" as Tab, label: "Vừa cập nhật" },
            { id: "all" as Tab, label: "Tất cả truyện" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-3 text-body-md font-medium transition-colors ${
                activeTab === tab.id ? "text-primary-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-primary-500 transition-all" />
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab !== "all" ? (
        <div className="py-8">
          <div className="section-container">
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
              {recentStories.map((story, i) => (
                <StoryCard key={story.id} story={story} index={i} />
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
        </div>
      ) : (
        <div className="py-6">
          <div className="section-container">
            {/* Genre filter pills */}
            <div className="mb-4">
              <div className="mb-3 flex items-center gap-2">
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
                <div className="ml-1 flex gap-1.5">
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
                <span className="text-caption text-gray-400">
                  {allTabTotal.toLocaleString()} truyện
                </span>
              )}
            </div>

            {/* Grid */}
            {allTabLoading ? (
              <CardSkeleton count={ALL_TAB_LIMIT} />
            ) : allTabStories.length === 0 ? (
              <EmptyState
                title={allTabGenre ? `Chưa có truyện thể loại "${allTabGenre}"` : "Không tìm thấy truyện"}
                description="Thử bỏ bộ lọc thể loại hoặc chọn tab khác nhé."
                action={
                  allTabGenre
                    ? { label: "Xem tất cả truyện", onClick: () => handleGenreChange(null) }
                    : undefined
                }
              />
            ) : (
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                {allTabStories.map((story, i) => (
                  <StoryCard key={story.id} story={story} index={i} />
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
                {Array.from({ length: Math.min(allTabTotalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (allTabTotalPages <= 7) pageNum = i + 1;
                  else if (allTabPage <= 4) pageNum = i + 1;
                  else if (allTabPage >= allTabTotalPages - 3) pageNum = allTabTotalPages - 6 + i;
                  else pageNum = allTabPage - 3 + i;
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
        </div>
      )}
    </section>
  );
}
