"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "@/components/AdminLayout";
import { API_BASE_URL } from "@/lib/api";
import { MagnifyingGlassIcon, PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function AdminUsersPage() {
  const { token } = useAdmin();
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Coin adjustment state
  const [adjustingUserId, setAdjustingUserId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [adjustResult, setAdjustResult] = useState<{ userId: string; msg: string; ok: boolean } | null>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      const res = await fetch(`${API_BASE_URL}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total);
      }
    } catch {}
    setLoading(false);
  }, [token, page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateRole = async (userId: string, role: string) => {
    if (!token) return;
    await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role }),
    });
    fetchUsers();
  };

  const adjustCoins = async (userId: string, amount: number) => {
    if (!token || adjusting) return;
    setAdjusting(true);
    setAdjustResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/adjust-coins`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, reason: adjustReason.trim() || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdjustResult({ userId, msg: `Thành công! Số dư mới: ${data.newBalance?.toLocaleString()} xu`, ok: true });
        setAdjustingUserId(null);
        setAdjustAmount("");
        setAdjustReason("");
        fetchUsers();
      } else {
        setAdjustResult({ userId, msg: data.error || "Lỗi", ok: false });
      }
    } catch {
      setAdjustResult({ userId, msg: "Lỗi kết nối server", ok: false });
    }
    setAdjusting(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const nonAdminUsers = users.filter((u) => u.role !== "admin");
    if (selectedIds.size === nonAdminUsers.length && nonAdminUsers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(nonAdminUsers.map((u) => u.id)));
    }
  };

  const deleteSelected = async () => {
    if (!token || selectedIds.size === 0 || deleting) return;
    if (!confirm(`Bạn có chắc muốn xóa ${selectedIds.size} người dùng? Tất cả dữ liệu của họ (truyện, bình luận, xu...) sẽ bị xóa vĩnh viễn.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedIds(new Set());
        fetchUsers();
      } else {
        alert(data.error || "Lỗi xóa người dùng");
      }
    } catch {
      alert("Lỗi kết nối server");
    }
    setDeleting(false);
  };

  const deleteSingle = async (userId: string, userName: string) => {
    if (deleting) return;
    if (!confirm(`Xóa người dùng "${userName}"? Tất cả dữ liệu sẽ bị xóa vĩnh viễn.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: [userId] }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedIds((prev) => { const n = new Set(prev); n.delete(userId); return n; });
        fetchUsers();
      } else {
        alert(data.error || "Lỗi xóa người dùng");
      }
    } catch {
      alert("Lỗi kết nối server");
    }
    setDeleting(false);
  };

  const roleColors: Record<string, string> = {
    reader: "bg-gray-100 text-gray-600",
    author: "bg-blue-100 text-blue-700",
    admin: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-heading-md font-bold text-gray-900">Quản lý người dùng</h2>

      {/* Filters + bulk delete */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Tìm theo tên hoặc email..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-4 text-body-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </div>
        <select
          value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm focus:border-red-400 focus:outline-none"
        >
          <option value="">Tất cả vai trò</option>
          <option value="reader">Reader</option>
          <option value="author">Author</option>
          <option value="admin">Admin</option>
        </select>
        {selectedIds.size > 0 && (
          <button
            onClick={deleteSelected}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2.5 text-body-sm font-semibold text-white shadow-sm hover:bg-red-600 disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4" />
            {deleting ? "Đang xóa..." : `Xóa ${selectedIds.size} người dùng`}
          </button>
        )}
      </div>

      {/* Table */}
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
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={users.filter((u) => u.role !== "admin").length > 0 && selectedIds.size === users.filter((u) => u.role !== "admin").length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-400"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-caption font-semibold text-gray-500">Người dùng</th>
                  <th className="px-4 py-3 text-left text-caption font-semibold text-gray-500">Email</th>
                  <th className="px-4 py-3 text-center text-caption font-semibold text-gray-500">Xu</th>
                  <th className="px-4 py-3 text-center text-caption font-semibold text-gray-500">Truyện</th>
                  <th className="px-4 py-3 text-center text-caption font-semibold text-gray-500">Vai trò</th>
                  <th className="px-4 py-3 text-center text-caption font-semibold text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className={`hover:bg-gray-50 ${selectedIds.has(u.id) ? "bg-red-50/50" : ""}`}>
                    <td className="px-3 py-3">
                      {u.role !== "admin" ? (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(u.id)}
                          onChange={() => toggleSelect(u.id)}
                          className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-400"
                        />
                      ) : (
                        <span className="inline-block h-4 w-4" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-body-sm font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-body-sm text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-body-sm font-semibold text-gray-900">{u.coinBalance?.toLocaleString()}</span>
                        <button
                          onClick={() => {
                            setAdjustingUserId(adjustingUserId === u.id ? null : u.id);
                            setAdjustAmount("");
                            setAdjustReason("");
                            setAdjustResult(null);
                          }}
                          className="ml-1 rounded p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          title="Cộng/trừ xu"
                        >
                          <PlusCircleIcon className="h-4 w-4" />
                        </button>
                      </div>
                      {/* Inline adjust form */}
                      {adjustingUserId === u.id && (
                        <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-2 text-left">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              placeholder="VD: 500 hoặc -200"
                              value={adjustAmount}
                              onChange={(e) => setAdjustAmount(e.target.value)}
                              className="w-28 rounded border border-gray-200 px-2 py-1 text-[11px] focus:border-blue-400 focus:outline-none"
                            />
                            <button
                              disabled={!adjustAmount || adjusting}
                              onClick={() => adjustCoins(u.id, parseInt(adjustAmount))}
                              className="rounded bg-blue-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                            >
                              {adjusting ? "..." : "Xác nhận"}
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Lý do (tùy chọn)"
                            value={adjustReason}
                            onChange={(e) => setAdjustReason(e.target.value)}
                            className="mt-1.5 w-full rounded border border-gray-200 px-2 py-1 text-[11px] focus:border-blue-400 focus:outline-none"
                          />
                          <p className="mt-1 text-[10px] text-gray-500">Nhập số dương để cộng, số âm để trừ</p>
                        </div>
                      )}
                      {adjustResult?.userId === u.id && (
                        <p className={`mt-1 text-[11px] ${adjustResult?.ok ? "text-emerald-600" : "text-red-600"}`}>
                          {adjustResult?.msg}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-body-sm text-center text-gray-600">{u._count?.stories || 0}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${roleColors[u.role] || "bg-gray-100 text-gray-600"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <select
                          value={u.role}
                          onChange={(e) => updateRole(u.id, e.target.value)}
                          className="rounded-lg border border-gray-200 px-2 py-1 text-[11px] focus:outline-none"
                        >
                          <option value="reader">Reader</option>
                          <option value="author">Author</option>
                          <option value="admin">Admin</option>
                        </select>
                        {u.role !== "admin" && (
                          <button
                            onClick={() => deleteSingle(u.id, u.name)}
                            disabled={deleting}
                            className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                            title="Xóa người dùng"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
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
          <p className="text-caption text-gray-500">Tổng: {total} người dùng</p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1} onClick={() => setPage(page - 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-caption font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >Trước</button>
            <span className="flex items-center px-3 text-caption text-gray-500">Trang {page}</span>
            <button
              disabled={users.length < 20} onClick={() => setPage(page + 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-caption font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >Sau</button>
          </div>
        </div>
      )}
    </div>
  );
}
