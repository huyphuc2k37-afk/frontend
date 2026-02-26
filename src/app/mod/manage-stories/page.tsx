"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
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
  LockClosedIcon,
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

  // Expandable chapters state
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);
  const [chapters, setChapters] = useState<EditChapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);

  // Chapter editing state
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editChapterTitle, setEditChapterTitle] = useState("");
  const [editChapterContent, setEditChapterContent] = useState("");
  const [editChapterNote, setEditChapterNote] = useState("");
  const [savingChapter, setSavingChapter] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [chapterResult, setChapterResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Edit story modal state
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

  // Copy story state
  const [copying, setCopying] = useState<string | null>(null);
  const [copyResult, setCopyResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);

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

  // ─── Toggle chapter expansion (like admin) ───
  const toggleChapters = async (storyId: string) => {
    if (expandedStoryId === storyId) {
      setExpandedStoryId(null);
      setChapters([]);
      return;
    }
    setExpandedStoryId(storyId);
    setLoadingChapters(true);
    setEditingChapterId(null);
    setChapterResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mod/stories/${storyId}/chapters-full`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setChapters(await res.json());
      }
    } catch {}
    setLoadingChapters(false);
  };

  // ─── Copy chapter content ───
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

  // ─── Chapter editing ───
  const startEditChapter = (ch: EditChapter) => {
    setEditingChapterId(ch.id);
    setEditChapterTitle(ch.title);
    setEditChapterContent(ch.content);
    setEditChapterNote(ch.authorNote || "");
    setChapterResult(null);
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
        setChapters((prev) =>
          prev.map((ch) =>
            ch.id === editingChapterId
              ? { ...ch, title: editChapterTitle.trim(), content: editChapterContent, authorNote: editChapterNote || null, wordCount: data.chapter?.wordCount ?? ch.wordCount }
              : ch
          )
        );
        setEditingChapterId(null);
        setChapterResult({ type: "success", msg: `Đã cập nhật chương "${editChapterTitle.trim()}"` });
      } else {
        setChapterResult({ type: "error", msg: data.error || "Lỗi khi cập nhật chương" });
      }
    } catch {
      setChapterResult({ type: "error", msg: "Lỗi kết nối" });
    }
    setSavingChapter(false);
  };

  // ─── Story edit modal ───
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
      setShowEditModal(true);
    } catch {}
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
        setShowEditModal(false);
        fetchStories();
      } else {
        setEditResult({ type: "error", msg: data.error || "Lỗi khi cập nhật" });
      }
    } catch {
      setEditResult({ type: "error", msg: "Lỗi kết nối" });
    }
    setEditSaving(false);
  };

  // ─── Copy story ───
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
                  <th className="px-4 py-3 text-center text-caption font-semibold text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stories.map((s) => (
                  <Fragment key={s.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-body-sm font-medium text-gray-900 max-w-[220px] truncate">{s.title}</td>
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
                      <td className="px-4 py-3 text-body-sm text-center text-gray-600">{(s.views || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusColors[s.status] || "bg-gray-100 text-gray-600"}`}>
                          {statusLabels[s.status] || s.status}
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
                            title="Sửa truyện"
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

                    {/* ═══ Expandable Chapter List (like admin) ═══ */}
                    {expandedStoryId === s.id && (
                      <tr>
                        <td colSpan={7} className="bg-gray-50/50 px-4 py-0">
                          {loadingChapters ? (
                            <div className="flex items-center justify-center py-6">
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                            </div>
                          ) : chapters.length === 0 ? (
                            <p className="py-4 text-center text-caption text-gray-400">Truyện chưa có chương nào</p>
                          ) : (
                            <div className="py-2">
                              {chapterResult && (
                                <div className={`mb-2 mx-3 rounded-lg p-2 text-caption font-medium ${chapterResult.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                  {chapterResult.msg}
                                </div>
                              )}
                              <table className="w-full">
                                <thead>
                                  <tr className="text-[11px] font-semibold text-gray-400 uppercase">
                                    <th className="px-3 py-2 text-left">STT</th>
                                    <th className="px-3 py-2 text-left">Tên chương</th>
                                    <th className="px-3 py-2 text-center">Số chữ</th>
                                    <th className="px-3 py-2 text-center">Khóa</th>
                                    <th className="px-3 py-2 text-center">Ngày tạo</th>
                                    <th className="px-3 py-2 text-center">Thao tác</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {chapters.map((ch) => (
                                    <Fragment key={ch.id}>
                                      <tr className="hover:bg-white">
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
                                          <div className="flex items-center justify-center gap-1">
                                            <button
                                              onClick={() => copyChapterContent(ch)}
                                              className="rounded-lg p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                                              title="Copy nội dung"
                                            >
                                              {copiedId === ch.id ? (
                                                <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                                              ) : (
                                                <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                                              )}
                                            </button>
                                            <button
                                              onClick={() => editingChapterId === ch.id ? cancelEditChapter() : startEditChapter(ch)}
                                              className={`rounded-lg p-1 ${editingChapterId === ch.id ? "text-indigo-600 bg-indigo-50" : "text-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"}`}
                                              title="Sửa chương"
                                            >
                                              <PencilSquareIcon className="h-3.5 w-3.5" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                      {editingChapterId === ch.id && (
                                        <tr>
                                          <td colSpan={6} className="bg-indigo-50/30 px-4 py-3">
                                            <div className="space-y-3 max-w-3xl">
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
                                                  rows={12}
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
                                          </td>
                                        </tr>
                                      )}
                                    </Fragment>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
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

      {/* ═══ Edit Story Modal ═══ */}
      {showEditModal && editStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                <PencilSquareIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-body-lg font-bold text-gray-900">Sửa truyện</h3>
                <p className="text-body-sm text-gray-500">Chỉnh sửa thông tin và ảnh bìa truyện.</p>
              </div>
            </div>

            {editResult && (
              <div className={`mb-4 rounded-xl p-3 text-body-sm font-medium ${editResult.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {editResult.msg}
              </div>
            )}

            <div className="space-y-4">
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
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-body-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={saveEdit}
                disabled={!editTitle.trim() || editSaving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-body-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {editSaving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <PencilSquareIcon className="h-4 w-4" />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
