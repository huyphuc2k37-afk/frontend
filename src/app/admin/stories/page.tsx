"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "@/components/AdminLayout";
import { API_BASE_URL } from "@/lib/api";
import {
  MagnifyingGlassIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

interface AdminChapter {
  id: string;
  title: string;
  number: number;
  wordCount: number;
  isLocked: boolean;
  price: number;
  createdAt: string;
}

export default function AdminStoriesPage() {
  const { token } = useAdmin();
  const [stories, setStories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);
  const [chapters, setChapters] = useState<AdminChapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);

  const fetchStories = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`${API_BASE_URL}/api/admin/stories?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStories(data.stories);
        setTotal(data.total);
      }
    } catch {}
    setLoading(false);
  }, [token, page, search]);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const deleteStory = async (id: string, title: string) => {
    if (!token) return;
    if (!confirm(`Xóa truyện "${title}"? Toàn bộ chương sẽ bị xóa theo. Hành động này không thể hoàn tác.`)) return;
    await fetch(`${API_BASE_URL}/api/admin/stories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (expandedStoryId === id) {
      setExpandedStoryId(null);
      setChapters([]);
    }
    fetchStories();
  };

  const toggleChapters = async (storyId: string) => {
    if (expandedStoryId === storyId) {
      setExpandedStoryId(null);
      setChapters([]);
      return;
    }
    setExpandedStoryId(storyId);
    setLoadingChapters(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/stories/${storyId}/chapters`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setChapters(await res.json());
      }
    } catch {}
    setLoadingChapters(false);
  };

  const deleteChapter = async (chapterId: string, title: string) => {
    if (!token) return;
    if (!confirm(`Xóa chương "${title}"? Hành động này không thể hoàn tác.`)) return;
    await fetch(`${API_BASE_URL}/api/admin/chapters/${chapterId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setChapters((prev) => prev.filter((c) => c.id !== chapterId));
    // Update chapter count in story list
    setStories((prev) =>
      prev.map((s) =>
        s.id === expandedStoryId
          ? { ...s, _count: { ...s._count, chapters: (s._count?.chapters || 1) - 1 } }
          : s
      )
    );
  };

  const statusColors: Record<string, string> = {
    ongoing: "bg-blue-100 text-blue-700",
    completed: "bg-emerald-100 text-emerald-700",
    paused: "bg-amber-100 text-amber-700",
  };

  const statusLabels: Record<string, string> = {
    ongoing: "Đang viết",
    completed: "Hoàn thành",
    paused: "Tạm ngưng",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-heading-md font-bold text-gray-900">Quản lý truyện</h2>

      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text" placeholder="Tìm theo tên truyện hoặc tác giả..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-4 text-body-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
        />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-caption font-semibold text-gray-500">Truyện</th>
                  <th className="px-4 py-3 text-left text-caption font-semibold text-gray-500">Tác giả</th>
                  <th className="px-4 py-3 text-center text-caption font-semibold text-gray-500">Thể loại</th>
                  <th className="px-4 py-3 text-center text-caption font-semibold text-gray-500">Chương</th>
                  <th className="px-4 py-3 text-center text-caption font-semibold text-gray-500">Lượt xem</th>
                  <th className="px-4 py-3 text-center text-caption font-semibold text-gray-500">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-caption font-semibold text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stories.map((s) => (
                  <>
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-body-sm font-medium text-gray-900 max-w-[200px] truncate">{s.title}</td>
                      <td className="px-4 py-3 text-body-sm text-gray-500">{s.author?.name}</td>
                      <td className="px-4 py-3 text-body-sm text-center text-gray-600">{s.genre}</td>
                      <td className="px-4 py-3 text-body-sm text-center text-gray-600">
                        <button
                          onClick={() => toggleChapters(s.id)}
                          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {s._count?.chapters || 0}
                          {expandedStoryId === s.id ? (
                            <ChevronUpIcon className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDownIcon className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-body-sm text-center text-gray-600">{s.views?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusColors[s.status] || "bg-gray-100 text-gray-600"}`}>
                          {statusLabels[s.status] || s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => deleteStory(s.id, s.title)}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                          title="Xóa truyện"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    {expandedStoryId === s.id && (
                      <tr key={`${s.id}-chapters`}>
                        <td colSpan={7} className="bg-gray-50/50 px-4 py-0">
                          {loadingChapters ? (
                            <div className="flex items-center justify-center py-6">
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                            </div>
                          ) : chapters.length === 0 ? (
                            <p className="py-4 text-center text-caption text-gray-400">Truyện chưa có chương nào</p>
                          ) : (
                            <div className="py-2">
                              <table className="w-full">
                                <thead>
                                  <tr className="text-[11px] font-semibold text-gray-400 uppercase">
                                    <th className="px-3 py-2 text-left">STT</th>
                                    <th className="px-3 py-2 text-left">Tên chương</th>
                                    <th className="px-3 py-2 text-center">Số chữ</th>
                                    <th className="px-3 py-2 text-center">Khóa</th>
                                    <th className="px-3 py-2 text-center">Ngày tạo</th>
                                    <th className="px-3 py-2 text-center">Xóa</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {chapters.map((ch) => (
                                    <tr key={ch.id} className="hover:bg-white">
                                      <td className="px-3 py-2 text-caption text-gray-500">{ch.number}</td>
                                      <td className="px-3 py-2 text-body-sm text-gray-700">{ch.title}</td>
                                      <td className="px-3 py-2 text-caption text-center text-gray-500">{ch.wordCount?.toLocaleString() || 0}</td>
                                      <td className="px-3 py-2 text-center">
                                        {ch.isLocked ? (
                                          <span className="inline-flex items-center gap-0.5 text-amber-500 text-caption">
                                            <LockClosedIcon className="h-3 w-3" /> {ch.price} xu
                                          </span>
                                        ) : (
                                          <span className="text-caption text-gray-400">Miễn phí</span>
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-caption text-center text-gray-400">
                                        {new Date(ch.createdAt).toLocaleDateString("vi-VN")}
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <button
                                          onClick={() => deleteChapter(ch.id, ch.title)}
                                          className="rounded-lg p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                                          title="Xóa chương"
                                        >
                                          <TrashIcon className="h-3.5 w-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-caption text-gray-500">Tổng: {total} truyện</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-caption font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">Trước</button>
            <span className="flex items-center px-3 text-caption text-gray-500">Trang {page}</span>
            <button disabled={stories.length < 20} onClick={() => setPage(page + 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-caption font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">Sau</button>
          </div>
        </div>
      )}
    </div>
  );
}
