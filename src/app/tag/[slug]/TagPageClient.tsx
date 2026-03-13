"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  EyeIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { API_BASE_URL } from "@/lib/api";

interface ApiTag {
  id: string;
  name: string;
  slug: string;
  type: string;
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
  coverUrl?: string | null;
  isAdult?: boolean;
  author: { id: string; name: string; image: string | null };
  category?: { name: string; slug: string } | null;
  _count: { chapters: number; bookmarks: number };
  tags?: { name: string; slug: string; type: string }[];
}

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' fill='%23e5e7eb'%3E%3Crect width='300' height='400'/%3E%3C/svg%3E";

const tagTypeLabels: Record<string, string> = {
  genre: "Thể loại",
  relation: "Tuyến tình cảm",
  ending: "Kết thúc",
  tone: "Phong cách",
  perspective: "Góc nhìn",
  content: "Nội dung",
  form: "Hình thức",
};

function StoryCard({ story }: { story: ApiStory }) {
  const fallbackUrl = `${API_BASE_URL}/api/stories/${story.id}/cover?v=${encodeURIComponent(story.updatedAt || "2")}`;
  const coverUrl = story.coverUrl || fallbackUrl;
  const [src, setSrc] = useState(coverUrl);
  return (
    <Link href={`/story/${story.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 shadow-sm transition-shadow group-hover:shadow-md">
        <Image
          src={src}
          alt={story.title}
          fill
          sizes="(max-width: 640px) 50vw, 180px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setSrc(PLACEHOLDER)}
        />
        {story.status === "completed" && (
          <span className="absolute left-2 top-2 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            Full
          </span>
        )}
      </div>
      <h3 className="mt-2.5 line-clamp-1 text-body-sm font-semibold text-gray-900 transition-colors group-hover:text-primary-600">
        {story.title}
      </h3>
      <p className="mt-0.5 text-caption text-gray-500">{story.author?.name}</p>
      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-500">
        <span className="flex items-center gap-0.5">
          <EyeIcon className="h-3 w-3" />
          {story.views >= 1000
            ? (story.views / 1000).toFixed(1) + "K"
            : story.views}
        </span>
        <span>{story._count?.chapters ?? 0} chương</span>
      </div>
    </Link>
  );
}

export default function TagPageClient({
  tag,
  initialStories,
  pagination,
}: {
  tag: ApiTag;
  initialStories: ApiStory[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}) {
  const [stories, setStories] = useState(initialStories);
  const [page, setPage] = useState(pagination.page);
  const [loading, setLoading] = useState(false);
  const [totalPages] = useState(pagination.totalPages);
  const [sort, setSort] = useState("updated");

  const loadPage = async (newPage: number, newSort?: string) => {
    const s = newSort || sort;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/tags/${tag.slug}?page=${newPage}&pageSize=30&sort=${s}`,
      );
      const data = await res.json();
      if (data?.stories) {
        setStories(data.stories);
        setPage(newPage);
      }
    } catch {}
    setLoading(false);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    loadPage(1, newSort);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Breadcrumb */}
        <nav
          className="section-container pt-4 text-caption text-gray-500"
          aria-label="Breadcrumb"
        >
          <ol className="flex items-center gap-1">
            <li>
              <Link href="/" className="hover:text-primary-600">
                Trang chủ
              </Link>
            </li>
            <li>
              <ChevronRightIcon className="h-3 w-3" />
            </li>
            <li>
              <Link href="/explore" className="hover:text-primary-600">
                Khám phá
              </Link>
            </li>
            <li>
              <ChevronRightIcon className="h-3 w-3" />
            </li>
            <li className="font-medium text-gray-800">{tag.name}</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="pb-4 pt-6 sm:pt-8">
          <div className="section-container">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                {tagTypeLabels[tag.type] || tag.type}
              </span>
              <h1 className="text-display-sm text-gray-900 sm:text-display-md">
                {tag.name}
              </h1>
            </div>
            <p className="mt-3 text-body-lg text-gray-600">
              {pagination.total} truyện với tag &ldquo;{tag.name}&rdquo;
            </p>
          </div>
        </section>

        {/* Sort buttons */}
        <div className="section-container pb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "updated", label: "Mới cập nhật" },
              { value: "new", label: "Mới đăng" },
              { value: "views", label: "Nhiều lượt đọc" },
              { value: "popular", label: "Yêu thích nhất" },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => handleSortChange(s.value)}
                className={`rounded-full px-3.5 py-1.5 text-body-sm font-medium transition-all ${
                  sort === s.value
                    ? "bg-primary-600 text-white shadow-md"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Story grid */}
        {stories.length > 0 ? (
          <section className="py-6">
            <div className="section-container">
              <div className={`grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 ${loading ? "opacity-50" : ""}`}>
                {stories.map((s) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    disabled={page <= 1 || loading}
                    onClick={() => loadPage(page - 1)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-body-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Trang trước
                  </button>
                  <span className="px-3 text-body-sm text-gray-500">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages || loading}
                    onClick={() => loadPage(page + 1)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-body-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Trang sau
                  </button>
                </div>
              )}
            </div>
          </section>
        ) : (
          <div className="section-container py-20 text-center">
            <p className="text-body-lg text-gray-400">
              Chưa có truyện nào với tag này.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
