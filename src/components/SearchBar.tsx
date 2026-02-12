"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import type { Story } from "@/types";

interface SearchBarProps {
  stories: Story[];
  /** Controlled status filter (from parent) */
  activeStatus?: string;
  onStatusChange?: (status: string) => void;
}

const filterChips = {
  status: [
    { value: "all", label: "Tất cả" },
    { value: "ongoing", label: "Đang ra" },
    { value: "completed", label: "Hoàn thành" },
  ],
};

export default function SearchBar({
  stories,
  activeStatus,
  onStatusChange,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [internalStatus, setInternalStatus] = useState("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const statusFilter = activeStatus ?? internalStatus;
  const setStatusFilter = onStatusChange ?? setInternalStatus;

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return stories
      .filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.author.toLowerCase().includes(q) ||
          s.genre.toLowerCase().includes(q),
      )
      .slice(0, 5);
  }, [query, stories]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <section id="explore" className="scroll-mt-24 py-8 sm:py-12" aria-label="Tìm kiếm">
      <div className="section-container">
        <div className="mx-auto max-w-2xl" ref={containerRef}>
          {/* Search input */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Tìm truyện, tác giả, thể loại..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-12 text-body-md shadow-card transition-all focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
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
                        <Image
                          src={s.coverUrl}
                          alt=""
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-body-sm font-medium text-gray-900">
                          {s.title}
                        </div>
                        <div className="text-caption text-gray-500">
                          {s.author} &middot; {s.genre}
                        </div>
                      </div>
                      {s.isPaid && (
                        <span className="flex-shrink-0 rounded-full bg-primary-100 px-2 py-0.5 text-caption font-medium text-primary-700">
                          {s.priceCoins}₫
                        </span>
                      )}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Filter chips */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-body-sm font-medium text-gray-500">
              Trạng thái:
            </span>
            {filterChips.status.map((c) => (
              <button
                key={c.value}
                onClick={() => setStatusFilter(c.value)}
                className={`rounded-full px-4 py-1.5 text-body-sm font-medium transition-all ${
                  statusFilter === c.value
                    ? "bg-accent-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                aria-pressed={statusFilter === c.value}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
