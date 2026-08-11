"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home, Users, BookOpen, DollarSign, Banknote,
  Menu, X, LogOut, ChevronLeft, ShieldCheck, Megaphone,
  Bell, MessageSquare, ShieldAlert, BarChart3, ChevronLeft as BackIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { API_BASE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./ui/ThemeSwitcher";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { useUIStore } from "@/stores/uiStore";

interface AdminContextType {
  token: string | null;
}

const AdminContext = createContext<AdminContextType>({ token: null });
export const useAdmin = () => useContext(AdminContext);

const sidebarItems = [
  { id: "dashboard", label: "Tổng quan", href: "/admin", icon: Home },
  { id: "revenue", label: "Doanh thu", href: "/admin/revenue", icon: BarChart3 },
  { id: "users", label: "Người dùng", href: "/admin/users", icon: Users },
  { id: "stories", label: "Truyện", href: "/admin/stories", icon: BookOpen },
  { id: "deposits", label: "Nạp xu", href: "/admin/deposits", icon: DollarSign },
  { id: "withdrawals", label: "Rút tiền", href: "/admin/withdrawals", icon: Banknote },
  { id: "announcements", label: "Thông báo", href: "/admin/announcements", icon: Megaphone },
  { id: "banners", label: "Banner QC", href: "/admin/banners", icon: BarChart3 },
  { id: "notifications", label: "Gửi TB cá nhân", href: "/admin/notifications", icon: Bell },
  { id: "messages", label: "Nhắn tin tác giả", href: "/admin/messages", icon: MessageSquare },
  { id: "banned-ips", label: "Chặn IP spam", href: "/admin/banned-ips", icon: ShieldAlert },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminImage, setAdminImage] = useState<string | null>(null);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed["admin"] ?? false);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

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
          setAdminImage(data.image ?? null);
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-destructive border-t-transparent" />
          <p className="mt-4 text-body-sm text-muted-foreground">Đang tải Admin Panel...</p>
        </div>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const sidebarWidth = sidebarCollapsed ? "lg:w-16" : "lg:w-64";
  const showLabels = !sidebarCollapsed;

  return (
    <AdminContext.Provider value={{ token }}>
      <div className="flex min-h-screen bg-muted">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 transform bg-sidebar text-sidebar-foreground shadow-xl transition-all duration-300 lg:static lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            sidebarWidth
          )}
          style={{ backgroundColor: "#0f0f14" }}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive shadow-md">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                {showLabels && (
                  <div>
                    <span className="text-heading-sm font-bold text-white">VStory</span>
                    <p className="text-[10px] font-medium tracking-wide text-gray-400">ADMIN PANEL</p>
                  </div>
                )}
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 lg:hidden">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Admin info */}
            {showLabels && (
              <div className="mx-4 mt-4 rounded-xl bg-white/5 p-3">
                <div className="flex items-center gap-3">
                  <Avatar src={adminImage} fallback={adminName} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-body-sm font-semibold text-white">{adminName}</p>
                    <p className="text-[10px] text-gray-400">Administrator</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav */}
            <nav className="mt-4 flex-1 space-y-1 px-3">
              {sidebarItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    title={!showLabels ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-2.5 text-body-sm font-medium transition-all",
                      active
                        ? "bg-destructive/15 text-destructive"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", active && "text-destructive")} />
                    {showLabels && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom */}
            <div className="border-t border-white/10 p-3">
              <button
                onClick={() => toggleSidebar("admin")}
                className="hidden w-full items-center gap-3 rounded-xl px-4 py-2 text-body-sm text-gray-400 hover:bg-white/5 hover:text-white lg:flex"
              >
                <ChevronLeft className={cn("h-5 w-5 transition-transform", sidebarCollapsed && "rotate-180")} />
                {showLabels && <span>Thu gọn</span>}
              </button>
              <Link
                href="/"
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-body-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <BackIcon className="h-5 w-5" />
                {showLabels && <span>Về trang chủ</span>}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-body-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-5 w-5" />
                {showLabels && <span>Đăng xuất</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
                aria-label="Mở menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-body-md font-semibold text-foreground">
                {sidebarItems.find((i) => isActive(i.href))?.label || "Admin"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
