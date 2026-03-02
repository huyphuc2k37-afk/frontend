"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "@/components/AdminLayout";
import { API_BASE_URL } from "@/lib/api";
import { ShieldExclamationIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

interface BannedIP {
  id: string;
  ip: string;
  reason: string | null;
  bannedBy: string | null;
  createdAt: string;
}

export default function BannedIPsPage() {
  const { token } = useAdmin();
  const [ips, setIps] = useState<BannedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIP, setNewIP] = useState("");
  const [reason, setReason] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const fetchIPs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/banned-ips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIps(data.ips || []);
      }
    } catch {}
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchIPs(); }, [fetchIPs]);

  const banIP = async () => {
    if (!token || !newIP.trim() || adding) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/banned-ips`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ip: newIP.trim(), reason: reason.trim() || "Spam" }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewIP("");
        setReason("");
        fetchIPs();
      } else {
        setError(data.error || "Lỗi");
      }
    } catch {
      setError("Lỗi kết nối server");
    }
    setAdding(false);
  };

  const unbanIP = async (id: string, ip: string) => {
    if (!token) return;
    if (!confirm(`Bỏ chặn IP "${ip}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/banned-ips/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchIPs();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldExclamationIcon className="h-6 w-6 text-red-500" />
        <h2 className="text-heading-md font-bold text-gray-900">Chặn IP spam</h2>
      </div>

      <p className="text-body-sm text-gray-500">
        IP bị chặn sẽ không thể đăng ký tài khoản mới (cả email lẫn Google). 
        Ngoài ra, mỗi IP chỉ được đăng ký tối đa 3 tài khoản mỗi giờ.
      </p>

      {/* Add IP form */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-body-md font-semibold text-gray-900 mb-3">Thêm IP vào danh sách chặn</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-caption font-medium text-gray-600 mb-1">Địa chỉ IP</label>
            <input
              type="text"
              placeholder="VD: 103.123.45.67"
              value={newIP}
              onChange={(e) => setNewIP(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-caption font-medium text-gray-600 mb-1">Lý do</label>
            <input
              type="text"
              placeholder="Spam tạo tài khoản"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </div>
          <button
            onClick={banIP}
            disabled={adding || !newIP.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-500 px-5 py-2.5 text-body-sm font-semibold text-white shadow-sm hover:bg-red-600 disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4" />
            {adding ? "Đang chặn..." : "Chặn IP"}
          </button>
        </div>
        {error && <p className="mt-2 text-body-sm text-red-600">{error}</p>}
      </div>

      {/* Banned IPs list */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="text-body-sm font-semibold text-gray-700">
            Danh sách IP đang bị chặn ({ips.length})
          </h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
          </div>
        ) : ips.length === 0 ? (
          <p className="py-12 text-center text-body-sm text-gray-400">Chưa có IP nào bị chặn</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-caption font-semibold text-gray-500">IP</th>
                  <th className="px-5 py-3 text-left text-caption font-semibold text-gray-500">Lý do</th>
                  <th className="px-5 py-3 text-left text-caption font-semibold text-gray-500">Chặn bởi</th>
                  <th className="px-5 py-3 text-left text-caption font-semibold text-gray-500">Ngày chặn</th>
                  <th className="px-5 py-3 text-center text-caption font-semibold text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ips.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-body-sm font-mono font-semibold text-gray-900">{item.ip}</td>
                    <td className="px-5 py-3 text-body-sm text-gray-600">{item.reason || "—"}</td>
                    <td className="px-5 py-3 text-body-sm text-gray-500">{item.bannedBy || "—"}</td>
                    <td className="px-5 py-3 text-body-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => unbanIP(item.id, item.ip)}
                        className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        Bỏ chặn
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
