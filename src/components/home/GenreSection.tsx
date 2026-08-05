"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  storyCount?: number;
  _count?: { stories: number };
}

/**
 * Hiển thị 8 thể loại phổ biến ngay trên trang chủ — người đọc dễ tìm thể loại yêu thích.
 * Data fetched từ /api/categories, cache 1h cùng ISR của trang chủ.
 */
export default function GenreSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/categories`, { next: { revalidate: 3600 } } as any)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        const list: Category[] = data?.categories || [];
        // Backend returns `storyCount` directly (số nguyên) thay vì `_count.stories`
        const countOf = (c: Category) => c.storyCount ?? c._count?.stories ?? 0;
        list.sort((a, b) => countOf(b) - countOf(a));
        setCategories(list.slice(0, 12));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-white py-10 sm:py-12">
        <div className="section-container">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-heading-lg font-bold text-gray-900 sm:text-heading-xl">
                Khám phá theo thể loại
              </h2>
              <p className="mt-1 text-body-sm text-gray-500">Đang tải...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-white py-10 sm:py-12">
      <div className="section-container">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-heading-lg font-bold text-gray-900 sm:text-heading-xl">
              Khám phá theo thể loại
            </h2>
            <p className="mt-1 text-body-sm text-gray-500">
              Chọn thể loại bạn yêu thích để bắt đầu đọc
            </p>
          </div>
          <Link
            href="/the-loai"
            className="hidden text-body-sm font-semibold text-primary-600 hover:text-primary-700 sm:inline"
          >
            Xem tất cả →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/the-loai/${cat.slug}`}
              className="group flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
            >
              <span
                className="mb-2 text-2xl sm:text-3xl"
                style={{ color: cat.color || "#7c3aed" }}
                aria-hidden
              >
                {cat.icon || "📚"}
              </span>
              <span className="text-body-sm font-semibold text-gray-900 group-hover:text-primary-600">
                {cat.name}
              </span>
              <span className="mt-0.5 text-[11px] text-gray-500">
                {(cat.storyCount ?? cat._count?.stories ?? 0).toLocaleString("vi-VN")} truyện
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center sm:hidden">
          <Link
            href="/the-loai"
            className="inline-block text-body-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            Xem tất cả thể loại →
          </Link>
        </div>
      </div>
    </section>
  );
}
