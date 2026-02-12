"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import { API_BASE_URL } from "@/lib/api";

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
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* ─── Sidebar ─── */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-md">
                  <span className="text-lg font-extrabold text-white">V</span>
                </div>
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
              <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                <BellIcon className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
              </button>
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
