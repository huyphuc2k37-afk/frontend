"use client";

import { useState, useEffect, useRef, createContext, useContext } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  HomeIcon,
  BookOpenIcon,
  PencilSquareIcon,
  ChartBarIcon,
  UserCircleIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  BellAlertIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import { API_BASE_URL, authFetch } from "@/lib/api";

/* ── Types ── */

interface AuthorProfile {
  name: string;
  email: string;
  image?: string;
  role: string;
}

interface StudioContextType {
  profile: AuthorProfile | null;
  token: string | null;
}

const StudioContext = createContext<StudioContextType>({ profile: null, token: null });
export const useStudio = () => useContext(StudioContext);

/* ── Nav items ── */

const sidebarItems = [
  { id: "dashboard", label: "Văn phòng", href: "/write", icon: HomeIcon },
  { id: "stories", label: "Tác phẩm", href: "/write/stories", icon: BookOpenIcon },
  { id: "new", label: "Viết truyện mới", href: "/write/new", icon: PencilSquareIcon },
  { id: "stats", label: "Thống kê", href: "/write/stats", icon: ChartBarIcon },
  { id: "revenue", label: "Doanh thu", href: "/write/revenue", icon: CurrencyDollarIcon },
  { id: "withdraw", label: "Rút tiền", href: "/write/withdraw", icon: BanknotesIcon },
  { id: "notifications", label: "Thông báo", href: "/write/notifications", icon: BellAlertIcon },
];

const sidebarBottom = [
  { id: "guide", label: "Hướng dẫn viết", href: "/write/guide", icon: DocumentTextIcon },
  { id: "faq", label: "Câu hỏi thường gặp", href: "/write/faq", icon: QuestionMarkCircleIcon },
];

/* ── Component ── */

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<AuthorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const token = (session as any)?.accessToken || null;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/write");
      return;
    }
    if (status === "authenticated" && token) {
      fetch(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.role !== "author") {
            router.push("/author/register");
            return;
          }
          setProfile({ name: data.name, email: data.email, image: data.image, role: data.role });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, token, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Fetch unread count on mount
  useEffect(() => {
    if (!token) return;
    authFetch("/api/notifications?limit=5", token)
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.unreadCount === "number") {
          setUnreadCount(data.unreadCount);
          if (Array.isArray(data.notifications)) setNotifications(data.notifications);
        }
      })
      .catch(() => {});
  }, [token]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await authFetch("/api/notifications?limit=10", token);
      const data = await res.json();
      if (res.ok) {
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
      }
    } catch {}
  };

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      await authFetch(`/api/notifications/${id}/read`, token, { method: "PUT" });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  if (loading || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="mt-4 text-body-sm text-gray-500">Đang tải Studio...</p>
        </div>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === "/write") return pathname === "/write";
    return pathname.startsWith(href);
  };

  return (
    <StudioContext.Provider value={{ profile, token }}>
      <div className="flex min-h-screen bg-gray-100">
        {/* ─── Mobile overlay ─── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ─── Sidebar ─── */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <Link href="/" className="flex items-center">
                <div>
                  <span className="text-heading-sm font-bold text-gradient">VStory</span>
                  <p className="text-[10px] font-medium tracking-wide text-gray-400">AUTHOR STUDIO</p>
                </div>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 lg:hidden">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* User info card */}
            {profile && (
              <div className="mx-4 mt-4 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 p-4">
                <div className="flex items-center gap-3">
                  {profile.image ? (
                    <Image src={profile.image} alt="" width={40} height={40} className="rounded-full ring-2 ring-white" />
                  ) : (
                    <UserCircleIcon className="h-10 w-10 text-primary-400" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-body-sm font-bold text-gray-900">
                      {profile.name}
                    </p>
                    <p className="truncate text-caption text-gray-500">{profile.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav links */}
            <nav className="mt-4 flex-1 space-y-1 px-3">
              {sidebarItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-body-sm font-medium transition-all ${
                      active
                        ? "bg-primary-50 text-primary-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${active ? "text-primary-500" : ""}`} />
                    {item.label}
                    {active && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-primary-500" />
                    )}
                  </Link>
                );
              })}

              <div className="my-4 border-t border-gray-100" />

              {sidebarBottom.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-body-sm font-medium transition-all ${
                      active
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom actions */}
            <div className="border-t border-gray-100 p-3">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-body-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              >
                <ChevronLeftIcon className="h-5 w-5" />
                Về trang chủ
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-body-sm font-medium text-red-500 hover:bg-red-50"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Đăng xuất
              </button>
            </div>
          </div>
        </aside>

        {/* ─── Main area ─── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
              <h1 className="text-body-md font-semibold text-gray-900">
                {sidebarItems.find((i) => isActive(i.href))?.label ||
                  sidebarBottom.find((i) => isActive(i.href))?.label ||
                  "Studio"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setNotifOpen((o) => !o);
                    if (!notifOpen) fetchNotifications();
                  }}
                  className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                >
                  <BellIcon className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-gray-100 bg-white shadow-xl z-50">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                      <h3 className="text-body-sm font-bold text-gray-900">Thông báo</h3>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-caption font-medium text-red-600">
                          {unreadCount} chưa đọc
                        </span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center">
                          <BellIcon className="mx-auto h-8 w-8 text-gray-300" />
                          <p className="mt-2 text-caption text-gray-400">Chưa có thông báo</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (!n.isRead) markAsRead(n.id);
                              if (n.link) router.push(n.link);
                              setNotifOpen(false);
                            }}
                            className={`cursor-pointer border-b border-gray-50 px-4 py-3 transition-colors hover:bg-gray-50 ${
                              !n.isRead ? "bg-primary-50/40" : ""
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {!n.isRead && (
                                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-body-sm font-medium text-gray-900">{n.title}</p>
                                <p className="mt-0.5 text-caption text-gray-500 line-clamp-2">{n.message}</p>
                                <p className="mt-1 text-[11px] text-gray-400">
                                  {new Date(n.createdAt).toLocaleDateString("vi-VN", {
                                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <Link
                      href="/write/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="block border-t border-gray-100 px-4 py-2.5 text-center text-caption font-medium text-primary-600 hover:bg-gray-50"
                    >
                      Xem tất cả thông báo
                    </Link>
                  </div>
                )}
              </div>
              {profile && (
                <div className="ml-1 hidden items-center gap-2 sm:flex">
                  {profile.image ? (
                    <Image src={profile.image} alt="" width={32} height={32} className="rounded-full" />
                  ) : (
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  )}
                  <span className="text-body-sm font-medium text-gray-700">
                    {profile.name}
                  </span>
                </div>
              )}
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </StudioContext.Provider>
  );
}
