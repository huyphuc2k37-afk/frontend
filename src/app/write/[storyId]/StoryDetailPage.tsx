"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  EyeIcon,
  HeartIcon,
  BookmarkIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  LockOpenIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { useStudio } from "@/components/StudioLayout";
import { API_BASE_URL } from "@/lib/api";

interface Chapter {
  id: string;
  title: string;
  number: number;
  wordCount: number;
  isLocked: boolean;
  price: number;
  createdAt: string;
  updatedAt: string;
}

interface StoryDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  genre: string;
  tags: string | null;
  status: string;
  views: number;
  likes: number;
  coverImage: string | null;
  isAdult: boolean;
  createdAt: string;
  updatedAt: string;
  chapters: Chapter[];
  _count: { bookmarks: number; comments: number };
}

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useStudio();
  const storyId = params.storyId as string;

  const [story, setStory] = useState<StoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingInfo, setEditingInfo] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteChapterId, setDeleteChapterId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token || !storyId) return;
    fetchStory();
  }, [token, storyId]);

  const fetchStory = () => {
    fetch(`${API_BASE_URL}/api/manage/stories/${storyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setStory(data);
        setEditTitle(data.title);
        setEditDesc(data.description);
        setEditStatus(data.status);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        router.push("/write/stories");
      });
  };

  const handleSaveInfo = async () => {
    if (!token || !story) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/manage/stories/${story.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          status: editStatus,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setStory((prev) => (prev ? { ...prev, ...updated } : prev));
        setEditingInfo(false);
      }
    } catch {}
    setSaving(false);
  };

  const handleDeleteChapter = async (id: string) => {
    if (!token) return;
    setDeleting(true);
    try {
      await fetch(`${API_BASE_URL}/api/manage/chapters/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setStory((prev) =>
        prev ? { ...prev, chapters: prev.chapters.filter((c) => c.id !== id) } : prev
      );
      setDeleteChapterId(null);
    } catch {
      alert("Không thể xóa chương");
    }
    setDeleting(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!story) return null;

  const statusLabels: Record<string, string> = {
    ongoing: "Đang viết",
    completed: "Hoàn thành",
    paused: "Tạm ngưng",
  };

  const totalWords = story.chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/write/stories"
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h2 className="text-heading-md font-bold text-gray-900 truncate">
            {story.title}
          </h2>
          <p className="text-body-sm text-gray-500">
            {story.chapters.length} chương · {totalWords.toLocaleString()} chữ · {story.views.toLocaleString()} lượt đọc
          </p>
        </div>
        <Link
          href={`/write/${story.id}/chapter/new`}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-body-sm font-semibold text-white shadow-md hover:bg-primary-600"
        >
          <PlusIcon className="h-4 w-4" />
          Viết chương mới
        </Link>
      </div>

      {/* Story Info Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-body-lg font-semibold text-gray-900">Thông tin truyện</h3>
          {!editingInfo ? (
            <button
              onClick={() => setEditingInfo(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-caption font-medium text-primary-600 hover:bg-primary-50"
            >
              <PencilSquareIcon className="h-3.5 w-3.5" />
              Chỉnh sửa
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingInfo(false);
                  setEditTitle(story.title);
                  setEditDesc(story.description);
                  setEditStatus(story.status);
                }}
                className="rounded-lg px-3 py-1.5 text-caption font-medium text-gray-500 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveInfo}
                disabled={saving}
                className="rounded-lg bg-primary-500 px-4 py-1.5 text-caption font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          )}
        </div>

        {editingInfo ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-caption font-medium text-gray-700">Tên truyện</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-caption font-medium text-gray-700">Mô tả</label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-caption font-medium text-gray-700">Trạng thái</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              >
                <option value="ongoing">Đang viết</option>
                <option value="completed">Hoàn thành</option>
                <option value="paused">Tạm ngưng</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-gray-100 px-2.5 py-1 text-caption font-medium text-gray-600">
                {story.genre}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  story.status === "completed"
                    ? "bg-emerald-100 text-emerald-700"
                    : story.status === "paused"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {statusLabels[story.status] || story.status}
              </span>
              {story.isAdult && (
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-600">
                  18+
                </span>
              )}
            </div>
            <p className="text-body-sm text-gray-600 leading-relaxed">{story.description}</p>
            <div className="flex flex-wrap gap-4 text-caption text-gray-500">
              <span className="flex items-center gap-1">
                <EyeIcon className="h-3.5 w-3.5" /> {story.views.toLocaleString()} lượt đọc
              </span>
              <span className="flex items-center gap-1">
                <HeartIcon className="h-3.5 w-3.5" /> {story.likes.toLocaleString()} thích
              </span>
              <span className="flex items-center gap-1">
                <BookmarkIcon className="h-3.5 w-3.5" /> {story._count.bookmarks} lưu
              </span>
              <span className="flex items-center gap-1">
                <ChatBubbleLeftIcon className="h-3.5 w-3.5" /> {story._count.comments} bình luận
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="h-3.5 w-3.5" /> Tạo {new Date(story.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chapters List */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-body-lg font-semibold text-gray-900">
            Danh sách chương ({story.chapters.length})
          </h3>
          <Link
            href={`/write/${story.id}/chapter/new`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-caption font-medium text-primary-600 hover:bg-primary-100"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Thêm chương
          </Link>
        </div>

        {story.chapters.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-200" />
            <p className="mt-3 text-body-sm font-medium text-gray-500">Chưa có chương nào</p>
            <p className="mt-1 text-caption text-gray-400">Bắt đầu viết chương đầu tiên cho truyện của bạn</p>
            <Link
              href={`/write/${story.id}/chapter/new`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-body-sm font-semibold text-white shadow-md hover:bg-primary-600"
            >
              <PlusIcon className="h-4 w-4" />
              Viết chương đầu tiên
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {story.chapters.map((chapter, i) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="group flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-gray-50"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-caption font-bold text-gray-500">
                  {chapter.number}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/write/${story.id}/chapter/${chapter.id}`}
                    className="text-body-sm font-medium text-gray-900 hover:text-primary-600"
                  >
                    {chapter.title}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-3 text-[11px] text-gray-400">
                    <span>{chapter.wordCount?.toLocaleString() || 0} chữ</span>
                    <span>{new Date(chapter.updatedAt).toLocaleDateString("vi-VN")}</span>
                    {chapter.isLocked && (
                      <span className="flex items-center gap-0.5 text-amber-500">
                        <LockClosedIcon className="h-3 w-3" />
                        {chapter.price} xu
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Link
                    href={`/write/${story.id}/chapter/${chapter.id}`}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary-600"
                    title="Chỉnh sửa"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteChapterId(chapter.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title="Xóa"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete chapter modal */}
      <AnimatePresence>
        {deleteChapterId && (
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
              <h3 className="text-body-lg font-bold text-gray-900">Xác nhận xóa chương</h3>
              <p className="mt-2 text-body-sm text-gray-500">
                Bạn có chắc muốn xóa chương này? Hành động không thể hoàn tác.
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setDeleteChapterId(null)}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDeleteChapter(deleteChapterId)}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-body-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {deleting ? "Đang xóa..." : "Xóa chương"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
