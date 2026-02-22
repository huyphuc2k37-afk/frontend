"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useMod } from "@/components/ModLayout";
import { API_BASE_URL } from "@/lib/api";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

interface Author {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface Story {
  id: string;
  title: string;
  slug: string;
  description: string;
  genre: string;
  tags: string[] | string | null;
  status: string;
  approvalStatus: string;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: Author;
  _count: { chapters: number };
}

interface StoryDetail extends Story {
  coverImage: string | null;
  targetAudience: string | null;
  chapters: { id: string; title: string; number: number; wordCount: number; approvalStatus?: string; createdAt: string }[];
  _count: { chapters: number; bookmarks: number; comments: number };
}

const statusTabs = [
  { key: "pending", label: "Chờ duyệt", icon: ClockIcon, color: "amber" },
  { key: "approved", label: "Đã duyệt", icon: CheckCircleIcon, color: "emerald" },
  { key: "rejected", label: "Từ chối", icon: XCircleIcon, color: "red" },
  { key: "all", label: "Tất cả", icon: null, color: "gray" },
];

export default function ModStoriesPage() {
  const { token, isSuperMod } = useMod();

  // Helper to normalize tags (backend sends String? or string[])
  const parseTags = (tags: string[] | string | null | undefined): string[] => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    return tags.split(",").map((t) => t.trim()).filter(Boolean);
  };
  const [stories, setStories] = useState<Story[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Detail/review panel
  const [selectedStory, setSelectedStory] = useState<StoryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);
  const [editCoverBase64, setEditCoverBase64] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const openEditModal = () => {
    if (!selectedStory) return;
    setEditTitle(selectedStory.title);
    setEditDescription(selectedStory.description || "");
    setEditGenre(selectedStory.genre || "");
    setEditStatus(selectedStory.status || "ongoing");
    setEditCoverPreview(selectedStory.coverImage || null);
    setEditCoverBase64(null);
    setShowEditModal(true);
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
    if (!token || !selectedStory) return;
    setEditSaving(true);
    try {
      const body: any = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        genre: editGenre,
        status: editStatus,
      };
      if (editCoverBase64) body.coverImage = editCoverBase64;
      const res = await fetch(`${API_BASE_URL}/api/mod/stories/${selectedStory.id}/edit`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setActionResult({ type: "success", msg: "Đã cập nhật truyện thành công!" });
        setShowEditModal(false);
        // Refresh detail
        viewDetail(selectedStory.id);
        fetchStories();
      } else {
        setActionResult({ type: "error", msg: data.error || "Lỗi khi cập nhật" });
      }
    } catch {
      setActionResult({ type: "error", msg: "Lỗi kết nối" });
    }
    setEditSaving(false);
  };

  const fetchStories = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        status: statusFilter,
      });
      if (search) params.set("search", search);

      const res = await fetch(`${API_BASE_URL}/api/mod/stories?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStories(data.stories || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, search]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("status");
    if (s && ["pending", "approved", "rejected", "all"].includes(s)) {
      setStatusFilter(s);
    }
  }, []);

  const viewDetail = async (id: string) => {
    if (!token) return;
    setDetailLoading(true);
    setSelectedStory(null);
    setActionResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mod/stories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelectedStory(data);
    } catch {}
    setDetailLoading(false);
  };

  const approveStory = async () => {
    if (!token || !selectedStory) return;
    setActionLoading(true);
    setActionResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mod/stories/${selectedStory.id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setActionResult({ type: "success", msg: "Đã duyệt truyện thành công!" });
        setSelectedStory((prev) => prev ? { ...prev, approvalStatus: "approved", rejectionReason: null } : null);
        fetchStories();
      } else {
        setActionResult({ type: "error", msg: data.error || "Lỗi khi duyệt" });
      }
    } catch {
      setActionResult({ type: "error", msg: "Lỗi kết nối" });
    }
    setActionLoading(false);
  };

  const rejectStory = async () => {
    if (!token || !selectedStory || !rejectReason.trim()) return;
    setActionLoading(true);
    setActionResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mod/stories/${selectedStory.id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionResult({ type: "success", msg: "Đã từ chối truyện." });
        setSelectedStory((prev) => prev ? { ...prev, approvalStatus: "rejected", rejectionReason: rejectReason.trim() } : null);
        setShowRejectModal(false);
        setRejectReason("");
        fetchStories();
      } else {
        setActionResult({ type: "error", msg: data.error || "Lỗi khi từ chối" });
      }
    } catch {
      setActionResult({ type: "error", msg: "Lỗi kết nối" });
    }
    setActionLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const statusBadge = (s: string) => {
    switch (s) {
      case "pending":
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700"><ClockIcon className="h-3 w-3" /> Chờ duyệt</span>;
      case "approved":
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"><CheckCircleIcon className="h-3 w-3" /> Đã duyệt</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-700"><XCircleIcon className="h-3 w-3" /> Từ chối</span>;
      default:
        return <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">{s}</span>;
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-heading-md font-bold text-gray-900">Duyệt truyện</h2>
        <p className="mt-1 text-body-sm text-gray-500">
          Kiểm duyệt và quản lý trạng thái truyện trên hệ thống ({total} kết quả)
        </p>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setPage(1); setSelectedStory(null); }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all ${
                statusFilter === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon && <tab.icon className="h-3.5 w-3.5" />}
              {tab.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên truyện, tác giả..."
              className="rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-body-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-body-sm font-medium text-white hover:bg-indigo-700"
          >
            Tìm
          </button>
        </form>
      </div>

      <div className="flex gap-5">
        {/* Story list */}
        <div className={`flex-1 space-y-3 ${selectedStory ? "hidden lg:block lg:max-w-[50%]" : ""}`}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            </div>
          ) : stories.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
              <p className="text-body-sm text-gray-400">Không có truyện nào.</p>
            </div>
          ) : (
            <>
              {stories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => viewDetail(story.id)}
                  className={`cursor-pointer rounded-2xl border bg-white p-4 transition-all hover:shadow-md ${
                    selectedStory?.id === story.id ? "border-indigo-300 ring-1 ring-indigo-200" : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-body-sm font-semibold text-gray-900">{story.title}</h3>
                      </div>
                      <p className="mt-1 text-[12px] text-gray-500">
                        bởi <span className="font-medium text-gray-700">{story.author.name}</span>
                        {" • "}{story.genre}
                        {" • "}{story._count.chapters} chương
                      </p>
                      {story.description && (
                        <p className="mt-1.5 line-clamp-2 text-[12px] text-gray-400">{story.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {statusBadge(story.approvalStatus)}
                      <span className="text-[10px] text-gray-400">{formatDate(story.createdAt)}</span>
                    </div>
                  </div>
                  {parseTags(story.tags).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {parseTags(story.tags).slice(0, 5).map((tag) => (
                        <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">{tag}</span>
                      ))}
                      {parseTags(story.tags).length > 5 && (
                        <span className="text-[10px] text-gray-400">+{parseTags(story.tags).length - 5}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <span className="text-body-sm text-gray-600">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail panel */}
        {(selectedStory || detailLoading) && (
          <div className="flex-1 lg:max-w-[50%]">
            <div className="sticky top-20 rounded-2xl border border-gray-100 bg-white shadow-sm">
              {detailLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                </div>
              ) : selectedStory ? (
                <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
                  {/* Header */}
                  <div className="border-b border-gray-100 p-5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-body-lg font-bold text-gray-900">{selectedStory.title}</h3>
                        </div>
                        <p className="mt-1 text-body-sm text-gray-500">
                          bởi <span className="font-medium text-gray-700">{selectedStory.author.name}</span> ({selectedStory.author.email})
                        </p>
                        <div className="mt-2">{statusBadge(selectedStory.approvalStatus)}</div>
                      </div>
                      <button
                        onClick={() => setSelectedStory(null)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 lg:hidden"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Action result */}
                  {actionResult && (
                    <div className={`mx-5 mt-4 rounded-xl p-3 text-body-sm font-medium ${
                      actionResult.type === "success"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}>
                      {actionResult.msg}
                    </div>
                  )}

                  {/* Info */}
                  <div className="space-y-4 p-5">
                    <div className="grid grid-cols-2 gap-3 text-body-sm">
                      <div>
                        <p className="text-[11px] font-medium text-gray-400">Thể loại</p>
                        <p className="mt-0.5 font-medium text-gray-700">{selectedStory.genre}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-gray-400">Trạng thái truyện</p>
                        <p className="mt-0.5 font-medium text-gray-700">{selectedStory.status === "ongoing" ? "Đang ra" : selectedStory.status === "completed" ? "Hoàn thành" : selectedStory.status}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-gray-400">Số chương</p>
                        <p className="mt-0.5 font-medium text-gray-700">{selectedStory._count.chapters}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-gray-400">Lượt đánh dấu</p>
                        <p className="mt-0.5 font-medium text-gray-700">{selectedStory._count.bookmarks}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-gray-400">Ngày tạo</p>
                        <p className="mt-0.5 font-medium text-gray-700">{formatDate(selectedStory.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-gray-400">Đối tượng</p>
                        <p className="mt-0.5 font-medium text-gray-700">{selectedStory.targetAudience || "—"}</p>
                      </div>
                    </div>

                    {/* Description */}
                    {selectedStory.description && (
                      <div>
                        <p className="text-[11px] font-medium text-gray-400">Mô tả</p>
                        <p className="mt-1 whitespace-pre-line rounded-xl bg-gray-50 p-3 text-body-sm text-gray-700">
                          {selectedStory.description}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {parseTags(selectedStory.tags).length > 0 && (
                      <div>
                        <p className="text-[11px] font-medium text-gray-400">Tags</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {parseTags(selectedStory.tags).map((tag) => (
                            <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-600">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chapters list */}
                    {selectedStory.chapters && selectedStory.chapters.length > 0 && (
                      <div>
                        <p className="text-[11px] font-medium text-gray-400">Danh sách chương ({selectedStory.chapters.length})</p>
                        <div className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-gray-100">
                          {selectedStory.chapters.map((ch) => (
                            <div key={ch.id} className="flex items-center justify-between border-b border-gray-50 px-3 py-2 last:border-0">
                              <span className="text-[12px] text-gray-700">
                                <span className="font-medium">Chương {ch.number}:</span> {ch.title}
                              </span>
                              <div className="flex items-center gap-2">
                                {ch.approvalStatus === "pending" && (
                                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">Chờ</span>
                                )}
                                {ch.approvalStatus === "approved" && (
                                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">Duyệt</span>
                                )}
                                {ch.approvalStatus === "rejected" && (
                                  <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-semibold text-red-700">Từ chối</span>
                                )}
                                <span className="text-[10px] text-gray-400">{ch.wordCount} từ</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rejection reason (if rejected) */}
                    {selectedStory.approvalStatus === "rejected" && selectedStory.rejectionReason && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                        <p className="text-[11px] font-medium text-red-500">Lý do từ chối</p>
                        <p className="mt-1 text-body-sm text-red-700">{selectedStory.rejectionReason}</p>
                      </div>
                    )}

                    {/* View on site + Edit */}
                    <div className="flex flex-wrap gap-2">
                      {selectedStory.approvalStatus === "approved" && (
                        <a
                          href={`/story/${selectedStory.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-body-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                          <EyeIcon className="h-4 w-4" />
                          Xem truyện trên site
                        </a>
                      )}
                      {isSuperMod && (
                      <button
                        onClick={openEditModal}
                        className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-body-sm font-medium text-indigo-700 hover:bg-indigo-100"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        Sửa truyện
                      </button>
                      )}
                    </div>

                    {/* Actions */}
                    {selectedStory.approvalStatus === "pending" && (
                      <div className="flex gap-3 border-t border-gray-100 pt-4">
                        <button
                          onClick={approveStory}
                          disabled={actionLoading}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-body-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          Duyệt truyện
                        </button>
                        <button
                          onClick={() => { setShowRejectModal(true); setRejectReason(""); }}
                          disabled={actionLoading}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-body-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                        >
                          <XCircleIcon className="h-4 w-4" />
                          Từ chối
                        </button>
                      </div>
                    )}

                    {/* Re-review actions for already reviewed stories */}
                    {(selectedStory.approvalStatus === "approved" || selectedStory.approvalStatus === "rejected") && (
                      <div className="border-t border-gray-100 pt-4">
                        <p className="mb-2 text-[11px] text-gray-400">Thay đổi trạng thái kiểm duyệt:</p>
                        <div className="flex gap-3">
                          {selectedStory.approvalStatus !== "approved" && (
                            <button
                              onClick={approveStory}
                              disabled={actionLoading}
                              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-body-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                              Duyệt
                            </button>
                          )}
                          {selectedStory.approvalStatus !== "rejected" && (
                            <button
                              onClick={() => { setShowRejectModal(true); setRejectReason(""); }}
                              disabled={actionLoading}
                              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-body-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              <XCircleIcon className="h-4 w-4" />
                              Từ chối
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-body-lg font-bold text-gray-900">Từ chối truyện</h3>
                <p className="text-body-sm text-gray-500">Nhập lý do từ chối để tác giả biết cần chỉnh sửa gì.</p>
              </div>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              rows={4}
              className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-body-sm focus:border-red-300 focus:outline-none focus:ring-1 focus:ring-red-200"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-body-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={rejectStory}
                disabled={!rejectReason.trim() || actionLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-body-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <XCircleIcon className="h-4 w-4" />
                    Xác nhận từ chối
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEditModal && selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                <PencilSquareIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-body-lg font-bold text-gray-900">Sửa truyện</h3>
                <p className="text-body-sm text-gray-500">Chỉnh sửa nội dung và ảnh bìa truyện.</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Tên truyện</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Mô tả</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                />
              </div>

              {/* Genre + Status */}
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

              {/* Cover image */}
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
                        onClick={() => { setEditCoverBase64(null); setEditCoverPreview(selectedStory.coverImage || null); }}
                        className="text-[11px] text-red-500 hover:text-red-600"
                      >
                        Hoàn tác ảnh
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
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
