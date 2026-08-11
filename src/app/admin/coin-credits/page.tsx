"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "@/components/AdminLayout";
import { API_BASE_URL } from "@/lib/api";
import {
  GiftIcon,
  UserGroupIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

interface CoinCredit {
  id: string;
  adminId: string;
  authorId: string;
  amount: number;
  reason: string;
  createdAt: string;
  admin: { id: string; name: string; email: string; image: string | null };
  author: { id: string; name: string; email: string; image: string | null };
}

interface CreditStats {
  period: string;
  totalAmount: number;
  totalCount: number;
  byAdmin: Array<{
    admin: { id: string; name: string; email: string; image: string | null };
    amount: number;
    count: number;
  }>;
  byAuthor: Array<{
    author: { id: string; name: string; email: string; image: string | null };
    amount: number;
    count: number;
  }>;
}

export default function AdminCoinCreditsPage() {
  const { token } = useAdmin();
  const [credits, setCredits] = useState<CoinCredit[]>([]);
  const [stats, setStats] = useState<CreditStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statsPeriod, setStatsPeriod] = useState("30d");

  const fetchCredits = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("search", search);
      const res = await fetch(`${API_BASE_URL}/api/admin/coin-credits?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits);
        setTotal(data.total);
      }
    } catch {}
    setLoading(false);
  }, [token, page, limit, search]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/coin-credits/stats?period=${statsPeriod}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {}
  }, [token, statsPeriod]);

  useEffect(() => { fetchCredits(); }, [fetchCredits]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const formatCurrency = (num: number) => new Intl.NumberFormat("vi-VN").format(num);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const handleExport = async () => {
    if (!token) return;
    try {
      const allCredits: CoinCredit[] = [];
      let currentPage = 1;
      while (true) {
        const params = new URLSearchParams({ page: String(currentPage), limit: "100" });
        if (search) params.set("search", search);
        const res = await fetch(`${API_BASE_URL}/api/admin/coin-credits?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) break;
        const data = await res.json();
        allCredits.push(...data.credits);
        if (data.credits.length < 100) break;
        currentPage++;
      }

      const headers = ["Admin", "Tác giả", "Email tác giả", "Số xu", "Lý do", "Thời gian"];
      const rows = allCredits.map((c) => [
        c.admin.name,
        c.author.name,
        c.author.email,
        c.amount,
        c.reason.replace(/"/g, '""'),
        formatDate(c.createdAt),
      ]);
      const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `admin-coin-credits-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {}
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-heading-md font-bold text-gray-900">Lịch sử Cộng Xu Admin</h2>
          <p className="mt-1 text-body-sm text-gray-500">Ai đã cộng xu, cho ai, bao nhiêu, lý do gì</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-body-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <DocumentArrowDownIcon className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-purple-50 p-2">
                <GiftIcon className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="mt-3 text-caption text-gray-500">Tổng cộng ({stats.period})</p>
            <p className="mt-1 text-heading-sm font-bold text-gray-900">
              {formatCurrency(stats.totalAmount)} xu
            </p>
            <p className="mt-0.5 text-caption text-gray-400">{stats.totalCount} lần cộng</p>
          </div>

          {/* Top Admin */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <UserGroupIcon className="h-4 w-4 text-gray-400" />
              <p className="text-caption text-gray-500">Admin nhiều nhất</p>
            </div>
            {stats.byAdmin[0] ? (
              <>
                <p className="text-body-sm font-medium text-gray-900">{stats.byAdmin[0].admin.name}</p>
                <p className="mt-1 text-heading-sm font-bold text-purple-600">
                  {formatCurrency(stats.byAdmin[0].amount)} xu
                </p>
                <p className="mt-0.5 text-caption text-gray-400">{stats.byAdmin[0].count} lần</p>
              </>
            ) : (
              <p className="text-body-sm text-gray-400">Chưa có dữ liệu</p>
            )}
          </div>

          {/* Top Author */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <UserGroupIcon className="h-4 w-4 text-gray-400" />
              <p className="text-caption text-gray-500">Tác giả nhận nhiều nhất</p>
            </div>
            {stats.byAuthor[0] ? (
              <>
                <p className="text-body-sm font-medium text-gray-900">{stats.byAuthor[0].author.name}</p>
                <p className="mt-1 text-heading-sm font-bold text-green-600">
                  {formatCurrency(stats.byAuthor[0].amount)} xu
                </p>
                <p className="mt-0.5 text-caption text-gray-400">{stats.byAuthor[0].count} lần</p>
              </>
            ) : (
              <p className="text-body-sm text-gray-400">Chưa có dữ liệu</p>
            )}
          </div>

          {/* Period selector */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FunnelIcon className="h-4 w-4 text-gray-400" />
              <p className="text-caption text-gray-500">Khoảng thời gian</p>
            </div>
            <select
              value={statsPeriod}
              onChange={(e) => setStatsPeriod(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-body-xs focus:border-red-500 focus:outline-none"
            >
              <option value="7d">7 ngày</option>
              <option value="30d">30 ngày</option>
              <option value="90d">90 ngày</option>
              <option value="365d">365 ngày</option>
            </select>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo lý do..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-body-sm focus:border-red-500 focus:outline-none"
          />
        </div>
        <span className="text-caption text-gray-400">{total} kết quả</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        </div>
      ) : credits.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-16 shadow-sm">
          <GiftIcon className="h-12 w-12 text-gray-300" />
          <p className="mt-3 text-body-sm text-gray-500">Chưa có lịch sử cộng xu</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full text-left text-body-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Admin thực hiện</th>
                  <th className="px-4 py-3 font-medium">Tác giả nhận</th>
                  <th className="px-4 py-3 font-medium text-right">Số xu</th>
                  <th className="px-4 py-3 font-medium">Lý do</th>
                  <th className="px-4 py-3 font-medium">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {credits.map((credit, idx) => (
                  <tr key={credit.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{(page - 1) * limit + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-body-xs font-bold text-purple-600">
                          {credit.admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{credit.admin.name}</p>
                          <p className="text-caption text-gray-400">{credit.admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                          {credit.author.image ? (
                            <img src={credit.author.image} alt={credit.author.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400 text-xs font-bold">
                              {credit.author.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{credit.author.name}</p>
                          <p className="text-caption text-gray-400">{credit.author.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      +{formatCurrency(credit.amount)}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="truncate text-gray-700" title={credit.reason}>{credit.reason}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(credit.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-caption text-gray-500">
                Trang {page} / {totalPages} &mdash; {total} kết quả
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-body-xs disabled:opacity-50"
                >
                  Trước
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`rounded-lg border px-3 py-1.5 text-body-xs ${
                        p === page ? "border-red-500 bg-red-50 text-red-600" : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-body-xs disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
