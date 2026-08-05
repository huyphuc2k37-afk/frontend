"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { authFetch } from "@/lib/api";

interface Notification {
  id: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;

  useEffect(() => {
    if (!open || !token) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, token]);

  const fetchList = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await authFetch("/api/notifications?limit=10", token);
      const data = await res.json();
      if (res.ok) {
        setList(Array.isArray(data.notifications) ? data.notifications : []);
        setUnread(typeof data.unreadCount === "number" ? data.unreadCount : 0);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    if (!token) return;
    try {
      await authFetch(`/api/notifications/${id}/read`, token, { method: "PUT" });
      setList((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnread((prev) => Math.max(prev - 1, 0));
    } catch {}
  };

  const markAllRead = async () => {
    if (!token) return;
    try {
      await authFetch("/api/notifications/read-all", token, { method: "PUT" });
      setList((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch {}
  };

  if (!session?.user || !token) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={async () => {
          const next = !open;
          setOpen(next);
          if (next) await fetchList();
        }}
        className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100"
        aria-label="Thông báo"
      >
        <BellIcon className="h-5 w-5" />
        {unread > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />}
      </button>

      {open && (
        <div className="fixed inset-x-3 top-16 z-[60] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-1 duration-150 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 sm:z-auto">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <p className="text-body-sm font-semibold text-gray-900">Thông báo</p>
              <p className="mt-0.5 text-caption text-gray-500">
                {unread > 0 ? `${unread} chưa đọc` : "Không có thông báo mới"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="rounded-lg px-2 py-1 text-caption font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  Đọc tất cả
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 sm:hidden"
                aria-label="Đóng"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div
            className="overflow-y-auto overscroll-contain py-1 scrollbar-thin"
            style={{ maxHeight: "min(55vh, 320px)" }}
          >
            {loading ? (
              <div className="px-4 py-3 text-body-sm text-gray-500">Đang tải...</div>
            ) : list.length === 0 ? (
              <div className="px-4 py-3 text-body-sm text-gray-500">Chưa có thông báo nào.</div>
            ) : (
              list.map((n) => {
                const content = (
                  <div className={"block px-4 py-3 text-left hover:bg-gray-50 " + (n.isRead ? "" : "bg-amber-50/40")}>
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
                        setOpen(false);
                        if (!n.isRead) markRead(n.id);
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
                      if (!n.isRead) markRead(n.id);
                      setOpen(false);
                    }}
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
