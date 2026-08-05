"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { API_BASE_URL } from "@/lib/api";
import {
  BookOpenIcon,
  HeartIcon,
  FireIcon,
  SparklesIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface CategoryStats {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  storyCount: number;
  originalCount: number;
  translatedCount: number;
  totalViews: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories/overview`)
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getColorClasses = (color: string | null) => {
    switch (color) {
      case "red":
        return "from-red-500 to-rose-600";
      case "blue":
        return "from-blue-500 to-indigo-600";
      case "green":
        return "from-emerald-500 to-teal-600";
      case "purple":
        return "from-purple-500 to-violet-600";
      case "amber":
        return "from-amber-500 to-orange-600";
      case "pink":
        return "from-pink-500 to-rose-600";
      default:
        return "from-primary-500 to-secondary-600";
    }
  };

  const getIconBg = (color: string | null) => {
    switch (color) {
      case "red":
        return "bg-red-100 text-red-600";
      case "blue":
        return "bg-blue-100 text-blue-600";
      case "green":
        return "bg-emerald-100 text-emerald-600";
      case "purple":
        return "bg-purple-100 text-purple-600";
      case "amber":
        return "bg-amber-100 text-amber-600";
      case "pink":
        return "bg-pink-100 text-pink-600";
      default:
        return "bg-primary-100 text-primary-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="section-container py-8">
          <div className="mb-8">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white py-8">
        <div className="section-container">
          <h1 className="text-heading-lg font-bold text-gray-900">Thể loại truyện</h1>
          <p className="mt-2 text-body-md text-gray-600">
            Khám phá truyện theo thể loại yêu thích của bạn
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="section-container py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/the-loai/${category.slug}`}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
                {/* Gradient Header */}
                <div
                  className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${getColorClasses(
                    category.color
                  )} opacity-10`}
                />

                {/* Icon */}
                <div
                  className={`relative inline-flex h-14 w-14 items-center justify-center rounded-xl ${getIconBg(
                    category.color
                  )} shadow-sm`}
                >
                  {category.icon ? (
                    <span className="text-2xl">{category.icon}</span>
                  ) : (
                    <BookOpenIcon className="h-7 w-7" />
                  )}
                </div>

                {/* Title */}
                <h3 className="mt-4 text-heading-sm font-bold text-gray-900 transition-colors group-hover:text-primary-600">
                  {category.name}
                </h3>

                {/* Description */}
                {category.description && (
                  <p className="mt-1 line-clamp-2 text-caption text-gray-500">
                    {category.description}
                  </p>
                )}

                {/* Stats */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-caption text-gray-500">
                      <BookOpenIcon className="h-4 w-4" />
                      {category.storyCount.toLocaleString()}
                    </span>
                    {category.totalViews > 0 && (
                      <span className="inline-flex items-center gap-1 text-caption text-gray-500">
                        <EyeIcon className="h-4 w-4" />
                        {(category.totalViews / 1000).toFixed(0)}K
                      </span>
                    )}
                  </div>
                </div>

                {/* Type breakdown */}
                <div className="mt-3 flex gap-2">
                  {category.originalCount > 0 && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                      Sáng tác {category.originalCount}
                    </span>
                  )}
                  {category.translatedCount > 0 && (
                    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-600">
                      Dịch {category.translatedCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-12">
          <h2 className="text-heading-md font-bold text-gray-900">Khám phá nhanh</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {categories.slice(0, 12).map((cat) => (
              <Link
                key={cat.id}
                href={`/the-loai/${cat.slug}`}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-body-sm font-medium text-gray-700 transition-all hover:border-primary-300 hover:text-primary-700 hover:shadow-sm"
              >
                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
