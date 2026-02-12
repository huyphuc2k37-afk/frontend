"use client";

import { useEffect, useState } from "react";
import { useStudio } from "@/components/StudioLayout";
import { authFetch } from "@/lib/api";
import {
  BellIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
} from "@heroicons/react/24/outline";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { token } = useStudio();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (!token) return;
    authFetch("/api/notifications?limit=50", token)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      const res = await authFetch(`/api/notifications/${id}/read`, token, { method: "PUT" });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch {}
  };

  const markAllAsRead = async () => {
    if (!token) return;
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.all(
      unread.map((n) =>
        authFetch(`/api/notifications/${n.id}/read`, token, { method: "PUT" }).catch(() => {})
      )
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filtered = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const typeLabel = (type: string) => {
    switch (type) {
      case "wallet": return { text: "Ví xu", color: "bg-amber-100 text-amber-700" };
      case "admin": return { text: "Hệ thống", color: "bg-blue-100 text-blue-700" };
      default: return { text: "Thông báo", color: "bg-gray-100 text-gray-600" };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-md font-bold text-gray-900">Thông báo</h1>
          <p className="mt-1 text-body-sm text-gray-500">
            {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : "Không có thông báo chưa đọc"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-md px-3 py-1.5 text-caption font-medium transition-colors ${
                filter === "all" ? "bg-primary-50 text-primary-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`rounded-md px-3 py-1.5 text-caption font-medium transition-colors ${
                filter === "unread" ? "bg-primary-50 text-primary-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-caption font-medium text-gray-600 hover:bg-gray-50"
            >
              <CheckCircleIcon className="h-4 w-4" />
              Đọc tất cả
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="mt-6 space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
            <BellIcon className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 text-body-md font-medium text-gray-500">
              {filter === "unread" ? "Không có thông báo chưa đọc" : "Chưa có thông báo nào"}
            </p>
            <p className="mt-1 text-caption text-gray-400">
              Thông báo sẽ xuất hiện khi có người mua chương, bình luận, hay tặng xu.
            </p>
          </div>
        ) : (
          filtered.map((n) => {
            const badge = typeLabel(n.type);
            return (
              <div
                key={n.id}
                className={`group rounded-xl border bg-white p-4 shadow-sm transition-colors ${
                  !n.isRead
                    ? "border-primary-200 bg-primary-50/30"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {n.isRead ? (
                      <EnvelopeOpenIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EnvelopeIcon className="h-5 w-5 text-primary-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-body-sm font-semibold ${!n.isRead ? "text-gray-900" : "text-gray-700"}`}>
                        {n.title}
                      </h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.color}`}>
                        {badge.text}
                      </span>
                    </div>
                    <p className="mt-1 text-body-sm text-gray-600 leading-relaxed">{n.message}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-caption text-gray-400">
                        {new Date(n.createdAt).toLocaleDateString("vi-VN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {!n.isRead && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="text-caption font-medium text-primary-600 hover:text-primary-700"
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
