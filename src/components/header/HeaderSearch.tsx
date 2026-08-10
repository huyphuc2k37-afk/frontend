"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { authFetch } from "@/lib/api";

interface SearchHit {
  id: string;
  title: string;
  slug: string;
  coverUrl?: string | null;
  author?: { name: string };
}

interface HeaderSearchProps {
  token?: string;
  variant?: "desktop" | "mobile";
}

export default function HeaderSearch({ token, variant = "desktop" }: HeaderSearchProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isMobile = variant === "mobile";

  useEffect(() => {
    if (searchOpen && searchRef.current && !isMobile) {
      searchRef.current.focus();
    }
  }, [searchOpen, isMobile]);

  // Debounced live search (250ms). Cancels in-flight on each keystroke.
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearching(false);
      setDropdownOpen(false);
      return;
    }
    setSearching(true);
    setDropdownOpen(true);
    const timer = setTimeout(async () => {
      try {
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        const res = await authFetch(
          `/api/stories?search=${encodeURIComponent(q)}&limit=8`,
          token || "",
          { signal: ctrl.signal, timeoutMs: 8000 }
        );
        if (!res.ok) return;
        const data = await res.json();
        setSearchResults(data.stories || []);
      } catch {
        /* aborted or network — ignore */
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [searchQuery, token]);

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submitSearch = useCallback(() => {
    const q = searchQuery.trim();
    if (!q) return;
    setDropdownOpen(false);
    router.push(`/explore?q=${encodeURIComponent(q)}`);
  }, [searchQuery, router]);

  const showDropdown = dropdownOpen && searchQuery.trim().length >= 2;
  const placeholder = "Tìm truyện, tác giả...";
  const inputClass = isMobile
    ? "w-full rounded-xl border border-[#f0e6d0] bg-white/40 py-2.5 pl-10 pr-4 text-body-sm focus:border-primary-400 focus:bg-white/70 focus:outline-none"
    : "w-full rounded-full border border-[#f0e6d0] bg-white/40 py-2 pl-10 pr-4 text-body-sm text-gray-900 placeholder-gray-500 transition-colors focus:border-primary-400 focus:bg-white/70 focus:outline-none focus:ring-1 focus:ring-primary-200";

  return (
    <div className={isMobile ? "relative w-full" : "relative hidden flex-1 max-w-md lg:block"}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={searchRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.trim().length >= 2 && setDropdownOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitSearch();
            if (e.key === "Escape") {
              setSearchQuery("");
              setDropdownOpen(false);
              searchRef.current?.blur();
            }
          }}
          placeholder={placeholder}
          className={inputClass}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="header-search-listbox"
          aria-autocomplete="list"
        />
      </div>
      {showDropdown && (
        <div
          ref={dropdownRef}
          id="header-search-listbox"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl"
        >
          {searching && searchResults.length === 0 && (
            <div className="px-4 py-6 text-center text-caption text-gray-500">Đang tìm...</div>
          )}
          {!searching && searchResults.length === 0 && (
            <div className="px-4 py-6 text-center text-caption text-gray-500">
              Không tìm thấy truyện nào
            </div>
          )}
          {searchResults.map((s) => (
            <Link
              key={s.id}
              href={`/truyen/${s.slug}`}
              onClick={() => setDropdownOpen(false)}
              role="option"
              aria-selected="false"
              className="flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 last:border-b-0 hover:bg-gray-50"
            >
              {s.coverUrl ? (
                <Image
                  src={s.coverUrl}
                  alt=""
                  width={40}
                  height={56}
                  unoptimized
                  className="h-14 w-10 flex-shrink-0 rounded object-cover"
                />
              ) : (
                <div className="h-14 w-10 flex-shrink-0 rounded bg-gray-200" />
              )}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-body-sm font-semibold text-gray-900">{s.title}</p>
                <p className="line-clamp-1 text-caption text-gray-500">{s.author?.name || ""}</p>
              </div>
            </Link>
          ))}
          {searchResults.length > 0 && (
            <button
              onClick={submitSearch}
              className="block w-full border-t border-gray-100 px-4 py-2.5 text-center text-body-sm font-semibold text-primary-600 hover:bg-primary-50"
            >
              Xem tất cả kết quả cho &quot;{searchQuery.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
