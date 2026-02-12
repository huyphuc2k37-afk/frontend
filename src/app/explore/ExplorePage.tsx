"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import ExploreFilters from "@/components/ExploreFilters";
import Carousel from "@/components/Carousel";
import SectionsGrid from "@/components/SectionsGrid";
import Footer from "@/components/Footer";

import featuredData from "@/data/mock/featured.json";
import categoriesData from "@/data/mock/categories.json";

import type { Story, Category } from "@/types";

const allStories = featuredData as Story[];
const categories = categoriesData as Category[];

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string>("all");

  // Filter stories based on active filters
  const filteredStories = useMemo(() => {
    return allStories.filter((s) => {
      const matchCategory = !activeCategory || s.genre === activeCategory;
      const matchStatus =
        activeStatus === "all" || s.status === activeStatus;
      return matchCategory && matchStatus;
    });
  }, [activeCategory, activeStatus]);

  const featured = allStories.slice(0, 8);
  const newUpdated = filteredStories
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 4);
  const recommended = [...filteredStories].reverse().slice(0, 4);
  const weeklyHot = filteredStories
    .filter((s) => s.readersCount > 30000)
    .sort((a, b) => b.readersCount - a.readersCount)
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

        {weeklyHot.length > 0 && (
          <SectionsGrid title="Nổi bật tuần" stories={weeklyHot} />
        )}

        {filteredStories.length === 0 && (
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
