"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "@/components/AdminLayout";
import { API_BASE_URL } from "@/lib/api";
import { ShieldExclamationIcon, TrashIcon, PlusIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

interface BannedIP {
  id: string;
  ip: string;
  reason: string | null;
  bannedBy: string | null;
  createdAt: string;
}

interface BannedEmail {
  id: string;
  email: string;
  reason: string | null;
  bannedBy: string | null;
  createdAt: string;
}

export default function BannedIPsPage() {
  const { token } = useAdmin();

  // ── IP state ──
  const [ips, setIps] = useState<BannedIP[]>([]);
  const [loadingIPs, setLoadingIPs] = useState(true);
  const [newIP, setNewIP] = useState("");
  const [ipReason, setIpReason] = useState("");
  const [addingIP, setAddingIP] = useState(false);
  const [ipError, setIpError] = useState("");

  // ── Email state ──
  const [emails, setEmails] = useState<BannedEmail[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [emailReason, setEmailReason] = useState("");
  const [addingEmail, setAddingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");

  // ── Fetch IPs ──
  const fetchIPs = useCallback(async () => {
    if (!token) return;
    setLoadingIPs(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/banned-ips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIps(data.ips || []);
      }
    } catch {}
    setLoadingIPs(false);
  }, [token]);

  // ── Fetch Emails ──
  const fetchEmails = useCallback(async () => {
    if (!token) return;
    setLoadingEmails(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/banned-emails`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEmails(data.emails || []);
      }
    } catch {}
    setLoadingEmails(false);
  }, [token]);

  useEffect(() => { fetchIPs(); fetchEmails(); }, [fetchIPs, fetchEmails]);

  // ── Ban IP ──
  const banIP = async () => {
    if (!token || !newIP.trim() || addingIP) return;
    setAddingIP(true);
    setIpError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/banned-ips`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ip: newIP.trim(), reason: ipReason.trim() || "Spam" }),
      });
      const data = await res.json();
      if (res.ok) { setNewIP(""); setIpReason(""); fetchIPs(); }
      else setIpError(data.error || "Lỗi");
    } catch { setIpError("Lỗi kết nối server"); }
    setAddingIP(false);
  };

  const unbanIP = async (id: string, ip: string) => {
    if (!token || !confirm(`Bỏ chặn IP "${ip}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/banned-ips/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchIPs();
    } catch {}
  };

  // ── Ban Email ──
  const banEmail = async () => {
    if (!token || !newEmail.trim() || addingEmail) return;
    setAddingEmail(true);
    setEmailError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/banned-emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: newEmail.trim(), reason: emailReason.trim() || "Spam" }),
      });
      const data = await res.json();
      if (res.ok) { setNewEmail(""); setEmailReason(""); fetchEmails(); }
      else setEmailError(data.error || "Lỗi");
    } catch { setEmailError("Lỗi kết nối server"); }
    setAddingEmail(false);
  };

  const unbanEmail = async (id: string, email: string) => {
    if (!token || !confirm(`Bỏ chặn email "${email}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/banned-emails/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchEmails();
    } catch {}
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <ShieldExclamationIcon className="h-6 w-6 text-red-500" />
        <h2 className="text-heading-md font-bold text-gray-900">Chặn spam</h2>
      </div>

      <p className="text-body-sm text-gray-500">
        IP/Email bị chặn sẽ không thể đăng ký tài khoản mới (cả email lẫn Google).
        Gmail tự động chuẩn hóa (bỏ dấu chấm, bỏ +alias) nên không thể lách.
      </p>

      {/* ════════════ CHẶN EMAIL ════════════ */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <EnvelopeIcon className="h-5 w-5 text-orange-500" />
          <h3 className="text-body-md font-semibold text-gray-900">Chặn Email cụ thể</h3>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-caption font-medium text-gray-600 mb-1">Địa chỉ Email</label>
            <input
              type="email"
              placeholder="VD: hahahihicc124@gmail.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-caption font-medium text-gray-600 mb-1">Lý do</label>
            <input
              type="text"
              placeholder="Spam tạo tài khoản"
              value={emailReason}
              onChange={(e) => setEmailReason(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <button
            onClick={banEmail}
            disabled={addingEmail || !newEmail.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2.5 text-body-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4" />
            {addingEmail ? "Đang chặn..." : "Chặn Email"}
          </button>
        </div>
        {emailError && <p className="mt-2 text-body-sm text-red-600">{emailError}</p>}
      </div>

      {/* Banned emails list */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-orange-50">
          <h3 className="text-body-sm font-semibold text-orange-700">
            Email đang bị chặn ({emails.length})
          </h3>
        </div>
        {loadingEmails ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : emails.length === 0 ? (
          <p className="py-10 text-center text-body-sm text-gray-400">Chưa chặn email nào</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-caption font-semibold text-gray-500">Email</th>
                  <th className="px-5 py-3 text-left text-caption font-semibold text-gray-500">Lý do</th>
                  <th className="px-5 py-3 text-left text-caption font-semibold text-gray-500">Chặn bởi</th>
                  <th className="px-5 py-3 text-left text-caption font-semibold text-gray-500">Ngày</th>
                  <th className="px-5 py-3 text-center text-caption font-semibold text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {emails.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-body-sm font-medium text-gray-900">{item.email}</td>
                    <td className="px-5 py-3 text-body-sm text-gray-600">{item.reason || "—"}</td>
                    <td className="px-5 py-3 text-body-sm text-gray-500">{item.bannedBy || "—"}</td>
                    <td className="px-5 py-3 text-body-sm text-gray-500">{formatDate(item.createdAt)}</td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => unbanEmail(item.id, item.email)}
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

      {/* ════════════ CHẶN IP ════════════ */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <ShieldExclamationIcon className="h-5 w-5 text-red-500" />
          <h3 className="text-body-md font-semibold text-gray-900">Chặn IP</h3>
        </div>
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
              value={ipReason}
              onChange={(e) => setIpReason(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-body-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </div>
          <button
            onClick={banIP}
            disabled={addingIP || !newIP.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-500 px-5 py-2.5 text-body-sm font-semibold text-white shadow-sm hover:bg-red-600 disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4" />
            {addingIP ? "Đang chặn..." : "Chặn IP"}
          </button>
        </div>
        {ipError && <p className="mt-2 text-body-sm text-red-600">{ipError}</p>}
      </div>

      {/* Banned IPs list */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-red-50">
          <h3 className="text-body-sm font-semibold text-red-700">
            IP đang bị chặn ({ips.length})
          </h3>
        </div>
        {loadingIPs ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
          </div>
        ) : ips.length === 0 ? (
          <p className="py-10 text-center text-body-sm text-gray-400">Chưa chặn IP nào</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-caption font-semibold text-gray-500">IP</th>
                  <th className="px-5 py-3 text-left text-caption font-semibold text-gray-500">Lý do</th>
                  <th className="px-5 py-3 text-left text-caption font-semibold text-gray-500">Chặn bởi</th>
                  <th className="px-5 py-3 text-left text-caption font-semibold text-gray-500">Ngày</th>
                  <th className="px-5 py-3 text-center text-caption font-semibold text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ips.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-body-sm font-mono font-semibold text-gray-900">{item.ip}</td>
                    <td className="px-5 py-3 text-body-sm text-gray-600">{item.reason || "—"}</td>
                    <td className="px-5 py-3 text-body-sm text-gray-500">{item.bannedBy || "—"}</td>
                    <td className="px-5 py-3 text-body-sm text-gray-500">{formatDate(item.createdAt)}</td>
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
