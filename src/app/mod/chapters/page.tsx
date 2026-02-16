"use client";

import { useState, useEffect, useCallback } from "react";
import { useMod } from "@/components/ModLayout";
import { API_BASE_URL } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

interface ChapterListItem {
  id: string;
  title: string;
  number: number;
  wordCount: number;
  approvalStatus: string;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  story: {
    id: string;
    title: string;
    slug: string;
    author: { id: string; name: string; email: string };
  };
}

interface ChapterDetail {
  id: string;
  title: string;
  number: number;
  content: string;
  wordCount: number;
  authorNote: string | null;
  approvalStatus: string;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  story: {
    id: string;
    title: string;
    slug: string;
    genre: string;
    author: { id: string; name: string; email: string };
  };
}

const statusTabs = [
  { key: "pending", label: "Chờ duyệt", icon: ClockIcon, color: "amber" },
  { key: "approved", label: "Đã duyệt", icon: CheckCircleIcon, color: "emerald" },
  { key: "rejected", label: "Từ chối", icon: XCircleIcon, color: "red" },
  { key: "all", label: "Tất cả", icon: null, color: "gray" },
];

export default function ModChaptersPage() {
  const { token } = useMod();
  const [chapters, setChapters] = useState<ChapterListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Detail panel
  const [selectedChapter, setSelectedChapter] = useState<ChapterDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchChapters = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        status: statusFilter,
      });
      if (search) params.set("search", search);

      const res = await fetch(`${API_BASE_URL}/api/mod/chapters?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setChapters(data.chapters || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      setChapters([]);
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, search]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("status");
    if (s && ["pending", "approved", "rejected", "all"].includes(s)) {
      setStatusFilter(s);
    }
  }, []);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [statusFilter, page, search]);

  const viewDetail = async (id: string) => {
    if (!token) return;
    setDetailLoading(true);
    setSelectedChapter(null);
    setActionResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mod/chapters/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelectedChapter(data);
    } catch {}
    setDetailLoading(false);
  };

  const approveChapter = async () => {
    if (!token || !selectedChapter) return;
    setActionLoading(true);
    setActionResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mod/chapters/${selectedChapter.id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setActionResult({ type: "success", msg: "Đã duyệt chương thành công!" });
        setSelectedChapter((prev) => prev ? { ...prev, approvalStatus: "approved", rejectionReason: null } : null);
        fetchChapters();
      } else {
        setActionResult({ type: "error", msg: data.error || "Lỗi khi duyệt" });
      }
    } catch {
      setActionResult({ type: "error", msg: "Lỗi kết nối" });
    }
    setActionLoading(false);
  };

  const rejectChapter = async () => {
    if (!token || !selectedChapter || !rejectReason.trim()) return;
    setActionLoading(true);
    setActionResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mod/chapters/${selectedChapter.id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionResult({ type: "success", msg: "Đã từ chối chương." });
        setSelectedChapter((prev) => prev ? { ...prev, approvalStatus: "rejected", rejectionReason: rejectReason.trim() } : null);
        setShowRejectModal(false);
        setRejectReason("");
        fetchChapters();
      } else {
        setActionResult({ type: "error", msg: data.error || "Lỗi khi từ chối" });
      }
    } catch {
      setActionResult({ type: "error", msg: "Lỗi kết nối" });
    }
    setActionLoading(false);
  };

  const bulkApprove = async () => {
    if (!token || selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mod/chapters/approve-bulk`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ chapterIds: Array.from(selectedIds) }),
      });
      if (res.ok) {
        setSelectedIds(new Set());
        fetchChapters();
      }
    } catch {}
    setBulkLoading(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const pendingChapters = chapters.filter((c) => c.approvalStatus === "pending");
    if (selectedIds.size === pendingChapters.length && pendingChapters.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingChapters.map((c) => c.id)));
    }
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
        <h2 className="text-heading-md font-bold text-gray-900">Duyệt chương</h2>
        <p className="mt-1 text-body-sm text-gray-500">
          Kiểm duyệt nội dung chương trước khi hiển thị công khai ({total} kết quả)
        </p>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setPage(1); setSelectedChapter(null); }}
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
              placeholder="Tìm theo tên chương, truyện..."
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

      {/* Bulk approve bar */}
      {statusFilter === "pending" && selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
          <span className="text-body-sm font-medium text-indigo-700">
            Đã chọn {selectedIds.size} chương
          </span>
          <button
            onClick={bulkApprove}
            disabled={bulkLoading}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-body-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <CheckCircleIcon className="h-4 w-4" />
            {bulkLoading ? "Đang duyệt..." : "Duyệt tất cả đã chọn"}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-body-sm text-gray-500 hover:text-gray-700"
          >
            Bỏ chọn
          </button>
        </div>
      )}

      <div className="flex gap-5">
        {/* Chapter list */}
        <div className={`flex-1 space-y-3 ${selectedChapter ? "hidden lg:block lg:max-w-[50%]" : ""}`}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            </div>
          ) : chapters.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
              <p className="text-body-sm text-gray-400">Không có chương nào.</p>
            </div>
          ) : (
            <>
              {/* Select all for pending */}
              {statusFilter === "pending" && chapters.some((c) => c.approvalStatus === "pending") && (
                <div className="flex items-center gap-2 px-1">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 text-body-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                      selectedIds.size === chapters.filter((c) => c.approvalStatus === "pending").length
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-gray-300"
                    }`}>
                      {selectedIds.size === chapters.filter((c) => c.approvalStatus === "pending").length && (
                        <CheckIcon className="h-3.5 w-3.5" />
                      )}
                    </div>
                    Chọn tất cả
                  </button>
                </div>
              )}

              {chapters.map((ch) => (
                <div
                  key={ch.id}
                  className={`cursor-pointer rounded-2xl border bg-white p-4 transition-all hover:shadow-md ${
                    selectedChapter?.id === ch.id ? "border-indigo-300 ring-1 ring-indigo-200" : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox for pending */}
                    {statusFilter === "pending" && ch.approvalStatus === "pending" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSelect(ch.id); }}
                        className="mt-1 flex-shrink-0"
                      >
                        <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                          selectedIds.has(ch.id)
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-gray-300 hover:border-indigo-400"
                        }`}>
                          {selectedIds.has(ch.id) && <CheckIcon className="h-3.5 w-3.5" />}
                        </div>
                      </button>
                    )}

                    <div className="min-w-0 flex-1" onClick={() => viewDetail(ch.id)}>
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-body-sm font-semibold text-gray-900">
                          Chương {ch.number}: {ch.title}
                        </h3>
                      </div>
                      <p className="mt-1 text-[12px] text-gray-500">
                        Truyện: <span className="font-medium text-gray-700">{ch.story.title}</span>
                        {" • "}bởi <span className="font-medium text-gray-700">{ch.story.author.name}</span>
                        {" • "}{ch.wordCount} từ
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {statusBadge(ch.approvalStatus)}
                      <span className="text-[10px] text-gray-400">{formatDate(ch.createdAt)}</span>
                    </div>
                  </div>
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
        {(selectedChapter || detailLoading) && (
          <div className="flex-1 lg:max-w-[50%]">
            <div className="sticky top-20 rounded-2xl border border-gray-100 bg-white shadow-sm">
              {detailLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                </div>
              ) : selectedChapter ? (
                <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
                  {/* Header */}
                  <div className="border-b border-gray-100 p-5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-body-lg font-bold text-gray-900">
                          Chương {selectedChapter.number}: {selectedChapter.title}
                        </h3>
                        <p className="mt-1 text-body-sm text-gray-500">
                          Truyện: <span className="font-medium text-gray-700">{selectedChapter.story.title}</span>
                          {" • "}bởi <span className="font-medium text-gray-700">{selectedChapter.story.author.name}</span>
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          {statusBadge(selectedChapter.approvalStatus)}
                          <span className="text-[11px] text-gray-400">{selectedChapter.wordCount} từ • {selectedChapter.story.genre}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedChapter(null)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 lg:hidden"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Action result */}
                  {actionResult && (
                    <div className={`mx-5 mt-4 rounded-xl p-3 text-body-sm font-medium ${
                      actionResult.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    }`}>
                      {actionResult.msg}
                    </div>
                  )}

                  {/* Content preview */}
                  <div className="space-y-4 p-5">
                    <div>
                      <p className="text-[11px] font-medium text-gray-400">Nội dung chương</p>
                      <div
                        className="prose prose-sm mt-2 max-h-80 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-4"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedChapter.content) }}
                      />
                    </div>

                    {/* Author note */}
                    {selectedChapter.authorNote && (
                      <div>
                        <p className="text-[11px] font-medium text-gray-400">Ghi chú tác giả</p>
                        <p className="mt-1 whitespace-pre-line rounded-xl bg-blue-50 p-3 text-body-sm text-blue-700">
                          {selectedChapter.authorNote}
                        </p>
                      </div>
                    )}

                    {/* Rejection reason */}
                    {selectedChapter.approvalStatus === "rejected" && selectedChapter.rejectionReason && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                        <p className="text-[11px] font-medium text-red-500">Lý do từ chối</p>
                        <p className="mt-1 text-body-sm text-red-700">{selectedChapter.rejectionReason}</p>
                      </div>
                    )}

                    {/* View on site */}
                    {selectedChapter.approvalStatus === "approved" && (
                      <a
                        href={`/story/${selectedChapter.story.slug}/chapter/${selectedChapter.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-body-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        <EyeIcon className="h-4 w-4" />
                        Xem chương trên site
                      </a>
                    )}

                    {/* Actions for pending */}
                    {selectedChapter.approvalStatus === "pending" && (
                      <div className="flex gap-3 border-t border-gray-100 pt-4">
                        <button
                          onClick={approveChapter}
                          disabled={actionLoading}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-body-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          Duyệt chương
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

                    {/* Re-review for already reviewed */}
                    {(selectedChapter.approvalStatus === "approved" || selectedChapter.approvalStatus === "rejected") && (
                      <div className="border-t border-gray-100 pt-4">
                        <p className="mb-2 text-[11px] text-gray-400">Thay đổi trạng thái:</p>
                        <div className="flex gap-3">
                          {selectedChapter.approvalStatus !== "approved" && (
                            <button
                              onClick={approveChapter}
                              disabled={actionLoading}
                              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-body-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                              Duyệt
                            </button>
                          )}
                          {selectedChapter.approvalStatus !== "rejected" && (
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
                <h3 className="text-body-lg font-bold text-gray-900">Từ chối chương</h3>
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
                onClick={rejectChapter}
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
    </div>
  );
}
