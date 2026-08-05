"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { authFetch } from "@/lib/api";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import HeaderSearch from "@/components/header/HeaderSearch";
import HeaderActions from "@/components/header/HeaderActions";
import MobileNav from "@/components/header/MobileNav";

const navLinks = [
  { label: "Trang chủ", href: "/" },
  { label: "Khám phá", href: "/explore" },
  { label: "Thể loại", href: "/the-loai" },
  { label: "Truyện dịch", href: "/truyen-dich" },
  { label: "Bảng xếp hạng", href: "/ranking" },
  { label: "Tác giả", href: "/author" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;
  const pathname = usePathname();

  // Throttled scroll handler — 1 setState per animation frame max.
  useEffect(() => {
    let raf = 0;
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(() => {
        queued = false;
        setScrolled(window.scrollY > 10);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Close menus on route change.
  useEffect(() => {
    setIsOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  const isActive = useCallback(
    (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname.startsWith(href);
    },
    [pathname]
  );

  // Unread messages badge — poll every 3 minutes.
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  useEffect(() => {
    if (!token) {
      setUnreadMsgCount(0);
      return;
    }
    let cancelled = false;
    const fetchUnread = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await authFetch("/api/messages/unread-count", token);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setUnreadMsgCount(typeof data.unread === "number" ? data.unread : 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 180_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchUnread();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [token]);

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-200 ${
          scrolled ? "border-[#c9a84c] bg-[#fdf9f0]/95 shadow-sm backdrop-blur-md" : "border-[#f0e6d0] bg-[#fdf9f0]"
        }`}
      >
        <div className="section-container">
          <div className="flex h-14 items-center justify-between gap-4 sm:h-16">
            <Link href="/" className="flex flex-shrink-0 items-center">
              <span className="text-heading-md font-bold text-gradient">VStory</span>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-body-sm font-medium transition-colors ${
                    isActive(link.href) ? "text-primary-600" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <HeaderSearch token={token} variant="desktop" />

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
                aria-label="Tìm kiếm"
                aria-expanded={mobileSearchOpen}
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              <HeaderActions unreadMsgCount={unreadMsgCount} />

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-lg p-2 text-gray-600 md:hidden"
                aria-label={isOpen ? "Đóng menu" : "Mở menu"}
                aria-expanded={isOpen}
              >
                {isOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileSearchOpen && (
            <div className="overflow-hidden lg:hidden animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="pb-3">
                <HeaderSearch token={token} variant="mobile" />
              </div>
            </div>
          )}
        </div>

        <MobileNav
          isOpen={isOpen}
          navLinks={navLinks}
          isActive={isActive}
          onClose={() => setIsOpen(false)}
        />
      </header>

      <div className="h-14 sm:h-16" />
      <AnnouncementBanner />
    </>
  );
}
