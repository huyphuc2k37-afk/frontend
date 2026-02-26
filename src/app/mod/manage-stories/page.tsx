"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useMod } from "@/components/ModLayout";
import { API_BASE_URL } from "@/lib/api";
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PhotoIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

interface EditChapter {
  id: string;
  title: string;
  number: number;
  content: string;
  wordCount: number;
  authorNote: string | null;
  isLocked: boolean;
  price: number;
  approvalStatus: string;
  createdAt: string;
}

export default function ModManageStoriesPage() {
  const { token, isSuperMod } = useMod();
  const [stories, setStories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStory, setEditStory] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);
  const [editCoverBase64, setEditCoverBase64] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editResult, setEditResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Chapter editing state
  const [editChapters, setEditChapters] = useState<EditChapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editChapterTitle, setEditChapterTitle] = useState("");
  const [editChapterContent, setEditChapterContent] = useState("");
  const [editChapterNote, setEditChapterNote] = useState("");
  const [savingChapter, setSavingChapter] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Copy story state
  const [copying, setCopying] = useState<string | null>(null);
  const [copyResult, setCopyResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Active tab in edit modal
  const [activeTab, setActiveTab] = useState<"info" | "chapters">("info");

  const fetchStories = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20", status: "all" });
      if (search) params.set("search", search);
      const res = await fetch(`${API_BASE_URL}/api/mod/stories?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStories(data.stories || []);
        setTotal(data.total || 0);
      }
    } catch {}
    setLoading(false);
  }, [token, page, search]);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const openEditModal = async (storyId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/mod/stories/${storyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setEditStory(data);
      setEditTitle(data.title || "");
      setEditDescription(data.description || "");
      setEditGenre(data.genre || "");
      setEditStatus(data.status || "ongoing");
      setEditCoverPreview(data.coverImage || null);
      setEditCoverBase64(null);
      setEditResult(null);
      setEditChapters([]);
      setExpandedChapterId(null);
      setEditingChapterId(null);
      setActiveTab("info");
      setShowEditModal(true);

      // Fetch chapters with full content
      fetchChaptersFull(storyId);
    } catch {}
  };

  const fetchChaptersFull = async (storyId: string) => {
    if (!token) return;
    setLoadingChapters(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mod/stories/${storyId}/chapters-full`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEditChapters(data);
      }
    } catch {}
    setLoadingChapters(false);
  };

  const handleEditCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setEditCoverPreview(base64);
      setEditCoverBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const saveEdit = async () => {
    if (!token || !editStory) return;
    setEditSaving(true);
    try {
      const body: any = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        genre: editGenre,
        status: editStatus,
      };
      if (editCoverBase64) body.coverImage = editCoverBase64;
      const res = await fetch(`${API_BASE_URL}/api/mod/stories/${editStory.id}/edit`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setEditResult({ type: "success", msg: "Đã cập nhật truyện thành công!" });
        fetchStories();
      } else {
        setEditResult({ type: "error", msg: data.error || "Lỗi khi cập nhật" });
      }
    } catch {
      setEditResult({ type: "error", msg: "Lỗi kết nối" });
    }
    setEditSaving(false);
  };

  const startEditChapter = (ch: EditChapter) => {
    setEditingChapterId(ch.id);
    setEditChapterTitle(ch.title);
    setEditChapterContent(ch.content);
    setEditChapterNote(ch.authorNote || "");
    setExpandedChapterId(ch.id);
  };

  const cancelEditChapter = () => {
    setEditingChapterId(null);
    setEditChapterTitle("");
    setEditChapterContent("");
    setEditChapterNote("");
  };

  const saveChapter = async () => {
    if (!token || !editingChapterId) return;
    setSavingChapter(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mod/chapters/${editingChapterId}/edit`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editChapterTitle.trim(),
          content: editChapterContent,
          authorNote: editChapterNote || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditChapters((prev) =>
          prev.map((ch) =>
            ch.id === editingChapterId
              ? {
                  ...ch,
                  title: editChapterTitle.trim(),
                  content: editChapterContent,
                  authorNote: editChapterNote || null,
                  wordCount: data.chapter?.wordCount ?? ch.wordCount,
                }
              : ch
          )
        );
        setEditingChapterId(null);
        setEditResult({ type: "success", msg: `Đã cập nhật chương "${editChapterTitle.trim()}"` });
      } else {
        setEditResult({ type: "error", msg: data.error || "Lỗi khi cập nhật chương" });
      }
    } catch {
      setEditResult({ type: "error", msg: "Lỗi kết nối" });
    }
    setSavingChapter(false);
  };

  const copyChapterContent = async (ch: EditChapter) => {
    const plainText = ch.content.replace(/<[^>]*>/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    try {
      await navigator.clipboard.writeText(plainText);
      setCopiedId(ch.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = plainText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedId(ch.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const copyStory = async (id: string, title: string) => {
    if (!token) return;
    if (!confirm(`Sao chép truyện "${title}"? Toàn bộ chương sẽ được copy sang truyện mới do bạn sở hữu.`)) return;
    setCopying(id);
    setCopyResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mod/stories/${id}/copy`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCopyResult({ type: "success", msg: data.message || "Đã sao chép truyện thành công!" });
        fetchStories();
      } else {
        setCopyResult({ type: "error", msg: data.error || "Lỗi khi sao chép" });
      }
    } catch {
      setCopyResult({ type: "error", msg: "Lỗi kết nối" });
    }
    setCopying(null);
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

  const approvalColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-600",
    approved: "bg-emerald-50 text-emerald-600",
    rejected: "bg-red-50 text-red-600",
  };

  const approvalLabels: Record<string, string> = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối",
  };

  if (!isSuperMod) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-body-sm text-gray-500">Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-md font-bold text-gray-900">Quản lý truyện</h2>
        <p className="text-caption text-gray-500">Tổng: {total} truyện</p>
      </div>

      {/* Notifications */}
      {copyResult && (
        <div className={`rounded-xl p-3 text-body-sm font-medium ${copyResult.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {copyResult.msg}
        </div>
      )}
      {editResult && !showEditModal && (
        <div className={`rounded-xl p-3 text-body-sm font-medium ${editResult.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {editResult.msg}
        </div>
      )}

      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm theo tên truyện hoặc tác giả..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-4 text-body-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          </div>
        ) : stories.length === 0 ? (
          <div className="py-16 text-center text-body-sm text-gray-400">Không tìm thấy truyện nào</div>
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
                  <th className="px-4 py-3 text-center text-caption font-semibold text-gray-500">Kiểm duyệt</th>
                  <th className="px-4 py-3 text-center text-caption font-semibold text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stories.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-body-sm font-medium text-gray-900 max-w-[220px] truncate">{s.title}</td>
                    <td className="px-4 py-3 text-body-sm text-gray-500">{s.author?.name}</td>
                    <td className="px-4 py-3 text-body-sm text-center text-gray-600">{s.genre}</td>
                    <td className="px-4 py-3 text-body-sm text-center text-gray-600">{s._count?.chapters || 0}</td>
                    <td className="px-4 py-3 text-body-sm text-center text-gray-600">{(s.views || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusColors[s.status] || "bg-gray-100 text-gray-600"}`}>
                        {statusLabels[s.status] || s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${approvalColors[s.approvalStatus] || "bg-gray-100 text-gray-600"}`}>
                        {approvalLabels[s.approvalStatus] || s.approvalStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {s.slug && (
                          <a
                            href={`/story/${s.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50"
                            title="Xem truyện"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => openEditModal(s.id)}
                          className="rounded-lg p-1.5 text-indigo-500 hover:bg-indigo-50"
                          title="Sửa truyện & chương"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => copyStory(s.id, s.title)}
                          disabled={copying === s.id}
                          className="rounded-lg p-1.5 text-emerald-500 hover:bg-emerald-50 disabled:opacity-50"
                          title="Sao chép truyện"
                        >
                          {copying === s.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                          ) : (
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-caption text-gray-500">Trang {page} / {Math.ceil(total / 20)}</p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-caption font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Trước
            </button>
            <button
              disabled={stories.length < 20}
              onClick={() => setPage(page + 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-caption font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* ═══ Full Edit Modal (Story + Chapters) ═══ */}
      {showEditModal && editStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                  <PencilSquareIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-body-lg font-bold text-gray-900">Sửa truyện & chương</h3>
                  <p className="text-caption text-gray-500">{editStory.title} — {editChapters.length} chương</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-gray-100 px-6 shrink-0">
              <button
                onClick={() => setActiveTab("info")}
                className={`px-4 py-3 text-body-sm font-medium border-b-2 transition-colors ${
                  activeTab === "info"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Thông tin truyện
              </button>
              <button
                onClick={() => setActiveTab("chapters")}
                className={`px-4 py-3 text-body-sm font-medium border-b-2 transition-colors ${
                  activeTab === "chapters"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Danh sách chương ({editChapters.length})
              </button>
            </div>

            {/* Notification */}
            {editResult && (
              <div className={`mx-6 mt-4 rounded-xl p-3 text-body-sm font-medium shrink-0 ${editResult.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {editResult.msg}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* ─── Tab: Thông tin truyện ─── */}
              {activeTab === "info" && (
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-600 mb-1">Tên truyện</label>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-gray-600 mb-1">Mô tả</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={5}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-600 mb-1">Thể loại</label>
                      <input
                        value={editGenre}
                        onChange={(e) => setEditGenre(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-600 mb-1">Trạng thái</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                      >
                        <option value="ongoing">Đang viết</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="paused">Tạm ngưng</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-gray-600 mb-1">Ảnh bìa</label>
                    <div className="flex items-start gap-3">
                      {editCoverPreview ? (
                        <Image
                          src={editCoverPreview}
                          alt="Cover preview"
                          width={64}
                          height={96}
                          unoptimized
                          className="h-24 w-16 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="flex h-24 w-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                          <PhotoIcon className="h-6 w-6 text-gray-300" />
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-600 hover:bg-gray-50">
                          <PhotoIcon className="h-4 w-4" />
                          Chọn ảnh mới
                          <input type="file" accept="image/*" className="hidden" onChange={handleEditCoverChange} />
                        </label>
                        {editCoverBase64 && (
                          <button
                            onClick={() => { setEditCoverBase64(null); setEditCoverPreview(editStory.coverImage || null); }}
                            className="text-[11px] text-red-500 hover:text-red-600"
                          >
                            Hoàn tác ảnh
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={saveEdit}
                      disabled={!editTitle.trim() || editSaving}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-body-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {editSaving ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <PencilSquareIcon className="h-4 w-4" />
                          Lưu thông tin truyện
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ─── Tab: Danh sách chương ─── */}
              {activeTab === "chapters" && (
                <div className="space-y-3">
                  {loadingChapters ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="h-6 w-6 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
                    </div>
                  ) : editChapters.length === 0 ? (
                    <p className="py-12 text-center text-body-sm text-gray-400">Truyện chưa có chương nào</p>
                  ) : (
                    editChapters.map((ch) => (
                      <div key={ch.id} className="rounded-xl border border-gray-200 overflow-hidden">
                        {/* Chapter header */}
                        <div
                          className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            if (editingChapterId === ch.id) return;
                            setExpandedChapterId(expandedChapterId === ch.id ? null : ch.id);
                          }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-caption font-bold text-gray-400 w-8 text-center shrink-0">
                              {ch.number}
                            </span>
                            <span className="text-body-sm font-medium text-gray-800 truncate">
                              {ch.title}
                            </span>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {ch.wordCount.toLocaleString()} chữ
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); copyChapterContent(ch); }}
                              className="rounded-lg p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                              title="Copy nội dung"
                            >
                              {copiedId === ch.id ? (
                                <CheckIcon className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <ClipboardDocumentIcon className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); startEditChapter(ch); }}
                              className="rounded-lg p-1.5 text-indigo-500 hover:bg-indigo-50"
                              title="Sửa chương"
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>
                            {expandedChapterId === ch.id ? (
                              <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Chapter content (expanded) */}
                        {expandedChapterId === ch.id && (
                          <div className="border-t border-gray-100">
                            {editingChapterId === ch.id ? (
                              <div className="p-4 space-y-3">
                                <div>
                                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Tiêu đề chương</label>
                                  <input
                                    value={editChapterTitle}
                                    onChange={(e) => setEditChapterTitle(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-body-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Nội dung</label>
                                  <textarea
                                    value={editChapterContent}
                                    onChange={(e) => setEditChapterContent(e.target.value)}
                                    rows={15}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-body-sm font-mono leading-relaxed focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Ghi chú tác giả</label>
                                  <textarea
                                    value={editChapterNote}
                                    onChange={(e) => setEditChapterNote(e.target.value)}
                                    rows={2}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-body-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                                    placeholder="(tuỳ chọn)"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={cancelEditChapter}
                                    className="rounded-lg border border-gray-200 px-4 py-2 text-caption font-medium text-gray-600 hover:bg-gray-50"
                                  >
                                    Hủy
                                  </button>
                                  <button
                                    onClick={saveChapter}
                                    disabled={!editChapterTitle.trim() || !editChapterContent.trim() || savingChapter}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-caption font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                                  >
                                    {savingChapter ? (
                                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                      "Lưu chương"
                                    )}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4">
                                <div
                                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed max-h-[400px] overflow-y-auto"
                                  dangerouslySetInnerHTML={{ __html: ch.content }}
                                />
                                {ch.authorNote && (
                                  <div className="mt-3 rounded-lg bg-amber-50 p-3 text-caption text-amber-700">
                                    <strong>Ghi chú tác giả:</strong> {ch.authorNote}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
