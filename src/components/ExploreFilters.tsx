"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import type { Story } from "@/types";
import type { GenreGroup } from "@/data/genres";

interface ExploreFiltersProps {
  stories: Story[];
  genreGroups: GenreGroup[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  activeStatus: string;
  onStatusChange: (status: string) => void;
}

const statusOptions = [
  { value: "all", label: "Tất cả" },
  { value: "ongoing", label: "Đang ra" },
  { value: "completed", label: "Hoàn thành" },
];

export default function ExploreFilters({
  stories,
  genreGroups,
  activeCategory,
  onCategoryChange,
  activeStatus,
  onStatusChange,
}: ExploreFiltersProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return stories
      .filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.author?.name || "").toLowerCase().includes(q) ||
          s.genre.toLowerCase().includes(q),
      )
      .slice(0, 5);
  }, [query, stories]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const activeFiltersCount =
    (activeCategory ? 1 : 0) + (activeStatus !== "all" ? 1 : 0);

  return (
    <section className="py-6 sm:py-8" aria-label="Bộ lọc">
      <div className="section-container">
        <div className="mx-auto max-w-3xl" ref={containerRef}>
          {/* Search input row */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                placeholder="Tìm truyện, tác giả, thể loại..."
                className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-12 text-body-md shadow-card transition-all focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
                aria-label="Tìm kiếm truyện"
                aria-autocomplete="list"
                role="combobox"
                aria-controls="search-listbox"
                aria-expanded={isFocused && suggestions.length > 0}
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Xóa tìm kiếm"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}

              {/* Autocomplete dropdown */}
              <AnimatePresence>
                {isFocused && suggestions.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                    id="search-listbox"
                    role="listbox"
                  >
                    {suggestions.map((s) => (
                      <li
                        key={s.id}
                        className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-primary-50"
                        role="option"
                        aria-selected={false}
                        onClick={() => {
                          setQuery(s.title);
                          setIsFocused(false);
                        }}
                      >
                        <div className="relative h-10 w-8 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                          {s.coverImage && (
                          <Image
                            src={s.coverImage}
                            alt=""
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-body-sm font-medium text-gray-900">
                            {s.title}
                          </div>
                          <div className="text-caption text-gray-500">
                            {s.author?.name} &middot; {s.genre}
                          </div>
                        </div>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Filter toggle button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative flex items-center gap-2 rounded-2xl border px-4 py-3.5 text-body-sm font-medium transition-all ${
                showFilters || activeFiltersCount > 0
                  ? "border-primary-300 bg-primary-50 text-primary-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
              aria-label="Bộ lọc"
              aria-expanded={showFilters}
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Bộ lọc</span>
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[11px] font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-card sm:p-5">
                  {/* Thể loại */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-body-sm font-semibold text-gray-700">
                        Thể loại
                      </span>
                      {activeCategory && (
                        <button
                          onClick={() => onCategoryChange(null)}
                          className="text-caption font-medium text-primary-600 hover:text-primary-700"
                        >
                          Xóa bộ lọc
                        </button>
                      )}
                    </div>
                    <div className="max-h-[340px] space-y-3 overflow-y-auto pr-1">
                      {genreGroups.map((group) => (
                        <div key={group.label}>
                          <p className="mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            {group.label}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {group.genres.map((g) => (
                              <button
                                key={g}
                                onClick={() =>
                                  onCategoryChange(
                                    activeCategory === g ? null : g,
                                  )
                                }
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                                  activeCategory === g
                                    ? "bg-primary-600 text-white shadow-md"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                                aria-pressed={activeCategory === g}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-4 border-t border-gray-100" />

                  {/* Trạng thái */}
                  <div>
                    <span className="mb-3 block text-body-sm font-semibold text-gray-700">
                      Trạng thái
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => onStatusChange(opt.value)}
                          className={`rounded-full px-3.5 py-1.5 text-body-sm font-medium transition-all ${
                            activeStatus === opt.value
                              ? "bg-accent-600 text-white shadow-md"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                          aria-pressed={activeStatus === opt.value}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear all */}
                  {activeFiltersCount > 0 && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <button
                        onClick={() => {
                          onCategoryChange(null);
                          onStatusChange("all");
                        }}
                        className="text-body-sm font-medium text-red-500 hover:text-red-600"
                      >
                        Xóa tất cả bộ lọc
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active filter summary (when filters panel is closed) */}
          {!showFilters && activeFiltersCount > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-caption text-gray-400">Đang lọc:</span>
              {activeCategory && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-caption font-medium text-primary-700">
                  {activeCategory}
                  <button
                    onClick={() => onCategoryChange(null)}
                    className="ml-0.5 hover:text-primary-900"
                    aria-label={`Xóa lọc ${activeCategory}`}
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
              {activeStatus !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-3 py-1 text-caption font-medium text-accent-700">
                  {statusOptions.find((o) => o.value === activeStatus)?.label}
                  <button
                    onClick={() => onStatusChange("all")}
                    className="ml-0.5 hover:text-accent-900"
                    aria-label="Xóa lọc trạng thái"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
