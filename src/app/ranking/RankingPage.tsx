"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TrophyIcon,
  EyeIcon,
  HeartIcon,
  BookOpenIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { API_BASE_URL } from "@/lib/api";

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
  author: { id: string; name: string; image: string | null };
  _count: { chapters: number };
}

const tabs = [
  { key: "views", label: "Lượt đọc", icon: EyeIcon },
  { key: "likes", label: "Yêu thích", icon: HeartIcon },
  { key: "rating", label: "Đánh giá", icon: StarIcon },
];

const rankColors = ["text-yellow-500", "text-gray-400", "text-amber-700"];

export default function RankingPage() {
  const [stories, setStories] = useState<RankedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("views");

  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`${API_BASE_URL}/api/ranking?sort=${activeTab}&limit=20`)
      .then((r) => r.json())
      .then((data) => {
        setStories(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, [activeTab]);

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
              Những tác phẩm được yêu thích nhất trên VStory
            </p>
          </div>

          {/* Tabs */}
          <div className="mt-8 flex gap-2">
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
            <div className="mt-16 flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="mt-16 text-center text-gray-500">
              <p>Không thể tải bảng xếp hạng. Vui lòng thử lại sau.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {stories.map((story, index) => (
                <div key={story.id}>
                  <Link
                    href={`/story/${story.slug}`}
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
                        src={`${API_BASE_URL}/api/stories/${story.id}/cover?v=${encodeURIComponent(story.updatedAt || "2")}`}
                        alt={story.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                        unoptimized
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
                          {story._count.chapters}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden flex-shrink-0 text-right sm:block">
                      <div className="flex items-center gap-1.5 text-body-sm font-semibold text-gray-900">
                        {activeTab === "views" ? (
                          <>
                            <EyeIcon className="h-4 w-4 text-primary-500" />
                            {story.views.toLocaleString()}
                          </>
                        ) : activeTab === "likes" ? (
                          <>
                            <HeartIcon className="h-4 w-4 text-red-500" />
                            {story.likes.toLocaleString()}
                          </>
                        ) : (
                          <>
                            <StarIcon className="h-4 w-4 text-yellow-500" />
                            {story.averageRating}/5
                            <span className="text-caption font-normal text-gray-400">({story.ratingCount})</span>
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
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
