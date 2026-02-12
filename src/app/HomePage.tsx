"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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
} from "@heroicons/react/24/outline";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Story } from "@/types";

import featuredData from "@/data/mock/featured.json";

const allStories = featuredData as Story[];

/* ── Story Card (simple — cover + title + author) ── */
function SimpleCard({ story, index }: { story: Story; index: number }) {
  return (
    <Link href={`/story/${story.slug}`} className="group block">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 shadow-sm transition-shadow group-hover:shadow-md">
          <Image
            src={story.coverUrl}
            alt={story.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 180px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {/* Status badge */}
          {story.status === "completed" && (
            <span className="absolute left-2 top-2 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              Full
            </span>
          )}
        </div>
        <h3 className="mt-2.5 line-clamp-1 text-body-sm font-semibold text-gray-900 transition-colors group-hover:text-primary-600">
          {story.title}
        </h3>
        <p className="mt-0.5 text-caption text-gray-500">
          {story.author}
        </p>
      </motion.div>
    </Link>
  );
}

/* ── Horizontal Carousel ── */
function StoryCarousel({ title, stories, icon: Icon }: { title: string; stories: Story[]; icon: React.ElementType }) {
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
          className="hide-scrollbar -mx-2 flex gap-4 overflow-x-auto px-2 snap-x"
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

/* ── Tab options ── */
type Tab = "recent" | "new" | "recommended";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("recent");

  const tabs: { id: Tab; label: string }[] = [
    { id: "recent", label: "Vừa cập nhật" },
    { id: "new", label: "Tác phẩm mới" },
    { id: "recommended", label: "Đề xuất" },
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
        return [...allStories].sort((a, b) => b.readersCount - a.readersCount);
      default:
        return allStories;
    }
  }, [activeTab]);

  const hotStories = [...allStories].sort((a, b) => b.readersCount - a.readersCount);
  const completedStories = allStories.filter((s) => s.status === "completed");

  return (
    <>
      <Header />

      <main className="min-h-screen">
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
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-primary-500"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tab content grid ── */}
        <section className="py-8">
          <div className="section-container">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7"
            >
              {tabStories.map((story, i) => (
                <SimpleCard key={story.id} story={story} index={i} />
              ))}
            </motion.div>

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

        {/* ── Truyện hot carousel ── */}
        <div>
          <StoryCarousel title="Truyện Hot" stories={hotStories} icon={FireIcon} />
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
                  className="flex items-center gap-1 text-body-sm font-medium text-primary-500 hover:underline"
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
                className="flex items-center gap-1 text-body-sm font-medium text-primary-500 hover:underline"
              >
                Xem đầy đủ
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {hotStories.slice(0, 6).map((story, i) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                >
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
                    <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                      <Image src={story.coverUrl} alt="" fill className="object-cover" sizes="40px" />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h4 className="line-clamp-1 text-body-sm font-semibold text-gray-900">
                        {story.title}
                      </h4>
                      <p className="text-caption text-gray-500">{story.author}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-400">
                        <span className="flex items-center gap-0.5">
                          <EyeIcon className="h-3 w-3" />
                          {(story.readersCount / 1000).toFixed(1)}K
                        </span>
                        <span className="rounded bg-gray-100 px-1 py-0.5 text-[10px] font-medium">
                          {story.genre}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA banner ── */}
        <section className="py-12">
          <div className="section-container">
            <div className="rounded-2xl bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 px-6 py-10 text-center text-white sm:px-12">
              <SparklesIcon className="mx-auto h-8 w-8 text-white/80" />
              <h2 className="mt-3 text-heading-lg font-bold">Bạn có câu chuyện muốn kể?</h2>
              <p className="mx-auto mt-2 max-w-md text-body-md text-white/80">
                Trở thành tác giả trên VStory — hoàn toàn miễn phí. Viết, chia sẻ và xây dựng cộng đồng đọc giả.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/author/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-body-sm font-semibold text-orange-700 shadow-md transition-all hover:shadow-lg"
                >
                  Bắt đầu viết ngay
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

      <Footer />
    </>
  );
}
