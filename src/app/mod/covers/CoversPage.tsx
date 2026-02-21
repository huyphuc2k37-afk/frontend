"use client";

import { useState, useEffect } from "react";
import { useMod } from "@/components/ModLayout";
import { API_BASE_URL } from "@/lib/api";
import {
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

interface CoverStory {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  coverApprovalStatus: string;
  coverRejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string; email: string; image: string | null };
}

export default function CoversPage() {
  const { token } = useMod();
  const [stories, setStories] = useState<CoverStory[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {};

  const fetchCovers = () => {
    if (!token) return;
    Promise.all([
      fetch(`${API_BASE_URL}/api/mod/covers?status=${filter}&page=${page}`, { headers }).then((r) => r.ok ? r.json() : { stories: [], totalPages: 1 }),
      fetch(`${API_BASE_URL}/api/mod/covers/stats`, { headers }).then((r) => r.ok ? r.json() : { pending: 0, approved: 0, rejected: 0 }),
    ]).then(([data, statsData]) => {
      setStories(data?.stories || []);
      setTotalPages(data?.totalPages || 1);
      setStats(statsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchCovers(); }, [token, filter, page]);

  const approveCover = async (id: string) => {
    setProcessing(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mod/covers/${id}/approve`, { method: "PUT", headers });
      if (res.ok) {
        if (filter === "all") {
          setStories((prev) => prev.map((s) => s.id === id ? { ...s, coverApprovalStatus: "approved", coverRejectionReason: null } : s));
        } else {
          setStories((prev) => prev.filter((s) => s.id !== id));
        }
        setStats((prev) => ({ ...prev, pending: Math.max(0, prev.pending - 1), approved: prev.approved + 1 }));
      }
    } catch {}
    setProcessing(null);
  };

  const rejectCover = async () => {
    if (!rejectId || !rejectReason.trim()) return;
    setProcessing(rejectId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mod/covers/${rejectId}/reject`, {
        method: "PUT", headers, body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      if (res.ok) {
        if (filter === "all") {
          setStories((prev) => prev.map((s) => s.id === rejectId ? { ...s, coverApprovalStatus: "rejected", coverRejectionReason: rejectReason.trim() } : s));
        } else {
          setStories((prev) => prev.filter((s) => s.id !== rejectId));
        }
        setStats((prev) => ({ ...prev, pending: Math.max(0, prev.pending - 1), rejected: prev.rejected + 1 }));
        setRejectId(null);
        setRejectReason("");
      }
    } catch {}
    setProcessing(null);
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading-md font-bold text-gray-900">Duyệt ảnh bìa</h2>
        <p className="mt-1 text-body-sm text-gray-500">Kiểm duyệt hình ảnh bìa truyện</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Chờ duyệt", value: stats.pending, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Đã duyệt", value: stats.approved, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Từ chối", value: stats.rejected, color: "text-red-600", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl ${s.bg} p-4`}>
            <p className="text-body-sm text-gray-600">{s.label}</p>
            <p className={`text-heading-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <FunnelIcon className="h-4 w-4 text-gray-400" />
        {["pending", "approved", "rejected", "all"].map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`rounded-lg px-3 py-1.5 text-body-sm font-medium transition-colors ${
              filter === f ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "pending" ? "Chờ duyệt" : f === "approved" ? "Đã duyệt" : f === "rejected" ? "Từ chối" : "Tất cả"}
          </button>
        ))}
      </div>

      {/* Grid */}
      {stories.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-body-md text-gray-500">Không có ảnh bìa nào</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stories.map((story) => (
            <div key={story.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {/* Cover image */}
              <div
                className="relative aspect-[3/4] cursor-pointer bg-gray-100"
                onClick={() => story.coverImage && setPreviewImage(story.coverImage)}
              >
                {story.coverImage ? (
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <PhotoIcon className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-3">
                  <p className="line-clamp-2 text-body-sm font-semibold text-white">{story.title}</p>
                  <p className="text-[10px] text-gray-300">{story.author.name}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-3">
                {story.coverApprovalStatus === "pending" ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveCover(story.id)}
                      disabled={processing === story.id}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-body-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      Duyệt
                    </button>
                    <button
                      onClick={() => setRejectId(story.id)}
                      disabled={processing === story.id}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-body-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      Từ chối
                    </button>
                  </div>
                ) : (
                  <div className={`rounded-lg px-3 py-2 text-center text-body-sm font-medium ${
                    story.coverApprovalStatus === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                  }`}>
                    {story.coverApprovalStatus === "approved" ? "✅ Đã duyệt" : "❌ Đã từ chối"}
                    {story.coverRejectionReason && (
                      <p className="mt-1 text-caption text-red-500">{story.coverRejectionReason}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-lg text-body-sm font-medium ${
                page === p ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-heading-sm font-bold text-gray-900">Từ chối ảnh bìa</h3>
            <p className="mt-1 text-body-sm text-gray-500">Nhập lý do từ chối để thông báo cho tác giả</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="VD: Ảnh bìa không phù hợp, chứa nội dung phản cảm..."
              rows={4}
              className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-body-sm focus:border-red-400 focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { setRejectId(null); setRejectReason(""); }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-body-sm text-gray-600 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={rejectCover}
                disabled={!rejectReason.trim() || processing === rejectId}
                className="rounded-lg bg-red-500 px-4 py-2 text-body-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setPreviewImage(null)}>
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
