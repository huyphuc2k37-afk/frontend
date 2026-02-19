"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  HeartIcon,
  DocumentTextIcon,
  BookmarkIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  PencilSquareIcon,
  TrashIcon,
  SparklesIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useStudio } from "@/components/StudioLayout";
import { API_BASE_URL } from "@/lib/api";

interface UserStory {
  id: string;
  title: string;
  slug: string;
  genre: string;
  views: number;
  likes: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: { chapters: number; bookmarks: number; comments: number };
}

type FilterStatus = "all" | "ongoing" | "completed" | "paused";

export default function StoriesPage() {
  const { token } = useStudio();
  const [stories, setStories] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStories = useCallback(() => {
    fetch(`${API_BASE_URL}/api/manage/stories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.stories) setStories(data.stories);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchStories();
  }, [token, fetchStories]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await fetch(`${API_BASE_URL}/api/manage/stories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setStories((prev) => prev.filter((s) => s.id !== id));
      setDeleteId(null);
    } catch {
      alert("Không thể xóa truyện");
    }
    setDeleting(false);
  };

  const filtered = stories
    .filter((s) => {
      if (filter !== "all" && s.status !== filter) return false;
      if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    all: "Tất cả",
    ongoing: "Đang viết",
    completed: "Hoàn thành",
    paused: "Tạm ngưng",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-heading-md font-bold text-gray-900">
            Tác phẩm của tôi
          </h2>
          <p className="mt-1 text-body-sm text-gray-500">
            {stories.length} tác phẩm · {stories.reduce((s, st) => s + (st._count?.chapters || 0), 0)} chương
          </p>
        </div>
        <Link
          href="/write/new"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-primary-500 px-5 py-2.5 text-body-sm font-semibold text-white shadow-md hover:bg-primary-600"
        >
          <PlusIcon className="h-4 w-4" />
          Tạo truyện mới
        </Link>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm truyện theo tên..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-body-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "ongoing", "completed", "paused"] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-2 text-caption font-medium transition-all ${
                filter === f
                  ? "bg-primary-500 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {statusLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Stories */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
          <SparklesIcon className="mx-auto h-14 w-14 text-gray-200" />
          <h3 className="mt-3 text-body-md font-semibold text-gray-500">
            {search || filter !== "all" ? "Không tìm thấy tác phẩm" : "Chưa có tác phẩm nào"}
          </h3>
          <p className="mt-1 text-body-sm text-gray-400">
            {search || filter !== "all"
              ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
              : "Bắt đầu hành trình tác giả bằng tác phẩm đầu tiên!"}
          </p>
          {!search && filter === "all" && (
            <Link
              href="/write/new"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 text-body-sm font-semibold text-white shadow-md hover:bg-primary-600"
            >
              <PlusIcon className="h-4 w-4" />
              Tạo truyện đầu tiên
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/write/${story.id}`}
                      className="text-body-lg font-semibold text-gray-900 hover:text-primary-600"
                    >
                      {story.title}
                    </Link>
                    {story.genre?.split(",").map((g) => g.trim()).filter(Boolean).map((g) => (
                      <span key={g} className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">{g}</span>
                    ))}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        story.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : story.status === "paused"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {story.status === "completed" ? "Hoàn thành" : story.status === "paused" ? "Tạm ngưng" : "Đang viết"}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-caption text-gray-500">
                    <span className="flex items-center gap-1">
                      <DocumentTextIcon className="h-3.5 w-3.5" />
                      {story._count?.chapters || 0} chương
                    </span>
                    <span className="flex items-center gap-1">
                      <EyeIcon className="h-3.5 w-3.5" />
                      {story.views.toLocaleString()} lượt đọc
                    </span>
                    <span className="flex items-center gap-1">
                      <HeartIcon className="h-3.5 w-3.5" />
                      {story.likes.toLocaleString()} thích
                    </span>
                    <span className="flex items-center gap-1">
                      <BookmarkIcon className="h-3.5 w-3.5" />
                      {story._count?.bookmarks || 0} lưu
                    </span>
                    <span className="flex items-center gap-1">
                      <ChatBubbleLeftIcon className="h-3.5 w-3.5" />
                      {story._count?.comments || 0} bình luận
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {new Date(story.updatedAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-1">
                  <Link
                    href={`/write/${story.id}`}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                    title="Chỉnh sửa"
                  >
                    <PencilSquareIcon className="h-4.5 w-4.5" />
                  </Link>
                  <button
                    onClick={() => setDeleteId(story.id)}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    title="Xóa"
                  >
                    <TrashIcon className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            >
              <h3 className="text-body-lg font-bold text-gray-900">
                Xác nhận xóa truyện
              </h3>
              <p className="mt-2 text-body-sm text-gray-500">
                Bạn có chắc muốn xóa truyện này? Tất cả các chương cũng sẽ bị xóa. Hành động này không thể hoàn tác.
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-body-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {deleting ? "Đang xóa..." : "Xóa truyện"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
