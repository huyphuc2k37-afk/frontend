"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRightIcon,
  EyeIcon,
  BookOpenIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { API_BASE_URL } from "@/lib/api";

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  icon: string;
  color: string;
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
}

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' fill='%23e5e7eb'%3E%3Crect width='300' height='400'/%3E%3C/svg%3E";

function StoryCard({ story }: { story: ApiStory }) {
  const coverUrl = `${API_BASE_URL}/api/stories/${story.id}/cover`;
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
          unoptimized
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
      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-400">
        <span className="flex items-center gap-0.5">
          <EyeIcon className="h-3 w-3" />
          {story.views >= 1000
            ? (story.views / 1000).toFixed(1) + "K"
            : story.views}
        </span>
        <span>
          {story._count?.chapters ?? 0} chương
        </span>
      </div>
    </Link>
  );
}

export default function GenreLandingClient({
  category,
  initialStories,
}: {
  category: ApiCategory;
  initialStories: ApiStory[];
}) {
  const heading = `Truyện ${category.name}`;
  const hotStories = [...initialStories].sort((a, b) => b.views - a.views);
  const completedStories = initialStories.filter(
    (s) => s.status === "completed",
  );
  const newStories = [...initialStories].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  // Fetch other categories for internal linking
  const [otherCategories, setOtherCategories] = useState<ApiCategory[]>([]);
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then((r) => r.json())
      .then((data) => {
        const cats = (data?.categories || []).filter(
          (c: ApiCategory) => c.slug !== category.slug,
        );
        setOtherCategories(cats);
      })
      .catch(() => {});
  }, [category.slug]);

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
              <Link href="/the-loai" className="hover:text-primary-600">
                Thể loại
              </Link>
            </li>
            <li>
              <ChevronRightIcon className="h-3 w-3" />
            </li>
            <li className="font-medium text-gray-800">{heading}</li>
          </ol>
        </nav>

        {/* Hero / H1 */}
        <section className="pb-4 pt-6 sm:pt-8">
          <div className="section-container">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{category.icon}</span>
              <h1 className="text-display-sm text-gray-900 sm:text-display-md">
                {heading}
              </h1>
            </div>
            <p className="mt-3 max-w-2xl text-body-lg text-gray-600">
              {category.description || category.seoDescription}
            </p>
          </div>
        </section>

        {/* Story grid */}
        {initialStories.length > 0 ? (
          <>
            {/* Mới cập nhật */}
            <section className="py-6">
              <div className="section-container">
                <h2 className="mb-4 text-heading-md font-bold text-gray-900">
                  {category.name} mới cập nhật
                </h2>
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                  {newStories.map((s) => (
                    <StoryCard key={s.id} story={s} />
                  ))}
                </div>
              </div>
            </section>

            {/* Hot */}
            {hotStories.length > 0 && (
              <section className="py-6">
                <div className="section-container">
                  <h2 className="mb-4 text-heading-md font-bold text-gray-900">
                    {category.name} hot nhất
                  </h2>
                  <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                    {hotStories.slice(0, 12).map((s) => (
                      <StoryCard key={s.id} story={s} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Hoàn thành */}
            {completedStories.length > 0 && (
              <section className="py-6">
                <div className="section-container">
                  <h2 className="mb-4 text-heading-md font-bold text-gray-900">
                    {category.name} đã hoàn thành
                  </h2>
                  <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                    {completedStories.map((s) => (
                      <StoryCard key={s.id} story={s} />
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="section-container py-20 text-center">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-body-lg text-gray-500">
              Chưa có truyện {category.name.toLowerCase()} nào. Hãy quay lại sau!
            </p>
          </div>
        )}

        {/* CTA */}
        <section className="py-8">
          <div className="section-container text-center">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-body-sm font-semibold text-white shadow-md transition-all hover:bg-primary-600 hover:shadow-lg"
            >
              Khám phá tất cả truyện
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Related categories — internal linking */}
        {otherCategories.length > 0 && (
          <section className="border-t border-gray-100 py-8">
            <div className="section-container">
              <h2 className="mb-4 text-heading-sm font-bold text-gray-900">
                Thể loại truyện khác
              </h2>
              <div className="flex flex-wrap gap-2">
                {otherCategories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/the-loai/${c.slug}`}
                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-body-sm text-gray-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                  >
                    {c.icon} {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SEO text block — crawlable content for Google */}
        <section className="border-t border-gray-100 bg-gray-50/50 py-8">
          <div className="section-container">
            <h2 className="mb-3 text-heading-sm font-bold text-gray-800">
              Đọc truyện {category.name.toLowerCase()} online miễn phí tại VStory
            </h2>
            <div className="max-w-3xl text-body-sm leading-relaxed text-gray-600">
              <p>
                VStory là nền tảng đọc và viết truyện chữ hàng đầu dành cho
                người Việt. Tại đây, bạn có thể đọc truyện{" "}
                {category.name.toLowerCase()} hay nhất hoàn toàn miễn phí, với hàng
                nghìn chương được cập nhật liên tục bởi các tác giả Việt Nam.
              </p>
              <p className="mt-2">
                Kho truyện {category.name.toLowerCase()} trên VStory bao gồm cả
                truyện đang ra và truyện đã hoàn thành (full). Bạn có thể theo
                dõi truyện yêu thích, nhận thông báo khi có chương mới và đánh
                giá truyện để giúp cộng đồng tìm được những tác phẩm hay nhất.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
