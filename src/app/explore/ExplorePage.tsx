"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import ExploreFilters, { FilterSidebar, FilterDrawer, ActiveFilterChips } from "@/components/ExploreFilters";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import { CardSkeleton } from "@/components/LoadingState";
import { API_BASE_URL } from "@/lib/api";

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  storyCount: number;
}

interface ApiStory {
  id: string;
  title: string;
  slug: string;
  description: string | null;
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
  author: { id: string; name: string; image: string | null };
  _count: { chapters: number; bookmarks: number };
  category?: { name: string; slug: string } | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ExploreState {
  stories: ApiStory[];
  pagination: Pagination | null;
}

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [state, setState] = useState<ExploreState>({ stories: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Read filters from URL — this IS the single source of truth.
  const origin = searchParams.get("origin") || "all";
  const category = searchParams.get("category");
  const status = searchParams.get("status") || "all";
  const search = searchParams.get("q") || searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Fetch categories once (they don't change often).
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then((r) => r.json())
      .then((data) => setCategories(data?.categories || []))
      .catch(() => {});
  }, []);

  // Fetch stories whenever URL params change.
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setLoading(true);
    setError(false);

    const params = new URLSearchParams();
    params.set("limit", "36");
    params.set("page", String(page));
    if (origin !== "all") params.set("story_origin", origin);
    if (category) params.set("category", category);
    if (status !== "all") params.set("status", status);
    if (search.trim()) params.set("search", search.trim());

    const url = `${API_BASE_URL}/api/stories?${params.toString()}`;

    fetch(url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setState({
          stories: data?.stories || [],
          pagination: data?.pagination || null,
        });
      })
      .catch((err) => {
        if (cancelled || err.name === "AbortError") return;
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [origin, category, status, search, page]);

  // ── Filter helpers ───────────────────────────────────────────────
  const setFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1 on filter change
    router.replace(`/explore?${params.toString()}`, { scroll: false });
  };

  const setSearch = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) {
      params.set("q", q.trim());
    } else {
      params.delete("q");
      params.delete("search");
    }
    params.delete("page");
    router.replace(`/explore?${params.toString()}`, { scroll: false });
  };

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.replace(`/explore?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    router.replace("/explore", { scroll: false });
  };

  const activeFiltersCount = [
    origin !== "all",
    !!category,
    status !== "all",
    !!search,
  ].filter(Boolean).length;

  // Page title adapts to the active filter.
  const pageTitle = useMemo(() => {
    if (origin === "translated") return "Khám phá truyện dịch";
    if (origin === "original") return "Khám phá truyện nguyên tác";
    if (category) {
      const cat = categories.find((c) => c.slug === category);
      return cat ? cat.name : "Khám phá truyện";
    }
    return "Khám phá truyện";
  }, [origin, category, categories]);

  const { stories, pagination } = state;

  return (
    <>
      <Header />

      <main>
        {/* ── Page header ── */}
        <section className="pb-4 pt-8 sm:pt-12">
          <div className="section-container">
            <h1 className="text-display-sm text-gray-900 sm:text-display-md">
              {pageTitle}
            </h1>
            {pagination && (
              <p className="mt-1 text-body-sm text-gray-500">
                {pagination.total.toLocaleString("vi-VN")} truyện
                {search ? ` cho "${search}"` : ""}
              </p>
            )}
          </div>
        </section>

        {/* ── Search bar + chips (mobile: also show filter drawer button) ── */}
        <div className="pb-6">
          <div className="section-container">
            <div className="flex max-w-2xl items-start gap-4">
              <div className="flex-1">
                <ExploreFilters
                  categories={categories}
                  activeOrigin={origin}
                  onOriginChange={(v) => setFilter("origin", v)}
                  activeCategory={category}
                  onCategoryChange={(v) => setFilter("category", v)}
                  activeStatus={status}
                  onStatusChange={(v) => setFilter("status", v)}
                  searchQuery={search}
                  onSearchChange={setSearch}
                />
                <ActiveFilterChips
                  activeOrigin={origin}
                  activeCategory={category}
                  categories={categories}
                  activeStatus={status}
                  onOriginChange={(v) => setFilter("origin", v)}
                  onCategoryChange={(v) => setFilter("category", v)}
                  onStatusChange={(v) => setFilter("status", v)}
                />
              </div>
              {/* Mobile filter drawer toggle */}
              <div className="mt-2 lg:hidden">
                <FilterDrawer
                  categories={categories}
                  activeOrigin={origin}
                  onOriginChange={(v) => setFilter("origin", v)}
                  activeCategory={category}
                  onCategoryChange={(v) => setFilter("category", v)}
                  activeStatus={status}
                  onStatusChange={(v) => setFilter("status", v)}
                  searchQuery={search}
                  onSearchChange={setSearch}
                  hasActiveFilters={activeFiltersCount > 0}
                  onClearAll={clearAll}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Story grid ── */}
        <section className="pb-12">
          <div className="section-container">
            {/* Desktop: sidebar + grid in same container */}
            <div className="hidden items-start gap-6 lg:flex">
              <FilterSidebar
                categories={categories}
                activeOrigin={origin}
                onOriginChange={(v) => setFilter("origin", v)}
                activeCategory={category}
                onCategoryChange={(v) => setFilter("category", v)}
                activeStatus={status}
                onStatusChange={(v) => setFilter("status", v)}
                hasActiveFilters={activeFiltersCount > 0}
                onClearAll={clearAll}
              />
              <div className="min-w-0 flex-1">
                <StoryGrid
                  stories={stories}
                  loading={loading}
                  error={error}
                  pagination={pagination}
                  page={page}
                  search={search}
                  activeFiltersCount={activeFiltersCount}
                  onPageChange={setPage}
                  onClearAll={clearAll}
                />
              </div>
            </div>

            {/* Mobile: full-width grid */}
            <div className="lg:hidden">
              <StoryGrid
                stories={stories}
                loading={loading}
                error={error}
                pagination={pagination}
                page={page}
                search={search}
                activeFiltersCount={activeFiltersCount}
                onPageChange={setPage}
                onClearAll={clearAll}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function StoryGrid({
  stories,
  loading,
  error,
  pagination,
  page,
  search,
  activeFiltersCount,
  onPageChange,
  onClearAll,
}: {
  stories: ApiStory[];
  loading: boolean;
  error: boolean;
  pagination: Pagination | null;
  page: number;
  search: string;
  activeFiltersCount: number;
  onPageChange: (p: number) => void;
  onClearAll: () => void;
}) {
  if (loading) return <CardSkeleton count={36} />;
  if (error)
    return (
      <EmptyState
        title="Không thể tải dữ liệu"
        description="Máy chủ đang bận. Vui lòng thử lại."
        action={{ label: "Thử lại", onClick: () => onPageChange(1) }}
      />
    );
  if (stories.length === 0)
    return (
      <EmptyState
        title="Không tìm thấy truyện phù hợp"
        description="Thử bỏ bộ lọc hoặc từ khóa tìm kiếm khác."
        action={activeFiltersCount > 0 ? { label: "Xóa bộ lọc", onClick: onClearAll } : undefined}
      />
    );

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {stories.map((story) => (
          <StoryCardMemo key={story.id} story={story} />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-full border border-gray-200 px-4 py-2 text-body-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            ← Trước
          </button>
          <span className="px-4 text-body-sm text-gray-500">
            Trang {page} / {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-full border border-gray-200 px-4 py-2 text-body-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            Tiếp →
          </button>
        </div>
      )}
    </>
  );
}

// Lazy-loaded story card — avoids re-creating the entire card list component
// tree on filter changes. Since the grid itself is stable, memo here gives
// the biggest win.
import { memo } from "react";
import StoryCard from "@/components/StoryCard";
const StoryCardMemo = memo(StoryCard);

export default function ExplorePage() {
  return <ExploreContent />;
}
