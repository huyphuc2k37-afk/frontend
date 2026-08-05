"use client";

import { useState, useEffect, useRef, memo } from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { STORY_ORIGIN_OPTIONS, getStoryOriginLabel } from "@/lib/storyOrigin";

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  storyCount: number;
}

interface ExploreFiltersProps {
  categories: ApiCategory[];
  activeOrigin: string;
  onOriginChange: (origin: string) => void;
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  activeStatus: string;
  onStatusChange: (status: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const statusOptions = [
  { value: "all", label: "Tất cả" },
  { value: "ongoing", label: "Đang ra" },
  { value: "completed", label: "Hoàn thành" },
];

// ── Collapsible section ────────────────────────────────────────────────────────
function FilterSection({
  label,
  defaultOpen = true,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 text-body-sm font-semibold text-gray-800 hover:text-gray-900"
      >
        {label}
        {open ? (
          <ChevronUpIcon className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

// ── Sidebar (desktop) ─────────────────────────────────────────────────────────
export function FilterSidebar({
  categories,
  activeOrigin,
  onOriginChange,
  activeCategory,
  onCategoryChange,
  activeStatus,
  onStatusChange,
  hasActiveFilters,
  onClearAll,
}: ExploreFiltersProps & { hasActiveFilters: boolean; onClearAll: () => void }) {
  return (
    <aside className="w-56 flex-shrink-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-body-md font-bold text-gray-900">Bộ lọc</span>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-caption font-medium text-primary-600 hover:text-primary-700"
          >
            Xóa
          </button>
        )}
      </div>

      <div>
        <FilterSection label="Loại truyện" defaultOpen>
          <div className="flex flex-col gap-1">
            {[{ value: "all", label: "Tất cả" }, ...STORY_ORIGIN_OPTIONS].map((opt) => (
              <button
                key={opt.value}
                onClick={() => onOriginChange(opt.value)}
                className={`rounded-xl px-3 py-2.5 text-left text-body-sm font-medium transition-all ${
                  activeOrigin === opt.value
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection label="Thể loại" defaultOpen>
          <div className="flex flex-col gap-1">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => onCategoryChange(activeCategory === cat.slug ? null : cat.slug)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-body-sm font-medium transition-all ${
                  activeCategory === cat.slug
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{cat.icon}</span>
                <span className="flex-1">{cat.name}</span>
                <span className={`text-caption ${activeCategory === cat.slug ? "text-white/60" : "text-gray-400"}`}>
                  {cat.storyCount}
                </span>
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection label="Trạng thái" defaultOpen>
          <div className="flex flex-col gap-1">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onStatusChange(opt.value)}
                className={`rounded-xl px-3 py-2.5 text-left text-body-sm font-medium transition-all ${
                  activeStatus === opt.value
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}

// ── Mobile: Drawer overlay ──────────────────────────────────────────────────────
export function FilterDrawer({
  categories,
  activeOrigin,
  onOriginChange,
  activeCategory,
  onCategoryChange,
  activeStatus,
  onStatusChange,
  onClearAll,
  hasActiveFilters,
}: ExploreFiltersProps & { onClearAll: () => void; hasActiveFilters: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-body-sm font-medium transition-all ${
          hasActiveFilters
            ? "border-primary-300 bg-primary-50 text-primary-700"
            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
        }`}
        aria-label="Mở bộ lọc"
      >
        <AdjustmentsHorizontalIcon className="h-5 w-5" />
        <span>Bộ lọc</span>
        {hasActiveFilters && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[11px] font-bold text-white">
            {[activeOrigin !== "all", !!activeCategory, activeStatus !== "all"].filter(Boolean).length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 top-0 z-50 w-72 overflow-y-auto bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <span className="text-body-md font-bold text-gray-900">Bộ lọc</span>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Đóng"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="px-5 py-2">
                <FilterSection label="Loại truyện" defaultOpen>
                  <div className="flex flex-col gap-1.5">
                    {[{ value: "all", label: "Tất cả" }, ...STORY_ORIGIN_OPTIONS].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { onOriginChange(opt.value); setOpen(false); }}
                        className={`rounded-xl px-3 py-2.5 text-left text-body-sm font-medium transition-all ${
                          activeOrigin === opt.value
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection label="Thể loại" defaultOpen>
                  <div className="flex flex-col gap-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => { onCategoryChange(activeCategory === cat.slug ? null : cat.slug); setOpen(false); }}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-body-sm font-medium transition-all ${
                          activeCategory === cat.slug
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span className="flex-1">{cat.name}</span>
                        <span className="text-caption text-gray-400">{cat.storyCount}</span>
                      </button>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection label="Trạng thái" defaultOpen>
                  <div className="flex flex-col gap-1.5">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { onStatusChange(opt.value); setOpen(false); }}
                        className={`rounded-xl px-3 py-2.5 text-left text-body-sm font-medium transition-all ${
                          activeStatus === opt.value
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {hasActiveFilters && (
                  <div className="pt-4 pb-2">
                    <button
                      onClick={() => { onClearAll(); setOpen(false); }}
                      className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-body-sm font-medium text-red-500 hover:bg-red-100"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Search bar ─────────────────────────────────────────────────────────────────
function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tìm truyện, tác giả..."
        className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-body-md shadow-card transition-all placeholder:text-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 sm:py-3.5"
      />
      {value && (
        <button
          onClick={() => { onChange(""); inputRef.current?.focus(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Xóa tìm kiếm"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

// ── Active filter chips ─────────────────────────────────────────────────────────
export function ActiveFilterChips({
  activeOrigin,
  activeCategory,
  categories,
  activeStatus,
  onOriginChange,
  onCategoryChange,
  onStatusChange,
}: {
  activeOrigin: string;
  activeCategory: string | null;
  categories: ApiCategory[];
  activeStatus: string;
  onOriginChange: (v: string) => void;
  onCategoryChange: (v: string | null) => void;
  onStatusChange: (v: string) => void;
}) {
  const chips: { label: string; onRemove: () => void }[] = [];
  if (activeOrigin !== "all") chips.push({ label: getStoryOriginLabel(activeOrigin), onRemove: () => onOriginChange("all") });
  if (activeCategory) chips.push({ label: categories.find((c) => c.slug === activeCategory)?.name || activeCategory, onRemove: () => onCategoryChange(null) });
  if (activeStatus !== "all") chips.push({ label: statusOptions.find((o) => o.value === activeStatus)?.label || "", onRemove: () => onStatusChange("all") });

  if (chips.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-caption font-medium text-primary-700"
        >
          {chip.label}
          <button onClick={chip.onRemove} className="hover:text-primary-900" aria-label="Xóa">
            <XMarkIcon className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

// ── Main: search bar + chips (rendered by ExplorePage) ─────────────────────────
function ExploreFiltersInner({
  categories,
  activeOrigin,
  onOriginChange,
  activeCategory,
  onCategoryChange,
  activeStatus,
  onStatusChange,
  searchQuery = "",
  onSearchChange,
}: ExploreFiltersProps) {
  const [query, setQuery] = useState(searchQuery);

  useEffect(() => {
    if (!onSearchChange) return;
    const timer = setTimeout(() => onSearchChange(query), 400);
    return () => clearTimeout(timer);
  }, [query, onSearchChange]);

  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== query) setQuery(searchQuery);
  }, [searchQuery]);

  return (
    <div className="max-w-2xl">
      <SearchInput value={query} onChange={setQuery} />
    </div>
  );
}

export default memo(ExploreFiltersInner);
