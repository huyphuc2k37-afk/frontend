"use client";

import { useState, useEffect, useCallback } from "react";
import { useMod } from "@/components/ModLayout";
import { API_BASE_URL } from "@/lib/api";
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PhotoIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

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
  const [editIsAdult, setEditIsAdult] = useState(false);
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);
  const [editCoverBase64, setEditCoverBase64] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editResult, setEditResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);

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
      setEditIsAdult(data.isAdult || false);
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
        isAdult: editIsAdult,
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

      {/* Result message */}
      {editResult && !showEditModal && (
        <div className={`rounded-xl p-3 text-body-sm font-medium ${editResult.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {editResult.msg}
        </div>
      )}

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
                          title="Sửa truyện"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
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

      {/* Edit modal */}
      {showEditModal && editStory && (
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

            {editResult && (
              <div className={`mb-4 rounded-xl p-3 text-body-sm font-medium ${editResult.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {editResult.msg}
              </div>
            )}

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

              {/* 18+ */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editIsAdult}
                  onChange={(e) => setEditIsAdult(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-body-sm text-gray-700">Nội dung 18+</span>
              </label>

              {/* Cover image */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Ảnh bìa</label>
                <div className="flex items-start gap-3">
                  {editCoverPreview ? (
                    <img
                      src={editCoverPreview}
                      alt="Cover preview"
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
