"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  BookOpenIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  BellIcon,
  PencilSquareIcon,
  ClockIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { authFetch } from "@/lib/api";

const navLinks = [
  { label: "Trang chủ", href: "/" },
  { label: "Khám phá", href: "/explore" },
  { label: "Bảng xếp hạng", href: "/ranking" },
  { label: "Tác giả", href: "/author" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [coinBalance, setCoinBalance] = useState<number | null>(null);
  const { data: session } = useSession();
  const { profile } = useUserProfile();
  const token = (session as any)?.accessToken as string | undefined;
  const isAuthor = profile?.role === "author";
  const isAdmin = profile?.role === "admin";
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  // Fetch coin balance
  useEffect(() => {
    if (!token) { setCoinBalance(null); return; }
    const fetchBalance = async () => {
      try {
        const res = await authFetch("/api/wallet", token);
        const data = await res.json();
        if (res.ok) setCoinBalance(data.coinBalance ?? data.balance ?? 0);
      } catch { /* ignore */ }
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 60000);
    return () => clearInterval(interval);
  }, [token]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  const fetchNotifications = async () => {
    if (!token) return;
    setNotificationsLoading(true);
    try {
      const res = await authFetch("/api/notifications?limit=10", token);
      const data = await res.json();
      if (res.ok) {
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
      }
    } catch {
      // ignore
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    if (!token) return;
    try {
      await authFetch(`/api/notifications/${id}/read`, token, { method: "PUT" });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch {
      // ignore
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-200 ${
          scrolled
            ? "border-[#f0e6d0] bg-[#fdf9f0]/95 shadow-sm backdrop-blur-md"
            : "border-transparent bg-[#fdf9f0]"
        }`}
      >
        <div className="section-container">
          <div className="flex h-14 items-center justify-between gap-4 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex flex-shrink-0 items-center">
              <span className="text-heading-md font-bold text-gradient">VStory</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-body-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-primary-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop search bar */}
            <div className="hidden flex-1 max-w-md lg:block">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm truyện, tác giả..."
                  className="w-full rounded-full border border-[#f0e6d0] bg-white/40 py-2 pl-10 pr-4 text-body-sm text-gray-900 placeholder-gray-500 transition-colors focus:border-primary-400 focus:bg-white/70 focus:outline-none focus:ring-1 focus:ring-primary-200"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      window.location.href = `/explore?q=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                />
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
                aria-label="Tìm kiếm"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              {session?.user ? (
                <>
                  {/* Notification bell */}
                  <div className="relative" ref={notificationsRef}>
                    <button
                      onClick={async () => {
                        const next = !notificationsOpen;
                        setNotificationsOpen(next);
                        if (next) await fetchNotifications();
                      }}
                      className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                      aria-label="Thông báo"
                    >
                      <BellIcon className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                      )}
                    </button>

                    <AnimatePresence>
                      {notificationsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.97 }}
                          transition={{ duration: 0.12 }}
                          className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                        >
                          <div className="border-b border-gray-100 px-4 py-3">
                            <p className="text-body-sm font-semibold text-gray-900">Thông báo</p>
                            <p className="mt-0.5 text-caption text-gray-500">
                              {unreadCount > 0 ? `${unreadCount} chưa đọc` : "Không có thông báo mới"}
                            </p>
                          </div>
                          <div className="max-h-80 overflow-auto py-1">
                            {notificationsLoading ? (
                              <div className="px-4 py-3 text-body-sm text-gray-500">Đang tải...</div>
                            ) : notifications.length === 0 ? (
                              <div className="px-4 py-3 text-body-sm text-gray-500">Chưa có thông báo nào.</div>
                            ) : (
                              notifications.map((n) => {
                                const content = (
                                  <div
                                    className={
                                      "block px-4 py-3 text-left hover:bg-gray-50 " +
                                      (n.isRead ? "" : "bg-amber-50/40")
                                    }
                                  >
                                    <p className="text-body-sm font-semibold text-gray-900">{n.title}</p>
                                    <p className="mt-0.5 line-clamp-2 text-caption text-gray-600">{n.message}</p>
                                    <p className="mt-1 text-[11px] text-gray-400">
                                      {n.createdAt ? new Date(n.createdAt).toLocaleString("vi-VN") : ""}
                                    </p>
                                  </div>
                                );

                                if (n.link) {
                                  return (
                                    <Link
                                      key={n.id}
                                      href={n.link}
                                      onClick={() => {
                                        setNotificationsOpen(false);
                                        if (!n.isRead) markNotificationRead(n.id);
                                      }}
                                    >
                                      {content}
                                    </Link>
                                  );
                                }

                                return (
                                  <button
                                    key={n.id}
                                    className="w-full text-left"
                                    onClick={() => {
                                      if (!n.isRead) markNotificationRead(n.id);
                                      setNotificationsOpen(false);
                                    }}
                                  >
                                    {content}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Coin balance + CTA buttons */}
                  {!isAdmin && (
                    <Link
                      href="/wallet"
                      className="hidden items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-body-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-600 hover:shadow-md sm:inline-flex"
                    >
                      <CurrencyDollarIcon className="h-4 w-4" />
                      {coinBalance !== null
                        ? `${coinBalance.toLocaleString("vi-VN")} xu`
                        : "Nạp xu"}
                    </Link>
                  )}
                  {isAdmin ? (
                    <Link
                      href="/admin"
                      className="hidden items-center gap-1.5 rounded-full bg-red-500 px-4 py-2 text-body-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600 hover:shadow-md sm:inline-flex"
                    >
                      <ShieldCheckIcon className="h-4 w-4" />
                      Admin
                    </Link>
                  ) : isAuthor ? (
                    <Link
                      href="/write"
                      className="hidden items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2 text-body-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-600 hover:shadow-md sm:inline-flex"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                      Studio
                    </Link>
                  ) : null}

                  {/* User avatar dropdown */}
                  <div className="relative hidden md:block" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center rounded-full transition-opacity hover:opacity-80"
                    >
                      {(profile?.image || session.user.image) ? (
                        <Image
                          src={(profile?.image || session.user.image) as string}
                          alt=""
                          width={34}
                          height={34}
                          className="rounded-full ring-2 ring-gray-100"
                          unoptimized
                        />
                      ) : (
                        <UserCircleIcon className="h-9 w-9 text-gray-400" />
                      )}
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.97 }}
                          transition={{ duration: 0.12 }}
                          className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                        >
                          <div className="border-b border-gray-100 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <p className="text-body-sm font-semibold text-gray-900">
                                {session.user.name}
                              </p>
                              {isAuthor && (
                                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
                                  Tác giả
                                </span>
                              )}
                            </div>
                            <p className="truncate text-caption text-gray-500">
                              {session.user.email}
                            </p>
                            {coinBalance !== null && !isAdmin && (
                              <div className="mt-1.5 flex items-center gap-1 text-caption font-medium text-amber-600">
                                <CurrencyDollarIcon className="h-3.5 w-3.5" />
                                {coinBalance.toLocaleString("vi-VN")} xu
                              </div>
                            )}
                          </div>
                          <div className="py-1">
                            <Link
                              href="/profile"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-gray-700 hover:bg-gray-50"
                            >
                              <UserCircleIcon className="h-4 w-4" />
                              Trang cá nhân
                            </Link>
                            <Link
                              href="/bookshelf"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-gray-700 hover:bg-gray-50"
                            >
                              <BookOpenIcon className="h-4 w-4" />
                              Tủ truyện
                            </Link>
                            {isAuthor ? (
                              <Link
                                href="/write"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-gray-700 hover:bg-gray-50"
                              >
                                <PencilSquareIcon className="h-4 w-4" />
                                Studio tác giả
                              </Link>
                            ) : null}
                            {isAdmin && (
                              <Link
                                href="/admin"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-red-600 hover:bg-red-50"
                              >
                                <ShieldCheckIcon className="h-4 w-4" />
                                Quản trị Admin
                              </Link>
                            )}
                            {!isAdmin && (
                              <Link
                                href="/wallet"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-gray-700 hover:bg-gray-50"
                              >
                                <CurrencyDollarIcon className="h-4 w-4" />
                                Nạp xu
                              </Link>
                            )}
                            {!isAuthor && !isAdmin && (
                              <>
                                <Link
                                  href="/history"
                                  onClick={() => setUserMenuOpen(false)}
                                  className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <ClockIcon className="h-4 w-4" />
                                  Lịch sử đọc
                                </Link>
                                <Link
                                  href="/author/register"
                                  onClick={() => setUserMenuOpen(false)}
                                  className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-primary-600 hover:bg-primary-50"
                                >
                                  <PencilSquareIcon className="h-4 w-4" />
                                  Trở thành tác giả
                                </Link>
                              </>
                            )}
                          </div>
                          <div className="border-t border-gray-100 py-1">
                            <button
                              onClick={() => signOut({ callbackUrl: "/" })}
                              className="flex w-full items-center gap-2 px-4 py-2.5 text-body-sm text-red-600 hover:bg-red-50"
                            >
                              <ArrowRightOnRectangleIcon className="h-4 w-4" />
                              Đăng xuất
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden rounded-lg px-3 py-2 text-body-sm font-medium text-gray-600 hover:text-gray-900 md:block"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/explore"
                    className="hidden items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2 text-body-sm font-semibold text-white shadow-sm hover:bg-primary-600 sm:inline-flex"
                  >
                    Bắt đầu đọc
                  </Link>
                </>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-lg p-2 text-gray-600 md:hidden"
                aria-label="Menu"
              >
                {isOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden lg:hidden"
              >
                <div className="pb-3">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm truyện, tác giả..."
                      className="w-full rounded-xl border border-[#f0e6d0] bg-white/40 py-2.5 pl-10 pr-4 text-body-sm focus:border-primary-400 focus:bg-white/70 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && searchQuery.trim()) {
                          window.location.href = `/explore?q=${encodeURIComponent(searchQuery)}`;
                        }
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-[#f0e6d0]/50 md:hidden"
            >
              <nav className="bg-[#fdf9f0] px-4 py-3" aria-label="Mobile navigation">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block rounded-lg px-3 py-2.5 text-body-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "text-primary-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {session?.user ? (
                  <>
                    <div className="my-2 border-t border-gray-100" />
                    <div className="flex items-center gap-3 px-3 py-2">
                      {session.user.image ? (
                        <Image src={session.user.image} alt="" width={32} height={32} className="rounded-full" />
                      ) : (
                        <UserCircleIcon className="h-8 w-8 text-gray-400" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-body-sm font-semibold text-gray-900">
                            {session.user.name}
                          </p>
                          {isAuthor && (
                            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
                              Tác giả
                            </span>
                          )}
                        </div>
                        <p className="truncate text-caption text-gray-500">{session.user.email}</p>
                      </div>
                    </div>
                    {coinBalance !== null && !isAdmin && (
                      <Link
                        href="/wallet"
                        className="mx-3 mb-1 flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2"
                      >
                        <span className="flex items-center gap-1.5 text-body-sm font-medium text-amber-700">
                          <CurrencyDollarIcon className="h-4 w-4" />
                          Số dư
                        </span>
                        <span className="text-body-sm font-bold text-amber-600">
                          {coinBalance.toLocaleString("vi-VN")} xu
                        </span>
                      </Link>
                    )}
                    <Link href="/profile" className="block rounded-lg px-3 py-2.5 text-body-sm font-medium text-gray-700 hover:bg-gray-50">
                      Trang cá nhân
                    </Link>
                    <Link href="/bookshelf" className="block rounded-lg px-3 py-2.5 text-body-sm font-medium text-gray-700 hover:bg-gray-50">
                      Tủ truyện
                    </Link>
                    {isAuthor && (
                      <Link href="/write" className="block rounded-lg px-3 py-2.5 text-body-sm font-medium text-gray-700 hover:bg-gray-50">
                        Studio tác giả
                      </Link>
                    )}
                    {isAdmin && (
                      <Link href="/admin" className="block rounded-lg px-3 py-2.5 text-body-sm font-semibold text-red-600 hover:bg-red-50">
                        Quản trị Admin
                      </Link>
                    )}
                    {!isAdmin && (
                      <Link href="/wallet" className="block rounded-lg px-3 py-2.5 text-body-sm font-medium text-gray-700 hover:bg-gray-50">
                        Nạp xu
                      </Link>
                    )}
                    {!isAuthor && !isAdmin && (
                      <>
                        <Link href="/history" className="block rounded-lg px-3 py-2.5 text-body-sm font-medium text-gray-700 hover:bg-gray-50">
                          Lịch sử đọc
                        </Link>
                        <Link href="/author/register" className="block rounded-lg px-3 py-2.5 text-body-sm font-medium text-primary-600 hover:bg-primary-50">
                          Trở thành tác giả
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="block w-full rounded-lg px-3 py-2.5 text-left text-body-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block rounded-lg px-3 py-2.5 text-body-sm font-medium text-gray-700 hover:bg-gray-50">
                      Đăng nhập
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer so content doesn't go behind fixed header */}
      <div className="h-14 sm:h-16" />
    </>
  );
}
