"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ExploreFilters from "@/components/ExploreFilters";
import Carousel from "@/components/Carousel";
import SectionsGrid from "@/components/SectionsGrid";
import Footer from "@/components/Footer";
import AdSenseSlot from "@/components/ads/AdSenseSlot";
import { API_BASE_URL } from "@/lib/api";

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  _count: { stories: number };
}

interface ApiStory {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  genre: string;
  status: string;
  views: number;
  likes: number;
  updatedAt: string;
  author: { id: string; name: string; image: string | null };
  _count: { chapters: number; bookmarks: number };
  category?: { name: string; slug: string } | null;
}

export default function ExplorePage() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allStories, setAllStories] = useState<ApiStory[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories once
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then((r) => r.json())
      .then((data) => setCategories(data?.categories || []))
      .catch(() => {});
  }, []);

  // Read ?q= from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get("q") || "";
    if (q) setSearchQuery(q);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("limit", "40");
    if (activeCategory) params.set("category", activeCategory);
    if (activeStatus !== "all") params.set("status", activeStatus);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());

    setLoading(true);
    fetch(`${API_BASE_URL}/api/stories?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.stories) setAllStories(data.stories);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeCategory, activeStatus, searchQuery]);

  // Since backend already filters by genre/status, allStories IS the filtered result
  const featured = allStories.slice(0, 8);
  const newUpdated = [...allStories]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 4);
  const recommended = [...allStories].reverse().slice(0, 4);
  const weeklyHot = [...allStories]
    .sort((a, b) => b.views - a.views)
    .slice(0, 4);

  return (
    <>
      <Header />

      <main>
        {/* Page title */}
        <section className="pb-4 pt-8 sm:pt-12">
          <div className="section-container">
            <h1 className="text-display-sm text-gray-900 sm:text-display-md">
              Khám phá truyện
            </h1>
            <p className="mt-2 text-body-lg text-gray-500">
              Tìm câu chuyện yêu thích của bạn trong hàng nghìn tựa truyện.
            </p>
          </div>
        </section>

        {/* Unified search + filters */}
        <ExploreFilters
          stories={allStories}
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Featured carousel */}
        <Carousel title="Truyện nổi bật" stories={featured} />

        {/* Story grids */}
        {newUpdated.length > 0 && (
          <SectionsGrid title="Mới cập nhật" stories={newUpdated} />
        )}

        {recommended.length > 0 && (
          <SectionsGrid title="Đề xuất cho bạn" stories={recommended} />
        )}

        {/* Ad: between sections */}
        <div className="section-container py-4">
          <AdSenseSlot slot="1336707630" />
        </div>

        {weeklyHot.length > 0 && (
          <SectionsGrid title="Nổi bật tuần" stories={weeklyHot} />
        )}

        {!loading && allStories.length === 0 && (
          <div className="section-container py-20 text-center">
            <p className="text-body-lg text-gray-400">
              Không tìm thấy truyện phù hợp. Thử chọn thể loại khác?
            </p>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
