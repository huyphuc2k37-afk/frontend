"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "@/components/AdminLayout";
import { API_BASE_URL } from "@/lib/api";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

export default function AdminWithdrawalsPage() {
  const { token } = useAdmin();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [actionNote, setActionNote] = useState<Record<string, string>>({});

  const fetchWithdrawals = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`${API_BASE_URL}/api/admin/withdrawals?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data.withdrawals);
        setTotal(data.total);
      }
    } catch {}
    setLoading(false);
  }, [token, page, statusFilter]);

  useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    if (!token) return;
    const confirmMsg = status === "approved"
      ? "Xác nhận đã chuyển tiền cho tác giả?"
      : "Từ chối yêu cầu rút tiền? Xu sẽ được hoàn lại cho tác giả.";
    if (!confirm(confirmMsg)) return;

    const note = actionNote[id] || "";
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/withdrawals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, adminNote: note }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Lỗi không xác định" }));
        alert(data.error || "Thao tác thất bại");
      }
    } catch {
      alert("Lỗi kết nối server");
    }
    fetchWithdrawals();
  };

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "Chờ duyệt", color: "text-amber-600 bg-amber-50", icon: ClockIcon },
    approved: { label: "Đã chuyển", color: "text-emerald-600 bg-emerald-50", icon: CheckCircleIcon },
    rejected: { label: "Từ chối", color: "text-red-600 bg-red-50", icon: XCircleIcon },
  };

  const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-heading-md font-bold text-gray-900">Quản lý rút tiền</h2>
        <div className="flex gap-2">
          {["pending", "approved", "rejected", ""].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`rounded-lg px-3 py-2 text-caption font-medium transition-all ${
                statusFilter === s
                  ? "bg-red-500 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {s === "pending" ? "Chờ duyệt" : s === "approved" ? "Đã chuyển" : s === "rejected" ? "Từ chối" : "Tất cả"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
            <BanknotesIcon className="mx-auto h-12 w-12 text-gray-200" />
            <p className="mt-3 text-body-sm text-gray-500">Không có yêu cầu rút tiền nào</p>
          </div>
        ) : (
          withdrawals.map((w) => {
            const sc = statusConfig[w.status] || statusConfig.pending;
            return (
              <div key={w.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-body-sm font-semibold text-gray-900">{w.user?.name}</p>
                    <p className="text-caption text-gray-500">{w.user?.email}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-gray-50 p-3">
                      <div>
                        <p className="text-[11px] text-gray-400">Xu rút</p>
                        <p className="text-body-sm font-bold text-gray-900">{formatVND(w.amount)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400">Tiền VNĐ</p>
                        <p className="text-body-sm font-bold text-emerald-600">{formatVND(w.moneyAmount)}đ</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400">Ngân hàng</p>
                        <p className="text-body-sm font-semibold text-gray-900">{w.bankName}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400">STK</p>
                        <p className="text-body-sm font-semibold text-gray-900">{w.bankAccount}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[11px] text-gray-400">Chủ TK</p>
                        <p className="text-body-sm font-semibold text-gray-900">{w.bankHolder}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] text-gray-400">
                      {new Date(w.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${sc.color}`}>
                    <sc.icon className="h-3.5 w-3.5" />
                    {sc.label}
                  </span>
                </div>

                {w.status === "pending" && (
                  <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-gray-100 pt-4">
                    <div className="flex-1 min-w-[200px]">
                      <label className="mb-1 block text-[11px] font-medium text-gray-500">Ghi chú (tùy chọn)</label>
                      <input
                        type="text"
                        value={actionNote[w.id] || ""}
                        onChange={(e) => setActionNote((prev) => ({ ...prev, [w.id]: e.target.value }))}
                        placeholder="VD: Đã chuyển khoản lúc 14h ngày 12/02..."
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-caption focus:border-red-400 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => handleAction(w.id, "approved")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-caption font-semibold text-white hover:bg-emerald-600"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      Đã chuyển tiền
                    </button>
                    <button
                      onClick={() => handleAction(w.id, "rejected")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-4 py-2 text-caption font-semibold text-white hover:bg-red-600"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      Từ chối
                    </button>
                  </div>
                )}

                {w.adminNote && w.status !== "pending" && (
                  <p className="mt-3 text-caption text-gray-400 border-t border-gray-100 pt-3">
                    Ghi chú admin: {w.adminNote}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-caption text-gray-500">Tổng: {total} yêu cầu</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-caption font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">Trước</button>
            <span className="flex items-center px-3 text-caption text-gray-500">Trang {page}</span>
            <button disabled={withdrawals.length < 20} onClick={() => setPage(page + 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-caption font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">Sau</button>
          </div>
        </div>
      )}
    </div>
  );
}
