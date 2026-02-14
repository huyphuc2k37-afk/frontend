"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "@/components/AdminLayout";
import {
  MegaphoneIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { API_BASE_URL } from "@/lib/api";

interface Announcement {
  id: string;
  message: string;
  isActive: boolean;
  createdAt: string;
  createdByUser: { id: string; name: string };
}

export default function AdminAnnouncementsPage() {
  const { token } = useAdmin();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/announcements/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setAnnouncements(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleCreate = async () => {
    if (!token || !newMessage.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Lỗi tạo thông báo");
      } else {
        setNewMessage("");
        fetchAll();
      }
    } catch {
      setError("Lỗi kết nối server");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    if (!token) return;
    await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive: !currentActive }),
    });
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Xóa thông báo này?")) return;
    await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchAll();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MegaphoneIcon className="h-7 w-7 text-primary-500" />
          Thông báo chạy ngang
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Tạo thông báo hiển thị dưới thanh menu, chạy từ trái qua phải cho toàn bộ người dùng.
        </p>
      </div>

      {/* Create new */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Tạo thông báo mới</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập nội dung thông báo (tối đa 500 ký tự)..."
            maxLength={500}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newMessage.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4" />
            {creating ? "Đang tạo..." : "Tạo"}
          </button>
        </div>
        <div className="mt-1 text-xs text-gray-400">{newMessage.length}/500</div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* Preview */}
      {announcements.filter((a) => a.isActive).length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Xem trước</h2>
          <div className="overflow-hidden rounded-lg bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 text-white py-2 px-4">
            <div className="whitespace-nowrap text-sm font-medium animate-marquee-preview">
              {announcements
                .filter((a) => a.isActive)
                .map((a) => a.message)
                .join("  ★  ")}
            </div>
          </div>
          <style jsx>{`
            .animate-marquee-preview {
              display: inline-block;
              animation: marquee-preview 15s linear infinite;
            }
            @keyframes marquee-preview {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
          `}</style>
        </div>
      )}

      {/* List */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Danh sách thông báo ({announcements.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            Chưa có thông báo nào
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {announcements.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-4">
                {/* Status indicator */}
                <div
                  className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                    a.isActive ? "bg-green-500" : "bg-gray-300"
                  }`}
                  title={a.isActive ? "Đang hiện" : "Đã ẩn"}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${a.isActive ? "text-gray-900" : "text-gray-400 line-through"}`}>
                    {a.message}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Bởi {a.createdByUser.name} · {new Date(a.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(a.id, a.isActive)}
                    className={`rounded-lg p-2 text-sm transition-colors ${
                      a.isActive
                        ? "text-green-600 hover:bg-green-50"
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                    title={a.isActive ? "Ẩn thông báo" : "Hiện thông báo"}
                  >
                    {a.isActive ? (
                      <EyeIcon className="h-4 w-4" />
                    ) : (
                      <EyeSlashIcon className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Xóa"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
