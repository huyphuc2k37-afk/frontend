"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  HomeIcon,
  UsersIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  MegaphoneIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import { API_BASE_URL } from "@/lib/api";

interface AdminContextType {
  token: string | null;
}

const AdminContext = createContext<AdminContextType>({ token: null });
export const useAdmin = () => useContext(AdminContext);

const sidebarItems = [
  { id: "dashboard", label: "Tổng quan", href: "/admin", icon: HomeIcon },
  { id: "users", label: "Người dùng", href: "/admin/users", icon: UsersIcon },
  { id: "stories", label: "Truyện", href: "/admin/stories", icon: BookOpenIcon },
  { id: "deposits", label: "Nạp xu", href: "/admin/deposits", icon: CurrencyDollarIcon },
  { id: "withdrawals", label: "Rút tiền", href: "/admin/withdrawals", icon: BanknotesIcon },
  { id: "announcements", label: "Thông báo", href: "/admin/announcements", icon: MegaphoneIcon },
  { id: "notifications", label: "Gửi TB cá nhân", href: "/admin/notifications", icon: BellAlertIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState("");

  const token = (session as any)?.accessToken || null;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin");
      return;
    }
    if (status === "authenticated" && token) {
      fetch(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.role !== "admin") {
            router.push("/");
            return;
          }
          setAdminName(data.name);
          setLoading(false);
        })
        .catch(() => router.push("/"));
    }
  }, [status, token, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
          <p className="mt-4 text-body-sm text-gray-500">Đang tải Admin Panel...</p>
        </div>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <AdminContext.Provider value={{ token }}>
      <div className="flex min-h-screen bg-gray-100">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gray-900 shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
              <Link href="/admin" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 shadow-md">
                  <ShieldCheckIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-heading-sm font-bold text-white">VStory</span>
                  <p className="text-[10px] font-medium tracking-wide text-gray-400">ADMIN PANEL</p>
                </div>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 lg:hidden">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Admin info */}
            <div className="mx-4 mt-4 rounded-xl bg-gray-800 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
                  <ShieldCheckIcon className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-body-sm font-semibold text-white">{adminName}</p>
                  <p className="text-[10px] text-gray-400">Administrator</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="mt-4 flex-1 space-y-1 px-3">
              {sidebarItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-body-sm font-medium transition-all ${
                      active
                        ? "bg-red-500/10 text-red-400"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${active ? "text-red-400" : ""}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom */}
            <div className="border-t border-gray-800 p-3">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-body-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <ChevronLeftIcon className="h-5 w-5" />
                Về trang chủ
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-body-sm font-medium text-red-400 hover:bg-red-500/10"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Đăng xuất
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
              <h1 className="text-body-md font-semibold text-gray-900">
                {sidebarItems.find((i) => isActive(i.href))?.label || "Admin"}
              </h1>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
